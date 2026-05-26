import { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../services/profile-service';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState({
    name: 'Usuario',
    email: '',
    avatarUrl: null
  });
  const [loading, setLoading] = useState(true);

  // Cargar perfil al montar
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const data = await getProfile();
      setUser({
        name: data.name || 'Usuario',
        email: data.email || '',
        avatarUrl: data.avatarUrl || null
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <UserContext.Provider value={{ user, loading, updateUser, loadUserProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
