# Guía de Funcionalidad de Amigos - MiroFilm 👥

## Problema: No se encuentran amigos

El sistema de amigos está completamente implementado, pero necesitas tener datos en la base de datos para verlos.

---

## 📋 Cómo Probar la Funcionalidad de Amigos

### Paso 1: Crear Múltiples Usuarios

Primero, necesitas crear al menos 2 usuarios en la base de datos:

1. **Usuario 1**: Crea una cuenta en la aplicación
   - Email: `usuario1@test.com`
   - Contraseña: `Test123!`
   - Nombre: Usuario Uno

2. **Usuario 2**: Crea otra cuenta
   - Email: `usuario2@test.com`
   - Contraseña: `Test123!`
   - Nombre: Usuario Dos

### Paso 2: Enviar Solicitud de Amistad

1. Inicia sesión con **Usuario 1**
2. Ve a la página de **Amigos** (menú lateral)
3. Haz clic en el tab **"Buscar"**
4. Busca por nombre o email: `usuario2` o `usuario2@test.com`
5. Haz clic en el botón **"Agregar"** (con icono de UserPlus)

### Paso 3: Aceptar Solicitud

1. Cierra sesión (Usuario 1)
2. Inicia sesión con **Usuario 2**
3. Ve a la página de **Amigos**
4. Haz clic en el tab **"Solicitudes"**
5. Verás la solicitud de Usuario 1
6. Haz clic en **"Aceptar"**

### Paso 4: Ver Amigos

1. Ahora ambos usuarios son amigos
2. En el tab **"Amigos"** verás al otro usuario
3. Puedes hacer clic en **"Ver Perfil"** para ver sus favoritos y lo que está viendo

---

## 🔍 Estructura de Datos

### Tabla: Friendships

```sql
CREATE TABLE Friendships (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserRequestId INT NOT NULL,
    UserReceiveId INT NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (UserRequestId) REFERENCES Users(Id),
    FOREIGN KEY (UserReceiveId) REFERENCES Users(Id)
);
```

### Estados Posibles

- **Pending**: Solicitud enviada, esperando respuesta
- **Accepted**: Amigos confirmados
- **Rejected**: Solicitud rechazada

---

## 🛠️ Endpoints de la API

### 1. Enviar Solicitud de Amistad
```
POST /api/friendship/request/{receiverId}
Authorization: Bearer {token}
```

**Respuesta exitosa**:
```json
{
  "message": "Solicitud de amistad enviada con éxito."
}
```

### 2. Obtener Mis Amigos
```
GET /api/friendship/my-friends
Authorization: Bearer {token}
```

**Respuesta**:
```json
[
  {
    "id": 1,
    "userRequestId": 1,
    "userReceiveId": 2,
    "status": "Accepted",
    "createdAt": "2026-05-29T10:00:00",
    "userRequest": {
      "id": 1,
      "name": "Usuario Uno",
      "email": "usuario1@test.com"
    },
    "userReceive": {
      "id": 2,
      "name": "Usuario Dos",
      "email": "usuario2@test.com"
    }
  }
]
```

### 3. Obtener Solicitudes Pendientes Recibidas
```
GET /api/friendship/pending-requests
Authorization: Bearer {token}
```

### 4. Obtener Solicitudes Pendientes Enviadas
```
GET /api/friendship/sent-requests
Authorization: Bearer {token}
```

### 5. Buscar Usuarios
```
GET /api/friendship/search?query=usuario
Authorization: Bearer {token}
```

### 6. Responder a Solicitud
```
PUT /api/friendship/respond/{friendshipId}?status=Accepted
Authorization: Bearer {token}
```

**Parámetros**:
- `status`: "Accepted" o "Rejected"

### 7. Cancelar Solicitud Enviada
```
DELETE /api/friendship/cancel-request/{friendshipId}
Authorization: Bearer {token}
```

### 8. Obtener Estado de Amistad
```
GET /api/friendship/status/{otherUserId}
Authorization: Bearer {token}
```

---

## 🐛 Solución de Problemas

### Problema: "No se encuentran usuarios"

**Causa**: No hay usuarios en la base de datos

**Solución**:
1. Crea al menos 2 usuarios registrándote en la aplicación
2. Asegúrate de que los usuarios estén en la tabla `Users`

