import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/Admin.css';

function LayoutIcon({ name }) {
  const icons = {
    dashboard: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm8-3a1 1 0 00-1 1v2H7a1 1 0 000 2h2v2a1 1 0 002 0v-2h2a1 1 0 000-2h-2V8a1 1 0 00-1-1z"/>
      </svg>
    ),
    crm: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm6 4a1 1 0 011-1h2a1 1 0 011 1v8a1 1 0 01-1 1H9a1 1 0 01-1-1V8zm6-3a1 1 0 011-1h2a1 1 0 011 1v11a1 1 0 01-1 1h-2a1 1 0 01-1-1V5z"/>
      </svg>
    ),
    leads: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
      </svg>
    ),
    clients: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"/>
        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"/>
      </svg>
    ),
    proposals: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
      </svg>
    ),
    invoices: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd"/>
      </svg>
    ),
    campaigns: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
      </svg>
    ),
    posts: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
      </svg>
    ),
    new: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
      </svg>
    ),
    blog: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
      </svg>
    ),
    socials: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
      </svg>
    ),
    pages: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
      </svg>
    ),
    settings: (
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
      </svg>
    ),
  };
  return icons[name] || null;
}

export default function AdminLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If on login page, don't enforce auth check
  const isLoginPage = location.pathname === '/admin/login';

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      navigate('/admin/login', { replace: true });
    }
  }, [user, loading, isLoginPage, navigate]);

  // Render login page directly without the layout chrome
  if (isLoginPage) {
    return <Outlet />;
  }

  if (loading) {
    return (
      <div className="admin-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#92D108', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout admin-root">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__logo">
          MNX
          <span>Content Manager</span>
        </div>

        <nav className="admin-nav">
          <span className="admin-nav__section">Content</span>

          <NavLink to="/admin/posts" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            <LayoutIcon name="posts" />
            All Posts
          </NavLink>

          <NavLink to="/admin/posts/new" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            <LayoutIcon name="new" />
            New Post
          </NavLink>

          <NavLink to="/admin/socials" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            <LayoutIcon name="socials" />
            Social Media
          </NavLink>

          <span className="admin-nav__section">Pages</span>

          <NavLink to="/admin/pages" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            <LayoutIcon name="pages" />
            All Pages
          </NavLink>

          <NavLink to="/admin/pages/new" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            <LayoutIcon name="new" />
            New Page
          </NavLink>

          <span className="admin-nav__section">CRM</span>

          <NavLink to="/admin/crm" end className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            <LayoutIcon name="crm" />
            Dashboard
          </NavLink>

          <NavLink to="/admin/crm/leads" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            <LayoutIcon name="leads" />
            Leads
          </NavLink>

          <NavLink to="/admin/crm/clients" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            <LayoutIcon name="clients" />
            Clients
          </NavLink>

          <NavLink to="/admin/crm/proposals" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            <LayoutIcon name="proposals" />
            Proposals
          </NavLink>

          <NavLink to="/admin/crm/invoices" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            <LayoutIcon name="invoices" />
            Invoices
          </NavLink>

          <NavLink to="/admin/crm/campaigns" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            <LayoutIcon name="campaigns" />
            Campaigns
          </NavLink>

          <span className="admin-nav__section">Design</span>

          <NavLink to="/admin/settings" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            <LayoutIcon name="settings" />
            Settings
          </NavLink>

          <span className="admin-nav__section">Site</span>

          <a href="/blog" target="_blank" rel="noopener noreferrer" className="admin-nav-link">
            <LayoutIcon name="blog" />
            View Blog ↗
          </a>

          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-nav-link">
            <LayoutIcon name="dashboard" />
            View Site ↗
          </a>
        </nav>

        <div className="admin-sidebar__logout">
          <button className="admin-btn-secondary" style={{ width: '100%' }} onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
