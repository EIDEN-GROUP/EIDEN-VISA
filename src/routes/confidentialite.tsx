import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import sealEiden from "@/assets/decorations/logo-eiden.png";

export const Route = createFileRoute("/confidentialite")({
  component: Confidentialite,
});

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2 border-t border-border pt-6 first:border-t-0 first:pt-0">
      <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function Confidentialite() {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="flex items-center gap-3">
          <img src={sealEiden} alt="" className="h-10 w-10" />
          <div>
            <div className="font-display text-lg font-semibold text-foreground">Eiden Visa</div>
            <div className="ref text-muted-foreground">EIDEN Group · Agadir, Maroc</div>
          </div>
        </div>

        <div>
          <h1 className="page-title">Conditions d'utilisation & confidentialité</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ce document couvre l'outil interne de back-office Eiden Visa (le "système") et les données des clients
            qui y sont traitées dans le cadre de l'accompagnement à la demande de visa.
          </p>
        </div>

        <Section title="1. Objet du système">
          <p>
            Le système est un outil interne réservé au personnel d'Eiden Visa (EIDEN Group). Il sert à qualifier un
            dossier client, suivre son avancement dans les 7 étapes du parcours, gérer les rendez-vous auprès de
            TLScontact (France) et BLS International (Espagne), encaisser les paiements liés à l'accompagnement, et
            conserver les pièces justificatives fournies par le client. Il n'est pas un service public, ne se
            substitue à aucune démarche consulaire officielle, et ne délivre aucun visa — Eiden Visa accompagne, les
            autorités consulaires décident seules.
          </p>
        </Section>

        <Section title="2. Données traitées">
          <p>
            Le système conserve : l'identité et les coordonnées du client (nom, téléphone, ville, date de naissance),
            la nature de sa demande, les pièces qu'il a fournies (sous forme de PDF), les paiements réglés à Eiden
            Visa, et l'historique des actions effectuées sur son dossier par l'équipe.
          </p>
          <p>
            Ces données sont collectées uniquement pour la durée et les besoins de l'accompagnement du dossier. Elles
            ne sont jamais utilisées à des fins commerciales tierces (revente, prospection externe, profilage).
          </p>
        </Section>

        <Section title="3. Aucun partage illégal ou non autorisé">
          <p>
            Eiden Visa ne transmet les données ou documents d'un dossier qu'aux organismes strictement nécessaires à
            la demande de visa du client (TLScontact, BLS International, le consulat concerné), et uniquement avec
            l'accord implicite du client au moment où il confie son dossier.
          </p>
          <p>
            Le système ne partage, ne vend ni ne transfère aucune donnée client à un tiers non autorisé. Aucun
            document ou renseignement collecté par cet outil ne peut être utilisé pour falsifier, contourner ou
            détourner une procédure consulaire, ni pour toute autre finalité illégale — l'équipe s'engage à ne
            traiter que des dossiers et documents authentiques fournis par le client.
          </p>
        </Section>

        <Section title="4. Conservation et suppression">
          <p>
            Les documents et données d'un dossier sont conservés le temps du traitement de la demande puis pendant
            une durée raisonnable après clôture, à des fins de preuve d'accompagnement (reçus de paiement, suivi de
            décision consulaire). Un dossier peut être supprimé définitivement par un membre autorisé de l'équipe
            depuis sa fiche ; cette action est irréversible et journalisée.
          </p>
        </Section>

        <Section title="5. Accès et responsabilité de l'équipe">
          <p>
            L'accès au système est réservé aux membres de l'équipe Eiden Visa. Chaque action significative (création,
            modification, encaissement, clôture, suppression d'un dossier) est attribuée à la personne connectée et
            consignée dans le journal d'activité, consultable par le CEO depuis l'écran Ops.
          </p>
        </Section>

        <Section title="6. Contact">
          <p>
            Pour toute question relative à ce document ou à l'utilisation de vos données dans le cadre de votre
            dossier, adressez-vous directement à l'agence Eiden Visa qui a ouvert votre dossier, à Agadir.
          </p>
        </Section>

        <div className="border-t border-border pt-6 text-xs text-muted-foreground">
          <Link to="/" className="text-primary hover:underline">
            Retour au back-office
          </Link>
        </div>
      </div>
    </div>
  );
}
