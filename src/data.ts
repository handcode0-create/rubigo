import type { Category, Merchant, Order, Product, Service, User } from './types'

// ---------------------------------------------------------------------------
// UTILISATEUR DÉMO
// ---------------------------------------------------------------------------

export const user: User = {
  id: 'customer-001',
  name: 'Amadou Konaté',
  phone: '+225 07 08 09 10 11',
  initials: 'AK',
  city: 'Adzopé, Côte d\u2019Ivoire',
  role: 'customer',
  addresses: [
    {
      id: 'address-001',
      label: 'Maison',
      line: 'Quartier Commerce, Adzopé',
      isDefault: true,
      location: {
        latitude: 6.106,
        longitude: -3.861,
        address: 'Quartier Commerce, Adzopé',
        city: 'Adzopé',
        country: 'Côte d\u2019Ivoire',
      },
    },
    {
      id: 'address-002',
      label: 'Bureau',
      line: 'Avenue de l\u2019Indépendance, Adzopé',
      isDefault: false,
      location: {
        latitude: 6.1095,
        longitude: -3.8621,
        address: 'Avenue de l\u2019Indépendance, Adzopé',
        city: 'Adzopé',
        country: 'Côte d\u2019Ivoire',
      },
    },
  ],
  payment: { method: 'cash', status: 'pending' },
}

// ---------------------------------------------------------------------------
// SERVICES
// ---------------------------------------------------------------------------

export const services: Service[] = [
  { id: 'food',    icon: 'FO', label: 'Food',    description: 'Repas et boissons',    accent: 'coral' },
  { id: 'market',  icon: 'MA', label: 'Market',  description: 'Courses du quotidien', accent: 'lime'  },
  { id: 'express', icon: 'EX', label: 'Express', description: 'Colis et documents',   accent: 'blue'  },
  { id: 'shopper', icon: 'SH', label: 'Shopper', description: 'Un achat sur demande', accent: 'gold'  },
]

// ---------------------------------------------------------------------------
// CATÉGORIES
// ---------------------------------------------------------------------------

export const categories: Category[] = [
  // ── FOOD ──────────────────────────────────────────────────────────────────
  { id: 'restaurants',    label: 'Cuisine ivoirienne', icon: '\ud83c\udf7d\ufe0f' },
  { id: 'maquis',         label: 'Maquis',             icon: '\ud83d\udd25'         },
  { id: 'grillades',      label: 'Grillades',          icon: '\ud83c\udf56'         },
  { id: 'poulet',         label: 'Poulet braisé',      icon: '\ud83c\udf57'         },
  { id: 'fast-food',      label: 'Fast-food',          icon: '\ud83c\udf54'         },
  { id: 'pizza',          label: 'Pizza',              icon: '\ud83c\udf55'         },
  { id: 'pastries',       label: 'Boulangerie',        icon: '\ud83e\udd50'         },
  // ── MARKET ────────────────────────────────────────────────────────────────
  { id: 'markets',        label: 'Supermarchés',       icon: '\ud83d\uded2'         },
  { id: 'vivres',         label: 'Vivres frais',       icon: '\ud83c\udf3f'         },
  { id: 'boucherie',      label: 'Boucherie',          icon: '\ud83e\udd69'         },
  { id: 'poissonnerie',   label: 'Poissonnerie',       icon: '\ud83d\udc1f'         },
  { id: 'shops',          label: 'Épicerie',           icon: '\ud83c\udfea'         },
  { id: 'beaute',         label: 'Beauté',             icon: '\ud83d\udc85'         },
  { id: 'menage',         label: 'Maison',             icon: '\ud83e\uddf9'         },
]

// ---------------------------------------------------------------------------
// COMMERÇANTS — 22 établissements
// ---------------------------------------------------------------------------

