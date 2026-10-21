import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import HomePage from './pages/Home/HomePage';
import LearnPage from './pages/Learn/LearnPage';
import CategoryPage from './pages/Learn/CategoryPage';
import PracticePage from './pages/Practice/PracticePage';
import AboutPage from './pages/About/AboutPage';
import TranslatePage from './pages/Translate/TranslatePage';
import LoginPage from './pages/Login/LoginPage';

/** Redirects to /login if the user is not authenticated */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Redirects already-logged-in users away from the login page */
function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  if (isLoggedIn) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppShell() {
  return (
    <Routes>
      {/* ── Login: full-screen, no navbar/footer ── */}
      <Route
        path="/login"
        element={
          <RedirectIfAuth>
            <LoginPage />
          </RedirectIfAuth>
        }
      />

      {/* ── App shell: navbar + footer ── */}
      <Route
        path="/*"
        element={
          <div className="min-h-screen flex flex-col bg-[#FAF8F4]">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
                <Route path="/learn" element={<RequireAuth><LearnPage /></RequireAuth>} />
                <Route path="/learn/:categoryId" element={<RequireAuth><CategoryPage /></RequireAuth>} />
                <Route path="/practice" element={<RequireAuth><PracticePage /></RequireAuth>} />
                <Route path="/about" element={<RequireAuth><AboutPage /></RequireAuth>} />
                <Route path="/translate" element={<RequireAuth><TranslatePage /></RequireAuth>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
