import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { MainPage } from './pages/MainPage';
import { ProductListPage } from './pages/ProductListPage';
import { ProductDetailPage } from './pages/ProductDetail';
import { RedirectToProduct } from './pages/RedirectToProduct';
import { CSCenter } from './pages/CSCenter';
import { ProductSearchResult } from './pages/ProductSearchResult';
import { CompanyIntro } from './pages/CompanyIntro';
import { TermsOfService } from './pages/TermsOfService';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { NotFound } from './pages/NotFound';
import { InstallationCasesGallery } from './pages/InstallationCasesGallery';
import { InstallationCaseDetail } from './pages/InstallationCaseDetail';
import { QuoteRequestPage } from './pages/QuoteRequestPage';
import { AuthProvider } from './src/context/AuthContext';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ProductManager } from './pages/admin/ProductManager';
import { BookingList } from './pages/admin/BookingList';
import { CMSManager } from './pages/admin/CMSManager';
import { UserManager } from './pages/admin/UserManager';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminSignup } from './pages/admin/AdminSignup';
import { FAQManager } from './pages/admin/FAQManager';
import { InquiryManager } from './pages/admin/InquiryManager';
import { InstallationCasesManager } from './pages/admin/InstallationCasesManager';
import { MainReviewCardsManager } from './pages/admin/MainReviewCardsManager';
import { AdminRoute } from './src/components/AdminRoute';

function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // Respect in-page anchors if hash exists.
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, search, hash]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Admin Routes - Protected */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>}>
            <Route path="cms" element={<CMSManager />} />
            <Route path="sections" element={<CMSManager />} />
            <Route path="products" element={<ProductManager />} />
            <Route path="bookings" element={<BookingList />} />
            <Route path="users" element={<UserManager />} />
            <Route path="cases" element={<InstallationCasesManager />} />
            <Route path="main-reviews" element={<MainReviewCardsManager />} />
            <Route path="faqs" element={<FAQManager />} />
            <Route path="inquiries" element={<InquiryManager />} />
          </Route>

          {/* Admin Login - Separate Route */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />

          {/* Public Routes */}
          <Route
            path="/*"
            element={
              <div className="min-h-screen bg-white">
                <Header />
                <Routes>
                  <Route path="/" element={<MainPage />} />
                  <Route path="/products" element={<ProductListPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/mypage/*" element={<Navigate to="/" replace />} />
                  <Route path="/login" element={<Navigate to="/" replace />} />
                  <Route path="/signup" element={<Navigate to="/" replace />} />
                  <Route path="/cs" element={<CSCenter />} />
                  <Route path="/p/:code" element={<RedirectToProduct />} />
                  <Route path="/search" element={<ProductSearchResult />} />
                  <Route path="/company" element={<CompanyIntro />} />
                  <Route path="/quote-request" element={<QuoteRequestPage />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/cases" element={<InstallationCasesGallery />} />
                  <Route path="/cases/:id" element={<InstallationCaseDetail />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Footer />
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
