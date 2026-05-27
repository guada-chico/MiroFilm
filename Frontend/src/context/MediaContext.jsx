import { createContext, useContext, useState } from 'react';

const MediaContext = createContext();

export function MediaProvider({ children }) {
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [favoriteSeries, setFavoriteSeries] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [watchedSeries, setWatchedSeries] = useState([]);

  const toggleMovieFavorite = (movie) => {
    setFavoriteMovies(prev => {
      const exists = prev.find(m => m.tmdbId === movie.tmdbId);
      if (exists) {
        return prev.filter(m => m.tmdbId !== movie.tmdbId);
      } else {
        return [...prev, movie];
      }
    });
  };

  const toggleSeriesFavorite = (series) => {
    setFavoriteSeries(prev => {
      const exists = prev.find(s => s.tmdbId === series.tmdbId);
      if (exists) {
        return prev.filter(s => s.tmdbId !== series.tmdbId);
      } else {
        return [...prev, series];
      }
    });
  };

  const toggleMovieWatched = (movie) => {
    setWatchedMovies(prev => {
      const exists = prev.find(m => m.tmdbId === movie.tmdbId);
      if (exists) {
        return prev.filter(m => m.tmdbId !== movie.tmdbId);
      } else {
        return [...prev, movie];
      }
    });
  };

  const toggleSeriesWatched = (series) => {
    setWatchedSeries(prev => {
      const exists = prev.find(s => s.tmdbId === series.tmdbId);
      if (exists) {
        return prev.filter(s => s.tmdbId !== series.tmdbId);
      } else {
        return [...prev, series];
      }
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
        toggleMovieFavorite,
        toggleSeriesFavorite,
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
