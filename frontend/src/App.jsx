import { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy load components with better loading states
const HomePage = lazy(() => 
  import("./pages/HomePage").then(module => ({ default: module.default }))
);
const SignUpPage = lazy(() => 
  import("./pages/SignUpPage").then(module => ({ default: module.default }))
);
const LoginPage = lazy(() => 
  import("./pages/LoginPage").then(module => ({ default: module.default }))
);
const SettingsPage = lazy(() => 
  import("./pages/SettingPage").then(module => ({ default: module.default }))
);
const ProfilePage = lazy(() => 
  import("./pages/ProfilePage").then(module => ({ default: module.default }))
);

// Optimized loading component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
    <div className="text-center space-y-4">
      <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
      <p className="text-gray-600 dark:text-gray-400 text-sm">Loading...</p>
    </div>
  </div>
);

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme, initializeTheme } = useThemeStore();

  useEffect(() => {
    initializeTheme();
    checkAuth();
  }, [checkAuth, initializeTheme]);

  // Preload critical routes based on auth state
  useEffect(() => {
    if (authUser) {
      import("./pages/HomePage");
      import("./components/chat/ChatContainer");
    } else {
      import("./pages/LoginPage");
    }
  }, [authUser]);

  if (isCheckingAuth) {
    return <PageLoader />;
  }

  return (
    <ErrorBoundary>
      <div data-theme={theme} className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route 
              path="/" 
              element={authUser ? <HomePage /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/signup" 
              element={!authUser ? <SignUpPage /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/login" 
              element={!authUser ? <LoginPage /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/settings" 
              element={authUser ? <SettingsPage /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/profile" 
              element={authUser ? <ProfilePage /> : <Navigate to="/login" replace />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        <Toaster
          position="top-center"
          containerClassName="z-50"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-color)',
              fontSize: '14px',
              borderRadius: '8px',
              padding: '12px 16px',
              maxWidth: '90vw',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;