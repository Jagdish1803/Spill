import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { 
  LogOut, 
  MessageSquare, 
  Settings, 
  User, 
  Sun, 
  Moon, 
  Menu, 
  X 
} from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const NavLink = ({ to, icon: Icon, children, onClick }) => {
    const isActive = location.pathname === to;
    
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors touch-target ${
          isActive
            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="font-medium">{children}</span>
      </Link>
    );
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
              <MessageSquare className="w-8 h-8" />
              <span className="hidden sm:block">Spill</span>
            </Link>

            {authUser ? (
              <>
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-2">
                  <NavLink to="/" icon={MessageSquare}>
                    Chat
                  </NavLink>
                  <NavLink to="/profile" icon={User}>
                    Profile
                  </NavLink>
                  <NavLink to="/settings" icon={Settings}>
                    Settings
                  </NavLink>
                  
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
                  
                  <button
                    onClick={toggleTheme}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-target"
                    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {theme === 'dark' ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-target"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>

                {/* Mobile menu button and user info */}
                <div className="md:hidden flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={authUser.profilePic || "/avatar.png"}
                      alt={authUser.fullname}
                      className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-24">
                      {authUser.fullname}
                    </span>
                  </div>
                  
                  <button
                    onClick={toggleMobileMenu}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-target"
                    aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                  >
                    {isMenuOpen ? (
                      <X className="w-6 h-6" />
                    ) : (
                      <Menu className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-target"
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {authUser && isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu panel */}
          <div className="fixed top-16 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg md:hidden animate-slide-up">
            <div className="p-4 space-y-2">
              <NavLink to="/" icon={MessageSquare} onClick={() => setIsMenuOpen(false)}>
                Chat
              </NavLink>
              <NavLink to="/profile" icon={User} onClick={() => setIsMenuOpen(false)}>
                Profile
              </NavLink>
              <NavLink to="/settings" icon={Settings} onClick={() => setIsMenuOpen(false)}>
                Settings
              </NavLink>
              
              <div className="border-t border-gray-200 dark:border-gray-700 my-4" />
              
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left touch-target"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <Moon className="w-5 h-5 flex-shrink-0" />
                )}
                <span className="font-medium">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors text-left touch-target"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;