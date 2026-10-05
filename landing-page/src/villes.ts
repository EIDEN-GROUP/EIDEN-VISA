// Villes de résidence proposées dans la demande rapide : les régions du Sud du Maroc et
// leurs villes. Libellés : `t.demande.regions` / `t.demande.villes` (fr.ts, ar.ts).
// Le chef-lieu de la région vient en premier ; les autres villes sont triées à
// l'affichage selon la langue.

export const REGIONS_SUD = [
  {
    id: "soussMassa",
    villes: [
      "agadir",
      "inezgane",
      "aitMelloul",
      "dcheira",
      "lqliaa",
      "temsia",
      "aourir",
      "drarga",
      "taghazout",
      "biougra",
      "aitBaha",
      "sidiBibi",
      "belfaa",
      "massa",
      "aitAmira",
      "taroudant",
      "ouladTeima",
      "aitIaaza",
      "elGuerdane",
      "ouladBerhil",
      "aoulouz",
      "taliouine",
      "irherm",
      "tiznit",
      "tafraout",
      "tata",
      "akka",
      "foumZguid",
      "famElHisn",
    ],
  },
  {
    id: "guelmimOuedNoun",
    villes: [
      "guelmim",
      "bouizakarne",
      "taghjijt",
      "tanTan",
      "elOuatia",
      "sidiIfni",
      "mirleft",
      "lakhsas",
      "assa",
      "zag",
    ],
  },
  {
    id: "laayouneSakia",
    villes: ["laayoune", "elMarsa", "foumElOued", "boujdour", "tarfaya", "akhfennir", "esSemara"],
  },
  {
    id: "dakhlaOuedEdDahab",
    villes: ["dakhla", "elArgoub", "birGandouz", "aousserd"],
  },
  {
    id: "draaTafilalet",
    villes: [
      "errachidia",
      "erfoud",
      "rissani",
      "goulmima",
      "tinejdad",
      "boudnib",
      "jorf",
      "merzouga",
      "ouarzazate",
      "taznakht",
      "skoura",
      "tinghir",
      "boumalneDades",
      "kelaatMgouna",
      "alnif",
      "zagora",
      "agdz",
      "tamegroute",
      "mhamidElGhizlane",
      "midelt",
      "erRich",
      "boumia",
      "itzer",
      "imilchil",
    ],
  },
] as const;

export type RegionId = (typeof REGIONS_SUD)[number]["id"];
export type VilleId = (typeof REGIONS_SUD)[number]["villes"][number];

export const VILLES_IDS: readonly string[] = REGIONS_SUD.flatMap((r) => r.villes);
