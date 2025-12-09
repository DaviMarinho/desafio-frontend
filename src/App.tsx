import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Header from './components/Layout/Header';
import PrivateRoute from './components/PrivateRoute';
import Loading from './components/Loading';

// Eager loaded pages (small, public, frequently accessed)
import BuscaCep from './pages/BuscaCep';
import Login from './pages/Login';

// Lazy loaded pages (larger, private, less frequently accessed)
// This improves performance by code splitting - the Noticias page
// bundle will only be loaded when the user navigates to /noticias
const Noticias = lazy(() => import('./pages/Noticias'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<BuscaCep />} />
            <Route path="/login" element={<Login />} />

            {/* Private routes */}
            <Route
              path="/noticias"
              element={
                <PrivateRoute>
                  <Noticias />
                </PrivateRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
