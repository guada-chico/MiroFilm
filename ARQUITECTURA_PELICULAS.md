# 🏗️ Arquitectura de MiroFilm - Películas

## Diagrama General

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (React)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    HTTP/HTTPS (REST API)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    ASP.NET Core 8.0 API                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    CONTROLADORES                         │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │ TmdbController│  │MoviesController│ │WatchingStatus│   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │MovieFavorites│  │AuthController│  │UsersController│   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                   │
│  ┌──────────────────────────▼──────────────────────────────┐  │
│  │                    SERVICIOS                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │ TmdbService  │  │ BookService  │  │AuthService   │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │FavoritesServ.│  │FriendshipServ│  │NotificationS.│   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                   │
│  ┌──────────────────────────▼──────────────────────────────┐  │
│  │                  ENTITY FRAMEWORK CORE                  │  │
│  │                    (ORM - Data Layer)                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                   │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
    ┌───────────▼──────────┐    ┌──────────▼──────────┐
    │   SQL Server (BD)    │    │   TMDb API (REST)   │
    │                      │    │                     │
    │  ┌────────────────┐  │    │  ┌───────────────┐  │
    │  │ Users          │  │    │  │ /search       │  │
    │  │ Books          │  │    │  │ /popular      │  │
    │  │ Movies         │  │    │  │ /top_rated    │  │
    │  │ Favorites      │  │    │  │ /upcoming     │  │
    │  │ ReadingStatus  │  │    │  │ /now_playing  │  │
    │  │ WatchingStatus │  │    │  │ /discover     │  │
    │  │ Friendships    │  │    │  │ /movie/{id}   │  │
    │  │ Notifications  │  │    │  └───────────────┘  │
    │  └────────────────┘  │    │                     │
    └──────────────────────┘    └─────────────────────┘
```

---

## Flujo de Datos

### 1. Búsqueda de Películas (TMDb)

```
Cliente
   │
   ├─ GET /api/tmdb/search?q=Inception
   │
   ▼
TmdbController
   │
   ├─ Valida parámetros
   │
   ▼
TmdbService
   │
   ├─ Construye URL: https://api.themoviedb.org/3/search/movie
   ├─ Añade API key
   ├─ Realiza HttpClient.GetAsync()
   │
   ▼
TMDb API (Externa)
   │
   ├─ Procesa búsqueda
   ├─ Retorna JSON con películas
   │
   ▼
TmdbService
   │
   ├─ Parsea JSON
   ├─ Mapea a objetos Movie
   ├─ Construye URLs de imágenes
   │
   ▼
TmdbController
   │
   ├─ Retorna Ok(movies)
   │
   ▼
Cliente (JSON)
```

### 2. Crear Estado de Visualización

```
Cliente
   │
   ├─ POST /api/watchingstatus
   ├─ Body: { userId, movieId, status, currentMinute }
   │
   ▼
WatchingStatusController
   │
   ├─ Valida datos
   ├─ Verifica que userId y movieId sean válidos
   │
   ▼
AppDbContext
   │
   ├─ Busca si ya existe WatchingStatus
   │
   ▼
Si existe:
   ├─ Actualiza Status y CurrentMinute
   │
Si no existe:
   ├─ Crea nuevo WatchingStatus
   │
   ▼
SQL Server
   │
   ├─ INSERT o UPDATE en tabla WatchingStatuses
   │
   ▼
WatchingStatusController
   │
   ├─ Retorna CreatedAtAction o Ok
   │
   ▼
Cliente (JSON con WatchingStatus)
```

### 3. Actualizar Progreso

```
Cliente
   │
   ├─ PUT /api/watchingstatus/1/progress
   ├─ Body: { currentMinute, status }
   │
   ▼
WatchingStatusController
   │
   ├─ Busca WatchingStatus por ID
   │
   ▼
AppDbContext
   │
   ├─ SELECT * FROM WatchingStatuses WHERE Id = 1
   │
   ▼
SQL Server
   │
   ├─ Retorna registro
   │
   ▼
WatchingStatusController
   │
   ├─ Actualiza CurrentMinute
   ├─ Calcula ProgressPercentage (automático)
   │
   ▼
AppDbContext
   │
   ├─ UPDATE WatchingStatuses SET CurrentMinute = X
   │
   ▼
SQL Server
   │
   ├─ Actualiza registro
   │
   ▼
WatchingStatusController
   │
   ├─ Retorna Ok(watchingStatus)
   │
   ▼
