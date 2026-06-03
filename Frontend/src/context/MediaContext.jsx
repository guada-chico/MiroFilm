import { createContext, useContext, useState, useEffect } from 'react';
import { getMyFavorites, toggleMovieFavorite, toggleSeriesFavorite } from '../services/favorites-service';
import { getUserWatchingStatus, updateMovieStatus, updateSeriesStatus, deleteWatchingStatus } from '../services/watching-status-service';
import { useUser } from './UserContext';

const MediaContext = createContext();

export function MediaProvider({ children }) {
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [favoriteSeries, setFavoriteSeries] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [watchedSeries, setWatchedSeries] = useState([]);
  const [moviesByStatus, setMoviesByStatus] = useState({
    'Pendiente': [],
    'Viendo': [],
    'Visto': [],
    'Abandonado': []
  });
  const [seriesByStatus, setSeriesByStatus] = useState({
    'Pendiente': [],
    'Viendo': [],
    'Visto': [],
    'Abandonado': []
  });
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

        // Cargar estados de visualización desde la API
        if (user && user.id) {
          const watchingStatuses = await getUserWatchingStatus(user.id);
          console.log('Watching statuses loaded:', watchingStatuses);
          
          // Organizar por tipo y estado
          const moviesByStatusTemp = {
            'Pendiente': [],
            'Viendo': [],
            'Visto': [],
            'Abandonado': []
          };
          
          const seriesByStatusTemp = {
            'Pendiente': [],
            'Viendo': [],
            'Visto': [],
            'Abandonado': []
          };
          
          const watchedMoviesTemp = [];
          const watchedSeriesTemp = [];
          
          watchingStatuses.forEach(status => {
            if (status.movieId) {
              const movieStatus = {
                ...status.movie,
                watchingStatusId: status.id,
                watchingStatus: status.status
              };
              moviesByStatusTemp[status.status]?.push(movieStatus);
              if (status.status === 'Visto') {
                watchedMoviesTemp.push(movieStatus);
              }
            } else if (status.seriesId) {
              const seriesStatus = {
                ...status.series,
                watchingStatusId: status.id,
                watchingStatus: status.status
              };
              seriesByStatusTemp[status.status]?.push(seriesStatus);
              if (status.status === 'Visto') {
                watchedSeriesTemp.push(seriesStatus);
              }
            }
          });
          
          setMoviesByStatus(moviesByStatusTemp);
          setSeriesByStatus(seriesByStatusTemp);
          setWatchedMovies(watchedMoviesTemp);
          setWatchedSeries(watchedSeriesTemp);
        }
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
      setMoviesByStatus({
        'Pendiente': [],
        'Viendo': [],
        'Visto': [],
        'Abandonado': []
      });
      setSeriesByStatus({
        'Pendiente': [],
        'Viendo': [],
        'Visto': [],
        'Abandonado': []
      });
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

  const updateMovieWatchingStatus = async (movie, newStatus) => {
    try {
      console.log('Updating movie status:', movie.tmdbId, 'to', newStatus);
      
      // Si no tenemos un ID de BD, usamos tmdbId como ID temporal
      const movieId = movie.id || movie.tmdbId;
      
      const result = await updateMovieStatus(user.id, movieId, newStatus);
      
      // Actualizar el estado local
      setMoviesByStatus(prev => {
        const updated = { ...prev };
        
        // Remover de todos los estados
        Object.keys(updated).forEach(status => {
          updated[status] = updated[status].filter(m => m.tmdbId !== movie.tmdbId && m.id !== movieId);
        });
        
        // Agregar al nuevo estado
        const movieToAdd = {
          ...movie,
          watchingStatusId: result.id,
          watchingStatus: newStatus
        };
        updated[newStatus] = [...updated[newStatus], movieToAdd];
        
        return updated;
      });
      
      // Actualizar watchedMovies si el nuevo estado es "Visto"
      if (newStatus === 'Visto') {
        setWatchedMovies(prev => {
          const exists = prev.find(m => m.tmdbId === movie.tmdbId);
          if (!exists) {
            return [...prev, movie];
          }
          return prev;
        });
      } else {
        setWatchedMovies(prev => prev.filter(m => m.tmdbId !== movie.tmdbId));
      }
      
      return result;
    } catch (error) {
      console.error('Error updating movie status:', error);
      throw error;
    }
  };

  const updateSeriesWatchingStatus = async (series, newStatus) => {
    try {
      console.log('Updating series status:', series.tmdbId, 'to', newStatus);
      
      // Si no tenemos un ID de BD, usamos tmdbId como ID temporal
      const seriesId = series.id || series.tmdbId;
      
      const result = await updateSeriesStatus(user.id, seriesId, newStatus);
      
      // Actualizar el estado local
      setSeriesByStatus(prev => {
        const updated = { ...prev };
        
        // Remover de todos los estados
        Object.keys(updated).forEach(status => {
          updated[status] = updated[status].filter(s => s.tmdbId !== series.tmdbId && s.id !== seriesId);
        });
        
        // Agregar al nuevo estado
        const seriesToAdd = {
          ...series,
          watchingStatusId: result.id,
          watchingStatus: newStatus
        };
        updated[newStatus] = [...updated[newStatus], seriesToAdd];
        
        return updated;
      });
      
      // Actualizar watchedSeries si el nuevo estado es "Visto"
      if (newStatus === 'Visto') {
        setWatchedSeries(prev => {
          const exists = prev.find(s => s.tmdbId === series.tmdbId);
          if (!exists) {
            return [...prev, series];
          }
          return prev;
        });
      } else {
        setWatchedSeries(prev => prev.filter(s => s.tmdbId !== series.tmdbId));
      }
      
      return result;
    } catch (error) {
      console.error('Error updating series status:', error);
      throw error;
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
      
      // Guardar en localStorage (legacy)
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
      
      // Guardar en localStorage (legacy)
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
        moviesByStatus,
        seriesByStatus,
        loading,
        toggleMovieFavorite: toggleMovieFavoriteLocal,
        toggleSeriesFavorite: toggleSeriesFavoriteLocal,
        toggleMovieWatched,
        toggleSeriesWatched,
        updateMovieWatchingStatus,
        updateSeriesWatchingStatus,
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
