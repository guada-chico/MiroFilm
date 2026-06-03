import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, Film, Tv, X, Trash2 } from 'lucide-react';
import { useMedia } from '../../context/MediaContext';
import './Favoritos.css';

export default function Favoritos() {
  const navigate = useNavigate();
  const { favoriteMovies, favoriteSeries, watchedMovies, watchedSeries, toggleMovieFavorite, toggleSeriesFavorite } = useMedia();

  const [selectedItem, setSelectedItem] = useState(null);

  // Filtrar favoritos que no están vistas
  const unwatchedFavoriteMovies = favoriteMovies.filter(
    movie => !watchedMovies.find(watched => watched.tmdbId === movie.tmdbId)
  );

  const unwatchedFavoriteSeries = favoriteSeries.filter(
    series => !watchedSeries.find(watched => watched.tmdbId === series.tmdbId)
  );

  const renderMovieSection = (title, movies, IconComponent) => {
    if (movies.length === 0) return null;

    return (
      <section className="favoritos-section">
        <div className="section-head">
          <h3>
            {IconComponent && <IconComponent size={20} style={{ marginRight: '0.5rem', display: 'inline' }} />}
            {title}
          </h3>
          <span className="section-count">{movies.length}</span>
        </div>
        <div className="favoritos-list">
          {movies.map((movie) => (
            <div 
              key={movie.tmdbId} 
              className="favorito-item"
              onClick={() => setSelectedItem({ ...movie, type: 'movie' })}
            >
              <img
                src={movie.posterUrl || 'https://via.placeholder.com/80x120?text=Sin+portada'}
                alt={movie.title}
                className="favorito-poster"
              />
              <div className="favorito-details">
                <h4>{movie.title}</h4>
                <p>{movie.director || 'Director desconocido'}</p>
              </div>
              <button
                className="favorito-delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMovieFavorite(movie);
                }}
                title="Eliminar de favoritos"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderSeriesSection = (title, series, IconComponent) => {
    if (series.length === 0) return null;

    return (
      <section className="favoritos-section">
        <div className="section-head">
          <h3>
            {IconComponent && <IconComponent size={20} style={{ marginRight: '0.5rem', display: 'inline' }} />}
            {title}
          </h3>
          <span className="section-count">{series.length}</span>
        </div>
        <div className="favoritos-list">
          {series.map((show) => (
            <div 
              key={show.tmdbId} 
              className="favorito-item"
              onClick={() => setSelectedItem({ ...show, type: 'series' })}
            >
              <img
                src={show.posterUrl || 'https://via.placeholder.com/80x120?text=Sin+portada'}
                alt={show.title}
                className="favorito-poster"
              />
              <div className="favorito-details">
                <h4>{show.title}</h4>
                <p>{show.creator || 'Creador desconocido'}</p>
              </div>
              <button
                className="favorito-delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSeriesFavorite(show);
                }}
                title="Eliminar de favoritos"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const totalFavorites = unwatchedFavoriteMovies.length + unwatchedFavoriteSeries.length;

  return (
    <div className="favoritos-container">
      <header className="reco-header">
        <div className="reco-title-row">
          <button className="back-btn" onClick={() => navigate('/inicio')}>
            <ArrowLeft size={20} />
          </button>
          <h1>Mis Favoritos</h1>
        </div>
        <p>Tus películas y series favoritas</p>
      </header>

      {/* PELÍCULAS Y SERIES FAVORITAS EN 2 COLUMNAS */}
      <div className="favoritos-two-columns">
        <div className="column">
          {renderMovieSection('Películas Favoritas', unwatchedFavoriteMovies, Film)}
        </div>
        <div className="column">
          {renderSeriesSection('Series Favoritas', unwatchedFavoriteSeries, Tv)}
        </div>
      </div>

      {/* MENSAJE CUANDO NO HAY NADA */}
      {totalFavorites === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>
          <Heart size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>No tienes favoritos aún</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Agrega películas o series a tus favoritos para verlos aquí
          </p>
        </div>
      )}

      {/* MODAL DE DETALLES */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedItem(null)}>
              <X size={24} />
            </button>
            <div className="modal-body">
              <img
                src={selectedItem.posterUrl || 'https://via.placeholder.com/150x220?text=Sin+portada'}
                alt={selectedItem.title}
                className="modal-img"
              />
              <div className="modal-details">
                <h2>{selectedItem.title}</h2>
                <p className="modal-author">
                  {selectedItem.type === 'movie' 
                    ? `Dirigida por ${selectedItem.director || 'Director desconocido'}`
                    : `Creada por ${selectedItem.creator || 'Creador desconocido'}`
                  }
                </p>
                {selectedItem.genre && (
                  <p style={{ fontSize: '0.8rem', color: '#ff6b35', marginBottom: '0.5rem' }}>
                    {selectedItem.genre}
                  </p>
                )}
                {selectedItem.rating && (
                  <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.5rem' }}>
                    ⭐ Calificación: {selectedItem.rating.toFixed(1)}/10
                  </p>
                )}
                <div className="modal-section">
                  <h3 className="modal-label">Sinopsis</h3>
                  <p className="modal-text">{selectedItem.plot || 'Sin sinopsis disponible'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
