// Porte d'ouverture : les animations d'entrée attendent que l'avion du loader ait
// commencé à dévoiler la page, sinon elles se joueraient cachées sous le rideau.
import { useEffect, useState } from "react";

let ouverte = false;
let ouvrir!: () => void;

export const introPrete = new Promise<void>((resolve) => {
  ouvrir = () => {
    ouverte = true;
    resolve();
  };
});

export const introOuverte = () => ouverte;

/** Appelé par le loader en plein vol (ou tout de suite si le mouvement est réduit). */
export const lancerIntro = () => ouvrir();

/** `true` dès que l'intro est lancée : sert de garde aux animations Framer Motion. */
export function useIntroPrete() {
  const [pret, setPret] = useState(ouverte);
  useEffect(() => {
    if (pret) return;
    let actif = true;
    void introPrete.then(() => actif && setPret(true));
    return () => {
      actif = false;
    };
  }, [pret]);
  return pret;
}
