import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import SignupPage from './pages/SignupPage.tsx';
import DocsPage from './pages/DocsPage.tsx';
import SamplePage from './pages/SamplePage.tsx';
import CheckoutPage from './pages/CheckoutPage.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/sample" element={<SamplePage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/success" element={<CheckoutPage />} />
        <Route path="/pricing" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
