# Mejora: Avatares de Usuarios en Amigos 👤

## Problema Identificado

Los avatares de los usuarios en la página de Amigos estaban usando Pravatar con IDs aleatorios, lo que generaba avatares diferentes cada vez que se cargaba la página.

## Solución Implementada

Se cambió el sistema de avatares para:

1. **Usar el avatar del usuario** si tiene uno guardado en la base de datos (`avatarUrl`)
2. **Generar un avatar basado en el nombre** si no tiene avatar guardado
3. **Mantener consistencia** - el mismo usuario siempre tendrá el mismo avatar

## Cambios Realizados

### Archivo: `Frontend/src/pages/amigos/Amigos.jsx`

#### 1. Nuevas Funciones Auxiliares

```javascript
const getAvatarUrl = (user) => {
  if (user?.avatarUrl) return user.avatarUrl;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=ff6b35&color=fff&size=150`;
};

const getFriendAvatarUrl = (friendship) => {
  const friendUser = friendship.userRequest?.id === user.id ? friendship.userReceive : friendship.userRequest;
  return getAvatarUrl(friendUser);
};
```

#### 2. Cambios en Avatares

**Antes (❌ Avatares aleatorios)**:
```jsx
src={`https://i.pravatar.cc/150?u=${getFriendId(amigo)}`}
```

**Después (✅ Avatares consistentes)**:
```jsx
src={getFriendAvatarUrl(amigo)}
```

#### 3. Lugares Actualizados

- ✅ Tab "Amigos" - Avatar de amigos aceptados
- ✅ Tab "Solicitudes" - Avatar de solicitudes recibidas
- ✅ Tab "Solicitudes" - Avatar de solicitudes enviadas
- ✅ Tab "Buscar" - Avatar de resultados de búsqueda
- ✅ Tab "Actividad" - Avatar de actividad de amigos
- ✅ Modal "Perfil de Amigo" - Avatar en el modal

## Cómo Funciona

### Prioridad de Avatares

1. **Si el usuario tiene `avatarUrl`**: Usa ese avatar
2. **Si no tiene avatar**: Genera uno con `ui-avatars.com` basado en el nombre

### Generador de Avatares (ui-avatars.com)

```
https://ui-avatars.com/api/?name=Juan&background=ff6b35&color=fff&size=150
```

**Parámetros**:
- `name`: Nombre del usuario (se codifica para URLs)
- `background`: Color de fondo (#ff6b35 = naranja)
- `color`: Color del texto (#fff = blanco)
- `size`: Tamaño en píxeles (150)

### Ejemplo

**Usuario**: Juan Pérez (sin avatar guardado)
- Avatar generado: Letra "J" en fondo naranja
- Siempre será igual porque se basa en el nombre

**Usuario**: María García (con avatar guardado)
- Avatar: La imagen guardada en `avatarUrl`
- Siempre será la misma imagen

## Ventajas

✅ **Consistencia**: El mismo usuario siempre tiene el mismo avatar  
✅ **Personalización**: Si el usuario sube una foto, se usa esa  
✅ **Fallback automático**: Si no hay foto, genera una basada en el nombre  
✅ **Mejor UX**: Los usuarios reconocen a sus amigos por el avatar  
✅ **Sin dependencias externas**: Usa ui-avatars.com que es confiable  

## Cómo Subir Avatar

Los usuarios pueden subir su avatar en la página de **Perfil**:

1. Ve a **Perfil** (menú lateral)
2. Haz clic en el botón de cámara sobre tu avatar
3. Selecciona una imagen
4. Se guardará automáticamente

Una vez guardado, aparecerá en:
- Tu perfil
- Página de amigos (cuando otros te ven)
- Actividad de amigos
- Solicitudes de amistad

## Verificación

Para verificar que funciona:

1. Crea un usuario **sin avatar**
   - Verás un avatar generado con su inicial

2. Crea otro usuario **con avatar**
   - Verás la foto que subió

3. Agrega como amigos
   - Verás los avatares correctos en todas partes

4. Recarga la página
   - Los avatares seguirán siendo los mismos (consistencia)

## Notas Técnicas

### Función `getAvatarUrl`
```javascript
const getAvatarUrl = (user) => {
  if (user?.avatarUrl) return user.avatarUrl;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=ff6b35&color=fff&size=150`;
};
```

- Verifica si el usuario tiene `avatarUrl`
- Si no, genera URL con `ui-avatars.com`
- Usa `encodeURIComponent` para codificar el nombre correctamente
- Fallback a "U" si no hay nombre

### Función `getFriendAvatarUrl`
```javascript
const getFriendAvatarUrl = (friendship) => {
  const friendUser = friendship.userRequest?.id === user.id ? friendship.userReceive : friendship.userRequest;
  return getAvatarUrl(friendUser);
};
```

- Determina cuál es el amigo (no el usuario actual)
- Llama a `getAvatarUrl` con el amigo

## Próximas Mejoras

- [ ] Permitir cambiar avatar desde la página de Amigos
- [ ] Mostrar iniciales en avatar generado
- [ ] Agregar más opciones de color para avatares
- [ ] Cachear avatares localmente
- [ ] Agregar animación al cambiar avatar

## Soporte

Si los avatares no se muestran:

1. Verifica que el usuario tenga un nombre
2. Verifica que `avatarUrl` esté en la BD si subió foto
3. Revisa la consola del navegador (F12) para errores
4. Verifica que ui-avatars.com esté accesible

---

**Mejora Aplicada**: 29 de Mayo de 2026  
**Estado**: ✅ Completado
