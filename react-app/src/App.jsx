import { Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/layout/Navbar';
import ScrollToTop from './components/ui/ScrollToTop';
import HomeLanding from './pages/HomeLanding';
import RetailPage from './pages/RetailPage';
import WebDevelopment from './pages/WebDevelopment';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomeLanding />} />
        <Route path="/retail-automation-system" element={<RetailPage />} />
        <Route path="/web-design-development" element={<WebDevelopment />} />
      </Routes>
      <Analytics />
    </>
  );
}
