export const CATEGORIES = [
  {
    id: 'laptop',
    name: 'Laptop',
    pluralName: 'Laptops',
    iconName: 'laptop',
    catalogCount: 319,
    subtitle: 'Ultrabooks, gaming & workstation notebooks',
    taxonomyLabel: 'Computing & Portable Systems',
    accentColor: 'from-blue-600/15 to-indigo-600/10 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-50 text-blue-700',
    defaultBudget: { min: 35000, max: 90000, catalogMin: 20000, catalogMax: 180000 },
    defaultTargetId: 'lap-apl-mba15',
    defaultAttributes: {
      minPrice: 35000,
      maxPrice: 90000,
      primarySpec: '15.6 – 17 Inch',
      color: 'Black',
      brands: ['Apple', 'HP', 'Lenovo'],
    },
    suggestedQueries: [
      '17 inch gaming laptop',
      'black gaming laptop under 80000 with 16gb ram and 512gb ssd',
    ],
    brands: ['HP', 'Lenovo', 'ASUS', 'Dell', 'Acer', 'Apple', 'MSI'],
    colors: ['Black', 'Silver', 'Grey', 'Gold', 'Blue', 'Red'],
    discoveryExamples: [
      {
        label: '17" Gaming Laptop (Specific)',
        query: '17 inch gaming laptop',
        searchType: 'specific',
      },
      {
        label: 'Black Gaming Laptop < ₹80k (General)',
        query: 'black gaming laptop under 80000 with 16gb ram and 512gb ssd',
        searchType: 'general',
      },
      {
        label: 'HP Pavilion 14" i5 8GB 256GB (Partner Stockout Demo)',
        query: '2020 HP Pavilion Newest 14 Inch Laptop 10th Gen Intel i5 8GB RAM 256GB SSD Gold',
        searchType: 'specific',
      },
      {
        label: '15.6" Touchscreen Ryzen Laptop',
        query: 'HP 15.6 touch screen laptop ryzen 5 12gb memory 256gb ssd silver',
        searchType: 'specific',
      },
    ],
  },
  {
    id: 'phone',
    name: 'Phone',
    pluralName: 'Phones',
    iconName: 'phone',
    catalogCount: 369,
    subtitle: 'Unlocked 4G/5G smartphones & gaming handsets',
    taxonomyLabel: 'Mobile & Wireless Devices',
    accentColor: 'from-indigo-600/15 to-violet-600/10 text-indigo-700 border-indigo-200',
    iconBg: 'bg-indigo-50 text-indigo-700',
    defaultBudget: { min: 15000, max: 70000, catalogMin: 8000, catalogMax: 140000 },
    defaultTargetId: 'mob-apl-ip17',
    defaultAttributes: {
      minPrice: 15000,
      maxPrice: 70000,
      primarySpec: '6.1 – 6.7 Inch',
      color: 'Black',
      brands: ['Apple', 'Samsung'],
    },
    suggestedQueries: [
      'black phone under 60000 with 12gb ram and 512gb storage 6.6 inch',
      'unlocked 5g mobile phone',
    ],
    brands: ['Samsung', 'Apple', 'ASUS', 'NUU', 'OnePlus', 'Motorola', 'Xiaomi', 'Sony'],
    colors: ['Black', 'Blue', 'White', 'Silver', 'Gold', 'Red', 'Green'],
    discoveryExamples: [
      {
        label: 'Black Phone < ₹60k, 12GB/512GB (General)',
        query: 'black phone under 60000 with 12gb ram and 512gb storage 6.6 inch',
        searchType: 'general',
      },
      {
        label: 'NUU Mobile G3 Plus 64GB Black (Partner Recovery)',
        query: 'NUU Mobile G3 Plus Unlocked Cell Phone 64GB 4GB RAM Onyx Black',
        searchType: 'specific',
      },
      {
        label: '8GB RAM 128GB Gaming Phone < ₹70k',
        query: 'black gaming phone under 70000 with 8gb ram and 128gb storage',
        searchType: 'general',
      },
      {
        label: 'Dual SIM Unlocked Android Phone Blue',
        query: 'NUU Mobile G3 64GB 4GB RAM Dual SIM 4G LTE Unlocked Blue',
        searchType: 'specific',
      },
    ],
  },
  {
    id: 'watch',
    name: 'Watch',
    pluralName: 'Watches',
    iconName: 'watch',
    catalogCount: 228,
    subtitle: 'Smartwatches, GPS fitness trackers & chronographs',
    taxonomyLabel: 'Wearable Technology & Timepieces',
    accentColor: 'from-emerald-600/15 to-teal-600/10 text-emerald-700 border-emerald-200',
    iconBg: 'bg-emerald-50 text-emerald-700',
    defaultBudget: { min: 10000, max: 50000, catalogMin: 5000, catalogMax: 120000 },
    defaultTargetId: 'wat-sam-gw7',
    defaultAttributes: {
      minPrice: 10000,
      maxPrice: 50000,
      primarySpec: '44 – 46 mm',
      color: 'Black',
      brands: ['Samsung', 'Amazfit'],
    },
    suggestedQueries: [
      'Amazfit GTS Fitness Smartwatch Heart Rate Monitor 14-Day Battery GPS Desert Gold',
      'diesel brown watch under 40000',
    ],
    brands: ['Amazfit', 'TicWatch', 'Diesel', 'GUESS', 'Garmin', 'Samsung', 'Apple', 'Fossil'],
    colors: ['Black', 'Gold', 'Blue', 'Brown', 'Silver', 'Pink'],
    discoveryExamples: [
      {
        label: 'Amazfit GTS Desert Gold (Partner Recovery)',
        query: 'Amazfit GTS Fitness Smartwatch Heart Rate Monitor 14-Day Battery GPS Desert Gold',
        searchType: 'specific',
      },
      {
        label: 'Diesel Brown Watch < ₹40k (General)',
        query: 'diesel brown watch under 40000',
        searchType: 'general',
      },
      {
        label: 'Black Smartwatch < ₹60k with 1GB RAM',
        query: 'black watch under 60000 with 1gb ram',
        searchType: 'general',
      },
      {
        label: 'Blue Stainless Steel Android Wear Watch',
        query: 'GUESS Womens Stainless Steel Android Wear Touch Screen Silicone Smart Watch Blue',
        searchType: 'specific',
      },
    ],
  },
  {
    id: 'refrigerator',
    name: 'Refrigerator',
    pluralName: 'Refrigerators',
    iconName: 'refrigerator',
    catalogCount: 229,
    subtitle: 'Compact, beverage, multi-door & stainless appliances',
    taxonomyLabel: 'Home & Kitchen Cooling Appliances',
    accentColor: 'from-cyan-600/15 to-sky-600/10 text-cyan-700 border-cyan-200',
    iconBg: 'bg-cyan-50 text-cyan-700',
    defaultBudget: { min: 25000, max: 100000, catalogMin: 15000, catalogMax: 160000 },
    defaultTargetId: 'ref-sam-458',
    defaultAttributes: {
      minPrice: 25000,
      maxPrice: 85000,
      primarySpec: '400 – 500 L',
      color: 'White',
      brands: ['Samsung', 'LG'],
    },
    suggestedQueries: [
      'Samsung 458 L Bespoke AI Refrigerator Clean White',
      'Samsung double door white frost free 458L under 80000',
    ],
    brands: ['Midea', 'hOmeLabs', 'SMETA', 'Frestec', 'RCA', 'Danby', 'Frigidaire', 'Whirlpool'],
    colors: ['Black', 'Silver', 'White', 'Grey'],
    discoveryExamples: [
      {
        label: 'Midea 2.4 Cu.Ft Stainless (Partner Recovery)',
        query: 'Midea WHS-87LSS1 Refrigerator 2.4 Cubic Feet Stainless Steel',
        searchType: 'specific',
      },
      {
        label: 'hOmeLabs Black Fridge < ₹1,00,000 (General)',
        query: 'homelabs black refrigerator under 100000',
        searchType: 'general',
      },
      {
        label: 'Frestec Black Compact Fridge < ₹1,10,000',
        query: 'frestec black refrigerator under 110000',
        searchType: 'general',
      },
      {
        label: '12V/110V Compact RV Refrigerator 36 qt',
        query: 'SMETA 12V Volt Refrigerator 110V Compact Mini Fridge 36 qt',
        searchType: 'specific',
      },
    ],
  },
];

const LEGACY_CATEGORY_MAP = {
  smartphone: 'phone',
  smartwatch: 'watch',
};

export function normalizeCategoryId(categoryId) {
  if (!categoryId) return 'laptop';
  const clean = String(categoryId).toLowerCase().trim();
  const mapped = LEGACY_CATEGORY_MAP[clean] || clean;
  return CATEGORIES.some((c) => c.id === mapped) ? mapped : 'laptop';
}

export function getCategoryById(categoryId) {
  const norm = normalizeCategoryId(categoryId);
  return CATEGORIES.find((c) => c.id === norm) || CATEGORIES[0];
}

export function formatINR(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '₹—';
  return `₹${Math.round(num).toLocaleString('en-IN')}`;
}
