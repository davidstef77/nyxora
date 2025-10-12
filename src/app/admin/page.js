import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import AdminShell from '../../components/AdminShell';
import connect from '../api/lib/db';
import Product from '../api/lib/models/Product';
import Category from '../api/lib/models/Category';
import Blog from '../api/lib/models/Blog';
import Top from '../api/lib/models/Top';
import { authOptions } from '../api/auth/[...nextauth]/route';

export const metadata = { 
  title: 'Admin Dashboard - Nyxora',
  description: 'Manage your e-commerce platform with the Nyxora admin dashboard'
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    redirect('/admin/login');
  }

  let counts = { products: 0, categories: 0, blogs: 0, tops: 0 };
  try {
    await connect();
    counts.products = await Product.countDocuments();
    counts.categories = await Category.countDocuments();
    counts.blogs = await Blog.countDocuments();
    counts.tops = await Top.countDocuments();
  } catch (err) {
    // if DB unreachable, still render client admin UI with defaults
    console.error('[admin page] db count error', err && err.message ? err.message : err);
  }

  // render modern admin shell with improved UX
  return <AdminShell initialCounts={counts} session={session} />;
}
