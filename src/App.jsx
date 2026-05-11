import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DonatePage from './pages/DonatePage';
import OfferPage from './pages/OfferPage';
import PrivacyPage from './pages/PrivacyPage';
import RefundPage from './pages/RefundPage';
import ContactsPage from './pages/ContactsPage';
import TermsPage from './pages/TermsPage';
import PaymentStatusPage from './pages/PaymentStatusPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/donate" element={<DonatePage />} />
      <Route path="/oferta" element={<OfferPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/refund" element={<RefundPage />} />
      <Route path="/contacts" element={<ContactsPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/pay/success" element={<PaymentStatusPage status="success" />} />
      <Route path="/pay/fail" element={<PaymentStatusPage status="fail" />} />
      <Route path="/pay/result" element={<PaymentStatusPage status="result" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
