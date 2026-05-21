// Product data is managed via the admin dashboard and stored in the database.
// Fetch from GET /products endpoint. Do not add products here.
// The `categories` export is used by Home.jsx and Category.jsx for category navigation tiles.

export const categories = [
  {
    label: 'T-Shirts',
    slug: 'tees',
    apiCategory: 'Clothing',
    count: null,
    description: 'Heavyweight basics. Mid-weight 7oz or higher, pre-shrunk, relaxed fit.',
  },
  {
    label: 'Long Sleeves',
    slug: 'long-sleeves',
    apiCategory: 'Clothing',
    count: null,
    description: 'Tubular knit and mid-weight long sleeves. Heavy enough to wear alone.',
  },
  {
    label: 'Crew Necks',
    slug: 'crew-necks',
    apiCategory: 'Clothing',
    count: null,
    description: 'French terry and loopback fleece. Athletic rib at cuffs and collar.',
  },
  {
    label: 'Hoodies',
    slug: 'hoodies',
    apiCategory: 'Clothing',
    count: null,
    description: 'Stadium-weight brushed fleece. Self-fabric drawcord. Hand pockets.',
  },
]

export const products = []
