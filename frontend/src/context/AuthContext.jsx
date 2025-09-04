import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Create context
const AuthContext = createContext();

// Create provider
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  });

  const login = (user) => {
    setUser(user);
    const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('expiry', expiry);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('expiry');
    navigate('/login'); // Redirect to login
  };

  useEffect(() => {
    const expiry = localStorage.getItem('expiry');
    if (expiry) {
      const timeLeft = parseInt(expiry) - Date.now();
      if (timeLeft <= 0) {
        logout(); // Immediate logout if expired
      } else {
        const timer = setTimeout(() => {
          logout(); // Auto-logout after timeLeft
        }, timeLeft);
        return () => clearTimeout(timer); // Cleanup
      }
    }
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);