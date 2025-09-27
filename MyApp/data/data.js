// data/data.js
export const plantData = [
  {
    id: '1',
    name: 'Mentha-Mint',
    shortDescription: 'Mint is an aromatic plant that is almost entirely perennial...',
    longDescription: 'Mint is an aromatic plant that is almost entirely perennial. They have widely spread underground branching stems. It is traditionally used as a medicinal herb for treating stomach aches and chest pains.',
    image: 'https://images.unsplash.com/photo-1596423419339-652d5616b7a2?w=800&q=80',
    tags: [
      { label: 'Edible', type: 'default' },
      { label: 'Flowering', type: 'default' },
      { label: 'Easy', type: 'default' },
      { label: 'Spreading', type: 'default' },
    ],
    botanicalName: 'Mentha',
    scientificName: 'Mentha',
    alsoKnownAs: ['Spearmint', 'Peppermint'],
    health: {
      status: 'Healthy',
      diagnosis: 'The plant was diagnosed automatically. Contact our botany experts to be sure about results.',
    },
    scientificClassification: {
      Genus: 'Mentha',
      Family: 'Lamiaceae',
      Order: 'Lamiales',
      Class: 'Magnoliopsida',
      Phylum: 'Tracheophyta',
    },
    similarPlants: [
      { id: '7', name: 'Lemon Balm', image: 'https://images.unsplash.com/photo-1627988353381-b458f33161c5?w=300&h=300&fit=crop' },
      { id: '8', name: 'Basil', image: 'https://images.unsplash.com/photo-1584101138898-f437a2a87a54?w=300&h=300&fit=crop' },
      { id: '9', name: 'Rosemary', image: 'https://images.unsplash.com/photo-1594313044149-779414032a5d?w=300&h=300&fit=crop' },
    ],
    category: 'Herbs',
    conditions: {
      sunlight: 'Full Sun to Part Shade',
      hardness: '3-9',
      soil: {
        type: 'Loamy, Silty',
        drainage: 'Well-drained',
        ph: { min: 6.0, max: 7.5, range: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] }
      },
      temperature: {
        ideal: { min: 15, max: 25 },
        tolerable: { min: 10, max: 30 },
        range: { min: 5, max: 35 }
      }
    },
    requirements: {
      water: 'Every 2-3 Days',
      reporting: 'Every 1-2 Years',
      fertilizer: 'Once a month',
      misting: 'In dry climates'
    },
    pestsAndDiseases: {
      pests: ['Aphids', 'Spider mites', 'Mint rust'],
      diseases: ['Powdery mildew', 'Verticillium wilt']
    },
    uses: {
      symbolism: 'Mint (Mentha) is a versatile herb widely used for its refreshing flavor and medicinal properties. It is commonly used in cooking to add flavor to dishes, teas, and beverages. In herbal medicine, mint helps with digestion, relieves headaches, and soothes cold symptoms.'
    }
  },
  {
    id: '2',
    name: 'Tomato',
    shortDescription: 'The tomato is a red, juicy fruit commonly used as a vegetable...',
    longDescription: 'The tomato is a red, juicy fruit commonly used as a vegetable in cooking. It grows on vines and is a staple in many cuisines worldwide. Requires plenty of sun.',
    image: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=800&q=80',
    tags: [
      { label: 'Edible', type: 'default' },
      { label: 'Fruit-bearing', type: 'default' },
      { label: 'Leaves Toxic', type: 'danger' },
    ],
    botanicalName: 'Solanum lycopersicum',
    scientificName: 'Solanum lycopersicum',
    alsoKnownAs: ['Love apple'],
    health: {
      status: 'Needs Water',
      diagnosis: 'The soil is dry. Water the plant thoroughly.',
    },
    scientificClassification: {
      Genus: 'Solanum',
      Family: 'Solanaceae',
      Order: 'Solanales',
      Class: 'Magnoliopsida',
      Phylum: 'Tracheophyta',
    },
    similarPlants: [
        { id: '10', name: 'Bell Pepper', image: 'https://images.unsplash.com/photo-1518709415173-3c79a1a1d9a0?w=300&h=300&fit=crop' },
        { id: '11', name: 'Eggplant', image: 'https://images.unsplash.com/photo-1583524388175-3539331165ba?w=300&h=300&fit=crop' },
    ],
    category: 'Fruit',
    conditions: {
      sunlight: 'Full Sun',
      hardness: '10-11',
      soil: {
        type: 'Sandy Loam',
        drainage: 'Well-drained',
        ph: { min: 6.2, max: 6.8, range: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] }
      },
      temperature: {
        ideal: { min: 21, max: 29 },
        tolerable: { min: 16, max: 32 },
        range: { min: 10, max: 40 }
      }
    },
    requirements: {
      water: 'Daily',
      reporting: 'Annually (if potted)',
      fertilizer: 'Every 2 weeks',
      misting: 'Not required'
    },
    pestsAndDiseases: {
      pests: ['Aphids', 'Hornworms', 'Whiteflies'],
      diseases: ['Blight', 'Wilt', 'Mosaic Virus']
    },
    uses: {
      symbolism: 'Tomatoes are a staple in cuisines globally, celebrated for their versatility. They are rich in vitamins and antioxidants like lycopene, which is linked to many health benefits.'
    }
  },
  {
    id: '3',
    name: 'Cucumber',
    shortDescription: 'Cucumbers are long, green, cylindrical fruits that are widely cultivated...',
    longDescription: 'Cucumbers are long, green, cylindrical fruits that are widely cultivated. They are known for their high water content and refreshing taste, making them a popular salad ingredient.',
    image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=800&q=80',
    tags: [
      { label: 'Edible', type: 'default' },
      { label: 'Vining', type: 'default' },
      { label: 'Easy', type: 'default' },
    ],
    botanicalName: 'Cucumis sativus',
    scientificName: 'Cucumis sativus',
    alsoKnownAs: ['Cuke'],
    health: {
      status: 'Healthy',
      diagnosis: 'Leaves are vibrant and there are no signs of pests.',
    },
    scientificClassification: {
      Genus: 'Cucumis',
      Family: 'Cucurbitaceae',
      Order: 'Cucurbitales',
      Class: 'Magnoliopsida',
      Phylum: 'Tracheophyta',
    },
    similarPlants: [
        { id: '12', name: 'Zucchini', image: 'https://images.unsplash.com/photo-1596199442693-614b0147e8a8?w=300&h=300&fit=crop' },
    ],
    category: 'Vegetable',
    conditions: {
      sunlight: 'Full Sun',
      hardness: '4-12',
      soil: {
        type: 'Loamy',
        drainage: 'Well-drained',
        ph: { min: 6.0, max: 7.0, range: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] }
      },
      temperature: {
        ideal: { min: 18, max: 30 },
        tolerable: { min: 15, max: 35 },
        range: { min: 10, max: 40 }
      }
    },
    requirements: {
      water: 'Every 2-3 Days',
      reporting: 'N/A',
      fertilizer: 'Once a month',
      misting: 'Not required'
    },
    pestsAndDiseases: {
      pests: ['Cucumber beetles', 'Aphids'],
      diseases: ['Powdery mildew', 'Downy mildew']
    },
    uses: {
      symbolism: 'Cucumbers are known for their hydrating properties and are a popular ingredient in salads, sandwiches, and refreshing drinks. They are also used in skincare for their cooling effect.'
    }
  },
  {
    id: '4',
    name: 'Carrot',
    shortDescription: 'Carrots are root vegetables, typically orange in color...',
    longDescription: 'Carrots are root vegetables, typically orange in color, though purple, black, red, white, and yellow cultivars exist. They are a good source of beta carotene, fiber, and vitamin K1.',
    image: 'https://images.unsplash.com/photo-1582515073490-39981397c445?w=800&q=80',
    tags: [
      { label: 'Edible', type: 'default' },
      { label: 'Root', type: 'default' },
      { label: 'Biennial', type: 'default' },
    ],
    botanicalName: 'Daucus carota',
    scientificName: 'Daucus carota',
    alsoKnownAs: [],
    health: {
      status: 'Monitor for Pests',
      diagnosis: 'Some small holes detected in leaves, could be carrot rust fly.',
    },
    scientificClassification: {
      Genus: 'Daucus',
      Family: 'Apiaceae',
      Order: 'Apiales',
      Class: 'Magnoliopsida',
      Phylum: 'Tracheophyta',
    },
    similarPlants: [],
    category: 'Vegetable',
    conditions: {
      sunlight: 'Full Sun',
      hardness: '3-10',
      soil: {
        type: 'Sandy',
        drainage: 'Well-drained',
        ph: { min: 6.0, max: 6.8, range: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] }
      },
      temperature: {
        ideal: { min: 16, max: 21 },
        tolerable: { min: 10, max: 25 },
        range: { min: 5, max: 30 }
      }
    },
    requirements: {
      water: 'Weekly',
      reporting: 'N/A',
      fertilizer: 'Minimal needed',
      misting: 'Not required'
    },
    pestsAndDiseases: {
      pests: ['Carrot rust fly', 'Aphids'],
      diseases: ['Alternaria leaf blight', 'Cercospora leaf blight']
    },
    uses: {
      symbolism: 'Carrots are a popular root vegetable known for their high vitamin A content. They can be eaten raw, cooked, or juiced, and are a versatile ingredient in many dishes.'
    }
  },
  {
    id: '5',
    name: 'Lentils',
    shortDescription: 'Lentils are edible legumes, known for their lens-shaped seeds...',
    longDescription: 'Lentils are edible legumes, known for their lens-shaped seeds. They grow in pods that usually contain one or two seeds. They are a staple food in many South Asian countries.',
    image: 'https://images.unsplash.com/photo-1583357599139-9b3523c52590?w=800&q=80',
    tags: [
        { label: 'Edible', type: 'default' },
        { label: 'Bushy', type: 'default' },
    ],
    botanicalName: 'Lens culinaris',
    scientificName: 'Lens culinaris',
    alsoKnownAs: [],
    health: {
      status: 'Healthy',
      diagnosis: 'Plant shows vigorous growth and good pod formation.',
    },
    scientificClassification: {
      Genus: 'Lens',
      Family: 'Fabaceae',
      Order: 'Fabales',
      Class: 'Magnoliopsida',
      Phylum: 'Tracheophyta',
    },
    similarPlants: [
        { id: '13', name: 'Chickpea', image: 'https://images.unsplash.com/photo-1605591199385-8c5e4a7c8a6a?w=300&h=300&fit=crop' },
    ],
    category: 'Legumes',
    conditions: {
      sunlight: 'Full Sun',
      hardness: '5-11',
      soil: {
        type: 'Loamy',
        drainage: 'Well-drained',
        ph: { min: 6.0, max: 8.0, range: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] }
      },
      temperature: {
        ideal: { min: 18, max: 24 },
        tolerable: { min: 15, max: 30 },
        range: { min: 10, max: 35 }
      }
    },
    requirements: {
      water: 'Weekly',
      reporting: 'N/A',
      fertilizer: 'Not required',
      misting: 'Not required'
    },
    pestsAndDiseases: {
      pests: ['Aphids', 'Weevils'],
      diseases: ['Ascochyta blight', 'Anthracnose']
    },
    uses: {
      symbolism: 'Lentils are a highly nutritious legume, rich in protein and fiber. They are a staple in many cuisines and are used in soups, stews, salads, and side dishes.'
    }
  },
  {
    id: '6',
    name: 'Rose',
    shortDescription: 'A rose is a woody perennial flowering plant of the genus Rosa...',
    longDescription: 'A rose is a woody perennial flowering plant of the genus Rosa, in the family Rosaceae. There are over three hundred species and tens of thousands of cultivars. They form a group of plants that can be erect shrubs, climbing, or trailing, with stems that are often armed with sharp prickles.',
    image: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd6c?w=800&q=80',
    tags: [
      { label: 'Flowering', type: 'default' },
      { label: 'Shrub', type: 'default' },
      { label: 'Thorny', type: 'danger' },
    ],
    botanicalName: 'Rosa',
    scientificName: 'Rosa',
    alsoKnownAs: [],
    health: {
      status: 'Monitor for Fungus',
      diagnosis: 'Some black spots on lower leaves. Could be a fungal infection.',
    },
    scientificClassification: {
      Genus: 'Rosa',
      Family: 'Rosaceae',
      Order: 'Rosales',
      Class: 'Magnoliopsida',
      Phylum: 'Tracheophyta',
    },
    similarPlants: [
        { id: '14', name: 'Hibiscus', image: 'https://images.unsplash.com/photo-1564832440131-1e9c5105b412?w=300&h=300&fit=crop' },
    ],
    category: 'Flowers',
    conditions: {
      sunlight: 'Full Sun',
      hardness: '4-9',
      soil: {
        type: 'Loamy',
        drainage: 'Well-drained',
        ph: { min: 6.0, max: 7.0, range: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] }
      },
      temperature: {
        ideal: { min: 15, max: 25 },
        tolerable: { min: 10, max: 30 },
        range: { min: 5, max: 35 }
      }
    },
    requirements: {
      water: 'Weekly',
      reporting: 'Every 2-3 Years',
      fertilizer: 'Twice a year',
      misting: 'Not required'
    },
    pestsAndDiseases: {
      pests: ['Aphids', 'Japanese beetles', 'Spider mites'],
      diseases: ['Black spot', 'Powdery mildew', 'Rust']
    },
    uses: {
      symbolism: 'Roses are one of the most popular flowers in the world, symbolizing love, beauty, and passion. They are widely used in gardens, bouquets, and for producing rose oil for perfumes.'
    }
  },
   {
    id: '8',
    name: 'Basil',
    shortDescription: 'Basil is a culinary herb of the family Lamiaceae (mints)...',
    longDescription: 'Basil is a culinary herb prominently featured in Italian cuisine, and also plays a major role in Southeast Asian cuisines. It is known for its sweet, aromatic leaves.',
    image: 'https://images.unsplash.com/photo-1579113800036-3b6b7b8a9c3c?w=800&q=80',
    tags: [
      { label: 'Edible', type: 'default' },
      { label: 'Aromatic', type: 'default' },
      { label: 'Easy', type: 'default' },
    ],
    botanicalName: 'Ocimum basilicum',
    scientificName: 'Ocimum basilicum',
    alsoKnownAs: ['Sweet Basil'],
    health: {
      status: 'Healthy',
      diagnosis: 'Lush green leaves indicate a healthy plant.',
    },
    scientificClassification: {
      Genus: 'Ocimum',
      Family: 'Lamiaceae',
      Order: 'Lamiales',
      Class: 'Magnoliopsida',
      Phylum: 'Tracheophyta',
    },
    similarPlants: [
      { id: '1', name: 'Mentha-Mint', image: 'https://images.unsplash.com/photo-1596423419339-652d5616b7a2?w=300&h=300&fit=crop' },
    ],
    category: 'Herbs',
    conditions: {
      sunlight: 'Full Sun',
      hardness: '10+',
      soil: {
        type: 'Moist',
        drainage: 'Well-drained',
        ph: { min: 6.0, max: 7.0, range: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] }
      },
      temperature: {
        ideal: { min: 20, max: 30 },
        tolerable: { min: 15, max: 35 },
        range: { min: 10, max: 40 }
      }
    },
    requirements: {
      water: 'Every 2-3 Days',
      reporting: 'Annually',
      fertilizer: 'Once a month',
      misting: 'Not required'
    },
    pestsAndDiseases: {
      pests: ['Aphids', 'Slugs'],
      diseases: ['Downy mildew', 'Fusarium wilt']
    },
    uses: {
      symbolism: 'Basil is a beloved culinary herb, essential for pesto and many other dishes. It is also used in traditional medicine for its anti-inflammatory and antioxidant properties.'
    }
  }
];
