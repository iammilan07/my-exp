import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import About from './pages/About';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';import Settings from './pages/Settings';import { useState, useEffect, useCallback } from 'react';

const SIDEBAR_STATE_KEY = 'expenseTracker_sidebarCollapsed';

function App() {
  const { user } = useAuth();
  
  // Initialize sidebar state from localStorage (default: collapsed)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
      return savedState !== null ? JSON.parse(savedState) : true;
    } catch (error) {
      console.error('Error reading sidebar state from localStorage:', error);
      return true;
    }
  });

  // Memoized setter that persists to localStorage
  const handleSetSidebarCollapsed = useCallback((value) => {
    setSidebarCollapsed(value);
    try {
      localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving sidebar state to localStorage:', error);
    }
  }, []);

  // Sync state across tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === SIDEBAR_STATE_KEY && e.newValue !== null) {
        try {
          setSidebarCollapsed(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Error parsing sidebar state from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {user ? (
        // Layout with Sidebar for logged-in users
        <div className="flex min-h-screen">
          <Sidebar isCollapsed={sidebarCollapsed} setIsCollapsed={setSidebarCollapsed} />
          <div 
            className="flex-1 flex flex-col transition-all duration-300 ease-in-out"
            style={{
              marginLeft: sidebarCollapsed ? '5rem' : '16rem'
            }}
          >
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route
                  path="/signin"
                  element={<Navigate to="/dashboard" />}
                />
                <Route
                  path="/signup"
                  element={<Navigate to="/dashboard" />}
                />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <PrivateRoute>
                      <Settings />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </div>
      ) : (
        // Layout with Top Navbar for non-logged-in users
        <>
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route
                path="/signin"
                element={<SignIn />}
              />
              <Route
                path="/signup"
                element={<SignUp />}
              />
              <Route
                path="/dashboard"
                element={<Navigate to="/signin" />}
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </>
      )}
    </div>
  );
}

export default App;
