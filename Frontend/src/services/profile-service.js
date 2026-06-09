import api from './api-config';

/**
 * Obtiene el perfil del usuario actual
 */
export async function getProfile() {
  const response = await api.get('/users/profile');
  const data = response.data;
  
  // Si avatarUrl es una ruta relativa, construir la URL completa
  if (data.avatarUrl && !data.avatarUrl.startsWith('http')) {
    const baseUrl = api.defaults.baseURL.replace('/api', '');
    data.avatarUrl = baseUrl + data.avatarUrl;
  }
  
  // Agregar timestamp para evitar caché
  if (data.avatarUrl) {
    data.avatarUrl = `${data.avatarUrl}?t=${Date.now()}`;
  }
  
  return data;
}

/**
 * Actualiza el perfil del usuario (nombre y email)
 */
export async function updateProfile(name, email) {
  const response = await api.put('/users/profile', {
    name,
    email
  });
  return response.data;
}

/**
 * Cambia la contraseña del usuario
 */
export async function changePassword(currentPassword, newPassword) {
  const response = await api.post('/users/change-password', {
    currentPassword,
    newPassword
  });
  return response.data;
}

/**
 * Actualiza el avatar del usuario
 */
export async function updateAvatar(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  // Dejar que el navegador/axios establezca el Content-Type con el boundary automáticamente
  const response = await api.post('/users/avatar', formData);
  
  const data = response.data;
  
  // Si avatarUrl es una ruta relativa, construir la URL completa
  if (data.avatarUrl && !data.avatarUrl.startsWith('http')) {
    const baseUrl = api.defaults.baseURL.replace('/api', '');
    data.avatarUrl = baseUrl + data.avatarUrl;
  }
  
  // Agregar timestamp para evitar caché
  if (data.avatarUrl) {
    data.avatarUrl = `${data.avatarUrl}?t=${Date.now()}`;
  }
  
  return data;
}

/**
 * Elimina el avatar del usuario
 */
export async function deleteAvatar() {
  const response = await api.delete('/users/avatar');
  return response.data;
}
