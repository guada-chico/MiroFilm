import { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../services/profile-service';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState({
    id: null,
    name: 'Usuario',
    email: '',
    avatarUrl: null
  });
  const [loading, setLoading] = useState(true);

  // Cargar perfil al montar y cuando el token cambia
  useEffect(() => {
    loadUserProfile();
  }, []);

  // Escuchar cambios en el token
  useEffect(() => {
    const handleStorageChange = () => {
      loadUserProfile();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadUserProfile = async () => {
    try {
      // Solo cargar perfil si hay token
      const token = localStorage.getItem('token');
      if (!token) {
        setUser({
          id: null,
          name: 'Usuario',
          email: '',
          avatarUrl: null
        });
        setLoading(false);
        return;
      }
      
      const data = await getProfile();
      setUser({
        id: data.id || null,
        name: data.name || 'Usuario',
        email: data.email || '',
        avatarUrl: data.avatarUrl || null
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Si hay error, limpiar el usuario
      setUser({
        id: null,
        name: 'Usuario',
        email: '',
        avatarUrl: null
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const clearUser = () => {
    setUser({
      id: null,
      name: 'Usuario',
      email: '',
      avatarUrl: null
    });
  };

  return (
    <UserContext.Provider value={{ user, loading, updateUser, loadUserProfile, clearUser }}>
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
