export const metadata = {
  title: 'Produse Favorite | Nyxora',
  description: 'Lista ta de produse favorite',
  alternates: {
    canonical: 'https://www.nyxora.ro/favorites'
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true
    }
  }
};

export default function FavoritesLayout({ children }) {
  return children;
}
