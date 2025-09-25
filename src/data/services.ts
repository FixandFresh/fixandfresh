import { Service, ServiceCategory } from '../types/services';

export const services: Service[] = [
  // Residential & Airbnb Services
  {
    id: 'standard-airbnb',
    name: 'Standard Airbnb Turnover',
    description: 'Complete guest turnover cleaning: dust all surfaces, vacuum/mop floors, sanitize bathrooms & kitchen, empty trash, make beds with fresh linens, restock basic amenities',
    price: 32,
    marketPrice: 35,
    category: 'residential',
    type: 'cleaning',
    unit: 'job'
  },
  {
    id: 'deep-clean',
    name: 'Deep Clean',
    description: 'Comprehensive deep cleaning: baseboards, window sills, inside appliances, ceiling fans, light fixtures, detailed bathroom scrubbing, kitchen cabinet fronts, door frames',
    price: 42,
    marketPrice: 45,
    category: 'residential',
    type: 'cleaning',
    unit: 'job'
  },
  {
    id: 'move-clean',
    name: 'Move-In/Move-Out Clean',
    description: 'Intensive cleaning for property transitions: inside cabinets/drawers, appliance interiors, wall spot cleaning, minor maintenance checks, detailed inspection report',
    price: 36,
    marketPrice: 38,
    category: 'residential',
    type: 'cleaning',
    unit: 'job'
  },
  {
    id: 'room-addon',
    name: 'Room Add-Ons',
    description: 'Targeted room enhancement: extra bathroom deep clean, kitchen appliance detailing, balcony/patio cleaning, closet organization, premium room refresh',
    price: 13,
    marketPrice: 15,
    category: 'residential',
    type: 'cleaning',
    unit: 'room',
    isAddOn: true
  },
  {
    id: 'window-clean',
    name: 'Window Cleaning',
    description: 'Professional interior window cleaning: streak-free glass, window sills, frames, mirrors, glass doors, improved natural light and guest experience',
    price: 40,
    marketPrice: 45,
    category: 'residential',
    type: 'cleaning',
    unit: 'job'
  },
  {
    id: 'laundry',
    name: 'Laundry & Ironing',
    description: 'Complete laundry service: wash, dry, fold bed linens and towels, iron as needed, quality fabric care, fresh scent treatment, same-day turnaround',
    price: 28,
    marketPrice: 30,
    category: 'residential',
    type: 'restocking',
    unit: 'load'
  },
  {
    id: 'supplies-restock',
    name: 'Supplies Restocking',
    description: 'Guest amenity restocking: toilet paper, towels, soap, shampoo, coffee, tea, cleaning supplies, welcome snacks, quality brand selection',
    price: 14,
    marketPrice: 16,
    category: 'residential',
    type: 'restocking',
    unit: 'job'
  },
  // Specialty Services
  {
    id: 'eco-clean',
    name: 'Eco-Friendly Cleaning',
    description: 'Green cleaning with certified non-toxic products: plant-based cleaners, biodegradable supplies, allergen-free environment, safe for children and pets',
    price: 55,
    category: 'specialty',
    type: 'cleaning',
    unit: 'job'
  },
  {
    id: 'pet-clean',
    name: 'Pet-Friendly Deep Clean',
    description: 'Specialized pet cleanup: fur removal, odor elimination, pet-safe sanitizers, upholstery treatment, air purification, allergy-conscious cleaning',
    price: 60,
    category: 'specialty',
    type: 'cleaning',
    unit: 'job'
  },
  {
    id: 'premium-addon',
    name: 'Room-By-Room Premium Add-On',
    description: 'Luxury enhancement service: antimicrobial treatment, high-touch surface sanitization, premium air freshening, detailed quality inspection',
    price: 20,
    category: 'specialty',
    type: 'cleaning',
    unit: 'room',
    isAddOn: true
  },
  // Commercial Services
  {
    id: 'light-office',
    name: 'Light Office Cleaning',
    description: 'Weekly office maintenance for 2,500 sq ft: desk cleaning, trash removal, restroom sanitization, common area tidying, professional appearance',
    price: 350,
    category: 'commercial',
    type: 'cleaning',
    unit: 'sqft',
    frequency: 'monthly'
  },
  {
    id: 'standard-office',
    name: 'Standard Office Cleaning',
    description: 'Bi-weekly comprehensive cleaning for 3,500 sq ft: vacuum/mop, kitchen cleaning, conference room setup, detailed restroom service, supply monitoring',
    price: 600,
    category: 'commercial',
    type: 'cleaning',
    unit: 'sqft',
    frequency: 'monthly'
  },
  {
    id: 'emergency-disinfect',
    name: 'Emergency Disinfection',
    description: 'Rapid response sanitization: hospital-grade disinfection, high-touch surface treatment, air purification, health compliance certification',
    price: 45,
    category: 'commercial',
    type: 'cleaning',
    unit: 'hour'
  },
  {
    id: 'office-restock',
    name: 'Restock & Consumables',
    description: 'Weekly office supply management: paper products, cleaning supplies, kitchen items, hand sanitizer, quality brand selection, inventory tracking',
    price: 25,
    category: 'commercial',
    type: 'restocking',
    unit: 'job',
    frequency: 'weekly'
  },
  // Maintenance Services
  {
    id: 'minor-repairs',
    name: 'Minor Repairs & Pre-Inspection',
    description: 'Property maintenance check: light bulb replacement, handle tightening, leak detection, smoke alarm testing, detailed defect reporting, preventive care',
    price: 25,
    category: 'maintenance',
    type: 'repair',
    unit: 'job'
  },
  {
    id: 'smart-home',
    name: 'Smart Home Setup',
    description: 'Technology installation service: smart locks, thermostats, WiFi optimization, guest instruction cards, remote monitoring setup, tech support',
    price: 50,
    category: 'maintenance',
    type: 'maintenance',
    unit: 'job'
  },
  {
    id: 'pool-lawn',
    name: 'Seasonal Pool & Lawn Care',
    description: 'Weekly outdoor maintenance: pool cleaning/chemical balance, lawn mowing, hedge trimming, patio cleaning, seasonal plant care, curb appeal enhancement',
    price: 175,
    category: 'maintenance',
    type: 'maintenance',
    unit: 'job',
    frequency: 'monthly'
  },
  // Bundle Services
  {
    id: 'essential-bundle',
    name: 'Essential Airbnb Bundle',
    description: 'Complete guest turnover package: standard cleaning, fresh linens, amenity restocking, basic maintenance check, guest-ready guarantee, same-day service',
    price: 45,
    category: 'bundle',
    type: 'cleaning',
    unit: 'job',
    bundleServices: ['standard-airbnb', 'supplies-restock']
  },
  {
    id: 'premium-bundle',
    name: 'Premium Airbnb Bundle',
    description: 'Luxury guest experience package: deep cleaning, professional laundry service, premium amenities, quality inspection, 5-star preparation guarantee',
    price: 70,
    category: 'bundle',
    type: 'cleaning',
    unit: 'job',
    bundleServices: ['deep-clean', 'laundry']
  },
  {
    id: 'office-essentials',
    name: 'Office Essentials Plan',
    description: 'Complete office management: weekly cleaning service, supply restocking, maintenance monitoring, professional environment guarantee, flexible scheduling',
    price: 375,
    category: 'bundle',
    type: 'cleaning',
    unit: 'job',
    frequency: 'monthly',
    bundleServices: ['light-office', 'office-restock']
  },
  {
    id: 'emergency-response',
    name: 'Emergency Response Plan',
    description: '24/7 rapid response service: immediate cleaning/repair dispatch, 2-hour minimum response, priority scheduling, emergency contact support, peace of mind coverage',
    price: 90,
    category: 'bundle',
    type: 'repair',
    unit: 'job'
  }
];

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'residential',
    name: 'Residential & Airbnb',
    description: 'Cleaning and restocking for homes and short-term rentals',
    icon: '🏠',
    services: services.filter(s => s.category === 'residential')
  },
  {
    id: 'specialty',
    name: 'Specialty & Premium',
    description: 'Eco-friendly and specialized cleaning services',
    icon: '🧺',
    services: services.filter(s => s.category === 'specialty')
  },
  {
    id: 'commercial',
    name: 'Office & Commercial',
    description: 'Professional cleaning for offices and businesses',
    icon: '🏢',
    services: services.filter(s => s.category === 'commercial')
  },
  {
    id: 'maintenance',
    name: 'Maintenance & Add-Ons',
    description: 'Repairs, installations, and maintenance services',
    icon: '⚙️',
    services: services.filter(s => s.category === 'maintenance')
  },
  {
    id: 'bundle',
    name: 'Bundles & Plans',
    description: 'Cost-effective service packages',
    icon: '🧰',
    services: services.filter(s => s.category === 'bundle')
  }
];