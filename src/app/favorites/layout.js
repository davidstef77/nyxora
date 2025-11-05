export const metadata = {
  title: 'Produse Favorite | Nyxora',
  description: 'Lista ta de produse favorite',
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
