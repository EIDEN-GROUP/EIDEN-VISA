#!/usr/bin/env python3
"""
Surveillance de disponibilité RDV (TLScontact/BLS ou tout autre site public).

Ce script ne fait QUE lire une page publique et comparer son contenu à la dernière
lecture — comme un humain qui rafraîchit la page. Il n'automatise ni connexion, ni
formulaire, ni réservation : dès qu'un changement est détecté, il pousse une
notification dans l'app (table `notifications`) et c'est un agent humain qui va
réserver via le site officiel, comme n'importe quel autre demandeur.

Rien n'est codé en dur ici : toutes les URLs à surveiller viennent de la table
`rdv_watches`, remplie dynamiquement depuis l'écran "Surveillance RDV" de
visaflow-pro (src/routes/_app/rdv-watch.tsx). Ajouter/retirer une URL se fait dans
l'app, jamais dans ce fichier.

Utilisation :
    pip install psycopg2-binary requests
    python3 scripts/rdv_watcher.py            # une seule passe
    python3 scripts/rdv_watcher.py --loop      # tourne en boucle, respecte
                                                # interval_seconds par ligne

Variables d'environnement :
    DATABASE_URL   — même valeur que dans .env (obligatoire)
    RDV_USER_AGENT — user-agent HTTP à envoyer (optionnel)
    RDV_MIN_INTERVAL — plancher en secondes entre deux lectures d'une même URL,
                       pour rester poli avec le site distant (défaut 60)
"""

from __future__ import annotations

import argparse
import hashlib
import ipaddress
import os
import re
import socket
import sys
import time
import uuid
from datetime import datetime, timezone
from urllib.parse import urlparse

import psycopg2
import psycopg2.extras
import requests

MIN_INTERVAL = int(os.environ.get("RDV_MIN_INTERVAL", "60"))
USER_AGENT = os.environ.get(
    "RDV_USER_AGENT",
    "Mozilla/5.0 (compatible; EidenVisaRdvWatcher/1.0; +readonly availability check)",
)
REQUEST_TIMEOUT = 20
# Garde-fou : on ne hache jamais plus de 2 Mo (page piégée géante = DoS mémoire).
MAX_BYTES = 2_000_000

# Mots-clés génériques indiquant "aucun créneau" sur la plupart des sites de RDV
# consulaires. Purement informatif : le vrai signal est le hash du contenu qui change,
# ceci ne fait qu'écrire un statut lisible dans l'app.
NO_SLOT_PATTERNS = [
    r"aucun\s+rendez-?vous",
    r"pas\s+de\s+cr[ée]neau",
    r"no\s+appointment",
    r"complet",
    r"indisponible",
]


def get_database_url() -> str:
    url = os.environ.get("DATABASE_URL")
    if url:
        return url
    # Repli : lit .env à la racine du projet (même fichier que l'app Node lit).
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
    if os.path.exists(env_path):
        with open(env_path, encoding="utf-8") as f:
            for line in f:
                if line.startswith("DATABASE_URL="):
                    return line.split("=", 1)[1].strip()
    raise SystemExit("DATABASE_URL introuvable (variable d'env ou .env).")


def host_est_public(host: str) -> bool:
    """Revérifie après résolution DNS (l'écran d'ajout filtre déjà les littéraux,
    mais un nom peut se ré-écrire vers de l'interne entre-temps : rebinding)."""
    try:
        infos = socket.getaddrinfo(host, None)
    except socket.gaierror:
        return False
    for info in infos:
        try:
            ip = ipaddress.ip_address(info[4][0].split("%")[0])
        except ValueError:
            return False
        if not ip.is_global:
            return False
    return True