### Problema: "No aparecen amigos aceptados"

**Causa**: No hay relaciones "Accepted" en la tabla Friendships

**Solución**:
1. Envía una solicitud de amistad
2. Acepta la solicitud con el otro usuario
3. Verifica que el estado sea "Accepted"

### Problema: "Error al buscar usuarios"

**Causa**: El backend no está respondiendo correctamente

**Solución**:
1. Verifica que el backend esté corriendo
2. Revisa la consola del navegador (F12) para ver el error
3. Revisa los logs del backend

### Problema: "No puedo enviar solicitud"

**Causa**: Posibles razones:
- Ya existe una solicitud previa
- Intentas agregarte a ti mismo
- El usuario no existe

**Solución**:
1. Verifica que el usuario exista
2. Verifica que no haya una solicitud previa
3. Intenta con otro usuario

---

## 📊 Flujo de Amistad

```
Usuario A                          Usuario B
   |                                  |
   |--- Envía Solicitud (Pending) --->|
   |                                  |
   |<--- Acepta (Accepted) ----------|
   |                                  |
   |--- Ahora son Amigos ----------->|
   |                                  |
   |<--- Ver Perfil, Favoritos ------>|
```

---

## 🎯 Funcionalidades Disponibles

### Para Amigos Aceptados

- ✅ Ver perfil del amigo
- ✅ Ver películas/series que está viendo
- ✅ Ver películas/series favoritas
- ✅ Ver actividad reciente
- ✅ Recibir notificaciones de actividad

### Para Solicitudes Pendientes

- ✅ Aceptar solicitud
- ✅ Rechazar solicitud
- ✅ Cancelar solicitud enviada

### Para Búsqueda

- ✅ Buscar por nombre
- ✅ Buscar por email
- ✅ Ver resultados de búsqueda
- ✅ Enviar solicitud desde resultados

---

## 📱 Interfaz de Usuario

### Tab: Amigos
- Muestra lista de amigos aceptados
- Botón "Ver Perfil" para cada amigo
- Información: nombre, email, avatar

### Tab: Solicitudes
- **Solicitudes Recibidas**: Botones Aceptar/Rechazar
- **Solicitudes Enviadas**: Botón Cancelar

### Tab: Buscar
- Buscador por nombre o email
- Resultados en tiempo real
- Botón "Agregar" para enviar solicitud

### Tab: Actividad
- Actividad reciente de amigos
- Películas/series que agregaron a favoritos
- Películas/series que están viendo
- Porcentaje de progreso

### Modal: Perfil de Amigo
- Avatar del amigo
- Nombre y email
- Películas que está viendo (con barra de progreso)
- Películas/series favoritas

---

## 🔐 Seguridad

### Validaciones Implementadas

- ✅ Solo usuarios autenticados pueden acceder
- ✅ No puedes ser tu propio amigo
- ✅ No puedes enviar solicitud duplicada
- ✅ Solo el receptor puede aceptar/rechazar
- ✅ Solo el remitente puede cancelar

### Datos Protegidos

- ✅ Solo ves amigos aceptados
- ✅ Solo ves solicitudes tuyas
- ✅ Solo ves actividad de amigos reales

---

## 📝 Notas Importantes

1. **Base de Datos**: Asegúrate de que las migraciones estén aplicadas
2. **Backend**: El backend debe estar corriendo en `https://localhost:7001`
3. **Token JWT**: Se envía automáticamente en cada solicitud
4. **Notificaciones**: Se crean automáticamente al enviar solicitudes

---

## 🚀 Próximas Mejoras

- [ ] Notificaciones en tiempo real (WebSocket)
- [ ] Mensajes privados entre amigos
- [ ] Grupos de amigos
- [ ] Estadísticas de amigos
- [ ] Recomendaciones basadas en amigos

---

## 📞 Soporte

Si tienes problemas:

1. Revisa la consola del navegador (F12)
2. Revisa los logs del backend
3. Verifica que la base de datos tenga datos
4. Verifica que el backend esté corriendo
5. Verifica que el token JWT sea válido

---

**Última actualización**: 29 de Mayo de 2026  
**Estado**: ✅ Funcional
