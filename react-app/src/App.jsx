import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/layout/Navbar';
import ScrollToTop from './components/ui/ScrollToTop';
import { SiteSettingsProvider } from './hooks/useSiteSettings';
import DynamicPage from './pages/DynamicPage';
import Services from './pages/Services';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import PostEditor from './pages/admin/PostEditor';
import AdminSocials from './pages/admin/AdminSocials';
import AdminPages from './pages/admin/AdminPages';
import PageCreator from './pages/admin/PageCreator';
import PageEditor from './pages/admin/PageEditor';
import AdminSettings from './pages/admin/AdminSettings';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

function AppRoutes() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      <Routes>
        {/* Static pages served dynamically from Supabase CMS */}
        <Route path="/" element={<DynamicPage slug="home" />} />
        <Route path="/retail-automation-system" element={<DynamicPage slug="retail-automation-system" />} />
        <Route path="/web-design-development" element={<DynamicPage slug="web-design-development" />} />

        {/* Core pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Services listing */}
        <Route path="/services" element={<Services />} />

        {/* Blog */}
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
          <Route path="pages" element={<AdminPages />} />
          <Route path="pages/new" element={<PageCreator />} />
          <Route path="pages/:id/edit" element={<PageEditor />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* CMS catch-all — any new page slug created in admin */}
        <Route path="/:slug" element={<DynamicPage />} />
      </Routes>
      <Analytics />
    </>
  );
}

export default function App() {
  return (
    <SiteSettingsProvider>
      <AppRoutes />
    </SiteSettingsProvider>
  );
}
