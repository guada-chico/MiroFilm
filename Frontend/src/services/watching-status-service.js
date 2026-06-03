const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Obtener el estado de una película
export async function getMovieWatchingStatus(userId, movieId) {
  try {
    const response = await fetch(`${API_BASE_URL}/WatchingStatus/user/${userId}/movie/${movieId}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Error fetching movie watching status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching movie watching status:', error);
    throw error;
  }
}

// Obtener el estado de una serie
export async function getSeriesWatchingStatus(userId, seriesId) {
  try {
    const response = await fetch(`${API_BASE_URL}/WatchingStatus/user/${userId}/series/${seriesId}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Error fetching series watching status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching series watching status:', error);
    throw error;
  }
}

// Obtener todas las películas de un usuario
export async function getUserMovies(userId, status = null) {
  try {
    const url = new URL(`${API_BASE_URL}/WatchingStatus/user/${userId}/movies`);
    if (status) {
      url.searchParams.append('status', status);
    }
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Error fetching user movies');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user movies:', error);
    throw error;
  }
}

// Obtener todas las series de un usuario
export async function getUserSeries(userId, status = null) {
  try {
    const url = new URL(`${API_BASE_URL}/WatchingStatus/user/${userId}/series`);
    if (status) {
      url.searchParams.append('status', status);
    }
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Error fetching user series');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user series:', error);
    throw error;
  }
}

// Obtener todos los estados de un usuario
export async function getUserWatchingStatus(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/WatchingStatus/user/${userId}`);
    if (!response.ok) throw new Error('Error fetching user watching status');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user watching status:', error);
    throw error;
  }
}

// Crear o actualizar el estado de visualización
export async function createOrUpdateWatchingStatus(watchingStatus) {
  try {
    const response = await fetch(`${API_BASE_URL}/WatchingStatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(watchingStatus),
    });
    if (!response.ok) throw new Error('Error creating/updating watching status');
    return await response.json();
  } catch (error) {
    console.error('Error creating/updating watching status:', error);
    throw error;
  }
}

// Actualizar progreso
export async function updateProgress(statusId, currentMinute, status = null) {
  try {
    const response = await fetch(`${API_BASE_URL}/WatchingStatus/${statusId}/progress`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentMinute,
        status,
      }),
    });
    if (!response.ok) throw new Error('Error updating progress');
    return await response.json();
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
}

// Eliminar estado
export async function deleteWatchingStatus(statusId) {
  try {
    const response = await fetch(`${API_BASE_URL}/WatchingStatus/${statusId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error deleting watching status');
  } catch (error) {
    console.error('Error deleting watching status:', error);
    throw error;
  }
}

// Cambiar estado de película
export async function updateMovieStatus(userId, movieId, newStatus) {
  try {
    const response = await createOrUpdateWatchingStatus({
      userId,
      movieId,
      status: newStatus,
      currentMinute: 0,
    });
    return response;
  } catch (error) {
    console.error('Error updating movie status:', error);
    throw error;
  }
}

// Cambiar estado de serie
export async function updateSeriesStatus(userId, seriesId, newStatus) {
  try {
    const response = await createOrUpdateWatchingStatus({
      userId,
      seriesId,
      status: newStatus,
      currentMinute: 0,
    });
    return response;
  } catch (error) {
    console.error('Error updating series status:', error);
    throw error;
  }
}
