import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/layout/Navbar';
import ScrollToTop from './components/ui/ScrollToTop';
import HomeLanding from './pages/HomeLanding';
import RetailPage from './pages/RetailPage';
import WebDevelopment from './pages/WebDevelopment';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import PostEditor from './pages/admin/PostEditor';
import AdminSocials from './pages/admin/AdminSocials';

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomeLanding />} />
        <Route path="/retail-automation-system" element={<RetailPage />} />
        <Route path="/web-design-development" element={<WebDevelopment />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />

        {/* Admin routes — AdminLayout handles auth + sidebar */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/posts" replace />} />
          <Route path="login" element={<AdminLogin />} />
          <Route path="posts" element={<AdminDashboard />} />
          <Route path="posts/new" element={<PostEditor />} />
          <Route path="posts/:id/edit" element={<PostEditor />} />
          <Route path="socials" element={<AdminSocials />} />
        </Route>
      </Routes>
      <Analytics />
    </>
  );
}

export default function App() {
  return <AppRoutes />;
}