export const merchants: Merchant[] = [

  // ── FOOD ──────────────────────────────────────────────────────────────────

  {
    id: 'merchant-001',
    name: 'Chez Maman Awa',
    description: 'Cuisine ivoirienne généreuse préparée chaque jour depuis 2009. La sauce graine y est une institution.',
    categoryId: 'restaurants',
    category: 'Cuisine locale',
    rating: 4.8, reviewCount: 126,
    deliveryTime: '25-35 min', deliveryFee: 500, distance: '1,2 km', isOpen: true,
    location: { latitude: 6.1081, longitude: -3.8584, address: 'Quartier Commerce, Adzopé' },
    initials: 'MA', tone: 'sunset',

    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=82",
  },
  {
    id: 'merchant-002',
    name: 'Le Patio d\u2019Adzopé',
    description: 'Grillades, brochettes et boissons fraîches. La meilleure terrasse de la ville pour se retrouver.',
    categoryId: 'maquis',
    category: 'Grillades & snacks',
    rating: 4.6, reviewCount: 89,
    deliveryTime: '30-40 min', deliveryFee: 750, distance: '2,4 km', isOpen: true,
    location: { latitude: 6.1039, longitude: -3.8652, address: 'Avenue principale, Adzopé' },
    initials: 'PA', tone: 'forest',

    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=1200&q=82",
  },
  {
    id: 'merchant-003',
    name: 'Marché Central Frais',
    description: 'Fruits, légumes, vivres locaux et condiments du marché central d\u2019Adzopé. Frais chaque matin.',
    categoryId: 'markets',
    category: 'Supermarché',
    rating: 4.9, reviewCount: 204,
    deliveryTime: '20-30 min', deliveryFee: 500, distance: '0,8 km', isOpen: true,
    location: { latitude: 6.1094, longitude: -3.8591, address: 'Marché central, Adzopé' },
    initials: 'MC', tone: 'sky',

    image: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=1200&q=82",
  },
  {
    id: 'merchant-004',
    name: 'La Pâtisserie d\u2019Adzopé',
    description: 'Pains artisanaux, croissants, gâteaux et douceurs préparés chaque matin par notre boulanger.',
    categoryId: 'pastries',
    category: 'Pâtisseries & Boulangerie',
    rating: 4.7, reviewCount: 73,
    deliveryTime: '20-30 min', deliveryFee: 500, distance: '1,8 km', isOpen: false,
    location: { latitude: 6.1017, longitude: -3.8569, address: 'Quartier résidentiel, Adzopé' },
    initials: 'PÂ', tone: 'sunset',

    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=82",
  },
  {
    id: 'merchant-005',
    name: 'Maquis La Détente',
    description: 'Ambiance conviviale, poisson braisé sauce piment et bières glacées. L\u2019endroit favori des locaux.',
    categoryId: 'maquis',
    category: 'Maquis traditionnel',
    rating: 4.5, reviewCount: 152,
    deliveryTime: '35-45 min', deliveryFee: 750, distance: '3,1 km', isOpen: true,
    location: { latitude: 6.1012, longitude: -3.8702, address: 'Quartier Plateau, Adzopé' },
    initials: 'LD', tone: 'forest',

    image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1200&q=82",
  },
  {
    id: 'merchant-006',
    name: 'Snack Express Romuald',
    description: 'Sandwichs chauds, omelettes, brochettes de poulet. Idéal pour une pause rapide ou un en-cas.',
    categoryId: 'fast-food',
    category: 'Fast-food & Snacks',
    rating: 4.3, reviewCount: 61,
    deliveryTime: '15-25 min', deliveryFee: 500, distance: '0,6 km', isOpen: true,
    location: { latitude: 6.1102, longitude: -3.8558, address: 'Rue de la Gare, Adzopé' },
    initials: 'SR', tone: 'sky',

    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=82",
  },
  {
    id: 'merchant-007',
    name: 'Épicerie Adjoua',
    description: 'Huile de palme, farine de manioc, condiments, conserves et produits d\u2019entretien au meilleur prix.',
    categoryId: 'shops',
    category: 'Épicerie & Dépannage',
    rating: 4.4, reviewCount: 38,
    deliveryTime: '20-30 min', deliveryFee: 500, distance: '1,0 km', isOpen: true,
    location: { latitude: 6.1068, longitude: -3.8609, address: 'Quartier Commerce, Adzopé' },
    initials: 'ÉA', tone: 'sunset',

    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=82",
  },
  {
    id: 'merchant-008',
    name: 'Restaurant Le Bananier',
    description: 'Spécialités de la région : foutou igname, garba frais et tilapia grillé. Cuisine du terroir à prix doux.',
    categoryId: 'restaurants',
    category: 'Cuisine locale',
    rating: 4.7, reviewCount: 94,
    deliveryTime: '30-40 min', deliveryFee: 750, distance: '2,0 km', isOpen: true,
    location: { latitude: 6.1055, longitude: -3.8638, address: 'Quartier Gendarmerie, Adzopé' },
    initials: 'LB', tone: 'forest',

    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=82",
  },
  {
    id: 'merchant-009',
    name: 'Vivres Frais Mariam',
    description: 'Légumes du jardin, ignames, bananes plantains, piments frais. Directement des producteurs locaux.',
    categoryId: 'vivres',
    category: 'Vivres & Légumes',
    rating: 4.6, reviewCount: 47,
    deliveryTime: '25-35 min', deliveryFee: 500, distance: '1,5 km', isOpen: true,
    location: { latitude: 6.1088, longitude: -3.8575, address: 'Derrière le marché, Adzopé' },
    initials: 'VM', tone: 'sky',

    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1200&q=82",
  },
  {
    id: 'merchant-010',
    name: 'Boulangerie du Carrefour',
    description: 'Baguettes tradition, pains complets, pain de mie. Ouvert dès 5\u202fh du matin pour les lève-tôt.',
    categoryId: 'pastries',
    category: 'Boulangerie',
    rating: 4.5, reviewCount: 82,
    deliveryTime: '15-20 min', deliveryFee: 250, distance: '0,4 km', isOpen: true,
    location: { latitude: 6.1108, longitude: -3.8547, address: 'Carrefour principal, Adzopé' },
    initials: 'BC', tone: 'sunset',

    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=82",
  },

  // ── NOUVEAUX FOOD ──────────────────────────────────────────────────────────

  {
    id: 'merchant-011',
    name: 'Chez Tonton Yao',
    description: 'Le spécialiste du poulet braisé à Adzopé. Braisé minute sur braise de bois, attiéké ou riz inclus.',
    categoryId: 'poulet',
    category: 'Poulet braisé',
    rating: 4.9, reviewCount: 214,
    deliveryTime: '20-30 min', deliveryFee: 500, distance: '1,1 km', isOpen: true,
    location: { latitude: 6.1072, longitude: -3.8601, address: 'Rue du Commerce, Adzopé' },
    initials: 'TY', tone: 'forest',

    image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1200&q=82",
  },
  {
    id: 'merchant-012',
    name: 'La Braise Royale',
    description: 'Côtes de bœuf, brochettes mixtes, escargots et côtelettes grillés à la braise. Goût authentique garanti.',
    categoryId: 'grillades',
    category: 'Grillades',
    rating: 4.7, reviewCount: 118,
    deliveryTime: '30-45 min', deliveryFee: 750, distance: '2,2 km', isOpen: true,
    location: { latitude: 6.1045, longitude: -3.8671, address: 'Boulevard Houphouët, Adzopé' },
    initials: 'BR', tone: 'sky',

    image: "https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1200&q=82",
  },
  {
    id: 'merchant-013',
    name: 'Burger Palace Adzopé',
    description: 'Burgers frais, nuggets croustillants, frites maison. La food moderne arrive à Adzopé !',
    categoryId: 'fast-food',
    category: 'Burger & Fast-food',
    rating: 4.4, reviewCount: 67,
    deliveryTime: '20-30 min', deliveryFee: 500, distance: '0,9 km', isOpen: true,
    location: { latitude: 6.1099, longitude: -3.8565, address: 'Centre commercial, Adzopé' },
    initials: 'BP', tone: 'sunset',

    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=82",
  },
  {
    id: 'merchant-014',
    name: 'Pizza Maquis Adzopé',
    description: 'Pizzas généreuses cuites au four à bois, avec garnitures locales et importées. Livraison rapide.',
    categoryId: 'pizza',
    category: 'Pizza',
    rating: 4.5, reviewCount: 53,
    deliveryTime: '25-35 min', deliveryFee: 750, distance: '1,6 km', isOpen: true,
    location: { latitude: 6.1032, longitude: -3.8633, address: 'Quartier Résidentiel, Adzopé' },
    initials: 'PM', tone: 'forest',

    image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1200&q=82",
  },
  {
    id: 'merchant-015',
    name: 'Station Attiéké',
    description: 'L\u2019attiéké comme vous l\u2019aimez : frais, froid ou chaud, avec poisson, poulet ou viande. Garba mythique.',
    categoryId: 'restaurants',
    category: 'Attiéké & Garba',
    rating: 4.8, reviewCount: 176,
    deliveryTime: '15-25 min', deliveryFee: 500, distance: '0,7 km', isOpen: true,
    location: { latitude: 6.1091, longitude: -3.8572, address: 'Marché central, Adzopé' },
    initials: 'SA', tone: 'sky',

    image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=82",
  },
  {
    id: 'merchant-016',
    name: 'Chez Sandrine',
    description: 'Sandwichs garnis, chawarma maison, tacos et hot-dogs. Cuisine fusion locale pour les gourmands pressés.',
    categoryId: 'fast-food',
    category: 'Sandwichs & Chawarma',
    rating: 4.3, reviewCount: 44,
    deliveryTime: '15-20 min', deliveryFee: 500, distance: '0,5 km', isOpen: true,
    location: { latitude: 6.1103, longitude: -3.8553, address: 'Rue de la Gare, Adzopé' },
    initials: 'CS', tone: 'sunset',

    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=82",
  },
  {
    id: 'merchant-017',
    name: 'Le Cocotier',
    description: 'Restaurant africain familial. Foutou, placali, kedjenou et soupe fumée dans une ambiance chaleureuse.',
    categoryId: 'restaurants',
    category: 'Restaurant africain',
    rating: 4.6, reviewCount: 99,
    deliveryTime: '35-50 min', deliveryFee: 750, distance: '2,8 km', isOpen: true,
    location: { latitude: 6.1021, longitude: -3.8688, address: 'Quartier Nouveau, Adzopé' },
    initials: 'LC', tone: 'forest',

    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=82",
  },

  // ── NOUVEAUX MARKET ────────────────────────────────────────────────────────

  {
    id: 'merchant-018',
    name: 'Boucherie Centrale',
    description: 'Viandes fraîches découpées à la demande : bœuf, mouton, poulet. Livraison rapide sous froid.',
    categoryId: 'boucherie',
    category: 'Boucherie',
    rating: 4.5, reviewCount: 61,
    deliveryTime: '20-30 min', deliveryFee: 500, distance: '1,3 km', isOpen: true,
    location: { latitude: 6.1078, longitude: -3.8598, address: 'Marché central, Adzopé' },
    initials: 'BC', tone: 'sky',

    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=82",
  },
  {
    id: 'merchant-019',
    name: 'Poissonnerie Fraîcheur',
    description: 'Poissons frais du jour : tilapia, carpe, maquereau, crevettes. Arrivage quotidien depuis le lac.',
    categoryId: 'poissonnerie',
    category: 'Poissonnerie',
    rating: 4.6, reviewCount: 55,
    deliveryTime: '25-35 min', deliveryFee: 500, distance: '1,7 km', isOpen: true,
    location: { latitude: 6.1061, longitude: -3.8621, address: 'Berge du lac, Adzopé' },
    initials: 'PF', tone: 'sunset',

    image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=82",
  },
  {
    id: 'merchant-020',
    name: 'Superette Adia Express',
    description: 'Épicerie complète : riz, huile, conserves, produits laitiers, œufs et boissons. Livraison express.',
    categoryId: 'markets',
    category: 'Superette',
    rating: 4.7, reviewCount: 130,
    deliveryTime: '15-25 min', deliveryFee: 500, distance: '0,9 km', isOpen: true,
    location: { latitude: 6.1096, longitude: -3.8583, address: 'Centre-ville, Adzopé' },
    initials: 'AE', tone: 'forest',

    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1200&q=82",
  },
  {
    id: 'merchant-021',
    name: 'Beauté & Maison Koné',
    description: 'Produits d\u2019hygiène, cosmétiques, entretien ménager. Tout pour votre bien-être livré chez vous.',
    categoryId: 'beaute',
    category: 'Beauté & Maison',
    rating: 4.4, reviewCount: 29,
    deliveryTime: '20-30 min', deliveryFee: 500, distance: '1,2 km', isOpen: true,
    location: { latitude: 6.1083, longitude: -3.8593, address: 'Quartier Commerce, Adzopé' },
    initials: 'BK', tone: 'sky',

    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=82",
  },
  {
    id: 'merchant-022',
    name: 'Fruits & Légumes Diallo',
    description: 'Fruits tropicaux et légumes du marché. Mangues, avocats, tomates et ignames cueillis du matin.',
    categoryId: 'vivres',
    category: 'Fruits & Légumes',
    rating: 4.8, reviewCount: 87,
    deliveryTime: '20-30 min', deliveryFee: 500, distance: '0,6 km', isOpen: true,
    location: { latitude: 6.1086, longitude: -3.8569, address: 'Derrière le marché, Adzopé' },
    initials: 'FD', tone: 'sunset',

    image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=1200&q=82",
  },
]

