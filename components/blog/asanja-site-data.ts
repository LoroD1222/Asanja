export const campLinks = [
  {label: 'Asanja Moru', href: '/asanja-moru/'},
  {label: 'Asanja Siri Bustani, Grumeti', href: '/asanja-sri-bustani/'},
  {label: 'Asanja Nyasirori', href: '/asanja-nyasirori/'},
  {label: 'Asanja Ndembo, Ruaha', href: '/asanja-ruaha/'},
  {label: 'Asanja Under The Stars', href: '/asanja-under-the-stars/'},
  {label: 'Asanja Ewasi, Tarangire', href: '/asanja-ewasi-tarangire/'},
] as const

export const siteMenuLinks = [
  {
    label: 'Asanja Story',
    href: '/about/',
    image: '/legacy/wp-content/uploads/2024/04/menu-fire_20250724093930.webp',
  },
  {
    label: 'Camps & Lodges',
    href: '/camps-and-lodges/',
    image: '/legacy/wp-content/uploads/2025/07/camp-slide-sri-bustani-couple-deck_20250709165549.webp',
    children: campLinks,
  },
  {
    label: 'Safaris',
    href: '/safaris/',
    image: '/legacy/wp-content/uploads/2020/08/lady-on-safari_20250805120210-e1754388375386.webp',
  },
  {
    label: 'Experiences',
    href: '/experiences/',
    image: '/legacy/wp-content/uploads/2024/04/menu-masaai-visit_20250724093647.webp',
  },
  {
    label: 'Asanja Reviews',
    href: '/asanja-reviews/',
    image: '/legacy/wp-content/uploads/2024/04/menu-reviews_20250711104945.webp',
  },
  {
    label: 'Journal',
    href: '/blogs/',
    image: '/legacy/wp-content/uploads/2025/07/faq-asanja-header_20250711100340.webp',
  },
  {
    label: 'FAQs',
    href: '/faqs/',
    image: '/legacy/wp-content/uploads/2025/07/faq-asanja-safari_20250711100340.webp',
  },
  {
    label: 'Contact Us',
    href: '/contact/',
    image: '/legacy/wp-content/uploads/2024/05/wade-lambert-VfdOzbZkW1w-unsplash.jpg',
  },
] as const

export const footerGroups = [
  {
    title: 'Experience',
    links: [
      {label: 'Our Camps', href: '/camps-and-lodges/'},
      {label: 'Safaris', href: '/safaris/'},
      {label: 'Experiences', href: '/experiences/'},
    ],
  },
  {
    title: 'About',
    links: [
      {label: 'Our Story', href: '/about/'},
      {label: 'FAQ', href: '/faqs/'},
    ],
  },
  {
    title: 'Contact',
    links: [
      {label: 'General enquiries', href: '/contact/'},
      {label: 'Plan my stay', href: '/plan-my-stay/'},
      {label: 'Terms & Conditions', href: '/terms/'},
    ],
  },
] as const
