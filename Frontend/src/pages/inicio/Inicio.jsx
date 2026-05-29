import { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMyRecommendations, getPopularMovies } from '../../services/recommendations-service';
import { getMySeriesRecommendations, getPopularSeries } from '../../services/series-service';
import { useSettings } from '../../context/SettingsContext';
import { useUser } from '../../context/UserContext';
import { getT } from '../../i18n';
import { X, Heart, Eye } from 'lucide-react';
import { useMedia } from '../../context/MediaContext';
import './Inicio.css';

export default function Inicio() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { user } = useUser();
  const { isMovieFavorite, toggleMovieFavorite, isMovieWatched, toggleMovieWatched, isSeriesFavorite, toggleSeriesFavorite, isSeriesWatched, toggleSeriesWatched } = useMedia();
  const t = getT(settings.language).common;
  const [recommendations, setRecommendations] = useState([]);
  const [loadingReco, setLoadingReco] = useState(true);
  const [movieRecommendations, setMovieRecommendations] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [seriesRecommendations, setSeriesRecommendations] = useState([]);
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState(null);

  // Recomendaciones PRH, películas y series al montar
  useEffect(() => {
    const loadMovies = async () => {
      try {
        const data = await getMyRecommendations();
        
        // Asegurar que es un array
        let moviesArray = Array.isArray(data) ? data : (data?.data ? data.data : []);
        
        // Si no hay recomendaciones, cargar películas populares
        if (moviesArray.length === 0) {
          console.log('No hay recomendaciones, cargando películas populares...');
          try {
            const popularData = await getPopularMovies(1);
            moviesArray = Array.isArray(popularData) ? popularData : (popularData?.data ? popularData.data : []);
            console.log('Películas populares cargadas:', moviesArray.length);
          } catch (popErr) {
            console.error('Error cargando películas populares:', popErr);
          }
        }
        
        setMovieRecommendations(moviesArray);
      } catch (err) {
        console.error('Error cargando películas recomendadas:', err);
        // Intentar cargar películas populares como fallback
        try {
          const popularData = await getPopularMovies(1);
          const moviesArray = Array.isArray(popularData) ? popularData : (popularData?.data ? popularData.data : []);
          setMovieRecommendations(moviesArray);
        } catch (popErr) {
          console.error('Error cargando películas populares como fallback:', popErr);
          setMovieRecommendations([]);
        }
      } finally {
        setLoadingMovies(false);
      }
    };

    const loadSeries = async () => {
      try {
        const data = await getMySeriesRecommendations();
        console.log('Datos de series recomendadas recibidos:', data);
        
        // Asegurar que es un array
        let seriesArray = Array.isArray(data) ? data : (data?.data ? data.data : []);
        console.log('Series array después de procesar:', seriesArray);
        
        // Si no hay recomendaciones, cargar series populares
        if (seriesArray.length === 0) {
          console.log('No hay recomendaciones, cargando series populares...');
          try {
            const popularData = await getPopularSeries(1);
            console.log('Series populares recibidas:', popularData);
            seriesArray = Array.isArray(popularData) ? popularData : (popularData?.data ? popularData.data : []);
            console.log('Series populares cargadas:', seriesArray.length);
          } catch (popErr) {
            console.error('Error cargando series populares:', popErr);
          }
        }
        
        console.log('Series finales a mostrar:', seriesArray);
        setSeriesRecommendations(seriesArray);
      } catch (err) {
        console.error('Error cargando series recomendadas:', err);
        // Intentar cargar series populares como fallback
        try {
          const popularData = await getPopularSeries(1);
          const seriesArray = Array.isArray(popularData) ? popularData : (popularData?.data ? popularData.data : []);
          setSeriesRecommendations(seriesArray);
        } catch (popErr) {
          console.error('Error cargando series populares como fallback:', popErr);
          setSeriesRecommendations([]);
        }
      } finally {
        setLoadingSeries(false);
      }
    };

    loadMovies();
    loadSeries();
  }, []);

  // Recargar recomendaciones cuando el usuario vuelve a la página de inicio
  useEffect(() => {
    const handleFocus = () => {
      console.log('Página de Inicio enfocada, recargando recomendaciones...');
      const loadMovies = async () => {
        setLoadingMovies(true);
        try {
          const data = await getMyRecommendations();
          console.log('Nuevas recomendaciones recibidas:', data?.length || 0);
          
          // Asegurar que es un array
          let moviesArray = Array.isArray(data) ? data : (data?.data ? data.data : []);
          
          // Si no hay recomendaciones, cargar películas populares
          if (moviesArray.length === 0) {
            console.log('No hay recomendaciones, cargando películas populares...');
            try {
              const popularData = await getPopularMovies(1);
              moviesArray = Array.isArray(popularData) ? popularData : (popularData?.data ? popularData.data : []);
              console.log('Películas populares cargadas:', moviesArray.length);
            } catch (popErr) {
              console.error('Error cargando películas populares:', popErr);
            }
          }
          
          console.log('Películas a mostrar:', moviesArray.length);
          setMovieRecommendations(moviesArray);
        } catch (err) {
          console.error('Error cargando películas recomendadas:', err);
          // Intentar cargar películas populares como fallback
          try {
            const popularData = await getPopularMovies(1);
            const moviesArray = Array.isArray(popularData) ? popularData : (popularData?.data ? popularData.data : []);
            setMovieRecommendations(moviesArray);
          } catch (popErr) {
            console.error('Error cargando películas populares como fallback:', popErr);
            setMovieRecommendations([]);
          }
        } finally {
          setLoadingMovies(false);
        }
      };

      const loadSeries = async () => {
        setLoadingSeries(true);
        try {
          const data = await getMySeriesRecommendations();
          console.log('Nuevas recomendaciones de series recibidas:', data);
          
          // Asegurar que es un array
          let seriesArray = Array.isArray(data) ? data : (data?.data ? data.data : []);
          
          // Si no hay recomendaciones, cargar series populares
          if (seriesArray.length === 0) {
            console.log('No hay recomendaciones, cargando series populares...');
            try {
              const popularData = await getPopularSeries(1);
              console.log('Series populares recibidas:', popularData);
              seriesArray = Array.isArray(popularData) ? popularData : (popularData?.data ? popularData.data : []);
              console.log('Series populares cargadas:', seriesArray.length);
            } catch (popErr) {
              console.error('Error cargando series populares:', popErr);
            }
          }
          
          console.log('Series a mostrar:', seriesArray.length);
          setSeriesRecommendations(seriesArray);
        } catch (err) {
          console.error('Error cargando series recomendadas:', err);
          // Intentar cargar series populares como fallback
          try {
            const popularData = await getPopularSeries(1);
            const seriesArray = Array.isArray(popularData) ? popularData : (popularData?.data ? popularData.data : []);
            setSeriesRecommendations(seriesArray);
          } catch (popErr) {
            console.error('Error cargando series populares como fallback:', popErr);
            setSeriesRecommendations([]);
          }
        } finally {
          setLoadingSeries(false);
        }
      };

      loadMovies();
      loadSeries();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  return (
    <div className="inicio-content">
      <h1>Bienvenido/a {user.name}</h1>
      
      {/* BOTONES DE NAVEGACIÓN */}
      <div className="nav-buttons">
        <button className="nav-btn" onClick={() => navigate('/peliculas')}>Películas</button>
        <button className="nav-btn" onClick={() => navigate('/series')}>Series</button>
        <button className="nav-btn" onClick={() => navigate('/favoritos')}>Favoritos</button>
        <button className="nav-btn" onClick={() => navigate('/amigos')}>Amigos</button>
      </div>

      {/* SECCIÓN: PELÍCULAS RECOMENDADAS */}
      <section className="movies-section">
        <div className="section-head">
          <h3>Películas Recomendadas</h3>
          <span
            className="orange-link"
            onClick={() => navigate('/peliculas')}
            style={{ cursor: 'pointer' }}
          >
            {t.viewAll} &gt;
          </span>
        </div>

        {loadingMovies ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '0.5rem' }}>
            <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#aaa', fontSize: '0.9rem' }}>{t.loading}</p>
          </div>
        ) : movieRecommendations.length > 0 ? (
          <div className="movies-grid">
            {movieRecommendations.slice(0, 5).map((movie, i) => (
              <div
                key={movie.id || movie.tmdbId || i}
                className="series-card-wrapper"
                onClick={() => setSelectedMovie(movie)}
                title={`${movie.title} — ${movie.releaseDate}`}
              >
                <div className="series-img-wrapper">
                  {movie.posterUrl || movie.posterPath || movie.imageUrl ? (
                    <img 
                      src={movie.posterUrl || (movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : movie.imageUrl)} 
                      alt={movie.title}
                      onError={(e) => {
                        console.error('Error cargando imagen:', movie.posterUrl);
                        e.target.src = 'https://via.placeholder.com/150x220?text=Sin+portada';
                      }}
                    />
                  ) : (
                    <div style={{ width: '100%', aspectRatio: '2/3', padding: '0.5rem', fontSize: '0.75rem', textAlign: 'center', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', borderRadius: '20px' }}>
                      {movie.title}
                    </div>
                  )}
                  <div className="series-hover-actions">
                    <button 
                      className="series-icon-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMovieFavorite(movie);
                      }}
                      title="Agregar a favoritos"
                    >
                      <Heart size={18} fill={isMovieFavorite(movie.tmdbId) ? '#ff6b35' : 'none'} color="#ff6b35" />
                    </button>
                    <button 
                      className="series-icon-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMovieWatched(movie);
                      }}
                      title="Marcar como visto"
                    >
                      <Eye size={18} fill={isMovieWatched(movie.tmdbId) ? '#ff6b35' : 'none'} color="#ff6b35" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#aaa', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>No se encontraron películas recomendadas. Agrega películas a favoritos para obtener recommendations personalizadas.</p>
        )}
      </section>

      {/* SECCIÓN: SERIES RECOMENDADAS - AHORA COMPARTE LA CLASE movies-grid */}
      <section className="series-section">
        <div className="section-head">
          <h3>Series Recomendadas</h3>
          <span
            className="orange-link"
            onClick={() => navigate('/series')}
            style={{ cursor: 'pointer' }}
          >
            {t.viewAll} &gt;
          </span>
        </div>

        {loadingSeries ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '0.5rem' }}>
            <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#aaa', fontSize: '0.9rem' }}>{t.loading}</p>
          </div>
        ) : seriesRecommendations.length > 0 ? (
          <div className="movies-grid">
            {seriesRecommendations.slice(0, 5).map((show, i) => (
              <div
                key={show.id || show.tmdbId || i}
                className="series-card-wrapper"
                onClick={() => setSelectedSeries(show)}
                title={`${show.title} — ${show.firstAirDate}`}
              >
                <div className="series-img-wrapper">
                  {show.posterUrl || show.posterPath || show.imageUrl ? (
                    <img 
                      src={show.posterUrl || (show.posterPath ? `https://image.tmdb.org/t/p/w500${show.posterPath}` : show.imageUrl)} 
                      alt={show.title}
                      onError={(e) => {
                        console.error('Error cargando imagen:', show.posterUrl);
                        e.target.src = 'https://via.placeholder.com/150x220?text=Sin+portada';
                      }}
                    />
                  ) : (
                    <div style={{ width: '100%', aspectRatio: '2/3', padding: '0.5rem', fontSize: '0.75rem', textAlign: 'center', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', borderRadius: '20px' }}>
                      {show.title}
                    </div>
                  )}
                  <div className="series-hover-actions">
                    <button 
                      className="series-icon-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSeriesFavorite(show);
                      }}
                      title="Agregar a favoritos"
                    >
                      <Heart size={18} fill={isSeriesFavorite(show.tmdbId) ? '#ff6b35' : 'none'} color="#ff6b35" />
                    </button>
                    <button 
                      className="series-icon-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSeriesWatched(show);
                      }}
                      title="Marcar como visto"
                    >
                      <Eye size={18} fill={isSeriesWatched(show.tmdbId) ? '#ff6b35' : 'none'} color="#ff6b35" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#aaa', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>No se encontraron series recomendadas. Agrega series a favoritos para obtener recomendaciones personalizadas.</p>
        )}
      </section>



      {/* Modal de detalle de película */}
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
                <div className="modal-scrollable">
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
                </div>
                <div className="modal-actions">
                  <button 
                    className="modal-action-btn" 
                    onClick={() => toggleMovieFavorite(selectedMovie)}
                    title="Agregar a favoritos"
                  >
                    <Heart size={18} fill={isMovieFavorite(selectedMovie.tmdbId) ? '#ff6b35' : 'none'} color="#ff6b35" />
                  </button>
                  <button 
                    className="modal-action-btn" 
                    onClick={() => toggleMovieWatched(selectedMovie)}
                    title="Marcar como visto"
                  >
                    <Eye size={18} fill={isMovieWatched(selectedMovie.tmdbId) ? '#ff6b35' : 'none'} color="#ff6b35" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalle de serie */}
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
                <div className="modal-scrollable">
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
                </div>
                <div className="modal-actions">
                  <button 
                    className="modal-action-btn" 
                    onClick={() => toggleSeriesFavorite(selectedSeries)}
                    title="Agregar a favoritos"
                  >
                    <Heart size={18} fill={isSeriesFavorite(selectedSeries.tmdbId) ? '#ff6b35' : 'none'} color="#ff6b35" />
                  </button>
                  <button 
                    className="modal-action-btn" 
                    onClick={() => toggleSeriesWatched(selectedSeries)}
                    title="Marcar como visto"
                  >
                    <Eye size={18} fill={isSeriesWatched(selectedSeries.tmdbId) ? '#ff6b35' : 'none'} color="#ff6b35" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}