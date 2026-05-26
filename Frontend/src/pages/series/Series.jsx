import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, BookmarkPlus, ArrowLeft, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { getPopularSeries, searchSeries } from '../../services/series-service';
import { useSettings } from '../../context/SettingsContext';
import { getT } from '../../i18n';
import './Series.css';

export default function Series() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const t = getT(settings.language);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Cargar series populares
  useEffect(() => {
    setLoading(true);
    setSeries([]);
    
    if (isSearching && searchTerm) {
      // Si estamos buscando, usar el endpoint de búsqueda
      searchSeries(searchTerm)
        .then((data) => {
          console.log('Series encontradas:', data?.length || 0);
          setSeries(data ?? []);
        })
        .catch((error) => {
          console.error('Error searching series:', error);
          setSeries([]);
        })
        .finally(() => setLoading(false));
    } else {
      // Si no, cargar series populares
      getPopularSeries(currentPage)
        .then((data) => {
          console.log('Series recibidas:', data?.length || 0);
          setSeries(data ?? []);
        })
        .catch((error) => {
          console.error('Error fetching series:', error);
          setSeries([]);
        })
        .finally(() => setLoading(false));
    }
  }, [currentPage, isSearching, searchTerm]);

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    setIsSearching(value.length > 0);
  };

  const handleAddToWatchlist = async (seriesId) => {
    // TODO: Implementar agregar a lista de visualización
    setSelectedSeries(null);
  };

  return (
    <div className="series-container">
      <header className="reco-header">
        <div className="reco-title-row">
          <button className="back-btn" onClick={() => navigate('/inicio')}>
            <ArrowLeft size={20} />
          </button>
          <h1>{t.series?.title || 'Series'}</h1>
        </div>
        <p>{t.series?.subtitle || 'Series recomendadas basadas en tus favoritos'}</p>
      </header>

      {/* Buscador */}
      <div className="search-container">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Buscar por título, director, género..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>{t.common?.loading || 'Cargando series...'}</p>
      ) : series.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>{t.series?.noSeries || 'No hay series disponibles'}</p>
      ) : (
        <>
          <div className="series-grid">
            {series.map((show, i) => (
              <div key={show.tmdbId || show.id || i} className="series-card" onClick={() => setSelectedSeries(show)}>
                <div className="series-img-wrapper">
                  <img
                    src={show.posterUrl || 'https://via.placeholder.com/150x220?text=Sin+portada'}
                    alt={show.title}
                  />
                  <div className="series-hover-actions">
                    <button className="series-icon-btn" onClick={(e) => { e.stopPropagation(); }}>
                      <Heart size={18} />
                    </button>
                    <button className="series-icon-btn" onClick={(e) => { e.stopPropagation(); handleAddToWatchlist(show.id); }}>
                      <BookmarkPlus size={18} />
                    </button>
                  </div>
                </div>
                <div className="series-info">
                  <h4>{show.title}</h4>
                  <p>{show.creator || 'Creador desconocido'}</p>
                  {show.genre && <p style={{ fontSize: '0.7rem', color: '#999' }}>{show.genre}</p>}
                  {show.rating && <p style={{ fontSize: '0.7rem', color: '#ff6b35' }}>⭐ {show.rating.toFixed(1)}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Paginación - solo mostrar si no estamos buscando */}
          {!isSearching && series.length > 0 && (
            <div className="pagination-container">
              <button 
                className="pagination-btn" 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
              >
                <ChevronLeft size={20} />
              </button>
              <span className="pagination-info">
                Página {currentPage}
              </span>
              <button 
                className="pagination-btn" 
                onClick={handleNextPage}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal de detalle */}
      {selectedSeries && (
        <div className="modal-overlay" onClick={() => setSelectedSeries(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedSeries(null)}>
              <X size={24} />
            </button>
            <div className="modal-body">
              <img
                src={selectedSeries.posterUrl || 'https://via.placeholder.com/150x220?text=Sin+portada'}
                alt={selectedSeries.title}
                className="modal-img"
              />
              <div className="modal-details">
                <h2>{selectedSeries.title}</h2>
                <p className="modal-author">Creada por {selectedSeries.creator || 'Creador desconocido'}</p>
                {selectedSeries.genre && (
                  <p style={{ fontSize: '0.8rem', color: '#ff6b35', marginBottom: '0.5rem' }}>
                    {selectedSeries.genre}
                  </p>
                )}
                {selectedSeries.rating && (
                  <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.5rem' }}>
                    ⭐ Calificación: {selectedSeries.rating.toFixed(1)}/10
                  </p>
                )}
                {selectedSeries.numberOfSeasons && (
                  <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.5rem' }}>
                    Temporadas: {selectedSeries.numberOfSeasons}
                  </p>
                )}
                {selectedSeries.numberOfEpisodes && (
                  <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.5rem' }}>
                    Episodios: {selectedSeries.numberOfEpisodes}
                  </p>
                )}
                {selectedSeries.firstAirDate && (
                  <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.5rem' }}>
                    Estreno: {new Date(selectedSeries.firstAirDate).toLocaleDateString('es-ES')}
                  </p>
                )}
                {selectedSeries.status && (
                  <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.5rem' }}>
                    Estado: {selectedSeries.status}
                  </p>
                )}
                <div className="modal-section">
                  <h3 className="modal-label">Sinopsis</h3>
                  <p className="modal-text">{selectedSeries.plot || 'Sin sinopsis disponible'}</p>
                </div>
                <button className="add-to-library-btn" onClick={() => handleAddToWatchlist(selectedSeries.id)}>
                  Añadir a mi lista
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
