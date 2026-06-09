import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMyFavorites, toggleMovieFavorite, toggleSeriesFavorite } from '../services/favorites-service';
import {
  getMyWatchingStatuses,
  setMovieStatus,
  setSeriesStatus,
  deleteMovieStatus,
  deleteSeriesStatus,
} from '../services/watching-status-service';
import { useUser } from './UserContext';

const MediaContext = createContext();

const ESTADOS = ['Pendiente', 'Viendo', 'Visto', 'Abandonado'];

const emptyByStatus = () =>
  ESTADOS.reduce((acc, s) => ({ ...acc, [s]: [] }), {});

export function MediaProvider({ children }) {
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [favoriteSeries, setFavoriteSeries] = useState([]);
  const [moviesByStatus, setMoviesByStatus] = useState(emptyByStatus());
  const [seriesByStatus, setSeriesByStatus] = useState(emptyByStatus());
  // Map tmdbId → status string para consultas rápidas
  const [movieStatusMap, setMovieStatusMap] = useState({});
  const [seriesStatusMap, setSeriesStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const loadAllMedia = useCallback(async () => {
    try {
      setLoading(true);

      // Favoritos
      const favorites = await getMyFavorites();
      setFavoriteMovies(favorites.filter(f => f.type === 'movie'));
      setFavoriteSeries(favorites.filter(f => f.type === 'series'));

      // Estados de visualización
      const statuses = await getMyWatchingStatuses();

      const moviesByStatusTemp = emptyByStatus();
      const seriesByStatusTemp = emptyByStatus();
      const movieStatusMapTemp = {};
      const seriesStatusMapTemp = {};

      statuses.forEach(ws => {
        // El status viene como string capitalizado: "Pendiente", "Viendo", etc.
        const statusKey = ws.status;
        if (!statusKey || !ESTADOS.includes(statusKey)) return; // ignorar estados desconocidos

        if (ws.movieId && ws.movie) {
          const item = { ...ws.movie, watchingStatusId: ws.id, watchingStatus: statusKey };
          if (moviesByStatusTemp[statusKey]) moviesByStatusTemp[statusKey].push(item);
          if (ws.movie.tmdbId) movieStatusMapTemp[ws.movie.tmdbId] = statusKey;
        } else if (ws.seriesId && ws.series) {
          const item = { ...ws.series, watchingStatusId: ws.id, watchingStatus: statusKey };
          if (seriesByStatusTemp[statusKey]) seriesByStatusTemp[statusKey].push(item);
          if (ws.series.tmdbId) seriesStatusMapTemp[ws.series.tmdbId] = statusKey;
        }
      });

      setMoviesByStatus(moviesByStatusTemp);
      setSeriesByStatus(seriesByStatusTemp);
      setMovieStatusMap(movieStatusMapTemp);
      setSeriesStatusMap(seriesStatusMapTemp);
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadAllMedia();
    } else {
      setFavoriteMovies([]);
      setFavoriteSeries([]);
      setMoviesByStatus(emptyByStatus());
      setSeriesByStatus(emptyByStatus());
      setMovieStatusMap({});
      setSeriesStatusMap({});
      setLoading(false);
    }
  }, [user?.id, loadAllMedia]);

  // ─── Favoritos ───────────────────────────────────────────────────────────

  const toggleMovieFavoriteLocal = async (movie) => {
    try {
      await toggleMovieFavorite(movie.tmdbId, {
        title: movie.title,
        director: movie.director,
        plot: movie.plot,
        posterUrl: movie.posterUrl,
        genre: movie.genre,
        rating: movie.rating,
        duration: movie.duration,
        releaseDate: movie.releaseDate,
        language: movie.language,
      });
      setFavoriteMovies(prev => {
        const exists = prev.find(m => m.tmdbId === movie.tmdbId);
        if (exists) return prev.filter(m => m.tmdbId !== movie.tmdbId);
        return [...prev, {
          tmdbId: movie.tmdbId, title: movie.title, posterUrl: movie.posterUrl,
          director: movie.director, genre: movie.genre, rating: movie.rating,
          plot: movie.plot, type: 'movie'
        }];
      });
    } catch (error) {
      console.error('Error toggling movie favorite:', error);
    }
  };

  const toggleSeriesFavoriteLocal = async (series) => {
    try {
      await toggleSeriesFavorite(series.tmdbId, {
        title: series.title,
        creator: series.creator,
        plot: series.plot,
        posterUrl: series.posterUrl,
        genre: series.genre,
        rating: series.rating,
        numberOfSeasons: series.numberOfSeasons,
        numberOfEpisodes: series.numberOfEpisodes,
        firstAirDate: series.firstAirDate,
        lastAirDate: series.lastAirDate,
        language: series.language,
        status: series.status,
      });
      setFavoriteSeries(prev => {
        const exists = prev.find(s => s.tmdbId === series.tmdbId);
        if (exists) return prev.filter(s => s.tmdbId !== series.tmdbId);
        return [...prev, {
          tmdbId: series.tmdbId, title: series.title, posterUrl: series.posterUrl,
          creator: series.creator, genre: series.genre, rating: series.rating,
          plot: series.plot, type: 'series'
        }];
      });
    } catch (error) {
      console.error('Error toggling series favorite:', error);
    }
  };

  // ─── Estado de visualización ─────────────────────────────────────────────

  /**
   * Establece o actualiza el estado de una película.
   * Si newStatus es null o vacío, elimina el estado.
   */
  const updateMovieWatchingStatus = async (movie, newStatus) => {
    try {
      if (!newStatus) {
        await deleteMovieStatus(movie.tmdbId);
        _removeMovieFromStatus(movie.tmdbId);
        return;
      }

      await setMovieStatus(movie.tmdbId, newStatus, {
        title: movie.title,
        director: movie.director,
        plot: movie.plot,
        posterUrl: movie.posterUrl,
        genre: movie.genre,
        rating: movie.rating,
        duration: movie.duration,
        releaseDate: movie.releaseDate,
        language: movie.language,
      });

      setMovieStatusMap(prev => ({ ...prev, [movie.tmdbId]: newStatus }));

      setMoviesByStatus(prev => {
        // Quitar el ítem de todos los buckets existentes
        const updated = {};
        ESTADOS.forEach(s => {
          updated[s] = (prev[s] || []).filter(m => m.tmdbId !== movie.tmdbId);
        });
        // Añadir al bucket nuevo
        updated[newStatus] = [
          ...updated[newStatus],
          { ...movie, watchingStatus: newStatus }
        ];
        return updated;
      });
    } catch (error) {
      console.error('Error updating movie status:', error);
      throw error;
    }
  };

  /**
   * Establece o actualiza el estado de una serie.
   * Si newStatus es null o vacío, elimina el estado.
   */
  const updateSeriesWatchingStatus = async (series, newStatus) => {
    try {
      if (!newStatus) {
        await deleteSeriesStatus(series.tmdbId);
        _removeSeriesFromStatus(series.tmdbId);
        return;
      }

      await setSeriesStatus(series.tmdbId, newStatus, {
        title: series.title,
        creator: series.creator,
        plot: series.plot,
        posterUrl: series.posterUrl,
        genre: series.genre,
        rating: series.rating,
        numberOfSeasons: series.numberOfSeasons,
        numberOfEpisodes: series.numberOfEpisodes,
        firstAirDate: series.firstAirDate,
        lastAirDate: series.lastAirDate,
        language: series.language,
        status: series.status,
      });

      setSeriesStatusMap(prev => ({ ...prev, [series.tmdbId]: newStatus }));

      setSeriesByStatus(prev => {
        // Quitar el ítem de todos los buckets existentes
        const updated = {};
        ESTADOS.forEach(s => {
          updated[s] = (prev[s] || []).filter(s2 => s2.tmdbId !== series.tmdbId);
        });
        // Añadir al bucket nuevo
        updated[newStatus] = [
          ...updated[newStatus],
          { ...series, watchingStatus: newStatus }
        ];
        return updated;
      });
    } catch (error) {
      console.error('Error updating series status:', error);
      throw error;
    }
  };

  const _removeMovieFromStatus = (tmdbId) => {
    setMovieStatusMap(prev => {
      const updated = { ...prev };
      delete updated[tmdbId];
      return updated;
    });
    setMoviesByStatus(prev => {
      const updated = {};
      ESTADOS.forEach(s => {
        updated[s] = (prev[s] || []).filter(m => m.tmdbId !== tmdbId);
      });
      return updated;
    });
  };

  const _removeSeriesFromStatus = (tmdbId) => {
    setSeriesStatusMap(prev => {
      const updated = { ...prev };
      delete updated[tmdbId];
      return updated;
    });
    setSeriesByStatus(prev => {
      const updated = {};
      ESTADOS.forEach(s => {
        updated[s] = (prev[s] || []).filter(s2 => s2.tmdbId !== tmdbId);
      });
      return updated;
    });
  };

  // ─── Helpers de consulta rápida ───────────────────────────────────────────

  const isMovieFavorite = (tmdbId) => favoriteMovies.some(m => m.tmdbId === tmdbId);
  const isSeriesFavorite = (tmdbId) => favoriteSeries.some(s => s.tmdbId === tmdbId);
  const getMovieStatus = (tmdbId) => movieStatusMap[tmdbId] || null;
  const getSeriesStatus = (tmdbId) => seriesStatusMap[tmdbId] || null;
  // Legacy
  const isMovieWatched = (tmdbId) => movieStatusMap[tmdbId] === 'Visto';
  const isSeriesWatched = (tmdbId) => seriesStatusMap[tmdbId] === 'Visto';

  return (
    <MediaContext.Provider
      value={{
        favoriteMovies,
        favoriteSeries,
        moviesByStatus,
        seriesByStatus,
        loading,
        toggleMovieFavorite: toggleMovieFavoriteLocal,
        toggleSeriesFavorite: toggleSeriesFavoriteLocal,
        updateMovieWatchingStatus,
        updateSeriesWatchingStatus,
        isMovieFavorite,
        isSeriesFavorite,
        isMovieWatched,
        isSeriesWatched,
        getMovieStatus,
        getSeriesStatus,
        reloadMedia: loadAllMedia,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
}

export function useMedia() {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMedia must be used within MediaProvider');
  }
  return context;
}
