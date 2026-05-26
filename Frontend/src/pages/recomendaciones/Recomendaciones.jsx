import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, BookmarkPlus, ArrowLeft, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getMyRecommendations } from '../../services/recommendations-service';
import { useSettings } from '../../context/SettingsContext';
import { getT } from '../../i18n';
import './Recomendaciones.css';

export default function Recomendaciones() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const t = getT(settings.language);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const MOVIES_PER_PAGE = 20;

  useEffect(() => {
    setLoading(true);
    setMovies([]);
    getMyRecommendations()
      .then((data) => setMovies(data ?? []))
      .catch((error) => {
        console.error('Error fetching recommendations:', error);
        setMovies([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(movies.length / MOVIES_PER_PAGE);
  const startIndex = (currentPage - 1) * MOVIES_PER_PAGE;
  const endIndex = startIndex + MOVIES_PER_PAGE;
  const currentMovies = movies.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleAddToWatchlist = async (movieId) => {
    // TODO: Implementar agregar a lista de visualización
    setSelectedMovie(null);
  };

  return (
    <div className="reco-container">
      <header className="reco-header">
        <div className="reco-title-row">
          <button className="back-btn" onClick={() => navigate('/inicio')}>
            <ArrowLeft size={20} />
          </button>
          <h1>Recomendaciones de Películas</h1>
        </div>
        <p>Películas recomendadas basadas en tus favoritos</p>
      </header>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>Cargando películas...</p>
      ) : movies.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>No hay recomendaciones disponibles</p>
      ) : (
        <>
          <div className="reco-grid">
            {currentMovies.map((movie, i) => (
              <div key={movie.tmdbId || movie.id || i} className="reco-card" onClick={() => setSelectedMovie(movie)}>
                <div className="reco-img-wrapper">
                  <img
                    src={movie.posterUrl || 'https://via.placeholder.com/150x220?text=Sin+portada'}
                    alt={movie.title}
                  />
                  <div className="reco-hover-actions">
                    <button className="reco-icon-btn" onClick={(e) => { e.stopPropagation(); }}>
                      <Heart size={18} />
                    </button>
                    <button className="reco-icon-btn" onClick={(e) => { e.stopPropagation(); handleAddToWatchlist(movie.id); }}>
                      <BookmarkPlus size={18} />
                    </button>
                  </div>
                </div>
                <div className="reco-info">
                  <h4>{movie.title}</h4>
                  <p>{movie.director || 'Director desconocido'}</p>
                  {movie.genre && <p style={{ fontSize: '0.7rem', color: '#999' }}>{movie.genre}</p>}
                  {movie.rating && <p style={{ fontSize: '0.7rem', color: '#ff6b35' }}>⭐ {movie.rating.toFixed(1)}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <button 
                className="pagination-btn" 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
              >
                <ChevronLeft size={20} />
              </button>
              <span className="pagination-info">
                Página {currentPage} de {totalPages}
              </span>
              <button 
                className="pagination-btn" 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal de detalle */}
      {selectedMovie && (
        <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedMovie(null)}>
              <X size={24} />
            </button>
            <div className="modal-body">
              <img
                src={selectedMovie.posterUrl || 'https://via.placeholder.com/150x220?text=Sin+portada'}
                alt={selectedMovie.title}
                className="modal-img"
              />
              <div className="modal-details">
                <h2>{selectedMovie.title}</h2>
                <p className="modal-author">Dirigida por {selectedMovie.director || 'Director desconocido'}</p>
                {selectedMovie.genre && (
                  <p style={{ fontSize: '0.8rem', color: '#ff6b35', marginBottom: '0.5rem' }}>
                    {selectedMovie.genre}
                  </p>
                )}
                {selectedMovie.rating && (
                  <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.5rem' }}>
                    ⭐ Calificación: {selectedMovie.rating.toFixed(1)}/10
                  </p>
                )}
                {selectedMovie.releaseDate && (
                  <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.5rem' }}>
                    Estreno: {new Date(selectedMovie.releaseDate).toLocaleDateString('es-ES')}
                  </p>
                )}
                <div className="modal-section">
                  <h3 className="modal-label">Sinopsis</h3>
                  <p className="modal-text">{selectedMovie.plot || 'Sin sinopsis disponible'}</p>
                </div>
                <button className="add-to-library-btn" onClick={() => handleAddToWatchlist(selectedMovie.id)}>
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
