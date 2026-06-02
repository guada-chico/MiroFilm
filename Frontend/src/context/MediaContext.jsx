import { createContext, useContext, useState, useEffect } from 'react';
import { getMyFavorites, toggleMovieFavorite, toggleSeriesFavorite } from '../services/favorites-service';
import { useUser } from './UserContext';

const MediaContext = createContext();

export function MediaProvider({ children }) {
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [favoriteSeries, setFavoriteSeries] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [watchedSeries, setWatchedSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  // Cargar favoritos y vistos desde la API e localStorage al montar el componente
  // y cuando el usuario cambia
  useEffect(() => {
    const loadAllMedia = async () => {
      try {
        setLoading(true);
        
        // Cargar favoritos desde la API
        const favorites = await getMyFavorites();
        console.log('Favorites loaded:', favorites);
        
        const movies = favorites.filter(f => f.type === 'movie');
        const series = favorites.filter(f => f.type === 'series');
        
        setFavoriteMovies(movies);
        setFavoriteSeries(series);

        // Cargar vistos desde localStorage
        const watchedMoviesLocal = JSON.parse(localStorage.getItem('watchedMovies') || '[]');
        const watchedSeriesLocal = JSON.parse(localStorage.getItem('watchedSeries') || '[]');
        
        setWatchedMovies(watchedMoviesLocal);
        setWatchedSeries(watchedSeriesLocal);
      } catch (error) {
        console.error('Error loading media:', error);
      } finally {
        setLoading(false);
      }
    };

    // Solo cargar si hay un usuario autenticado
    if (user && user.id) {
      loadAllMedia();
    } else {
      // Si no hay usuario, limpiar todo
      setFavoriteMovies([]);
      setFavoriteSeries([]);
      setWatchedMovies([]);
      setWatchedSeries([]);
      setLoading(false);
    }
  }, [user?.id]); // Recargarse cuando cambia el ID del usuario

  const toggleMovieFavoriteLocal = async (movie) => {
    try {
      console.log('Toggling movie favorite:', movie.tmdbId, movie);
      await toggleMovieFavorite(movie.tmdbId);
      
      setFavoriteMovies(prev => {
        const exists = prev.find(m => m.tmdbId === movie.tmdbId);
        if (exists) {
          return prev.filter(m => m.tmdbId !== movie.tmdbId);
        } else {
          return [...prev, {
            tmdbId: movie.tmdbId,
            title: movie.title,
            posterUrl: movie.posterUrl,
            director: movie.director || 'Director desconocido',
            genre: movie.genre,
            rating: movie.rating,
            plot: movie.plot,
            type: 'movie'
          }];
        }
      });
    } catch (error) {
      console.error('Error toggling movie favorite:', error);
    }
  };

  const toggleSeriesFavoriteLocal = async (series) => {
    try {
      console.log('Toggling series favorite:', series.tmdbId, series);
      await toggleSeriesFavorite(series.tmdbId);
      
      setFavoriteSeries(prev => {
        const exists = prev.find(s => s.tmdbId === series.tmdbId);
        if (exists) {
          return prev.filter(s => s.tmdbId !== series.tmdbId);
        } else {
          return [...prev, {
            tmdbId: series.tmdbId,
            title: series.title,
            posterUrl: series.posterUrl,
            creator: series.creator || 'Creador desconocido',
            genre: series.genre,
            rating: series.rating,
            plot: series.plot,
            type: 'series'
          }];
        }
      });
    } catch (error) {
      console.error('Error toggling series favorite:', error);
    }
  };

  const toggleMovieWatched = (movie) => {
    setWatchedMovies(prev => {
      const exists = prev.find(m => m.tmdbId === movie.tmdbId);
      let updated;
      
      if (exists) {
        updated = prev.filter(m => m.tmdbId !== movie.tmdbId);
      } else {
        updated = [...prev, {
          tmdbId: movie.tmdbId,
          title: movie.title,
          posterUrl: movie.posterUrl,
        }];
      }
      
      // Guardar en localStorage
      localStorage.setItem('watchedMovies', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleSeriesWatched = (series) => {
    setWatchedSeries(prev => {
      const exists = prev.find(s => s.tmdbId === series.tmdbId);
      let updated;
      
      if (exists) {
        updated = prev.filter(s => s.tmdbId !== series.tmdbId);
      } else {
        updated = [...prev, {
          tmdbId: series.tmdbId,
          title: series.title,
          posterUrl: series.posterUrl,
        }];
      }
      
      // Guardar en localStorage
      localStorage.setItem('watchedSeries', JSON.stringify(updated));
      return updated;
    });
  };

  const isMovieFavorite = (tmdbId) => favoriteMovies.some(m => m.tmdbId === tmdbId);
  const isSeriesFavorite = (tmdbId) => favoriteSeries.some(s => s.tmdbId === tmdbId);
  const isMovieWatched = (tmdbId) => watchedMovies.some(m => m.tmdbId === tmdbId);
  const isSeriesWatched = (tmdbId) => watchedSeries.some(s => s.tmdbId === tmdbId);

  return (
    <MediaContext.Provider
      value={{
        favoriteMovies,
        favoriteSeries,
        watchedMovies,
        watchedSeries,
        loading,
        toggleMovieFavorite: toggleMovieFavoriteLocal,
        toggleSeriesFavorite: toggleSeriesFavoriteLocal,
        toggleMovieWatched,
        toggleSeriesWatched,
        isMovieFavorite,
        isSeriesFavorite,
        isMovieWatched,
        isSeriesWatched,
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
