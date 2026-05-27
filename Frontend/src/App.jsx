import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { UserProvider } from './context/UserContext';
import Sidebar from './components/sidebar/Sidebar';
import Navbar from './components/navbar/Navbar';
import Inicio from './pages/inicio/Inicio';
import Login from './pages/login/Login';
import Peliculas from './pages/peliculas/Peliculas';
import Favoritos from './pages/favoritos/Favoritos';
import Perfil from './pages/perfil/Perfil';
import Ajustes from './pages/ajustes/Ajustes';
import Ayuda from './pages/ayuda/Ayuda';
import Amigos from './pages/amigos/Amigos';
import Series from './pages/series/Series';
import './App.css';

function AppContent() {
  const location = useLocation();
  
  // Definimos si estamos en la página de login
  const isLoginPage = location.pathname === '/login';

  return (
    <div className={isLoginPage ? "login-layout" : "app-layout"}>
      {/* Solo mostramos el Sidebar si NO es la página de login */}
      {!isLoginPage && <Sidebar />}
      
      <div className={isLoginPage ? "login-content" : "content-area"}>
        {/* Solo mostramos el Navbar si NO es la página de login */}
        {!isLoginPage && <Navbar />}
        
        <main className={isLoginPage ? "" : "main-view"}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/inicio" element={<Inicio />} />
            <Route path="/peliculas" element={<Peliculas />} />
            <Route path="/mis-libros" element={<Favoritos />} />
            <Route path="/favoritos" element={<Favoritos />} />
            <Route path="/amigos" element={<Amigos/>} />
            <Route path="/series" element={<Series />} />

            <Route path="/perfil" element={<Perfil />} />
            <Route path="/ajustes" element={<Ajustes />} />
            <Route path="/ayuda" element={<Ayuda />} />
            
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <UserProvider>
          <AppContent />
        </UserProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}