def fetch_page(url: str) -> str:
    try:
        host = urlparse(url).hostname or ""
    except ValueError:
        raise requests.RequestException(f"URL invalide : {url}")
    if urlparse(url).scheme != "https" or not host_est_public(host):
        raise requests.RequestException(f"URL non autorisée (intranet/interne) : {host}")
    resp = requests.get(
        url,
        headers={"User-Agent": USER_AGENT},
        timeout=REQUEST_TIMEOUT,
        stream=True,
    )
    resp.raise_for_status()
    morceaux: list[bytes] = []
    total = 0
    for bloc in resp.iter_content(chunk_size=65536, decode_unicode=False):
        if not isinstance(bloc, bytes):
            continue
        total += len(bloc)
        if total > MAX_BYTES:
            raise requests.RequestException("Page trop volumineuse, ignorée.")
        morceaux.append(bloc)
    return b"".join(morceaux).decode(resp.encoding or "utf-8", errors="replace")


def normalize(html: str) -> str:
    """Réduit le bruit (timestamps, tokens CSRF, espaces) avant le hash, pour éviter
    de déclencher une fausse alerte à chaque octet qui bouge sans rapport avec les
    créneaux réels."""
    text = re.sub(r"\s+", " ", html)
    text = re.sub(r'(csrf|token|nonce)="[^"]*"', "", text, flags=re.I)
    return text.strip()


def guess_status(html: str) -> str:
    lowered = html.lower()
    for pat in NO_SLOT_PATTERNS:
        if re.search(pat, lowered):
            return "indisponible (probable)"
    return "à vérifier — le contenu a changé"


def notify(conn, watch: dict, status: str) -> None:
    """Insère une notification pour chaque utilisateur — visible dans la cloche de
    l'app (table `notifications`, type "info")."""
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM users")
        user_ids = [row[0] for row in cur.fetchall()]
        message = (
            f"Changement détecté sur « {watch['label']} » — {status}. "
            f"Vérifiez manuellement : {watch['url']}"
        )
        for uid in user_ids:
            cur.execute(
                """
                INSERT INTO notifications (id, user_id, type, message, dossier_id, url, acteur_nom)
                VALUES (%s, %s, 'info', %s, %s, %s, %s)
                """,
                (str(uuid.uuid4()), uid, message, watch["dossier_id"], watch["url"], "Surveillance RDV"),
            )
    conn.commit()


def check_one(conn, watch: dict) -> None:
    try:
        html = fetch_page(watch["url"])
    except requests.RequestException as exc:
        print(f"[warn] {watch['label']}: échec de lecture ({exc})", file=sys.stderr)
        return

    digest = hashlib.sha256(normalize(html).encode("utf-8")).hexdigest()
    status = guess_status(html)
    changed = watch["last_snapshot_hash"] is not None and digest != watch["last_snapshot_hash"]

    with conn.cursor() as cur:
        cur.execute(
            """
            UPDATE rdv_watches
            SET last_snapshot_hash = %s, last_status = %s, last_checked_at = %s
            WHERE id = %s
            """,
            (digest, status, datetime.now(timezone.utc), watch["id"]),
        )
    conn.commit()

    if changed:
        print(f"[alert] {watch['label']}: changement détecté -> {status}")
        notify(conn, watch, status)
    else:
        print(f"[ok] {watch['label']}: pas de changement ({status})")


def run_once(conn) -> None:
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(
            """
            SELECT id, label, url, dossier_id, interval_seconds,
                   last_snapshot_hash, last_checked_at
            FROM rdv_watches
            WHERE actif = true
            """
        )
        watches = cur.fetchall()

    if not watches:
        print("[info] aucune surveillance active — ajoutez une URL depuis l'écran dédié.")
        return

    now = datetime.now(timezone.utc)
    for watch in watches:
        interval = max(watch["interval_seconds"] or 300, MIN_INTERVAL)
        last = watch["last_checked_at"]
        if last is not None and (now - last).total_seconds() < interval:
            continue
        check_one(conn, watch)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--loop", action="store_true", help="Tourne en continu au lieu d'une seule passe."
    )
    parser.add_argument(
        "--poll-seconds",
        type=int,
        default=30,
        help="Fréquence de relecture de la table rdv_watches en mode --loop (défaut 30s).",
    )
    args = parser.parse_args()

    conn = psycopg2.connect(get_database_url())
    try:
        if args.loop:
            print("[info] boucle démarrée — Ctrl+C pour arrêter.")
            while True:
                run_once(conn)
                time.sleep(args.poll_seconds)
        else:
            run_once(conn)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
