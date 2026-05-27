import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye, ArrowLeft, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { getPopularMovies, searchMovies, getMovieDetails, getMoviesByGenre } from '../../services/recommendations-service';
import { useSettings } from '../../context/SettingsContext';
import { useMedia } from '../../context/MediaContext';
import { getT } from '../../i18n';
import './Peliculas.css';

// Géneros de películas de TMDB
const MOVIE_GENRES = [
  { id: 28, name: 'Acción' },
  { id: 12, name: 'Aventura' },
  { id: 16, name: 'Animación' },
  { id: 35, name: 'Comedia' },
  { id: 80, name: 'Crimen' },
  { id: 99, name: 'Documental' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Familia' },
  { id: 14, name: 'Fantasía' },
  { id: 36, name: 'Historia' },
  { id: 27, name: 'Terror' },
  { id: 10402, name: 'Música' },
  { id: 9648, name: 'Misterio' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Ciencia Ficción' },
  { id: 10770, name: 'Película de TV' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'Guerra' },
  { id: 37, name: 'Western' }
];

export default function Peliculas() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { isMovieFavorite, toggleMovieFavorite, isMovieWatched, toggleMovieWatched } = useMedia();
  const t = getT(settings.language);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);

  // Cargar películas populares, por búsqueda o por género
  useEffect(() => {
    let isMounted = true;
    
    const loadMovies = async () => {
      try {
        if (isMounted) setLoading(true);
        
        let data;
        if (isSearching && searchTerm) {
          // Si estamos buscando, usar el endpoint de búsqueda
          console.log('Buscando películas:', searchTerm);
          data = await searchMovies(searchTerm);
        } else if (selectedGenre) {
          // Si hay un género seleccionado, cargar películas por género
          console.log('Cargando películas por género:', selectedGenre);
          data = await getMoviesByGenre(selectedGenre, currentPage);
        } else {
          // Si no, cargar películas populares
          console.log('Cargando películas populares, página:', currentPage);
          data = await getPopularMovies(currentPage);
        }
        
        if (isMounted) {
          console.log('Películas recibidas:', data?.length || 0, data);
          setMovies(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error cargando películas:', error);
        if (isMounted) setMovies([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    loadMovies();
    
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

  const handleMovieClick = async (movie) => {
    // Obtener detalles completos de la película
    setLoadingDetails(true);
    try {
      const details = await getMovieDetails(movie.tmdbId);
      setSelectedMovie(details);
    } catch (error) {
      console.error('Error fetching movie details:', error);
      setSelectedMovie(movie);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggleFavorite = async (e, movie) => {
    e.stopPropagation();
    // Obtener detalles completos antes de agregar a favoritos
    try {
      const details = await getMovieDetails(movie.tmdbId);
      await toggleMovieFavorite(details || movie);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleToggleWatched = async (e, movie) => {
    e.stopPropagation();
    // Obtener detalles completos antes de marcar como visto
    try {
      const details = await getMovieDetails(movie.tmdbId);
      toggleMovieWatched(details || movie);
    } catch (error) {
      console.error('Error getting movie details:', error);
      toggleMovieWatched(movie);
    }
    // TODO: Llamar a API para marcar como visto/no visto
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
          <h1>Películas</h1>
        </div>
        <p>Películas populares de todo el mundo</p>
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
        {MOVIE_GENRES.map((genre) => (
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
        <p style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>Cargando películas...</p>
      ) : movies.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>No hay películas disponibles</p>
      ) : (
        <>
          <div className="reco-grid">
            {movies.map((movie, i) => (
              <div key={movie.tmdbId || movie.id || i} className="reco-card" onClick={() => handleMovieClick(movie)}>
                <div className="reco-img-wrapper">
                  <img
                    src={movie.posterUrl || 'https://via.placeholder.com/150x220?text=Sin+portada'}
                    alt={movie.title}
                  />
                  <div className="reco-hover-actions">
                    <button 
                      className="reco-icon-btn" 
                      onClick={(e) => handleToggleFavorite(e, movie)}
                      title="Agregar a favoritos"
                    >
                      <Heart size={18} fill={isMovieFavorite(movie.tmdbId) ? '#ff6b35' : 'none'} color="#ff6b35" />
                    </button>
                    <button 
                      className="reco-icon-btn" 
                      onClick={(e) => handleToggleWatched(e, movie)}
                      title="Marcar como visto"
                    >
                      <Eye size={18} fill={isMovieWatched(movie.tmdbId) ? '#ff6b35' : 'none'} color="#ff6b35" />
                    </button>
                  </div>
                </div>
                <div className="reco-info">
                  <h4>{movie.title}</h4>
                  <p>{movie.director || 'Director desconocido'}</p>
                  {movie.genre && <p style={{ fontSize: '0.7rem', color: '#999' }}>{movie.genre}</p>}
                  {movie.rating && <p style={{ fontSize: '0.9rem', color: '#ff6b35' }}>⭐ {movie.rating.toFixed(1)}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Paginación - solo mostrar si no estamos buscando ni filtrando por género */}
          {!isSearching && !selectedGenre && movies.length > 0 && (
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
          {selectedGenre && movies.length > 0 && (
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
      {selectedMovie && (
        <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedMovie(null)}>
              <X size={24} />
            </button>
            {loadingDetails ? (
              <p style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>Cargando detalles...</p>
            ) : (
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
                  {selectedMovie.duration && (
                    <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.5rem' }}>
                      Duración: {selectedMovie.duration} minutos
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
