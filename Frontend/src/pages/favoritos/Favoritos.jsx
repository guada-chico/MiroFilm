import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, Film, Tv, Bookmark, Eye, Trophy } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { getT } from '../../i18n';
import './Favoritos.css';

export default function Favoritos() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const t = getT(settings.language);
  
  const [stats, setStats] = useState({
    moviesWatchedThisYear: 0,
    seriesWatchedThisYear: 0
  });

  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [favoriteSeries, setFavoriteSeries] = useState([]);
  const [savedMovies, setSavedMovies] = useState([]);
  const [savedSeries, setSavedSeries] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [watchedSeries, setWatchedSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Cargar datos del usuario
    // - Películas favoritas
    // - Series favoritas
    // - Películas guardadas
    // - Series guardadas
    // - Películas vistas
    // - Series vistas
    // - Contadores de películas/series vistas este año
    setLoading(false);
  }, []);

  const renderMovieSection = (title, movies, icon) => {
    if (movies.length === 0) return null;

    return (
      <section className="favoritos-section">
        <div className="section-head">
          <h3>
            {icon && <icon size={20} style={{ marginRight: '0.5rem' }} />}
            {title}
          </h3>
          <span className="section-count">{movies.length}</span>
        </div>
        <div className="favoritos-grid">
          {movies.map((movie) => (
            <div key={movie.id} className="favorito-card">
              <img
                src={movie.posterUrl || 'https://via.placeholder.com/150x220?text=Sin+portada'}
                alt={movie.title}
              />
              <div className="favorito-info">
                <h4>{movie.title}</h4>
                <p>{movie.director || 'Director desconocido'}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderSeriesSection = (title, series, icon) => {
    if (series.length === 0) return null;

    return (
      <section className="favoritos-section">
        <div className="section-head">
          <h3>
            {icon && <icon size={20} style={{ marginRight: '0.5rem' }} />}
            {title}
          </h3>
          <span className="section-count">{series.length}</span>
        </div>
        <div className="favoritos-grid">
          {series.map((show) => (
            <div key={show.id} className="favorito-card">
              <img
                src={show.posterUrl || 'https://via.placeholder.com/150x220?text=Sin+portada'}
                alt={show.title}
              />
              <div className="favorito-info">
                <h4>{show.title}</h4>
                <p>{show.creator || 'Creador desconocido'}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="favoritos-container">
      <header className="reco-header">
        <div className="reco-title-row">
          <button className="back-btn" onClick={() => navigate('/inicio')}>
            <ArrowLeft size={20} />
          </button>
          <h1>Mis Favoritos</h1>
        </div>
        <p>Tus películas y series favoritas, guardadas y vistas</p>
      </header>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#aaa', padding: '2rem' }}>Cargando favoritos...</p>
      ) : (
        <>
          {/* ESTADÍSTICAS */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-circle">
                <Film color="#ff6b35" size={24} />
              </div>
              <div className="stat-info">
                <h3>Películas 2026</h3>
                <p className="big-number">{stats.moviesWatchedThisYear}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-circle">
                <Tv color="#ff6b35" size={24} />
              </div>
              <div className="stat-info">
                <h3>Series 2026</h3>
                <p className="big-number">{stats.seriesWatchedThisYear}</p>
              </div>
            </div>
          </div>

          {/* PELÍCULAS FAVORITAS */}
          {renderMovieSection('Películas Favoritas', favoriteMovies, Film)}

          {/* SERIES FAVORITAS */}
          {renderSeriesSection('Series Favoritas', favoriteSeries, Tv)}

          {/* PELÍCULAS GUARDADAS */}
          {renderMovieSection('Películas Guardadas', savedMovies, Bookmark)}

          {/* SERIES GUARDADAS */}
          {renderSeriesSection('Series Guardadas', savedSeries, Bookmark)}

          {/* PELÍCULAS VISTAS */}
          {renderMovieSection('Películas Vistas', watchedMovies, Eye)}

          {/* SERIES VISTAS */}
          {renderSeriesSection('Series Vistas', watchedSeries, Eye)}

          {/* MENSAJE CUANDO NO HAY NADA */}
          {favoriteMovies.length === 0 &&
            favoriteSeries.length === 0 &&
            savedMovies.length === 0 &&
            savedSeries.length === 0 &&
            watchedMovies.length === 0 &&
            watchedSeries.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>
                <Heart size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>No tienes favoritos aún</p>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Agrega películas o series a tus favoritos para verlos aquí
                </p>
              </div>
            )}
        </>
      )}
    </div>
  );
}
