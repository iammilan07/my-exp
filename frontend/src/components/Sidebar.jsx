import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { TrendingUp, Home, Info, Wallet, LogOut, Sun, Moon, Menu, X, AlertCircle, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { useState } from 'react';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/');
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'About', path: '/about', icon: Info },
    { name: 'My Expenses', path: '/dashboard', icon: Wallet },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg text-gray-700 dark:text-gray-300 hover:scale-110 transition-transform duration-200"
      >
        {isOpen ? <X className="h-6 w-6 animate-spin-once" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-2xl border-r border-gray-200 dark:border-gray-700 z-40 transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 ${isCollapsed ? 'w-20' : 'w-64'} flex flex-col`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <TrendingUp className="h-6 w-6 text-white" />
              <div className="absolute inset-0 bg-white rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 bg-clip-text text-transparent whitespace-nowrap overflow-hidden animate-fade-in">
                ExpenseTracker
              </span>
            )}
          </Link>
          
          {/* Collapse Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden md:flex mt-4 ${isCollapsed ? 'mx-auto' : 'ml-0'} items-center ${isCollapsed ? 'justify-center' : 'space-x-2'} px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 group`}
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className={`h-5 w-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
            {!isCollapsed && <span className="text-sm font-medium">Collapse Menu</span>}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                title={isCollapsed ? item.name : ''}
                className={`relative flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden ${
                  active
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/50 scale-105'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:scale-105 hover:shadow-md'
                }`}
              >
                {/* Background animation on hover */}
                {!active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
                
                <Icon
                  className={`h-5 w-5 ${isCollapsed ? '' : 'flex-shrink-0'} transition-all duration-300 relative z-10 ${
                    active 
                      ? 'text-white scale-110' 
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-primary-500 group-hover:scale-110'
                  }`}
                />
                {!isCollapsed && (
                  <span className="font-medium relative z-10 group-hover:translate-x-1 transition-transform duration-300">
                    {item.name}
                  </span>
                )}
                
                {/* Active indicator */}
                {active && !isCollapsed && (
                  <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section - Theme Toggle & Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2 bg-gray-50/50 dark:bg-gray-800/50">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={isCollapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : ''}
            className={`relative flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-xl w-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300 group overflow-hidden hover:scale-105 hover:shadow-md`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {theme === 'dark' ? (
              <>
                <Sun className="h-5 w-5 text-yellow-500 group-hover:rotate-180 transition-transform duration-500 relative z-10" />
                {!isCollapsed && <span className="font-medium relative z-10 group-hover:translate-x-1 transition-transform duration-300">Light Mode</span>}
              </>
            ) : (
              <>
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:rotate-12 transition-transform duration-300 relative z-10" />
                {!isCollapsed && <span className="font-medium relative z-10 group-hover:translate-x-1 transition-transform duration-300">Dark Mode</span>}
              </>
            )}
          </button>

          {/* User Info & Logout */}
          {user && (
            <div className="space-y-2">
              {!isCollapsed && (
                <div className="px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 animate-fade-in">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Logged in as</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate mt-1">
                    {user.email}
                  </p>
                </div>
              )}
              
              {/* Settings Button */}
              <Link
                to="/settings"
                title={isCollapsed ? 'Settings' : ''}
                className={`relative flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-xl w-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300 group overflow-hidden hover:scale-105 hover:shadow-md`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Settings className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300 relative z-10" />
                {!isCollapsed && <span className="font-medium relative z-10 group-hover:translate-x-1 transition-transform duration-300">Settings</span>}
              </Link>

              <button
                onClick={handleLogout}
                title={isCollapsed ? 'Logout' : ''}
                className={`relative flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-xl w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 group overflow-hidden hover:scale-105 hover:shadow-md`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <LogOut className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
                {!isCollapsed && <span className="font-medium relative z-10 group-hover:translate-x-1 transition-transform duration-300">Logout</span>}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirm Logout</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Are you sure you want to logout?</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 btn btn-danger"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
