  #!/usr/bin/env python3
# RUBIGO - Enrichissement des données de démonstration
#
# Usage depuis la racine du projet :
#   python generate_data.py
#
# Le script écrit/complète src/data.ts avec les données enrichies.
# Il ne modifie pas la logique métier, les commandes, le PIN, les rôles
# ou la tarification.

from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "src" / "data.ts"

# IMPORTANT :
# Ce fichier contient les données enrichies générées pour RUBIGO.
# Si src/data.ts contient déjà des données que vous souhaitez conserver,
# faites un commit Git avant d'exécuter ce script.

TS = r"""
// ============================================================
// RUBIGO — DONNÉES DE DÉMONSTRATION ENRICHIES
// ============================================================

export const enrichedProducts = [
  // ----------------------------------------------------------
  // FRUITS & LÉGUMES DIALLO (merchant-022)
  // ----------------------------------------------------------
  { id:'p-169', merchantId:'merchant-022', categoryId:'vivres', name:'Mangue ×4', description:'Mangues locales sucrées et juteuses, variété Kent ou Julie', price:1500, category:'Fruits', available:true },
  { id:'p-170', merchantId:'merchant-022', categoryId:'vivres', name:'Ananas entier', description:'Ananas Victoria de Côte d’Ivoire, parfumé et sucré', price:1500, category:'Fruits', available:true },
  { id:'p-171', merchantId:'merchant-022', categoryId:'vivres', name:'Papaye mûre (1 kg)', description:'Papaye jaune et sucrée, mûrie sur pied, poids environ 1 kg', price:1000, category:'Fruits', available:true },
  { id:'p-172', merchantId:'merchant-022', categoryId:'vivres', name:'Orange ×6', description:'Oranges fraîches de saison, jus abondant, idéales à presser', price:1000, category:'Fruits', available:true },
  { id:'p-173', merchantId:'merchant-022', categoryId:'vivres', name:'Noix de coco ×2', description:'Noix de coco fraîches avec eau de coco, à boire ou cuisiner', price:1500, category:'Fruits', available:true },
  { id:'p-174', merchantId:'merchant-022', categoryId:'vivres', name:'Banane plantain ×8', description:'Régime de plantains mûrs à point pour alloco ou braisé', price:2000, category:'Fruits', available:true },
  { id:'p-175', merchantId:'merchant-022', categoryId:'vivres', name:'Tomate 1 kg', description:'Tomates rondes fermes du jardin, idéales pour sauce ou crudités', price:1000, category:'Légumes', available:true },
  { id:'p-176', merchantId:'merchant-022', categoryId:'vivres', name:'Aubergine ×3', description:'Aubergines violettes fraîches, fermes et brillantes', price:800, category:'Légumes', available:true },
  { id:'p-177', merchantId:'merchant-022', categoryId:'vivres', name:'Carotte 500 g', description:'Carottes fraîches et croquantes, lavées et prêtes à l’emploi', price:700, category:'Légumes', available:true },
  { id:'p-178', merchantId:'merchant-022', categoryId:'vivres', name:'Concombre ×2', description:'Concombres longs et fermes, rafraîchissants en salade', price:600, category:'Légumes', available:true },
  { id:'p-179', merchantId:'merchant-022', categoryId:'vivres', name:'Chou blanc (demi)', description:'Demi-chou blanc frais et croquant, idéal pour coleslaw', price:500, category:'Légumes', available:true },
  { id:'p-180', merchantId:'merchant-022', categoryId:'vivres', name:'Igname blanche 3 kg', description:'Igname fraîche de qualité, gros calibre, poids environ 3 kg', price:3000, category:'Vivres', available:true },

  // ----------------------------------------------------------
  // POISSONNERIE FRAÎCHE (merchant-019)
  // ----------------------------------------------------------
  { id:'p-142', merchantId:'merchant-019', categoryId:'poissonnerie', name:'Tilapia frais (800 g env.)', description:'Tilapia entier et frais, poids moyen 800 g, vidé sur demande', price:3000, category:'Poissons', available:true },
  { id:'p-143', merchantId:'merchant-019', categoryId:'poissonnerie', name:'Carpe fraîche (1 kg env.)', description:'Carpe entière fraîche, chair ferme et savoureuse', price:4000, category:'Poissons', available:true },
  { id:'p-144', merchantId:'merchant-019', categoryId:'poissonnerie', name:'Maquereau frais ×3', description:'Trois maquereaux frais, idéals grillés ou braisés', price:3500, category:'Poissons', available:true },
  { id:'p-145', merchantId:'merchant-019', categoryId:'poissonnerie', name:'Crevettes fraîches 500 g', description:'Crevettes fraîches, décortiquées ou entières', price:5000, category:'Poissons', available:true },
  { id:'p-146', merchantId:'merchant-019', categoryId:'poissonnerie', name:'Poisson fumé 500 g', description:'Poisson fumé artisanal, idéal pour sauces et soupes', price:3500, category:'Poissons', available:true },
  { id:'p-147', merchantId:'merchant-019', categoryId:'poissonnerie', name:'Thon frais (steak 300 g)', description:'Steak de thon frais 300 g, grillé ou en sauce', price:4500, category:'Poissons', available:false },

  // ----------------------------------------------------------
  // SUPERETTE ADIA EXPRESS (merchant-020)
  // ----------------------------------------------------------
  { id:'p-148', merchantId:'merchant-020', categoryId:'markets', name:'Riz parfumé 5 kg', description:'Riz long grain parfumé, sac familial 5 kg', price:5500, category:'Épicerie', available:true },
  { id:'p-149', merchantId:'merchant-020', categoryId:'markets', name:'Huile végétale 1 L', description:'Huile végétale raffinée, idéale pour la cuisson', price:2000, category:'Épicerie', available:true },
  { id:'p-150', merchantId:'merchant-020', categoryId:'markets', name:'Sucre cristallisé 1 kg', description:'Sucre blanc cristallisé, qualité standard', price:800, category:'Épicerie', available:true },
  { id:'p-151', merchantId:'merchant-020', categoryId:'markets', name:'Farine de blé 1 kg', description:'Farine tout usage pour pains, gâteaux et sauces', price:1000, category:'Épicerie', available:true },
  { id:'p-152', merchantId:'merchant-020', categoryId:'markets', name:'Lait en poudre 400 g', description:'Lait entier en poudre, marque ou équivalent selon disponibilité', price:3500, category:'Épicerie', available:true },
  { id:'p-153', merchantId:'merchant-020', categoryId:'markets', name:'Café soluble 200 g', description:'Café soluble, pot familial 200 g', price:2500, category:'Épicerie', available:true },
  { id:'p-154', merchantId:'merchant-020', categoryId:'markets', name:'Œufs frais ×12', description:'Œufs de poule frais, plateau de 12', price:2500, category:'Épicerie', available:true },
  { id:'p-155', merchantId:'merchant-020', categoryId:'markets', name:'Tomate concentrée (boîte)', description:'Tomate concentrée, boîte 400 g', price:700, category:'Conserves', available:true },
  { id:'p-156', merchantId:'merchant-020', categoryId:'markets', name:'Biscuits ×10', description:'Paquet de biscuits secs pour goûter ou petit déjeuner', price:500, category:'Épicerie', available:true },
  { id:'p-157', merchantId:'merchant-020', categoryId:'markets', name:'Sel iodé 1 kg', description:'Sel iodé fin, sachet 1 kg', price:400, category:'Épicerie', available:true },
  { id:'p-158', merchantId:'merchant-020', categoryId:'markets', name:'Eau minérale ×6 (1,5 L)', description:'Pack de 6 bouteilles d’eau minérale de 1,5 L', price:3000, category:'Boissons', available:true },

  // ----------------------------------------------------------
  // BEAUTÉ & MAISON KONÉ (merchant-021)
  // ----------------------------------------------------------
  { id:'p-159', merchantId:'merchant-021', categoryId:'beaute', name:'Gel douche 250 ml', description:'Gel douche hydratant, parfum doux', price:2500, category:'Beauté', available:true },
  { id:'p-160', merchantId:'merchant-021', categoryId:'beaute', name:'Shampooing 400 ml', description:'Shampooing soin et brillance', price:3500, category:'Beauté', available:true },
  { id:'p-161', merchantId:'merchant-021', categoryId:'beaute', name:'Crème corporelle 400 ml', description:'Crème nourrissante hydratation longue durée', price:3000, category:'Beauté', available:true },
  { id:'p-162', merchantId:'merchant-021', categoryId:'beaute', name:'Déodorant stick', description:'Déodorant longue durée, format stick', price:2000, category:'Beauté', available:true },
  { id:'p-163', merchantId:'merchant-021', categoryId:'beaute', name:'Dentifrice 75 ml', description:'Dentifrice protection quotidienne, tube 75 ml', price:1500, category:'Beauté', available:true },
  { id:'p-164', merchantId:'merchant-021', categoryId:'beaute', name:'Vaseline Original 250 ml', description:'Gelée de pétrole pour hydrater la peau et les lèvres', price:1500, category:'Beauté', available:true },
  { id:'p-165', merchantId:'merchant-021', categoryId:'menage', name:'Lessive 1 kg', description:'Lessive en poudre pour le linge', price:3000, category:'Entretien', available:true },
  { id:'p-166', merchantId:'merchant-021', categoryId:'menage', name:'Liquide vaisselle 750 ml', description:'Liquide vaisselle dégraissant parfum citron', price:1500, category:'Entretien', available:true },
  { id:'p-167', merchantId:'merchant-021', categoryId:'menage', name:'Papier toilette ×6 rouleaux', description:'Pack de 6 rouleaux doubles épaisseurs', price:2500, category:'Entretien', available:true },
  { id:'p-168', merchantId:'merchant-021', categoryId:'menage', name:'Éponge grattante ×3', description:'Éponges double face pour vaisselle et surfaces', price:750, category:'Entretien', available:true },
]

export const enrichedOrders = [
  {
    id:'RB-000124', orderNumber:'RB-2026-000124',
    merchantId:'merchant-002', merchantName:'Le Patio d’Adzopé',
    items:[
      { productId:'p-011', name:'Demi-poulet braisé', quantity:2, unitPrice:5000 },
      { productId:'p-012', name:'Brochettes de boeuf ×5', quantity:1, unitPrice:2500 },
      { productId:'p-015', name:'Coca-Cola 33 cl', quantity:2, unitPrice:500 },
    ],
    subtotal:13500, deliveryFee:750, total:14250,
    status:'delivering', paymentStatus:'pending',
    date:'Aujourd’hui, 12 h 40',
    deliveryAddress:'Quartier Commerce, Adzopé',
    deliveryPin:'4827',
    driver:{ name:'Koffi Yao', initials:'KY', eta:'8 min' },
  },
  {
    id:'RB-000125', orderNumber:'RB-2026-000125',
    merchantId:'merchant-001', merchantName:'Chez Maman Awa',
    items:[
      { productId:'p-001', name:'Riz sauce graine', quantity:1, unitPrice:3500 },
      { productId:'p-008', name:'Jus de gingembre maison', quantity:2, unitPrice:750 },
    ],
    subtotal:5000, deliveryFee:500, total:5500,
    status:'preparing', paymentStatus:'pending',
    date:'Aujourd’hui, 13 h 05',
    deliveryAddress:'Avenue de l’Indépendance, Adzopé',
    deliveryPin:'3159',
  },
  {
    id:'RB-000126', orderNumber:'RB-2026-000126',
    merchantId:'merchant-006', merchantName:'Snack Express Romuald',
    items:[
      { productId:'p-041', name:'Sandwich poulet grillé', quantity:1, unitPrice:1500 },
      { productId:'p-046', name:'Jus de bissap 50 cl', quantity:1, unitPrice:500 },
    ],
    subtotal:2000, deliveryFee:500, total:2500,
    status:'driver_assigned', paymentStatus:'pending',
    date:'Aujourd’hui, 13 h 20',
    deliveryAddress:'Quartier Commerce, Adzopé',
    deliveryPin:'7042',
    driver:{ name:'Koffi Yao', initials:'KY', eta:'20 min' },
  },
  {
    id:'RB-000118', orderNumber:'RB-2026-000118',
    merchantId:'merchant-001', merchantName:'Chez Maman Awa',
    items:[
      { productId:'p-001', name:'Riz sauce graine', quantity:2, unitPrice:3500 },
      { productId:'p-002', name:'Attiéké poisson frit', quantity:1, unitPrice:4000 },
    ],
    subtotal:11000, deliveryFee:500, total:11500,
    status:'delivered', paymentStatus:'paid',
    date:'06 sept. 2026',
    deliveryAddress:'Quartier Commerce, Adzopé',
    deliveryPin:'4827',
  },
  {
    id:'RB-000115', orderNumber:'RB-2026-000115',
    merchantId:'merchant-003', merchantName:'Marché Central Frais',
    items:[
      { productId:'p-018', name:'Panier du marché Essentiel', quantity:1, unitPrice:3500 },
      { productId:'p-020', name:'Igname blanche 2 kg', quantity:2, unitPrice:2000 },
      { productId:'p-022', name:'Huile de palme 1 L', quantity:1, unitPrice:2500 },
    ],
    subtotal:10000, deliveryFee:500, total:10500,
    status:'delivered', paymentStatus:'paid',
    date:'04 sept. 2026',
    deliveryAddress:'Quartier Commerce, Adzopé',
  },
  {
    id:'RB-000109', orderNumber:'RB-2026-000109',
    merchantId:'merchant-010', merchantName:'Boulangerie du Carrefour',
    items:[
      { productId:'p-068', name:'Baguette ordinaire', quantity:3, unitPrice:200 },
      { productId:'p-071', name:'Beignets ×5', quantity:2, unitPrice:500 },
      { productId:'p-070', name:'Chausson à la banane', quantity:2, unitPrice:400 },
    ],
    subtotal:2400, deliveryFee:250, total:2650,
    status:'delivered', paymentStatus:'paid',
    date:'02 sept. 2026',
    deliveryAddress:'Quartier Commerce, Adzopé',
  },
  {
    id:'RB-000103', orderNumber:'RB-2026-000103',
    merchantId:'merchant-005', merchantName:'Maquis La Détente',
    items:[
      { productId:'p-033', name:'Poisson braisé entier', quantity:1, unitPrice:6000 },
      { productId:'p-035', name:'Alloco sauce piment', quantity:1, unitPrice:1500 },
    ],
    subtotal:7500, deliveryFee:750, total:8250,
    status:'cancelled', paymentStatus:'refunded',
    date:'28 août 2026',
    deliveryAddress:'Quartier Commerce, Adzopé',
  },
  {
    id:'RB-000098', orderNumber:'RB-2026-000098',
    merchantId:'merchant-004', merchantName:'La Pâtisserie d’Adzopé',
    items:[
      { productId:'p-026', name:'Baguette tradition', quantity:2, unitPrice:300 },
      { productId:'p-027', name:'Croissant au beurre', quantity:4, unitPrice:500 },
    ],
    subtotal:2600, deliveryFee:500, total:3100,
    status:'merchant_rejected', paymentStatus:'refunded',
    date:'25 août 2026',
    deliveryAddress:'Avenue de l’Indépendance, Adzopé',
  },
]
"""

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(TS.strip() + "\n", encoding="utf-8")

# Basic verification
products = TS.count("id:'p-")
orders = TS.count("orderNumber:'RB-")
print(f"OK — fichier écrit : {OUTPUT}")
print(f"Produits dans ce fichier : {products}")
print(f"Commandes de démonstration : {orders}")
