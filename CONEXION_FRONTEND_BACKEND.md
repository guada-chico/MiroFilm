# 🔗 Conexión Frontend-Backend - Proyecto Miro

## ✅ Cambios Realizados

### 1. **Configuración de API (Frontend)**
- **Archivo**: `Frontend/src/services/api-config.js`
- **URL del Backend**: `https://localhost:7072/api` (puerto HTTPS del backend .NET)
- **Interceptores configurados**:
  - Adjunta automáticamente el token JWT en cada petición
  - Redirige al login si el backend devuelve 401 (no autorizado)

### 2. **Servicios Creados (Frontend)**
Se crearon servicios para cada módulo del backend:

- ✅ `auth-service.js` - Login, registro, logout
- ✅ `books-service.js` - Obtener libros, buscar
- ✅ `favorites-service.js` - Añadir/quitar favoritos
- ✅ `reading-service.js` - Gestión de biblioteca personal
- ✅ `recommendations-service.js` - Recomendaciones personalizadas
- ✅ `friendship-service.js` - Gestión de amigos
- ✅ `notifications-service.js` - Notificaciones
- ✅ `external-books-service.js` - **NUEVO**: Google Books, Open Library y Gutendex

### 3. **APIs Externas Integradas** 🆕

#### **Open Library (Portadas de alta calidad)**
- ✅ Integrado en el backend (`OpenLibraryService.cs`)
- ✅ Portadas de alta resolución por ISBN
- ✅ URL directa: `https://covers.openlibrary.org/b/isbn/{ISBN}-L.jpg`
- ✅ Sin necesidad de API Key
- ✅ Usado automáticamente en búsquedas cuando Google Books no tiene portada

#### **Gutendex / Project Gutenberg (Libros gratis)** 🆕
- ✅ Nuevo servicio backend: `GutendexService.cs`
- ✅ Nuevo controller: `GutendexController.cs`
- ✅ Más de 70,000 libros clásicos gratuitos
- ✅ Botón "Leer ahora" que abre el libro en formato HTML o TXT
- ✅ Nueva página dedicada: `/clasicos`
- ✅ Búsqueda por título/autor
- ✅ Top libros más descargados

### 4. **Páginas Actualizadas**
Las siguientes páginas ahora consumen datos reales del backend:

- ✅ **Login** (`Login.jsx`) - Autenticación real con JWT
- ✅ **Inicio** (`Inicio.jsx`) - Lectura actual, recomendaciones, búsqueda externa, clásicos gratuitos 🆕
- ✅ **Favoritos** (`Favoritos.jsx`) - Lista de favoritos con toggle
- ✅ **Biblioteca** (`Biblioteca.jsx`) - Libros por estado (leyendo, leídos, por leer)
- ✅ **Recomendaciones** (`Recomendaciones.jsx`) - Libros recomendados
- ✅ **Amigos** (`Amigos.jsx`) - Lista de amigos y envío de solicitudes
- ✅ **Clásicos** (`Clasicos.jsx`) - **NUEVA**: Catálogo de libros gratuitos con lectura online 🆕

### 5. **Backend (CORS y JWT)**
El backend ya está configurado con:
- ✅ CORS habilitado para cualquier origen
- ✅ Autenticación JWT
- ✅ Endpoints protegidos con `[Authorize]`
- ✅ 3 APIs externas integradas (Google Books, Open Library, Gutendex)

---

## 🚀 Cómo Ejecutar el Proyecto

### **Paso 1: Ejecutar el Backend (.NET)**

1. Abre una terminal en la carpeta `Backend/`
2. Ejecuta:
   ```bash
   dotnet run
   ```
3. El backend estará disponible en:
   - **HTTPS**: `https://localhost:7072`
   - **HTTP**: `http://localhost:5284`
   - **Swagger**: `https://localhost:7072/swagger`

### **Paso 2: Ejecutar el Frontend (React + Vite)**

1. Abre otra terminal en la carpeta `Frontend/`
2. Instala las dependencias (solo la primera vez):
   ```bash
   npm install
   ```
3. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. El frontend estará disponible en: `http://localhost:5173`

---

## 🔐 Flujo de Autenticación

1. El usuario se registra o inicia sesión en `/login`
2. El backend devuelve un **token JWT**
3. El token se guarda en `localStorage`
4. Todas las peticiones posteriores incluyen el token en el header `Authorization: Bearer <token>`
5. Si el token expira o es inválido, el usuario es redirigido al login

---

## 📡 Endpoints del Backend

### **Auth**
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión

### **Books**
- `GET /api/books` - Todos los libros
- `GET /api/books/{id}` - Libro por ID
- `GET /api/books/search?q=query` - Buscar libros

### **Favorites** (requiere autenticación)
- `POST /api/favorites/toggle/{bookId}` - Añadir/quitar favorito
- `GET /api/favorites` - Mis favoritos

### **Reading** (requiere autenticación)
- `POST /api/reading/update-status` - Actualizar estado de lectura
- `GET /api/reading/current` - Lectura actual
- `GET /api/reading/my-library` - Mi biblioteca completa

### **Recommendations** (requiere autenticación)
- `GET /api/recommendations` - Mis recomendaciones

### **Friendship** (requiere autenticación)
- `POST /api/friendship/request/{receiverId}` - Enviar solicitud
- `PUT /api/friendship/respond/{friendshipId}?status=Accepted` - Responder solicitud
- `GET /api/friendship/my-friends` - Mis amigos

### **Notifications** (requiere autenticación)
- `GET /api/notification` - Mis notificaciones
- `PUT /api/notification/{id}/read` - Marcar como leída

### **External Books** (APIs externas)
- `GET /api/externalbooks/search?q=query` - Buscar en Google Books + Open Library
- `GET /api/gutendex/search?q=query` - Buscar libros gratuitos en Gutenberg
- `GET /api/gutendex/top?count=20` - Top libros clásicos más descargados

---

## 🛠️ Solución de Problemas

### **Error de CORS**
Si ves errores de CORS en la consola del navegador:
- Verifica que el backend esté corriendo
- Asegúrate de que la URL en `api-config.js` sea correcta: `https://localhost:7072/api`

### **Error de certificado SSL**
Si el navegador bloquea `https://localhost:7072`:
1. Abre `https://localhost:7072/swagger` en el navegador
2. Acepta el certificado autofirmado
3. Recarga el frontend

### **Token expirado**
Si ves errores 401:
- Cierra sesión y vuelve a iniciar sesión
- El token se guarda en `localStorage` y se adjunta automáticamente

### **Base de datos vacía**
Si no ves datos:
- Asegúrate de que las migraciones se hayan aplicado: `dotnet ef database update`
- Registra un usuario y añade libros desde Swagger o el frontend

---

## 📝 Próximos Pasos

- [ ] Añadir manejo de errores más robusto con mensajes al usuario
- [ ] Implementar paginación en listas largas
- [ ] Añadir búsqueda de usuarios por nombre/email (actualmente solo por ID)
- [ ] Implementar notificaciones en tiempo real (SignalR)
- [ ] Añadir tests unitarios e integración

---

## 📚 Tecnologías Utilizadas

**Frontend:**
- React 18
- React Router DOM
- Axios
- Vite
- SweetAlert2
- Lucide React (iconos)

**Backend:**
- .NET 8
- Entity Framework Core
- SQL Server LocalDB
- JWT Authentication
- Swagger/OpenAPI

---

¡El frontend y backend están completamente conectados! 🎉