// ---------------------------------------------------------------------------
// PRODUITS — 152 articles
// ---------------------------------------------------------------------------

export const products: Product[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // CHEZ MAMAN AWA (merchant-001) — Cuisine locale
  // ═══════════════════════════════════════════════════════════════════════════
  { id:'p-001', merchantId:'merchant-001', categoryId:'restaurants', name:'Riz sauce graine',         description:'Portion généreuse, morceaux de poisson fumé et huile de palme maison',                price:3500, category:'Plats',          available:true,
 image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-002', merchantId:'merchant-001', categoryId:'restaurants', name:'Attiéké poisson frit',     description:'Attiéké frais, tilapia frit croustillant, sauce tomate piment et oignons',           price:4000, category:'Plats',          available:true,
 image: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-003', merchantId:'merchant-001', categoryId:'restaurants', name:'Kedjenou de poulet',       description:'Poulet mijoté aux épices, légumes du jardin, bouillon aromatique traditionnel',       price:5500, category:'Plats',          available:true,
 image: "https://images.unsplash.com/photo-1598514982901-ae6278f4a7d1?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-004', merchantId:'merchant-001', categoryId:'restaurants', name:'Riz sauce arachide',       description:'Riz blanc, sauce arachide onctueuse, poulet ou poisson au choix',                    price:4000, category:'Plats',          available:true,
 image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-005', merchantId:'merchant-001', categoryId:'restaurants', name:'Garba',                    description:'Thon braisé, attiéké frais, sauce piment de Maman Awa — la vraie recette',           price:1500, category:'Plats',          available:false,
 image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85", },
  { id:'p-006', merchantId:'merchant-001', categoryId:'restaurants', name:'Alloco + oeuf',            description:'Bananes plantains frites dorées accompagnées d\u2019un oeuf sur le plat',            price:1500, category:'Accompagnements', available:true,
 image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-007', merchantId:'merchant-001', categoryId:'restaurants', name:'Soupe de poisson',         description:'Bouillon de poisson fumé, légumes et épices, servie chaude avec fufu',                price:3000, category:'Soupes',         available:true,
 image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-008', merchantId:'merchant-001', categoryId:'restaurants', name:'Jus de gingembre maison',  description:'Gingembre frais pressé, citron, sucre de canne — bouteille 50\u202fcl',              price:750,  category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-009', merchantId:'merchant-001', categoryId:'restaurants', name:'Eau minérale 1,5\u202fL',  description:'Eau fraîche — OLGANE ou MIZAN',                                                       price:500,  category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85",  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LE PATIO D'ADZOPÉ (merchant-002) — Maquis
  // ═══════════════════════════════════════════════════════════════════════════
  { id:'p-010', merchantId:'merchant-002', categoryId:'maquis', name:'Poulet braisé entier',          description:'Poulet entier braisé sur braise de bois, attiéké et sauce maison inclus',             price:9000, category:'Grillades',       available:true,
 image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-011', merchantId:'merchant-002', categoryId:'maquis', name:'Demi-poulet braisé',            description:'Demi-poulet braisé, attiéké, piment et oignons frits',                               price:5000, category:'Grillades',       available:true,
 image: "https://images.unsplash.com/photo-1598514982901-ae6278f4a7d1?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-012', merchantId:'merchant-002', categoryId:'maquis', name:'Brochettes de boeuf ×5',        description:'Cinq brochettes de boeuf marinées aux épices, cuites à la braise',                   price:2500, category:'Grillades',       available:true,
 image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-013', merchantId:'merchant-002', categoryId:'maquis', name:'Poisson braisé',                description:'Tilapia entier braisé, sauce piment et attiéké',                                     price:6000, category:'Grillades',       available:true,
 image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-014', merchantId:'merchant-002', categoryId:'maquis', name:'Alloco sauce piment',           description:'Bananes plantains frites dorées, sauce tomate pimentée maison',                       price:1500, category:'Accompagnements', available:true,
 image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-015', merchantId:'merchant-002', categoryId:'maquis', name:'Coca-Cola 33\u202fcl',          description:'Boisson fraîche servie bien froide',                                                  price:500,  category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-016', merchantId:'merchant-002', categoryId:'maquis', name:'Fanta Orange 33\u202fcl',       description:'Boisson rafraîchissante bien froide',                                                 price:500,  category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-017', merchantId:'merchant-002', categoryId:'maquis', name:'Bière Castel 65\u202fcl',       description:'Bière locale bien fraîche, servie avec cacahuètes',                                  price:1200, category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85",  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MARCHÉ CENTRAL FRAIS (merchant-003) — Markets
  // ═══════════════════════════════════════════════════════════════════════════
  { id:'p-018', merchantId:'merchant-003', categoryId:'markets', name:'Panier du marché Essentiel',    description:'Tomates, oignons, ail, piment, gombo, poivrons — sélection du jour',                 price:3500, category:'Courses',         available:true,
 image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-019', merchantId:'merchant-003', categoryId:'markets', name:'Panier du marché Complet',      description:'Légumes variés + 1\u202fL huile palme + condiments — famille de 4',                  price:7500, category:'Courses',         available:true,
 image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-020', merchantId:'merchant-003', categoryId:'markets', name:'Igname blanche 2\u202fkg',      description:'Igname fraîche du marché, qualité sélectionnée',                                    price:2000, category:'Vivres',          available:true,
 image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-021', merchantId:'merchant-003', categoryId:'markets', name:'Bananes plantains ×6',          description:'Régime de plantains à point pour la cuisson',                                        price:1500, category:'Vivres',          available:true,
 image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-022', merchantId:'merchant-003', categoryId:'markets', name:'Huile de palme 1\u202fL',       description:'Huile de palme rouge artisanale, pressée localement',                               price:2500, category:'Épicerie',        available:true,
 image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-023', merchantId:'merchant-003', categoryId:'markets', name:'Farine de manioc 1\u202fkg',    description:'Farine d\u2019attiéké de qualité supérieure',                                       price:1000, category:'Épicerie',        available:true,
 image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-024', merchantId:'merchant-003', categoryId:'markets', name:'Tomates fraîches 1\u202fkg',    description:'Tomates fermes du jardin, idéales pour sauce ou salade',                            price:1000, category:'Légumes',         available:true,
 image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-025', merchantId:'merchant-003', categoryId:'markets', name:'Avocat ×4',                      description:'Avocats locaux mûrs à point, gros calibre de la région de la Mé',                  price:1500, category:'Fruits',          available:true,
 image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=900&q=85",  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LA PÂTISSERIE D'ADZOPÉ (merchant-004)
  // ═══════════════════════════════════════════════════════════════════════════
  { id:'p-026', merchantId:'merchant-004', categoryId:'pastries', name:'Baguette tradition',           description:'Baguette dorée à la croûte croustillante, cuite le matin',                           price:300,  category:'Pains',           available:true,
 image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-027', merchantId:'merchant-004', categoryId:'pastries', name:'Croissant au beurre',          description:'Croissant feuilleté au beurre, servi chaud',                                         price:500,  category:'Viennoiseries',   available:true,
 image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-028', merchantId:'merchant-004', categoryId:'pastries', name:'Gâteau au chocolat (part)',    description:'Moelleux au chocolat fondant, généreuse portion',                                    price:1500, category:'Pâtisseries',     available:false,
 image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=85", },
  { id:'p-029', merchantId:'merchant-004', categoryId:'pastries', name:'Pain de mie — miche',          description:'Pain de mie moelleux, idéal pour toasts et sandwichs',                             price:1200, category:'Pains',           available:true,
 image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-030', merchantId:'merchant-004', categoryId:'pastries', name:'Brioche nature',               description:'Brioche moelleuse légèrement sucrée, parfaite pour le petit déjeuner',              price:800,  category:'Viennoiseries',   available:true,
 image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-031', merchantId:'merchant-004', categoryId:'pastries', name:'Tarte aux fruits',             description:'Tarte garnie de fruits de saison sur crème pâtissière maison',                      price:2000, category:'Pâtisseries',     available:true,
 image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-032', merchantId:'merchant-004', categoryId:'pastries', name:'Café crème chaud',             description:'Café arabica, crème chaude, sucre — tasse 20\u202fcl',                              price:600,  category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85",  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MAQUIS LA DÉTENTE (merchant-005)
  // ═══════════════════════════════════════════════════════════════════════════
  { id:'p-033', merchantId:'merchant-005', categoryId:'maquis', name:'Poisson braisé entier',          description:'Tilapia ou capitaine braisé sur braise, sauce piment et attiéké inclus',             price:6000, category:'Grillades',       available:true,
 image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-034', merchantId:'merchant-005', categoryId:'maquis', name:'Escargots braisés ×10',          description:'Escargots géants braisés, sauce épicée maison, pain ou attiéké',                   price:4000, category:'Grillades',       available:true,
 image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-035', merchantId:'merchant-005', categoryId:'maquis', name:'Alloco sauce piment',            description:'Bananes plantains frites dorées, sauce tomate pimentée maison',                      price:1500, category:'Accompagnements', available:true,
 image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-036', merchantId:'merchant-005', categoryId:'maquis', name:'Attiéké solo',                   description:'Portion d\u2019attiéké frais nature, oignons et piment',                            price:1000, category:'Accompagnements', available:true,
 image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-037', merchantId:'merchant-005', categoryId:'maquis', name:'Arachides grillées',             description:'Cacahuètes grillées légèrement salées, sachet 100\u202fg',                          price:300,  category:'Snacks',          available:true,
 image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-038', merchantId:'merchant-005', categoryId:'maquis', name:'Fanta Orange 33\u202fcl',        description:'Boisson rafraîchissante bien froide',                                                price:500,  category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-039', merchantId:'merchant-005', categoryId:'maquis', name:'Bière Heineken 33\u202fcl',      description:'Bière import, fraîche et dorée',                                                     price:1500, category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-040', merchantId:'merchant-005', categoryId:'maquis', name:'Eau minérale 75\u202fcl',        description:'Eau fraîche, bouteille individuelle',                                                price:500,  category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=85",  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SNACK EXPRESS ROMUALD (merchant-006) — Fast-food
  // ═══════════════════════════════════════════════════════════════════════════
  { id:'p-041', merchantId:'merchant-006', categoryId:'fast-food', name:'Sandwich poulet grillé',      description:'Baguette croustillante, poulet grillé, mayo, tomate, salade verte',                  price:1500, category:'Sandwichs',       available:true,
 image: "https://images.unsplash.com/photo-1598514982901-ae6278f4a7d1?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-042', merchantId:'merchant-006', categoryId:'fast-food', name:'Sandwich viande hachée',      description:'Baguette garnie de viande hachée assaisonnée, fromage fondu, tomate',                price:1500, category:'Sandwichs',       available:true,
 image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-043', merchantId:'merchant-006', categoryId:'fast-food', name:'Omelette fromage baguette',   description:'Omelette moelleuse au fromage fondu dans une baguette chaude',                       price:1000, category:'Sandwichs',       available:true,
 image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-044', merchantId:'merchant-006', categoryId:'fast-food', name:'Brochettes poulet ×3',        description:'Trois brochettes marinées, sauce piment et oignons',                                 price:1500, category:'Grillades',       available:true,
 image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-045', merchantId:'merchant-006', categoryId:'fast-food', name:'Hot-dog classique',           description:'Saucisse grillée dans un pain moelleux, moutarde et ketchup',                       price:1000, category:'Sandwichs',       available:true,
 image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-046', merchantId:'merchant-006', categoryId:'fast-food', name:'Jus de bissap 50\u202fcl',    description:'Hibiscus rouge sucré, boisson traditionnelle fraîche',                              price:500,  category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-047', merchantId:'merchant-006', categoryId:'fast-food', name:'Sprite 33\u202fcl',           description:'Boisson pétillante citronnée fraîche',                                              price:500,  category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85",  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ÉPICERIE ADJOUA (merchant-007) — Shops
  // ═══════════════════════════════════════════════════════════════════════════
  { id:'p-048', merchantId:'merchant-007', categoryId:'shops', name:'Savon de Marseille ×3',           description:'Savon de ménage triple usage — lessive, vaisselle, usage courant',                  price:750,  category:'Entretien',       available:true,
 image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-049', merchantId:'merchant-007', categoryId:'shops', name:'Sardines à l\u2019huile (boîte)', description:'Sardines en conserve qualité import, boîte 125\u202fg',                            price:800,  category:'Conserves',       available:true,
 image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-050', merchantId:'merchant-007', categoryId:'shops', name:'Cube Maggi ×24',                  description:'Boîte de 24 cubes bouillon, incontournable de la cuisine ivoirienne',               price:500,  category:'Épicerie',        available:true,
 image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-051', merchantId:'merchant-007', categoryId:'shops', name:'Pâtes alimentaires 500\u202fg',   description:'Spaghetti ou macaroni, marque locale certifiée',                                    price:600,  category:'Épicerie',        available:true,
 image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-052', merchantId:'merchant-007', categoryId:'shops', name:'Riz parfumé 1\u202fkg',           description:'Riz long grain parfumé, qualité premium',                                           price:1200, category:'Épicerie',        available:true,
 image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-053', merchantId:'merchant-007', categoryId:'shops', name:'Eau de javel 1\u202fL',           description:'Eau de javel désinfectante toutes surfaces, flacon 1\u202fL',                       price:600,  category:'Entretien',       available:true,
 image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85",  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RESTAURANT LE BANANIER (merchant-008)
  // ═══════════════════════════════════════════════════════════════════════════
  { id:'p-054', merchantId:'merchant-008', categoryId:'restaurants', name:'Foutou igname soupe',       description:'Foutou d\u2019igname pilé, soupe de poisson fumé et légumes du jardin',             price:4500, category:'Plats',           available:true,
 image: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-055', merchantId:'merchant-008', categoryId:'restaurants', name:'Foutou sauce arachide',     description:'Foutou d\u2019igname, sauce arachide crémeuse, poulet ou poisson',                  price:4500, category:'Plats',           available:true,
 image: "https://images.unsplash.com/photo-1598514982901-ae6278f4a7d1?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-056', merchantId:'merchant-008', categoryId:'restaurants', name:'Placali sauce graine',      description:'Placali de manioc, sauce graine généreuse, poisson fumé',                            price:4000, category:'Plats',           available:true,
 image: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-057', merchantId:'merchant-008', categoryId:'restaurants', name:'Tilapia grillé complet',    description:'Tilapia du Lac frais, grillé, accompagné de riz gras ou d\u2019attiéké',            price:7000, category:'Plats',           available:true,
 image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-058', merchantId:'merchant-008', categoryId:'restaurants', name:'Sauce claire poulet',       description:'Portion de sauce claire avec poulet local, riz ou foutou au choix',                  price:4000, category:'Plats',           available:true,
 image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-059', merchantId:'merchant-008', categoryId:'restaurants', name:'Igname frite',              description:'Igname blanche frite dorée, sel et piment, portion individuelle',                    price:1500, category:'Accompagnements', available:true,
 image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-060', merchantId:'merchant-008', categoryId:'restaurants', name:'Soupe de poulet',           description:'Bouillon clair de poulet local, légumes et épices, très nourrissant',               price:3500, category:'Soupes',          available:true,
 image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-061', merchantId:'merchant-008', categoryId:'restaurants', name:'Eau minérale 1,5\u202fL',   description:'Eau fraîche — OLGANE ou MIZAN',                                                      price:500,  category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85",  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VIVRES FRAIS MARIAM (merchant-009) — Vivres
  // ═══════════════════════════════════════════════════════════════════════════
  { id:'p-062', merchantId:'merchant-009', categoryId:'vivres', name:'Tomates fraîches 1\u202fkg',     description:'Tomates fermes du jardin, idéales pour sauce, grillades ou salades',                price:1000, category:'Légumes',         available:true,
 image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-063', merchantId:'merchant-009', categoryId:'vivres', name:'Piment frais — sachet',          description:'Piment rouge fort, sachet 200\u202fg — directement du champ',                       price:500,  category:'Épices',          available:true,
 image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-064', merchantId:'merchant-009', categoryId:'vivres', name:'Avocat ×4',                       description:'Avocats locaux mûrs à point, gros calibre de la région de la Mé',                  price:1500, category:'Fruits',          available:true,
 image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-065', merchantId:'merchant-009', categoryId:'vivres', name:'Gombo frais 500\u202fg',          description:'Gombo de saison, idéal pour sauce gombo ou kedjenou',                              price:750,  category:'Légumes',         available:false,
 image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85", },
  { id:'p-066', merchantId:'merchant-009', categoryId:'vivres', name:'Oignons 1\u202fkg',              description:'Oignons blancs ou rouges, condition régulière, cultivé localement',                 price:800,  category:'Légumes',         available:true,
 image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-067', merchantId:'merchant-009', categoryId:'vivres', name:'Banane douce ×6',                 description:'Bananes douces mûres, idéales pour le dessert ou le goûter',                       price:1000, category:'Fruits',          available:true,
 image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=900&q=85",  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BOULANGERIE DU CARREFOUR (merchant-010)
  // ═══════════════════════════════════════════════════════════════════════════
  { id:'p-068', merchantId:'merchant-010', categoryId:'pastries', name:'Baguette ordinaire',            description:'La baguette du quartier, cuite plusieurs fois par jour',                             price:200,  category:'Pains',           available:true,
 image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-069', merchantId:'merchant-010', categoryId:'pastries', name:'Pain complet — demi',           description:'Pain complet aux céréales, riche en fibres — demi-miche 400\u202fg',               price:900,  category:'Pains',           available:true,
 image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-070', merchantId:'merchant-010', categoryId:'pastries', name:'Chausson à la banane',          description:'Viennoiserie feuilletée garnie de banane caramélisée',                              price:400,  category:'Viennoiseries',   available:true,
 image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-071', merchantId:'merchant-010', categoryId:'pastries', name:'Beignets ×5',                   description:'Beignets dorés chauds à la sortie du four, sucrés ou nature',                      price:500,  category:'Viennoiseries',   available:true,
 image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-072', merchantId:'merchant-010', categoryId:'pastries', name:'Pain au chocolat',              description:'Viennoiserie feuilletée au chocolat noir fondant',                                   price:500,  category:'Viennoiseries',   available:true,
 image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-073', merchantId:'merchant-010', categoryId:'pastries', name:'Sandwich jambon fromage',       description:'Baguette garnie de jambon et fromage fondu, gratiné',                               price:1500, category:'Sandwichs',       available:true,
 image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85",  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHEZ TONTON YAO (merchant-011) — Poulet braisé
  // ═══════════════════════════════════════════════════════════════════════════
  { id:'p-074', merchantId:'merchant-011', categoryId:'poulet', name:'Poulet braisé entier',            description:'Poulet entier braisé minute sur braise de bois, attiéké et sauce maison',            price:8500, category:'Grillades',       available:true,
 image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-075', merchantId:'merchant-011', categoryId:'poulet', name:'Demi-poulet braisé',              description:'Demi-poulet braisé doré, piment, oignons et attiéké',                               price:4500, category:'Grillades',       available:true,
 image: "https://images.unsplash.com/photo-1598514982901-ae6278f4a7d1?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-076', merchantId:'merchant-011', categoryId:'poulet', name:'Cuisses de poulet ×2',            description:'Deux cuisses bien grillées, sauce épicée maison',                                    price:3500, category:'Grillades',       available:true,
 image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-077', merchantId:'merchant-011', categoryId:'poulet', name:'Ailes de poulet ×6',              description:'Six ailes croustillantes braisées, sauce piment fort',                               price:3000, category:'Grillades',       available:true,
 image: "https://images.unsplash.com/photo-1598514982901-ae6278f4a7d1?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-078', merchantId:'merchant-011', categoryId:'poulet', name:'Poulet + riz gras',               description:'Demi-poulet braisé accompagné de riz gras aux légumes',                             price:5500, category:'Plats',           available:true,
 image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-079', merchantId:'merchant-011', categoryId:'poulet', name:'Attiéké solo',                    description:'Grande portion d\u2019attiéké frais, oignons et piment nature',                     price:1000, category:'Accompagnements', available:true,
 image: "https://images.unsplash.com/photo-1598514982901-ae6278f4a7d1?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-080', merchantId:'merchant-011', categoryId:'poulet', name:'Alloco maison',                   description:'Bananes plantains frites, sauce tomate pimentée maison',                             price:1500, category:'Accompagnements', available:true,
 image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-081', merchantId:'merchant-011', categoryId:'poulet', name:'Jus de gingembre citron',         description:'Gingembre frais pressé, citron, menthe — rafraîchissant',                           price:750,  category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1598514982901-ae6278f4a7d1?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-082', merchantId:'merchant-011', categoryId:'poulet', name:'Coca-Cola 33\u202fcl',            description:'Boisson fraîche bien froide',                                                        price:500,  category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-083', merchantId:'merchant-011', categoryId:'poulet', name:'Bissap maison 50\u202fcl',        description:'Bissap rouge sucré, goût authentique maison',                                        price:600,  category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1598514982901-ae6278f4a7d1?auto=format&fit=crop&w=900&q=85",  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LA BRAISE ROYALE (merchant-012) — Grillades
  // ═══════════════════════════════════════════════════════════════════════════
  { id:'p-084', merchantId:'merchant-012', categoryId:'grillades', name:'Côte de boeuf braisée',       description:'Côte de boeuf marinée aux herbes, braisée à point, sauce béarnaise',                 price:9000, category:'Grillades',       available:true,
 image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-085', merchantId:'merchant-012', categoryId:'grillades', name:'Brochettes mixtes ×8',         description:'Brochettes boeuf, poulet et agneau alternées, sauce piment',                         price:5000, category:'Grillades',       available:true,
 image: "https://images.unsplash.com/photo-1598514982901-ae6278f4a7d1?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-086', merchantId:'merchant-012', categoryId:'grillades', name:'Côtelettes d\u2019agneau ×3', description:'Trois côtelettes d\u2019agneau grillées, thym et ail',                              price:7000, category:'Grillades',       available:true,
 image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-087', merchantId:'merchant-012', categoryId:'grillades', name:'Escargots braisés ×12',        description:'Escargots géants braisés, beurre aillé et persil',                                  price:5000, category:'Grillades',       available:true,
 image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-088', merchantId:'merchant-012', categoryId:'grillades', name:'Saucisses grillées ×4',        description:'Saucisses de boeuf artisanales grillées, moutarde et cornichons',                   price:3500, category:'Grillades',       available:true,
 image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-089', merchantId:'merchant-012', categoryId:'grillades', name:'Frites maison',                description:'Pommes de terre fraîches coupées et frites, légèrement salées',                     price:1500, category:'Accompagnements', available:true,
 image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-090', merchantId:'merchant-012', categoryId:'grillades', name:'Salade verte',                 description:'Salade mixte fraîche, tomates, concombres, vinaigrette',                             price:1000, category:'Accompagnements', available:true,
 image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-091', merchantId:'merchant-012', categoryId:'grillades', name:'Bière Flag 65\u202fcl',        description:'Bière ivoirienne bien fraîche',                                                      price:1200, category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-092', merchantId:'merchant-012', categoryId:'grillades', name:'Limonade maison 50\u202fcl',   description:'Citron pressé, menthe fraîche, eau pétillante',                                      price:800,  category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=85",  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BURGER PALACE ADZOPÉ (merchant-013) — Burger
  // ═══════════════════════════════════════════════════════════════════════════
  { id:'p-093', merchantId:'merchant-013', categoryId:'fast-food', name:'Classic Burger',               description:'Steak boeuf haché, salade, tomate, oignon, ketchup, pain brioché',                  price:3500, category:'Burger',          available:true,
 image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-094', merchantId:'merchant-013', categoryId:'fast-food', name:'Cheese Burger',                description:'Steak boeuf, cheddar fondu, salade, tomate, moutarde',                              price:4000, category:'Burger',          available:true,
 image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-095', merchantId:'merchant-013', categoryId:'fast-food', name:'Chicken Burger',               description:'Filet de poulet pané croustillant, sauce spéciale, coleslaw',                       price:3500, category:'Burger',          available:true,
 image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-096', merchantId:'merchant-013', categoryId:'fast-food', name:'Double Burger',                description:'Double steak boeuf, double cheddar, bacon, sauce signature',                        price:5500, category:'Burger',          available:true,
 image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-097', merchantId:'merchant-013', categoryId:'fast-food', name:'Chicken Nuggets ×8',           description:'Huit nuggets de poulet dorés, sauce curry ou ketchup',                              price:2500, category:'Snacks',          available:true,
 image: "https://images.unsplash.com/photo-1598514982901-ae6278f4a7d1?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-098', merchantId:'merchant-013', categoryId:'fast-food', name:'Wings épicés ×8',              description:'Ailes de poulet marinées, panées et frites, sauce piquante',                        price:3000, category:'Snacks',          available:true,
 image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-099', merchantId:'merchant-013', categoryId:'fast-food', name:'Frites classiques',            description:'Frites de pommes de terre dorées et croustillantes',                                price:1500, category:'Accompagnements', available:true,
 image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-100', merchantId:'merchant-013', categoryId:'fast-food', name:'Hot-dog fromage',              description:'Saucisse de poulet, cheddar fondu, oignons caramélisés',                            price:2000, category:'Sandwichs',       available:true,
 image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-101', merchantId:'merchant-013', categoryId:'fast-food', name:'Coca-Cola 50\u202fcl',         description:'Coca bien froid, cup avec glaçons',                                                  price:700,  category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-102', merchantId:'merchant-013', categoryId:'fast-food', name:'Milkshake fraise',             description:'Milkshake onctueux à la fraise, 40\u202fcl',                                        price:2000, category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=85",  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PIZZA MAQUIS ADZOPÉ (merchant-014) — Pizza
  // ═══════════════════════════════════════════════════════════════════════════
  { id:'p-103', merchantId:'merchant-014', categoryId:'pizza', name:'Pizza Margherita',                 description:'Tomate, mozzarella, basilic frais — la classique italienne',                         price:5000, category:'Pizza',           available:true,
 image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-104', merchantId:'merchant-014', categoryId:'pizza', name:'Pizza Poulet',                     description:'Poulet grillé, poivrons, champignons, mozzarella',                                   price:6000, category:'Pizza',           available:true,
 image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-105', merchantId:'merchant-014', categoryId:'pizza', name:'Pizza Viande',                     description:'Viande hachée assaisonnée, oignons, olives, fromage fondu',                          price:6500, category:'Pizza',           available:true,
 image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-106', merchantId:'merchant-014', categoryId:'pizza', name:'Pizza 4 Fromages',                 description:'Mozzarella, emmental, chèvre et parmesan fondus',                                    price:7000, category:'Pizza',           available:true,
 image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-107', merchantId:'merchant-014', categoryId:'pizza', name:'Pizza Végétarienne',               description:'Légumes grillés, tomate fraîche, herbes de Provence, mozzarella',                   price:5500, category:'Pizza',           available:true,
 image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-108', merchantId:'merchant-014', categoryId:'pizza', name:'Pizza Familiale Poulet',           description:'Grande pizza 45\u202fcm, poulet, légumes, double fromage — 6 parts',                price:9000, category:'Pizza',           available:true,
 image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-109', merchantId:'merchant-014', categoryId:'pizza', name:'Fanta Orange 33\u202fcl',          description:'Boisson fraîche bien froide',                                                        price:500,  category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-110', merchantId:'merchant-014', categoryId:'pizza', name:'Eau minérale 50\u202fcl',          description:'Eau fraîche plate',                                                                  price:300,  category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85",  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STATION ATTIÉKÉ (merchant-015) — Attiéké
  // ═══════════════════════════════════════════════════════════════════════════
  { id:'p-111', merchantId:'merchant-015', categoryId:'restaurants', name:'Attiéké poisson frit',       description:'Grande portion d\u2019attiéké, tilapia frit croustillant, sauce tomate',             price:3500, category:'Plats',           available:true,
 image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-112', merchantId:'merchant-015', categoryId:'restaurants', name:'Attiéké poulet braisé',      description:'Attiéké frais, demi-poulet braisé, piment et oignons',                               price:4500, category:'Plats',           available:true,
 image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-113', merchantId:'merchant-015', categoryId:'restaurants', name:'Attiéké viande',             description:'Attiéké frais, viande de boeuf braisée, sauce épicée',                              price:4000, category:'Plats',           available:true,
 image: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-114', merchantId:'merchant-015', categoryId:'restaurants', name:'Garba classique',            description:'Thon braisé, attiéké nature, sauce piment — le plat emblématique',                  price:1500, category:'Plats',           available:true,
 image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-115', merchantId:'merchant-015', categoryId:'restaurants', name:'Garba spécial thon+',        description:'Double portion de thon braisé, attiéké, sauce piment fort',                          price:2500, category:'Plats',           available:true,
 image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-116', merchantId:'merchant-015', categoryId:'restaurants', name:'Attiéké alloco+oeuf',        description:'Attiéké, alloco doré, oeuf sur le plat et sauce tomate',                             price:2500, category:'Plats',           available:true,
 image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-117', merchantId:'merchant-015', categoryId:'restaurants', name:'Jus d\u2019ananas frais',   description:'Jus d\u2019ananas frais pressé, sans sucre ajouté, 50\u202fcl',                      price:750,  category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-118', merchantId:'merchant-015', categoryId:'restaurants', name:'Jus de mangue 50\u202fcl',  description:'Mangues fraîches mixées, légèrement sucré',                                           price:750,  category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=85",  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHEZ SANDRINE (merchant-016) — Sandwichs & Chawarma
  // ═══════════════════════════════════════════════════════════════════════════
  { id:'p-119', merchantId:'merchant-016', categoryId:'fast-food', name:'Chawarma poulet',              description:'Pain pita garni de poulet mariné, légumes croquants, sauce blanche',                 price:2500, category:'Sandwichs',       available:true,
 image: "https://images.unsplash.com/photo-1598514982901-ae6278f4a7d1?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-120', merchantId:'merchant-016', categoryId:'fast-food', name:'Chawarma viande',              description:'Pain pita, viande de boeuf épicée, tomate, oignon, sauce piquante',                 price:3000, category:'Sandwichs',       available:true,
 image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-121', merchantId:'merchant-016', categoryId:'fast-food', name:'Tacos poulet',                 description:'Tortilla garnie de poulet, légumes, fromage râpé, sauce maison',                    price:2500, category:'Sandwichs',       available:true,
 image: "https://images.unsplash.com/photo-1598514982901-ae6278f4a7d1?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-122', merchantId:'merchant-016', categoryId:'fast-food', name:'Sandwich poulet crudités',     description:'Poulet grillé, crudités fraîches, mayo citron, baguette croustillante',              price:1500, category:'Sandwichs',       available:true,
 image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-123', merchantId:'merchant-016', categoryId:'fast-food', name:'Hot-dog moutarde',             description:'Saucisse porc, moutarde, oignons frits, bun tendre',                                price:1500, category:'Sandwichs',       available:true,
 image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-124', merchantId:'merchant-016', categoryId:'fast-food', name:'Omelette garnie',              description:'Omelette aux champignons, fromage et poivrons, pain de mie grillé',                 price:1500, category:'Sandwichs',       available:true,
 image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-125', merchantId:'merchant-016', categoryId:'fast-food', name:'Jus de passion 50\u202fcl',   description:'Jus de fruit de la passion, sucré, très rafraîchissant',                             price:750,  category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-126', merchantId:'merchant-016', categoryId:'fast-food', name:'Sprite 33\u202fcl',            description:'Boisson pétillante citronnée fraîche',                                              price:500,  category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=85",  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LE COCOTIER (merchant-017) — Restaurant africain
  // ═══════════════════════════════════════════════════════════════════════════
  { id:'p-127', merchantId:'merchant-017', categoryId:'restaurants', name:'Foutou igname sauce graine', description:'Foutou pilé, sauce graine richissime, morceaux de viande fumée',                    price:5000, category:'Plats',           available:true,
 image: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-128', merchantId:'merchant-017', categoryId:'restaurants', name:'Placali sauce gombo',         description:'Placali de manioc, sauce gombo poissons et crevettes',                             price:4500, category:'Plats',           available:true,
 image: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-129', merchantId:'merchant-017', categoryId:'restaurants', name:'Kedjenou poisson',            description:'Poisson mijoté à l\u2019étouffée dans sa propre vapeur, épices et tomate',        price:5500, category:'Plats',           available:true,
 image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-130', merchantId:'merchant-017', categoryId:'restaurants', name:'Riz sauce tomate',            description:'Riz long grain, sauce tomate fraîche, poulet ou viande au choix',                  price:3500, category:'Plats',           available:true,
 image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-131', merchantId:'merchant-017', categoryId:'restaurants', name:'Banane plantain frite',       description:'Bananes plantains frites croustillantes, nature ou sauce piment',                   price:1500, category:'Accompagnements', available:true,
 image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-132', merchantId:'merchant-017', categoryId:'restaurants', name:'Patate douce frite',          description:'Patates douces frites légèrement sucrées, dorées et croustillantes',               price:1500, category:'Accompagnements', available:true,
 image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-133', merchantId:'merchant-017', categoryId:'restaurants', name:'Cocktail de fruits maison',   description:'Ananas, mangue, papaye et gingembre mixés frais, 50\u202fcl',                      price:1000, category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-134', merchantId:'merchant-017', categoryId:'restaurants', name:'Eau pétillante 50\u202fcl',  description:'Eau pétillante fraîche, bouteille individuelle',                                     price:500,  category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=85",  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BOUCHERIE CENTRALE (merchant-018) — Boucherie
  // ═══════════════════════════════════════════════════════════════════════════
  { id:'p-135', merchantId:'merchant-018', categoryId:'boucherie', name:'Poulet entier (1,5 kg env.)',   description:'Poulet local entier vidé et prêt à cuire, poids moyen 1,5\u202fkg',                 price:4000, category:'Viandes',         available:true,
 image: "https://images.unsplash.com/photo-1598514982901-ae6278f4a7d1?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-136', merchantId:'merchant-018', categoryId:'boucherie', name:'Cuisses de poulet ×4',          description:'Quatre cuisses de poulet fraîches, découpées à la demande',                        price:3000, category:'Viandes',         available:true,
 image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-137', merchantId:'merchant-018', categoryId:'boucherie', name:'Viande de boeuf 1\u202fkg',    description:'Boeuf local découpé en morceaux, qualité boucher',                                  price:5500, category:'Viandes',         available:true,
 image: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-138', merchantId:'merchant-018', categoryId:'boucherie', name:'Viande hachée 500\u202fg',     description:'Boeuf haché frais du jour, idéal pour burgers et sauces',                          price:3000, category:'Viandes',         available:true,
 image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-139', merchantId:'merchant-018', categoryId:'boucherie', name:'Mouton — gigot (1 kg)',         description:'Gigot de mouton local, tendre et savoureux, découpé à la demande',                 price:7000, category:'Viandes',         available:true,
 image: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-140', merchantId:'merchant-018', categoryId:'boucherie', name:'Côtes de porc ×4',              description:'Côtes de porc fraîches, idéales pour grillade ou rôti',                            price:4500, category:'Viandes',         available:false,
 image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85", },
  { id:'p-141', merchantId:'merchant-018', categoryId:'boucherie', name:'Foie de boeuf 500\u202fg',     description:'Foie frais, riche en fer, idéal sauté aux oignons',                                price:2500, category:'Viandes',         available:true,
 image: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=900&q=85",  },

  // ═══════════════════════════════════════════════════════════════════════════
  // POISSONNERIE FRAÎCHEUR (merchant-019)
  // ═══════════════════════════════════════════════════════════════════════════
  { id:'p-142', merchantId:'merchant-019', categoryId:'poissonnerie', name:'Tilapia frais (800g env.)',  description:'Tilapia du lac entier et frais, poids moyen 800\u202fg, vide sur demande',          price:3000, category:'Poissons',        available:true,
 image: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-143', merchantId:'merchant-019', categoryId:'poissonnerie', name:'Carpe fraîche (1 kg env.)',  description:'Carpe entière fraîche, chair ferme et savoureuse',                                  price:4000, category:'Poissons',        available:true,
 image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-144', merchantId:'merchant-019', categoryId:'poissonnerie', name:'Maquereau frais ×3',         description:'Trois maquereaux frais, idéals grillés ou braisés',                                 price:3500, category:'Poissons',        available:true,
 image: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-145', merchantId:'merchant-019', categoryId:'poissonnerie', name:'Crevettes fraîches 500\u202fg', description:'Crevettes du golfe fraîches, décortiquées ou entières',                       price:5000, category:'Poissons',        available:true,
 image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-146', merchantId:'merchant-019', categoryId:'poissonnerie', name:'Poisson fumé 500\u202fg',   description:'Poisson fumé artisanal, idéal pour sauces et soupes',                              price:3500, category:'Poissons',        available:true,
 image: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-147', merchantId:'merchant-019', categoryId:'poissonnerie', name:'Thon frais (steak 300g)',    description:'Steak de thon frais 300\u202fg, grillé ou en sauce',                               price:4500, category:'Poissons',        available:false,
 image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=85", },

  // ═══════════════════════════════════════════════════════════════════════════
  // SUPERETTE ADIA EXPRESS (merchant-020) — Markets
  // ═══════════════════════════════════════════════════════════════════════════
  { id:'p-148', merchantId:'merchant-020', categoryId:'markets', name:'Riz parfumé 5\u202fkg',          description:'Riz long grain parfumé, sac familial 5\u202fkg',                                    price:5500, category:'Épicerie',        available:true,
 image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-149', merchantId:'merchant-020', categoryId:'markets', name:'Huile végétale 1\u202fL',         description:'Huile végétale raffinée, idéale pour la cuisson',                                   price:2000, category:'Épicerie',        available:true,
 image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-150', merchantId:'merchant-020', categoryId:'markets', name:'Sucre cristallisé 1\u202fkg',     description:'Sucre blanc cristallisé, qualité standard',                                         price:800,  category:'Épicerie',        available:true,
 image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-151', merchantId:'merchant-020', categoryId:'markets', name:'Farine de blé 1\u202fkg',         description:'Farine tout usage pour pains, gâteaux et sauces',                                   price:1000, category:'Épicerie',        available:true,
 image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-152', merchantId:'merchant-020', categoryId:'markets', name:'Lait en poudre 400\u202fg',       description:'Lait entier en poudre, marque NIDO ou équivalent',                                  price:3500, category:'Épicerie',        available:true,
 image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-153', merchantId:'merchant-020', categoryId:'markets', name:'Café soluble 200\u202fg',         description:'Café Nescafé ou Ricoré, pot 200\u202fg',                                           price:2500, category:'Épicerie',        available:true,
 image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-154', merchantId:'merchant-020', categoryId:'markets', name:'Oeufs frais ×12',                  description:'Oeufs de poule frais, plateau de 12',                                               price:2500, category:'Épicerie',        available:true,
 image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-155', merchantId:'merchant-020', categoryId:'markets', name:'Tomate concentrée (boîte)',        description:'Tomate concentrée double, boîte 400\u202fg',                                        price:700,  category:'Conserves',       available:true,
 image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-156', merchantId:'merchant-020', categoryId:'markets', name:'Biscuits LU ×10',                  description:'Paquet de 10 biscuits secs, goûter ou petit déjeuner',                             price:500,  category:'Épicerie',        available:true,
 image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-157', merchantId:'merchant-020', categoryId:'markets', name:'Sel iodé 1\u202fkg',               description:'Sel iodé fin, sachet 1\u202fkg',                                                   price:400,  category:'Épicerie',        available:true,
 image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-158', merchantId:'merchant-020', categoryId:'markets', name:'Eau minérale ×6 (1,5\u202fL)',     description:'Pack de 6 bouteilles eau minérale 1,5\u202fL',                                     price:3000, category:'Boissons',        available:true,
 image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=85",  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BEAUTÉ & MAISON KONÉ (merchant-021)
  // ═══════════════════════════════════════════════════════════════════════════
  { id:'p-159', merchantId:'merchant-021', categoryId:'beaute', name:'Gel douche Dove 250\u202fml',       description:'Gel douche hydratant, parfum doux, peau sensible',                                  price:2500, category:'Beauté',          available:true,
 image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-160', merchantId:'merchant-021', categoryId:'beaute', name:'Shampooing Pantene 400\u202fml',    description:'Shampooing soin et brillance, tous types de cheveux',                               price:3500, category:'Beauté',          available:true,
 image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-161', merchantId:'merchant-021', categoryId:'beaute', name:'Crème corporelle Nivea 400\u202fml',description:'Crème nourrissante hydratation longue durée, peaux sèches',                        price:3000, category:'Beauté',          available:true,
 image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-162', merchantId:'merchant-021', categoryId:'beaute', name:'Déodorant Rexona stick',             description:'Déodorant 48h, protection transpiration, format stick 50\u202fg',                  price:2000, category:'Beauté',          available:true,
 image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-163', merchantId:'merchant-021', categoryId:'beaute', name:'Dentifrice Colgate 75\u202fml',     description:'Dentifrice protection caries et blancheur, tube 75\u202fml',                       price:1500, category:'Beauté',          available:true,
 image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-164', merchantId:'merchant-021', categoryId:'beaute', name:'Vaseline Original 250\u202fml',     description:'Gelée de pétrole pure, hydratation intense peau et lèvres',                        price:1500, category:'Beauté',          available:true,
 image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-165', merchantId:'merchant-021', categoryId:'menage', name:'Lessive Ariel 1\u202fkg',           description:'Lessive en poudre toutes lessiveuses, efficace à basse température',                price:3000, category:'Entretien',       available:true,
 image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-166', merchantId:'merchant-021', categoryId:'menage', name:'Liquide vaisselle Paic 750\u202fml',description:'Liquide vaisselle dégraissant puissant, parfum citron',                            price:1500, category:'Entretien',       available:true,
 image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-167', merchantId:'merchant-021', categoryId:'menage', name:'Papier toilette ×6 rouleaux',        description:'Pack de 6 rouleaux doubles épaisseurs, doux et résistants',                        price:2500, category:'Entretien',       available:true,
 image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-168', merchantId:'merchant-021', categoryId:'menage', name:'Éponge grattante ×3',                description:'Éponges à récurer double face pour vaisselle et surfaces',                         price:750,  category:'Entretien',       available:true,
 image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=900&q=85",  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FRUITS & LÉGUMES DIALLO (merchant-022) — Vivres
  // ═══════════════════════════════════════════════════════════════════════════
  { id:'p-169', merchantId:'merchant-022', categoryId:'vivres', name:'Mangue ×4',                        description:'Mangues locales sucrées et juteuses, variété Kent ou Julie',                        price:1500, category:'Fruits',          available:true,
 image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-170', merchantId:'merchant-022', categoryId:'vivres', name:'Ananas entier',                    description:'Ananas Victoria de Côte d\u2019Ivoire, parfumé et sucré',                          price:1500, category:'Fruits',          available:true,
 image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-171', merchantId:'merchant-022', categoryId:'vivres', name:'Papaye mûre (1 kg)',                description:'Papaye jaune et sucrée, mûrie sur pied, poids environ 1\u202fkg',                  price:1000, category:'Fruits',          available:true,
 image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-172', merchantId:'merchant-022', categoryId:'vivres', name:'Orange ×6',                        description:'Oranges fraîches de saison, jus abondant, idéales à presser',                      price:1000, category:'Fruits',          available:true,
 image: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-173', merchantId:'merchant-022', categoryId:'vivres', name:'Noix de coco ×2',                  description:'Noix de coco fraîches avec eau de coco, à boire ou cuisiner',                      price:1500, category:'Fruits',          available:true,
 image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-174', merchantId:'merchant-022', categoryId:'vivres', name:'Banane plantain ×8',                description:'Régime de plantains mûrs à point pour alloco ou braisé',                           price:2000, category:'Fruits',          available:true,
 image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-175', merchantId:'merchant-022', categoryId:'vivres', name:'Tomate 1\u202fkg',                  description:'Tomates rondes fermes du jardin, idéales pour sauce ou crudités',                  price:1000, category:'Légumes',         available:true,
 image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-176', merchantId:'merchant-022', categoryId:'vivres', name:'Aubergine ×3',                     description:'Aubergines violettes fraîches, fermes et brillantes',                               price:800,  category:'Légumes',         available:true,
 image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-177', merchantId:'merchant-022', categoryId:'vivres', name:'Carotte 500\u202fg',               description:'Carottes fraîches et croquantes, lavées et prêtes à l\u2019emploi',               price:700,  category:'Légumes',         available:true,
 image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-178', merchantId:'merchant-022', categoryId:'vivres', name:'Concombre ×2',                     description:'Concombres longs et fermes, rafraîchissants en salade',                             price:600,  category:'Légumes',         available:true,
 image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-179', merchantId:'merchant-022', categoryId:'vivres', name:'Chou blanc (demi)',                 description:'Demi-chou blanc frais et croquant, idéal pour coleslaw',                            price:500,  category:'Légumes',         available:true,
 image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85",  },
  { id:'p-180', merchantId:'merchant-022', categoryId:'vivres', name:'Igname blanche 3\u202fkg',         description:'Igname fraîche de qualité, gros calibre, poids environ 3\u202fkg',                 price:3000, category:'Vivres',          available:true,
 image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85",  },
]

// ---------------------------------------------------------------------------
// COMMANDES — 8 commandes avec statuts variés (données inchangées)
// ---------------------------------------------------------------------------

export const initialOrders: Order[] = [
  {
    id: 'RB-000124', orderNumber: 'RB-2026-000124',
    merchantId: 'merchant-002', merchantName: 'Le Patio d\u2019Adzopé',
    items: [
      { productId: 'p-011', name: 'Demi-poulet braisé',      quantity: 2, unitPrice: 5000 },
      { productId: 'p-012', name: 'Brochettes de boeuf ×5',  quantity: 1, unitPrice: 2500 },
      { productId: 'p-015', name: 'Coca-Cola 33\u202fcl',    quantity: 2, unitPrice: 500  },
    ],
    subtotal: 13500, deliveryFee: 750, total: 14250,
    status: 'delivering', paymentStatus: 'pending',
    date: 'Aujourd\u2019hui, 12\u202fh\u202f40',
    deliveryAddress: 'Quartier Commerce, Adzopé',
    deliveryPin: '4827',
    driver: { name: 'Koffi Yao', initials: 'KY', eta: '8 min' },
  },
  {
    id: 'RB-000125', orderNumber: 'RB-2026-000125',
    merchantId: 'merchant-001', merchantName: 'Chez Maman Awa',
    items: [
      { productId: 'p-001', name: 'Riz sauce graine',       quantity: 1, unitPrice: 3500 },
      { productId: 'p-008', name: 'Jus de gingembre maison', quantity: 2, unitPrice: 750  },
    ],
    subtotal: 5000, deliveryFee: 500, total: 5500,
    status: 'preparing', paymentStatus: 'pending',
    date: 'Aujourd\u2019hui, 13\u202fh\u202f05',
    deliveryAddress: 'Avenue de l\u2019Indépendance, Adzopé',
    deliveryPin: '3159',
  },
  {
    id: 'RB-000126', orderNumber: 'RB-2026-000126',
    merchantId: 'merchant-006', merchantName: 'Snack Express Romuald',
    items: [
      { productId: 'p-041', name: 'Sandwich poulet grillé', quantity: 1, unitPrice: 1500 },
      { productId: 'p-046', name: 'Jus de bissap 50\u202fcl', quantity: 1, unitPrice: 500 },
    ],
    subtotal: 2000, deliveryFee: 500, total: 2500,
    status: 'driver_assigned', paymentStatus: 'pending',
    date: 'Aujourd\u2019hui, 13\u202fh\u202f20',
    deliveryAddress: 'Quartier Commerce, Adzopé',
    deliveryPin: '7042',
    driver: { name: 'Koffi Yao', initials: 'KY', eta: '20 min' },
  },
  {
    id: 'RB-000118', orderNumber: 'RB-2026-000118',
    merchantId: 'merchant-001', merchantName: 'Chez Maman Awa',
    items: [
      { productId: 'p-001', name: 'Riz sauce graine',      quantity: 2, unitPrice: 3500 },
      { productId: 'p-002', name: 'Attiéké poisson frit',  quantity: 1, unitPrice: 4000 },
    ],
    subtotal: 11000, deliveryFee: 500, total: 11500,
    status: 'delivered', paymentStatus: 'paid',
    date: '06 sept. 2026',
    deliveryAddress: 'Quartier Commerce, Adzopé',
  },
  {
    id: 'RB-000115', orderNumber: 'RB-2026-000115',
    merchantId: 'merchant-003', merchantName: 'Marché Central Frais',
    items: [
      { productId: 'p-018', name: 'Panier du marché Essentiel', quantity: 1, unitPrice: 3500 },
      { productId: 'p-020', name: 'Igname blanche 2\u202fkg',   quantity: 2, unitPrice: 2000 },
      { productId: 'p-022', name: 'Huile de palme 1\u202fL',    quantity: 1, unitPrice: 2500 },
    ],
    subtotal: 10000, deliveryFee: 500, total: 10500,
    status: 'delivered', paymentStatus: 'paid',
    date: '04 sept. 2026',
    deliveryAddress: 'Quartier Commerce, Adzopé',
  },
  {
    id: 'RB-000109', orderNumber: 'RB-2026-000109',
    merchantId: 'merchant-010', merchantName: 'Boulangerie du Carrefour',
    items: [
      { productId: 'p-068', name: 'Baguette ordinaire',   quantity: 3, unitPrice: 200 },
      { productId: 'p-071', name: 'Beignets ×5',          quantity: 2, unitPrice: 500 },
      { productId: 'p-070', name: 'Chausson à la banane', quantity: 2, unitPrice: 400 },
    ],
    subtotal: 2400, deliveryFee: 250, total: 2650,
    status: 'delivered', paymentStatus: 'paid',
    date: '02 sept. 2026',
    deliveryAddress: 'Quartier Commerce, Adzopé',
  },
  {
    id: 'RB-000103', orderNumber: 'RB-2026-000103',
    merchantId: 'merchant-005', merchantName: 'Maquis La Détente',
    items: [
      { productId: 'p-033', name: 'Poisson braisé entier', quantity: 1, unitPrice: 6000 },
      { productId: 'p-035', name: 'Alloco sauce piment',   quantity: 1, unitPrice: 1500 },
    ],
    subtotal: 7500, deliveryFee: 750, total: 8250,
    status: 'cancelled', paymentStatus: 'refunded',
    date: '28 août 2026',
    deliveryAddress: 'Quartier Commerce, Adzopé',
  },
  {
    id: 'RB-000098', orderNumber: 'RB-2026-000098',
    merchantId: 'merchant-004', merchantName: 'La Pâtisserie d\u2019Adzopé',
    items: [
      { productId: 'p-026', name: 'Baguette tradition',  quantity: 2, unitPrice: 300 },
      { productId: 'p-027', name: 'Croissant au beurre', quantity: 4, unitPrice: 500 },
    ],
    subtotal: 2600, deliveryFee: 500, total: 3100,
    status: 'merchant_rejected', paymentStatus: 'refunded',
    date: '25 août 2026',
    deliveryAddress: 'Avenue de l\u2019Indépendance, Adzopé',
  },
]