Cliente (JSON con progreso actualizado)
```

---

## Estructura de Capas

```
┌─────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                     │
│  (Controllers: TmdbController, MoviesController, etc.)  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  BUSINESS LOGIC LAYER                   │
│  (Services: TmdbService, BookService, etc.)             │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  DATA ACCESS LAYER                      │
│  (Entity Framework Core, AppDbContext)                  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  DATABASE LAYER                         │
│  (SQL Server, LocalDB)                                  │
└─────────────────────────────────────────────────────────┘
```

---

## Modelos de Datos y Relaciones

```
┌─────────────────────────────────────────────────────────┐
│                      USER                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Id (PK)                                          │  │
│  │ Name                                             │  │
│  │ Email                                            │  │
│  │ PasswordHash                                     │  │
│  │ AvatarUrl                                        │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────┬──────────────────────────────────────┘
                 │
        ┌────────┴────────┬──────────────┬──────────────┐
        │                 │              │              │
        ▼                 ▼              ▼              ▼
    ┌────────┐      ┌──────────┐  ┌──────────┐  ┌──────────┐
    │FAVORITE│      │FRIENDSHIP│  │WATCHING  │  │READING   │
    │        │      │          │  │STATUS    │  │STATUS    │
    │UserId  │      │UserReqId │  │UserId    │  │UserId    │
    │MovieId │      │UserRecId │  │MovieId   │  │BookId    │
    │BookId  │      │Status    │  │Status    │  │Status    │
    └────┬───┘      └──────────┘  │CurrentMin│  │CurrentPg │
         │                         └────┬────┘  └────┬─────┘
         │                              │            │
    ┌────▼────┐                    ┌────▼────┐  ┌───▼──────┐
    │  MOVIE  │                    │  MOVIE  │  │  BOOK    │
    │         │                    │         │  │          │
    │ Id (PK) │                    │ Id (PK) │  │ Id (PK)  │
    │ TmdbId  │                    │ TmdbId  │  │ Title    │
    │ Title   │                    │ Title   │  │ Author   │
    │ Director│                    │ Director│  │ Isbn     │
    │ Plot    │                    │ Plot    │  │ Synopsis │
    │ Duration│                    │ Duration│  │ ImageUrl │
    │ Genre   │                    │ Genre   │  │ TotalPgs │
    │ Rating  │                    │ Rating  │  │ Category │
    │ Release │                    │ Release │  └──────────┘
    │ Language│                    │ Language│
    └────────┘                     └────────┘

    ┌──────────────┐
    │NOTIFICATION  │
    │              │
    │ Id (PK)      │
    │ UserId (FK)  │
    │ Message      │
    │ IsRead       │
    │ CreatedAt    │
    └──────────────┘
```

---

## Flujo de Autenticación

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE                              │
│  POST /api/auth/login                                   │
│  { email, password }                                    │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              AuthController                             │
│  ├─ Valida credenciales                                │
│  ├─ Busca usuario en BD                                │
│  ├─ Verifica contraseña con BCrypt                     │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              AuthService                                │
│  ├─ Genera JWT Token                                   │
│  ├─ Firma con clave secreta                            │
│  ├─ Incluye claims (userId, email)                     │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              CLIENTE                                    │
│  Recibe: { token, user }                               │
│  Almacena token en localStorage                        │
└─────────────────────────────────────────────────────────┘
                     │
                     │ (Próximas requests)
                     │
┌────────────────────▼────────────────────────────────────┐
│              CLIENTE                                    │
│  GET /api/movies                                        │
│  Header: Authorization: Bearer {token}                 │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│          JWT Middleware                                 │
│  ├─ Extrae token del header                            │
│  ├─ Valida firma                                       │
│  ├─ Valida expiración                                  │
│  ├─ Extrae claims                                      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│          MoviesController                               │
│  ├─ Acceso permitido                                   │
│  ├─ Procesa request                                    │
└─────────────────────────────────────────────────────────┘
```

---

## Integración con TMDb API

```
┌──────────────────────────────────────────────────────────┐
│                  TmdbService                             │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Constructor                                        │ │
│  │ ├─ Lee ApiKey de appsettings.json                 │ │
│  │ ├─ Lee BaseUrl (https://api.themoviedb.org/3)    │ │
│  │ ├─ Inyecta HttpClient                            │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ SearchMoviesAsync(query)                           │ │
│  │ ├─ URL: /search/movie?api_key=X&query=Y          │ │
│  │ ├─ HttpClient.GetAsync()                         │ │
│  │ ├─ JsonDocument.Parse()                          │ │
│  │ ├─ ParseMovies()                                 │ │
│  │ └─ Retorna List<Movie>                           │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ GetPopularMoviesAsync(page)                        │ │
│  │ ├─ URL: /movie/popular?api_key=X&page=Y          │ │
│  │ ├─ Similar a SearchMoviesAsync                   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ GetMovieDetailsAsync(tmdbId)                       │ │
│  │ ├─ URL: /movie/{id}?api_key=X                    │ │
│  │ ├─ Obtiene detalles completos                    │ │
│  │ ├─ Parsea géneros                                │ │
│  │ └─ Retorna Movie con todos los datos             │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ ParseMovies(JsonElement)                           │ │
│  │ ├─ Itera sobre array de películas                │ │
│  │ ├─ Mapea propiedades JSON a Movie                │ │
│  │ ├─ Construye URLs de imágenes                    │ │
│  │ └─ Retorna List<Movie>                           │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
                          │
                          │ HttpClient
                          │
                          ▼
        ┌─────────────────────────────────────┐
        │   TMDb API (api.themoviedb.org)     │
        │                                     │
        │  Endpoints:                         │
        │  ├─ /search/movie                   │
        │  ├─ /movie/popular                  │
        │  ├─ /movie/top_rated                │
        │  ├─ /movie/upcoming                 │
        │  ├─ /movie/now_playing              │
        │  ├─ /discover/movie                 │
        │  └─ /movie/{id}                     │
        │                                     │
        │  Retorna: JSON con películas        │
        └─────────────────────────────────────┘
```

