import type { Product } from '../types';

// Seed reference only — live data comes from Supabase. Pantry = tax-exempt in NC.
export const products: Product[] = [
  // Pantry — tax-exempt (unprepared food)
  { id: 'oats',                    name: 'Oats',                          category: 'Pantry', unit: 'per oz', pricePerUnit: 0.15, description: 'Whole rolled oats, great for oatmeal, granola, and baking.',                       available: true, taxable: false },
  { id: 'lentils',                 name: 'Lentils',                       category: 'Pantry', unit: 'per oz', pricePerUnit: 0.25, description: 'Earthy, protein-rich lentils. Quick-cooking with no soak needed.',              available: true, taxable: false },
  { id: 'almonds',                 name: 'Almonds',                       category: 'Pantry', unit: 'per oz', pricePerUnit: 0.60, description: 'Raw whole almonds, a nutritious and versatile snack.',                          available: true, taxable: false },
  { id: 'cashews',                 name: 'Cashews',                       category: 'Pantry', unit: 'per oz', pricePerUnit: 0.75, description: 'Creamy raw cashews, perfect for snacking or making cashew cream.',              available: true, taxable: false },
  { id: 'garlic-powder',           name: 'Garlic Powder',                 category: 'Pantry', unit: 'per oz', pricePerUnit: 0.99, description: 'Finely ground garlic — a pantry staple for any savory dish.',                  available: true, taxable: false },
  { id: 'coconut-shreds',          name: 'Coconut Shreds',                category: 'Pantry', unit: 'per oz', pricePerUnit: 0.36, description: 'Unsweetened shredded coconut for baking, granola, or smoothies.',              available: true, taxable: false },
  { id: 'dandelion-root-tea',      name: 'Dandelion Root Tea',            category: 'Pantry', unit: 'per oz', pricePerUnit: 1.80, description: 'Earthy, roasted dandelion root — a caffeine-free coffee alternative.',         available: true, taxable: false },
  { id: 'peppermint-leaf-tea',     name: 'Peppermint Leaf Tea',           category: 'Pantry', unit: 'per oz', pricePerUnit: 1.80, description: 'Refreshing dried peppermint leaf for a cool, soothing brew.',                   available: true, taxable: false },
  { id: 'raspberry-leaf-tea',      name: 'Raspberry Leaf Tea',            category: 'Pantry', unit: 'per oz', pricePerUnit: 1.80, description: 'Mild and nourishing dried raspberry leaf, naturally caffeine-free.',           available: true, taxable: false },
  // Home — taxable
  { id: 'blueland-tabs-5pack',     name: 'Blueland Dish Tabs (5-pack)',   category: 'Home',   unit: 'each',   pricePerUnit: 2.00, description: 'Plastic-free, powerful dishwasher tablets. Compostable packaging.',           available: true, taxable: true  },
  { id: 'blueland-tabs-10pack',    name: 'Blueland Dish Tabs (10-pack)',  category: 'Home',   unit: 'each',   pricePerUnit: 3.50, description: 'Plastic-free dishwasher tablets in bulk. Compostable packaging.',             available: true, taxable: true  },
];
