import api from './api-config';

/**
 * Obtiene el perfil del usuario actual
 */
export async function getProfile() {
  const response = await api.get('/users/profile');
  return response.data;
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
  
  const response = await api.post('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}

/**
 * Elimina el avatar del usuario
 */
export async function deleteAvatar() {
  const response = await api.delete('/users/avatar');
  return response.data;
}
