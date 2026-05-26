# Guía Rápida: MiroFilm - Películas

## 🎬 ¿Qué cambió?

| Aspecto | Antes (Libros) | Ahora (Películas) |
|--------|---|---|
| **Modelo Principal** | `Book` | `Movie` |
| **Seguimiento** | `ReadingStatus` (páginas) | `WatchingStatus` (minutos) |
| **API Externa** | Gutendex, NYT, PRH | **TMDb** |
| **Duración** | `TotalPages` | `Duration` (minutos) |
| **Autor** | `Author` | `Director` |
| **Progreso** | Páginas leídas | Minutos vistos |

---

## 🚀 Endpoints Principales

### 1. Buscar Películas (TMDb)
```bash
GET /api/tmdb/search?q=Inception
```
**Respuesta:**
```json
[
  {
    "id": 27205,
    "tmdbId": 27205,
    "title": "Inception",
    "director": null,
    "plot": "Cobb, a skilled thief...",
    "posterUrl": "https://image.tmdb.org/t/p/w500/...",
    "duration": 0,
    "genre": null,
    "rating": 8.8,
    "releaseDate": "2010-07-16"
  }
]
```

### 2. Películas Populares
```bash
GET /api/tmdb/popular?page=1
```

### 3. Películas Mejor Calificadas
```bash
GET /api/tmdb/top-rated?page=1
```

### 4. Próximos Estrenos
```bash
GET /api/tmdb/upcoming?page=1
```

### 5. Películas en Cines
```bash
GET /api/tmdb/now-playing?page=1
```

### 6. Por Género
```bash
GET /api/tmdb/genre/28?page=1  # 28 = Acción
```

### 7. Detalles de Película
```bash
GET /api/tmdb/278  # 278 = Shawshank Redemption
```

---

## 📽️ Gestión de Películas Locales

### Obtener todas
```bash
GET /api/movies
```

### Crear película
```bash
POST /api/movies
Content-Type: application/json

{
  "tmdbId": 550,
  "title": "Fight Club",
  "director": "David Fincher",
  "plot": "An insomniac office worker...",
  "posterUrl": "https://...",
  "duration": 139,
  "genre": "Drama, Thriller",
  "rating": 8.8,
  "releaseDate": "1999-10-15"
}
```

### Actualizar película
```bash
PUT /api/movies/1
```

### Eliminar película
```bash
DELETE /api/movies/1
```

---

## 👁️ Seguimiento de Visualización

### Crear estado de visualización
```bash
POST /api/watchingstatus
Content-Type: application/json

{
  "userId": 1,
  "movieId": 1,
  "status": "Viendo",
  "currentMinute": 45
}
```

**Estados disponibles:**
- `Pendiente` - No ha empezado
- `Viendo` - En progreso
- `Completada` - Terminada

### Actualizar progreso
```bash
PUT /api/watchingstatus/1/progress
Content-Type: application/json

{
  "currentMinute": 90,
  "status": "Viendo"
}
```

### Obtener películas del usuario
```bash
GET /api/watchingstatus/user/1
```

---

## ⭐ Películas Favoritas

### Añadir a favoritos
```bash
POST /api/moviefavorites
Content-Type: application/json

{
  "userId": 1,
  "movieId": 1
}
```

### Obtener favoritas del usuario
```bash
GET /api/moviefavorites/user/1
```

### Verificar si es favorita
```bash
GET /api/moviefavorites/user/1/movie/1
```

### Eliminar de favoritos
```bash
DELETE /api/moviefavorites/user/1/movie/1
```

---

## 🎯 Géneros TMDb (IDs)

| ID | Género |
|----|--------|
| 28 | Acción |
| 12 | Aventura |
| 16 | Animación |
| 35 | Comedia |
| 80 | Crimen |
| 18 | Drama |
| 27 | Terror |
| 878 | Ciencia Ficción |
| 53 | Thriller |
| 10749 | Romance |

