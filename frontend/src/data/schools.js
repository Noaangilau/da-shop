// School partner data. Add new schools here — each gets its own storefront at /school/:id

export const schools = [
  {
    id: 'west-high',
    name: 'West High School',
    shortName: 'WEST HIGH',
    mascot: 'PANTHERS',
    location: 'Salt Lake City, UT',
    since: 'EST. 2024',
    colors: {
      primary: '#CC0000',    // red
      secondary: '#111111',  // black
      primaryInk: '#ffffff', // text on primary
    },
    productCount: 0, // update as products are added
    storeOpen: true,
  },
]

export function getSchoolById(id) {
  return schools.find((s) => s.id === id) || null
}
