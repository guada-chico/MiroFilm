import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Tv, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { getT } from '../../i18n';
import './Series.css';

export default function Series() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const t = getT(settings.language);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState(null);

  const loadPopularSeries = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5285/api/tmdb/popular-series?page=${page}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const data = await response.json();
      setSeries(data ?? []);
      setCurrentPage(page);
      setIsSearchMode(false);
    } catch (err) {
      console.error('Error cargando series:', err);
      setSeries([]);
    } finally {
      setLoading(false);
    }
  };

  const searchSeries = async (query) => {
    setIsSearching(true);
    setIsSearchMode(true);
    try {
      const response = await fetch(
        `http://localhost:5285/api/tmdb/search-series?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const data = await response.json();
      setSeries(data ?? []);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error buscando series:', err);
      setSeries([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    loadPopularSeries(1);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadPopularSeries(1);
      return;
    }
    await searchSeries(searchQuery);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (!value.trim() && isSearchMode) {
      loadPopularSeries(1);
    }
  };

  const handleNextPage = () => {
    loadPopularSeries(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      loadPopularSeries(currentPage - 1);
    }
  };

  return (
    <div className="series-container">
      <header className="reco-header">
        <div className="reco-title-row">
          <button className="back-btn" onClick={() => navigate('/inicio')}>
            <ArrowLeft size={20} />
          </button>
          <h1>Series Populares</h1>
        </div>
        <p>Descubre las mejores series de televisión</p>
      </header>

      {/* Buscador */}
      <form className="search-bar-series" onSubmit={handleSearch}>
        <Search size={20} color="#bbb" />
        <input
          type="text"
          placeholder="Buscar series por título..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <button type="submit" disabled={isSearching}>
          {isSearching ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '0.5rem' }}>
          <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Cargando series...</p>
        </div>
      ) : series.length > 0 ? (
        <div className="series-grid">
          {series.map((show, i) => (
            <div 
              key={show.id || show.tmdbId || i} 
              className="series-card"
              onClick={() => setSelectedSeries(show)}
            >
              <div className="series-cover">
                {show.posterUrl ? (
                  <img src={show.posterUrl} alt={show.title || show.name} />
                ) : (
                  <div className="no-cover">
                    <Tv size={32} color="#ccc" />
                  </div>
                )}
              </div>
              
              <div className="series-info">
                <h4>{show.title || show.name}</h4>
                <p className="series-year">{show.releaseDate ? new Date(show.releaseDate).getFullYear() : 'Año desconocido'}</p>
                {show.rating && <p className="series-rating">⭐ {show.rating.toFixed(1)}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: '#aaa', marginTop: '3rem' }}>
          <Tv size={48} color="#ddd" />
          <p style={{ marginTop: '1rem' }}>
            No se encontraron series
          </p>
        </div>
      )}

      {/* Paginación */}
      {!isSearchMode && series.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '2rem', padding: '1rem' }}>
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: currentPage === 1 ? '#e0e0e0' : '#ff6b35',
              color: currentPage === 1 ? '#999' : 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              transition: 'background 0.2s'
            }}
          >
            <ChevronLeft size={18} />
            Anterior
          </button>
          <span style={{ color: '#666', fontWeight: 600 }}>
            Página {currentPage}
          </span>
          <button
            onClick={handleNextPage}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: '#ff6b35',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#e55a25'}
            onMouseLeave={(e) => e.target.style.background = '#ff6b35'}
          >
            Siguiente
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Modal de detalle */}
      {selectedSeries && (
        <div className="modal-overlay" onClick={() => setSelectedSeries(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedSeries(null)}>
              ✕
            </button>
            <div className="modal-body">
              <img
                src={selectedSeries.posterUrl || 'https://via.placeholder.com/150x220?text=Sin+portada'}
                alt={selectedSeries.title || selectedSeries.name}
                className="modal-img"
              />
              <div className="modal-details">
                <h2>{selectedSeries.title || selectedSeries.name}</h2>
                {selectedSeries.releaseDate && (
                  <p className="modal-year">Año: {new Date(selectedSeries.releaseDate).getFullYear()}</p>
                )}
                {selectedSeries.rating && (
                  <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.5rem' }}>
                    ⭐ Calificación: {selectedSeries.rating.toFixed(1)}/10
                  </p>
                )}
                <div className="modal-section">
                  <h3 className="modal-label">Sinopsis</h3>
                  <p className="modal-text">{selectedSeries.plot || selectedSeries.overview || 'Sin sinopsis disponible'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
