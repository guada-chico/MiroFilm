# Solución: Error al Enviar Solicitud de Amistad 📧

## Problema Identificado

Cuando intentas agregar a un usuario como amigo, aparece un mensaje genérico: "Error al enviar solicitud" sin explicar la causa real.

## Causas Posibles

### 1. Ya existe una relación de amistad
- Ya son amigos
- Ya hay una solicitud pendiente
- Ya rechazaste la solicitud

### 2. Intentas agregarte a ti mismo
- El sistema no permite ser tu propio amigo

### 3. El usuario no existe
- El usuario fue eliminado
- El ID es inválido

## Soluciones Aplicadas

### 1. Backend - Mensajes Más Claros

**Archivo**: `Backend/Controllers/FriendshipController.cs`

Se mejoró el endpoint `POST /api/friendship/request/{receiverId}` para retornar mensajes específicos:

```csharp
// Validar que no sea el mismo usuario
if (senderId == receiverId)
    return BadRequest(new { message = "No puedes agregarte a ti mismo como amigo." });

// Si ya existe relación
if (!success)
    return BadRequest(new { message = "Ya existe una solicitud de amistad con este usuario. Verifica tus solicitudes pendientes." });
```

### 2. Frontend - Mostrar Mensajes del Backend

**Archivo**: `Frontend/src/pages/amigos/Amigos.jsx`

Se mejoró el manejador de errores para mostrar el mensaje específico del backend:

```javascript
const handleSendRequest = async (receiverId) => {
  try {
    await sendFriendRequest(receiverId);
    alert(t.amigos?.requestSent || 'Solicitud enviada');
    await loadAllData();
    setSearchQuery('');
    setSearchResults([]);
  } catch (err) {
    // Mostrar el mensaje específico del backend
    const errorMessage = err.response?.data?.message || 
                        err.response?.data || 
                        t.amigos?.requestError || 
                        'Error al enviar solicitud';
    alert(errorMessage);
  }
};
```

## Mensajes de Error Ahora Disponibles

### ✅ Solicitud Enviada Exitosamente
```
"Solicitud de amistad enviada con éxito."
```

### ❌ Ya Existe Relación
```
"Ya existe una solicitud de amistad con este usuario. Verifica tus solicitudes pendientes."
```

### ❌ Intentas Agregarte a Ti Mismo
```
"No puedes agregarte a ti mismo como amigo."
```

## Cómo Resolver Cada Caso

### Caso 1: "Ya existe una solicitud de amistad"

**Solución**:
1. Ve a **Amigos** → **Solicitudes**
2. Verifica si hay una solicitud pendiente
3. Si está en "Solicitudes Recibidas": Acepta o rechaza
4. Si está en "Solicitudes Enviadas": Cancela si quieres

### Caso 2: "No puedes agregarte a ti mismo"

**Solución**:
- Este error no debería ocurrir normalmente
- Si ocurre, recarga la página

### Caso 3: "Error al enviar solicitud" (genérico)

**Solución**:
1. Verifica que el backend esté corriendo
2. Revisa la consola del navegador (F12)
3. Verifica que tengas conexión a internet
4. Intenta con otro usuario

## Flujo de Amistad Correcto

```
Usuario A                          Usuario B
   |                                  |
   |--- Busca a Usuario B ---------->|
   |                                  |
   |--- Haz clic en "Agregar" ------>|
   |                                  |
   |<--- Solicitud Enviada ----------|
   |                                  |
   |                                  |--- Ve Solicitud Recibida
   |                                  |
   |                                  |--- Haz clic en "Aceptar"
   |                                  |
   |<--- Solicitud Aceptada ---------|
   |                                  |
   |--- Ahora son Amigos ----------->|
```

## Validaciones Implementadas

### Backend
- ✅ No puedes ser tu propio amigo
- ✅ No puedes enviar solicitud duplicada
- ✅ Solo el receptor puede aceptar/rechazar
- ✅ Solo el remitente puede cancelar

### Frontend
- ✅ Muestra mensajes específicos del backend
- ✅ Recarga datos después de enviar solicitud
- ✅ Limpia el buscador después de enviar

## Verificación

Para verificar que funciona correctamente:

### Escenario 1: Enviar Solicitud Nueva
1. Busca un usuario que no sea amigo
2. Haz clic en "Agregar"
3. Deberías ver: "Solicitud de amistad enviada con éxito."

### Escenario 2: Intentar Enviar Solicitud Duplicada
1. Busca el mismo usuario de nuevo
2. Haz clic en "Agregar"
3. Deberías ver: "Ya existe una solicitud de amistad..."

### Escenario 3: Aceptar Solicitud
1. Inicia sesión con el otro usuario
2. Ve a **Amigos** → **Solicitudes**
3. Haz clic en "Aceptar"
4. Deberías ver: "Solicitud aceptada correctamente"

## Notas Técnicas

### Estructura de Error en Axios
```javascript
err.response?.data?.message  // Mensaje específico del backend
err.response?.data           // Objeto completo de error
err.response?.status         // Código HTTP (400, 401, 500, etc.)
```

### Códigos HTTP Utilizados
- `200 OK` - Solicitud enviada exitosamente
- `400 Bad Request` - Error de validación (ya existe, mismo usuario, etc.)
- `401 Unauthorized` - Token JWT inválido o expirado
- `500 Internal Server Error` - Error del servidor

## Próximas Mejoras

- [ ] Mostrar mensajes de error en la UI (no solo alerts)
- [ ] Agregar validación en el frontend antes de enviar
- [ ] Mostrar estado de amistad en el buscador
- [ ] Agregar botón "Cancelar solicitud" en resultados
- [ ] Agregar notificaciones en tiempo real

## Soporte

Si aún tienes problemas:

1. Abre la consola del navegador (F12)
2. Ve a la pestaña **Network**
3. Intenta agregar un amigo
4. Busca la solicitud `POST /api/friendship/request/...`
5. Revisa la respuesta (Response tab)
6. Comparte el mensaje de error

---

**Solución Aplicada**: 29 de Mayo de 2026  
**Estado**: ✅ Completado
