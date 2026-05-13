export interface Product {
  id: string;
  name: string;
  scientificName: string;
  price: number; // CHF
  stock: number;
  description: string;
  imagePlaceholder: {
    gradient: string;
    dominantColor: string;
    accentColor: string;
  };
}

export const mockProducts: Product[] = [
  {
    id: "clone-monstera-peru-04",
    name: "Monstera Peru Variegata",
    scientificName: "Monstera karstenianum var. 'Peru' – Clone #04",
    price: 4800,
    stock: 2,
    description:
      "Chimère issue d'une mutation somatique exceptionnelle. Panachure nacre sur vert forêt profond. Feuilles épaisses, bullées, à résistance supérieure. Spécimen certifié, racines développées sur substrat volcanique.",
    imagePlaceholder: {
      gradient: "radial-gradient(ellipse at 30% 20%, #3d6b55 0%, #1a3326 45%, #0f1f18 100%)",
      dominantColor: "#1a3326",
      accentColor: "#7a9b76",
    },
  },
  {
    id: "clone-begonia-soli-alpha",
    name: "Bégonia Soli-Mutata",
    scientificName: "Begonia 'Soli-Mutata' – Chimère Alpha",
    price: 2400,
    stock: 3,
    description:
      "Mutation foliaire unique : surface miroir irisée sous lumière rasante. Chaque feuille révèle un motif distinct selon l'angle d'observation. Collection privée genevoise, lignée documentée depuis 2019.",
    imagePlaceholder: {
      gradient: "radial-gradient(ellipse at 70% 30%, #c9a96e 0%, #a67c75 50%, #5e3d3a 100%)",
      dominantColor: "#a67c75",
      accentColor: "#c9a96e",
    },
  },
  {
    id: "clone-philodendron-caramel-01",
    name: "Philodendron Caramel Marble",
    scientificName: "Philodendron erubescens 'Caramel Marble' – Clone #01",
    price: 3600,
    stock: 1,
    description:
      "Marbrure caramel sur fond vert émeraude, impossible à reproduire par culture standard. Croissance grimpante, port élancé. Micropropagé en laboratoire suisse, pedigree génétique complet fourni.",
    imagePlaceholder: {
      gradient: "radial-gradient(ellipse at 50% 60%, #c9a96e 0%, #9a7a4a 35%, #1a3326 100%)",
      dominantColor: "#9a7a4a",
      accentColor: "#c9a96e",
    },
  },
  {
    id: "clone-hoya-kerrii-07",
    name: "Hoya Kerrii Splash",
    scientificName: "Hoya kerrii 'Splash Variegata' – Spécimen #07",
    price: 1800,
    stock: 4,
    description:
      "Variegation en éclaboussure aléatoire sur feuilles cordiformes. Chaque feuille est une pièce unique, non reproductible. Floraison parfumée en ombelle. Idéal pour collection haute valeur ou cadeau de prestige.",
    imagePlaceholder: {
      gradient: "radial-gradient(ellipse at 40% 40%, #f5f2eb 0%, #7a9b76 55%, #2d5040 100%)",
      dominantColor: "#7a9b76",
      accentColor: "#f5f2eb",
    },
  },
];