---

## 📊 Estructura de Datos

### Movie
```csharp
{
  "id": 1,                    // ID local
  "tmdbId": 278,              // ID de TMDb
  "title": "The Shawshank...",
  "director": "Frank Darabont",
  "plot": "Two imprisoned men...",
  "posterUrl": "https://...",
  "backdropUrl": "https://...",
  "duration": 142,            // minutos
  "genre": "Drama",
  "rating": 9.3,              // 0-10
  "releaseDate": "1994-10-14",
  "language": "en"
}
```

### WatchingStatus
```csharp
{
  "id": 1,
  "userId": 1,
  "movieId": 1,
  "status": "Viendo",
  "currentMinute": 45,
  "progressPercentage": 31    // calculado
}
```

### Favorite
```csharp
{
  "id": 1,
  "userId": 1,
  "movieId": 1,               // o BookId para libros
  "movie": { ... }            // objeto completo
}
```

---

## 🔧 Configuración

### appsettings.json
```json
{
  "TmdbApi": {
    "ApiKey": "3318becdeb4e8f0ae00703986f0ad43f",
    "AccessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "BaseUrl": "https://api.themoviedb.org/3"
  }
}
```

---

## 📝 Ejemplos de Uso

### Flujo Completo: Usuario ve una película

1. **Buscar película**
   ```bash
   GET /api/tmdb/search?q=Inception
   ```

2. **Crear estado de visualización**
   ```bash
   POST /api/watchingstatus
   {
     "userId": 1,
     "movieId": 1,
     "status": "Viendo",
     "currentMinute": 0
   }
   ```

3. **Actualizar progreso (cada 5 minutos)**
   ```bash
   PUT /api/watchingstatus/1/progress
   {
     "currentMinute": 45
   }
   ```

4. **Marcar como completada**
   ```bash
   PUT /api/watchingstatus/1/progress
   {
     "currentMinute": 148,
     "status": "Completada"
   }
   ```

5. **Añadir a favoritos**
   ```bash
   POST /api/moviefavorites
   {
     "userId": 1,
     "movieId": 1
   }
   ```

---

## 🐛 Troubleshooting

### Error: "TMDb API key not configured"
- Verificar que `appsettings.json` tiene la API key correcta
- Reiniciar la aplicación

### Error: "Column names in each table must be unique"
- Migración ya aplicada correctamente
- Verificar estado de la BD con: `dotnet ef database update`

### Películas sin imágenes
- Las URLs de TMDb pueden estar vacías
- Usar URL por defecto como fallback

---

## 📚 Archivos Importantes

- `Models/Movie.cs` - Modelo de película
- `Models/WatchingStatus.cs` - Seguimiento de visualización
- `Services/TmdbService.cs` - Integración con TMDb
- `Controllers/TmdbController.cs` - Endpoints de TMDb
- `Controllers/MoviesController.cs` - Gestión local
- `Controllers/WatchingStatusController.cs` - Seguimiento
- `Controllers/MovieFavoritesController.cs` - Favoritos
- `Miro_Movies.http` - Ejemplos de requests

---

## ✅ Checklist de Implementación

- [x] Modelo Movie creado
- [x] Modelo WatchingStatus creado
- [x] Servicio TMDb implementado
- [x] Controladores creados
- [x] Migración aplicada
- [x] Seed data insertado
- [x] Compilación exitosa
- [ ] Frontend actualizado (próximo paso)
- [ ] Tests unitarios (próximo paso)
- [ ] Documentación Swagger (próximo paso)

---

## 🎓 Próximos Pasos

1. **Frontend**: Actualizar componentes React
2. **Caché**: Implementar Redis para TMDb
3. **Validación**: Agregar FluentValidation
4. **Tests**: Crear tests unitarios
5. **Documentación**: Completar Swagger
6. **Recomendaciones**: Adaptar algoritmo para películas