---

## Inyección de Dependencias

```
Program.cs
│
├─ DbContext
│  └─ AddDbContext<AppDbContext>()
│
├─ Servicios Scoped
│  ├─ IAuthService → AuthService
│  ├─ IBookService → BookService
│  ├─ IFavoritesService → FavoritesService
│  ├─ IFriendshipService → FriendshipService
│  ├─ INotificationService → NotificationService
│  ├─ IReadingService → ReadingService
│  └─ IRecommendationService → RecommendationService
│
├─ Servicios HttpClient
│  ├─ IGoogleBookService → GoogleBookService
│  ├─ IOpenLibraryService → OpenLibraryService
│  ├─ IGutendexService → GutendexService
│  ├─ INytBooksService → NytBooksService
│  ├─ IPrhBooksService → PrhBooksService
│  └─ ITmdbService → TmdbService ◄── NUEVO
│
├─ Autenticación JWT
│  ├─ AddAuthentication(JwtBearerDefaults)
│  └─ AddJwtBearer(options)
│
├─ CORS
│  └─ AddCors("AllowReact")
│
└─ Swagger
   └─ AddSwaggerGen()
```

---

## Ciclo de Vida de una Request

```
1. Cliente envía request HTTP
   │
   ├─ GET /api/tmdb/search?q=Inception
   ├─ Headers: Authorization: Bearer {token}
   │
   ▼
2. Middleware de CORS
   ├─ Valida origen
   │
   ▼
3. Middleware de Autenticación
   ├─ Valida JWT token
   ├─ Extrae claims
   │
   ▼
4. Routing
   ├─ Mapea a TmdbController.Search()
   │
   ▼
5. Model Binding
   ├─ Extrae parámetros de query
   │
   ▼
6. Validación
   ├─ Valida que q no esté vacío
   │
   ▼
7. Ejecución del Controlador
   ├─ Llama a TmdbService.SearchMoviesAsync()
   │
   ▼
8. Ejecución del Servicio
   ├─ Construye URL
   ├─ Realiza HttpClient.GetAsync()
   ├─ Parsea respuesta JSON
   │
   ▼
9. Retorno de Datos
   ├─ Controlador retorna Ok(movies)
   │
   ▼
10. Serialización JSON
    ├─ Convierte objetos a JSON
    │
    ▼
11. Response HTTP
    ├─ Status: 200 OK
    ├─ Body: JSON con películas
    │
    ▼
12. Cliente recibe respuesta
```

---

## Manejo de Errores

```
TmdbService
│
├─ try
│  ├─ HttpClient.GetAsync()
│  ├─ JsonDocument.Parse()
│  ├─ ParseMovies()
│  │
│  └─ return List<Movie>
│
└─ catch (Exception ex)
   ├─ Console.WriteLine(ex.Message)
   ├─ return Enumerable.Empty<Movie>()
   │
   └─ Controlador retorna Ok([])
      (Lista vacía en lugar de error)
```

---

## Configuración de Seguridad

```
appsettings.json
│
├─ JWT
│  ├─ Key: "MI_CLAVE_SUPER_SECRETA_123_DEBE_SER_LARGA"
│  ├─ Issuer: "MiroAPI"
│  └─ Audience: "MiroApp"
│
├─ TmdbApi
│  ├─ ApiKey: "3318becdeb4e8f0ae00703986f0ad43f"
│  ├─ AccessToken: "eyJhbGciOiJIUzI1NiJ9..."
│  └─ BaseUrl: "https://api.themoviedb.org/3"
│
└─ ConnectionStrings
   └─ DefaultConnection: "Server=(localdb)\\mssqllocaldb;..."
```

---

## Resumen de Componentes

| Componente | Tipo | Responsabilidad |
|-----------|------|-----------------|
| TmdbController | Controller | Exponer endpoints de TMDb |
| MoviesController | Controller | CRUD de películas locales |
| WatchingStatusController | Controller | Gestionar visualización |
| MovieFavoritesController | Controller | Gestionar favoritos |
| TmdbService | Service | Integración con TMDb API |
| AppDbContext | DbContext | Acceso a datos |
| Movie | Model | Entidad de película |
| WatchingStatus | Model | Entidad de visualización |
| Favorite | Model | Entidad de favoritos |

---

**Arquitectura Completada**: ✅
**Compilación**: ✅
**Migraciones**: ✅
**Servicios**: ✅
