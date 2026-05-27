import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye, ArrowLeft, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { getPopularSeries, searchSeries, getSeriesDetails, getSeriesByGenre } from '../../services/series-service';
import { useSettings } from '../../context/SettingsContext';
import { useMedia } from '../../context/MediaContext';
import { getT } from '../../i18n';
import './Series.css';

// Géneros de series de TMDB
const TV_GENRES = [
  { id: 10759, name: 'Acción & Aventura' },
  { id: 16, name: 'Animación' },
  { id: 35, name: 'Comedia' },
  { id: 80, name: 'Crimen' },
  { id: 99, name: 'Documental' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Familia' },
  { id: 10762, name: 'Infantil' },
  { id: 9648, name: 'Misterio' },
  { id: 10763, name: 'Noticias' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Ciencia Ficción & Fantasía' },
  { id: 10766, name: 'Telenovela' },
  { id: 10767, name: 'Talk' },
  { id: 10768, name: 'Guerra & Política' },
  { id: 37, name: 'Western' }
];

export default function Series() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { isSeriesFavorite, toggleSeriesFavorite, isSeriesWatched, toggleSeriesWatched } = useMedia();
  const t = getT(settings.language);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);

  // Cargar series populares, por búsqueda o por género
  useEffect(() => {
    let isMounted = true;
    
    const loadSeries = async () => {
      try {
        if (isMounted) setLoading(true);
        
        let data;
        if (isSearching && searchTerm) {
          // Si estamos buscando, usar el endpoint de búsqueda
          console.log('Buscando series:', searchTerm);
          data = await searchSeries(searchTerm);
        } else if (selectedGenre) {
          // Si hay un género seleccionado, cargar series por género
          console.log('Cargando series por género:', selectedGenre);
          data = await getSeriesByGenre(selectedGenre, currentPage);
        } else {
          // Si no, cargar series populares
          console.log('Cargando series populares, página:', currentPage);
          data = await getPopularSeries(currentPage);
        }
        
        if (isMounted) {
          console.log('Series recibidas:', data?.length || 0, data);
          setSeries(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error cargando series:', error);
        if (isMounted) setSeries([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    loadSeries();
    
    return () => {
      isMounted = false;
    };
  }, [currentPage, isSearching, searchTerm, selectedGenre]);

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

  const handleGenreFilter = (genreId) => {
    if (selectedGenre === genreId) {
      // Si hace clic en el mismo género, deseleccionar
      setSelectedGenre(null);
    } else {
      // Seleccionar nuevo género
      setSelectedGenre(genreId);
    }
    setCurrentPage(1);
    setSearchTerm('');
    setIsSearching(false);
  };

  const handleSeriesClick = async (show) => {
    // Obtener detalles completos de la serie
    setLoadingDetails(true);
    try {
      const details = await getSeriesDetails(show.tmdbId);
      setSelectedSeries(details);
    } catch (error) {
      console.error('Error fetching series details:', error);
      setSelectedSeries(show);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggleFavorite = (e, series) => {
    e.stopPropagation();
    toggleSeriesFavorite(series);
    // TODO: Llamar a API para guardar/eliminar de favoritos
  };

  const handleToggleWatched = (e, series) => {
    e.stopPropagation();
    toggleSeriesWatched(series);
    // TODO: Llamar a API para marcar como visto/no visto
  };

  const handleAddToWatchlist = async (seriesId) => {
    // TODO: Implementar agregar a lista de visualización
    setSelectedSeries(null);
  };

  return (
    <div className="reco-container">
      <header className="reco-header">
        <div className="reco-title-row">
          <button className="back-btn" onClick={() => navigate('/inicio')}>
            <ArrowLeft size={20} />
          </button>
          <h1>{t.series?.title || 'Series'}</h1>
        </div>
        <p>{t.series?.subtitle || 'Descubre y sigue tus series favoritas'}</p>
      </header>

      {/* Buscador */}
      <div className="search-container">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Buscar por título o director"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      {/* Filtros por género */}
      <div className="genre-filters">
        {TV_GENRES.map((genre) => (
          <button
            key={genre.id}
            className={`genre-btn ${selectedGenre === genre.id ? 'active' : ''}`}
            onClick={() => handleGenreFilter(genre.id)}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>{t.common?.loading || 'Cargando series...'}</p>
      ) : series.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>{t.series?.noSeries || 'No hay series disponibles'}</p>
      ) : (
        <>
          <div className="series-grid">
            {series.map((show, i) => (
              <div key={show.tmdbId || show.id || i} className="series-card" onClick={() => handleSeriesClick(show)}>
                <div className="series-img-wrapper">
                  <img
                    src={show.posterUrl || 'https://via.placeholder.com/150x220?text=Sin+portada'}
                    alt={show.title}
                  />
                  <div className="series-hover-actions">
                    <button 
                      className="series-icon-btn" 
                      onClick={(e) => handleToggleFavorite(e, show)}
                      title="Agregar a favoritos"
                    >
                      <Heart size={18} fill={isSeriesFavorite(show.tmdbId) ? '#ff6b35' : 'none'} color="#ff6b35" />
                    </button>
                    <button 
                      className="series-icon-btn" 
                      onClick={(e) => handleToggleWatched(e, show)}
                      title="Marcar como visto"
                    >
                      <Eye size={18} fill={isSeriesWatched(show.tmdbId) ? '#ff6b35' : 'none'} color="#ff6b35" />
                    </button>
                  </div>
                </div>
                <div className="series-info">
                  <h4>{show.title}</h4>
                  <p>{show.creator || 'Creador desconocido'}</p>
                  {show.genre && <p style={{ fontSize: '0.7rem', color: '#999' }}>{show.genre}</p>}
                  {show.rating && <p style={{ fontSize: '0.9rem', color: '#ff6b35' }}>⭐ {show.rating.toFixed(1)}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Paginación - solo mostrar si no estamos buscando ni filtrando por género */}
          {!isSearching && !selectedGenre && series.length > 0 && (
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

          {/* Paginación - mostrar si hay filtro de género */}
          {selectedGenre && series.length > 0 && (
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
            {loadingDetails ? (
              <p style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>Cargando detalles...</p>
            ) : (
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
