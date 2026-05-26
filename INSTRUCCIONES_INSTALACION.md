# 📋 Instrucciones de Instalación y Ejecución

## Requisitos Previos

- ✅ .NET 8.0 SDK instalado
- ✅ SQL Server LocalDB instalado
- ✅ Visual Studio Code o Visual Studio 2022
- ✅ Git (opcional)

---

## 1. Preparación del Proyecto

### 1.1 Abrir Terminal
```bash
# Navegar a la carpeta del Backend
cd c:\Users\guadalupe.fernandez\source\repos\MiroFilm\Backend
```

### 1.2 Restaurar Dependencias
```bash
dotnet restore
```

---

## 2. Configuración de la Base de Datos

### 2.1 Verificar Conexión
La conexión a SQL Server LocalDB ya está configurada en `appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=MiroDB;Trusted_Connection=True;MultipleActiveResultSets=true"
}
```

### 2.2 Aplicar Migraciones (si es necesario)
```bash
# Aplicar todas las migraciones
dotnet ef database update

# Ver estado de migraciones
dotnet ef migrations list
```

**Nota**: Las migraciones ya han sido aplicadas. Este paso es solo si necesitas reiniciar la BD.

---

## 3. Compilación

### 3.1 Compilación en Debug
```bash
dotnet build
```

### 3.2 Compilación en Release
```bash
dotnet build --configuration Release
```

**Resultado esperado**:
```
✅ Compilación correcta
✅ 0 errores
✅ 5 advertencias (no críticas)
```

---

## 4. Ejecución

### 4.1 Ejecutar en Modo Debug
```bash
dotnet run
```

### 4.2 Ejecutar en Modo Release
```bash
dotnet run --configuration Release
```

**Salida esperada**:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:5001
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to exit.
```

---

## 5. Acceso a la Aplicación

### 5.1 Swagger UI
```
https://localhost:5001/swagger
```

### 5.2 API Base URL
```
https://localhost:5001/api
```

### 5.3 Endpoints Principales

#### Buscar Películas
```bash
curl -X GET "https://localhost:5001/api/tmdb/search?q=Inception" \
  -H "accept: application/json"
```

#### Películas Populares
```bash
curl -X GET "https://localhost:5001/api/tmdb/popular?page=1" \
  -H "accept: application/json"
```

#### Obtener Películas Locales
```bash
curl -X GET "https://localhost:5001/api/movies" \
  -H "accept: application/json"
```

---

## 6. Pruebas con Postman o Insomnia

### 6.1 Importar Colección
1. Abrir Postman/Insomnia
2. Importar archivo: `Backend/Miro_Movies.http`
3. Ejecutar requests

### 6.2 Ejemplo de Request
```
GET https://localhost:5001/api/tmdb/search?q=Inception
Accept: application/json
```

---

## 7. Pruebas con VS Code REST Client

### 7.1 Instalar Extensión
- Extensión: "REST Client" (Huachao Mao)

### 7.2 Usar Archivo HTTP
1. Abrir: `Backend/Miro_Movies.http`
2. Hacer clic en "Send Request" sobre cada endpoint

---

## 8. Troubleshooting

### 8.1 Error: "Cannot connect to database"
```bash
# Verificar que LocalDB está corriendo
sqllocaldb info

# Iniciar LocalDB si es necesario
sqllocaldb start mssqllocaldb
```

### 8.2 Error: "Port 5001 already in use"
```bash
# Cambiar puerto en launchSettings.json
# O matar proceso en el puerto
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

### 8.3 Error: "TMDb API key not configured"
- Verificar que `appsettings.json` tiene la API key correcta
- Reiniciar la aplicación

### 8.4 Error: "Migrations pending"
```bash
# Aplicar migraciones
dotnet ef database update
```

---

## 9. Desarrollo

### 9.1 Crear Nueva Migración
```bash
dotnet ef migrations add NombreMigracion
```

### 9.2 Revertir Última Migración
```bash
dotnet ef migrations remove
```

### 9.3 Actualizar BD
```bash
dotnet ef database update
```

---

## 10. Compilación para Producción

### 10.1 Publicar Aplicación
```bash
dotnet publish -c Release -o ./publish
```

### 10.2 Ejecutar desde Publicación
```bash
cd publish
dotnet Miro.dll
```

---

## 11. Variables de Entorno (Opcional)

### 11.1 Crear archivo .env
```
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=https://localhost:5001
```

### 11.2 Usar en Ejecución
```bash
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet run
```

---

## 12. Verificación de Instalación

### 12.1 Checklist
- [ ] .NET 8.0 SDK instalado: `dotnet --version`
- [ ] Proyecto restaurado: `dotnet restore`
- [ ] Compilación exitosa: `dotnet build`
- [ ] BD actualizada: `dotnet ef database update`
- [ ] Aplicación ejecutándose: `dotnet run`
- [ ] Swagger accesible: `https://localhost:5001/swagger`
- [ ] Endpoints respondiendo: `GET /api/tmdb/popular`

---

## 13. Estructura de Carpetas Esperada

```
MiroFilm/
├── Backend/
│   ├── Controllers/
│   ├── Models/
│   ├── Services/
│   ├── Data/
│   ├── Migrations/
│   ├── Dto/
│   ├── Properties/
│   ├── bin/
│   ├── obj/
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   ├── Program.cs
│   ├── Miro.csproj
│   ├── Miro.http
│   ├── Miro_Movies.http
│   └── Miro.slnx
├── TRANSFORMACION_PELICULAS.md
├── GUIA_RAPIDA_PELICULAS.md
├── ARQUITECTURA_PELICULAS.md
├── README_PELICULAS.md
├── RESUMEN_TRANSFORMACION.txt
└── INSTRUCCIONES_INSTALACION.md
```

---

## 14. Comandos Útiles

### 14.1 Limpiar Proyecto
```bash
dotnet clean
```

### 14.2 Restaurar Dependencias
```bash
dotnet restore
```

### 14.3 Ver Versión de .NET
```bash
dotnet --version
```

### 14.4 Ver Información del Proyecto
```bash
dotnet project-info
```

### 14.5 Ejecutar Tests (si existen)
```bash
dotnet test
```

---

## 15. Configuración de Desarrollo

### 15.1 Usar appsettings.Development.json
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Debug"
    }
  }
}
```

### 15.2 Habilitar Hot Reload
```bash
dotnet watch run
```

---

## 16. Debugging

### 16.1 Usar Visual Studio Code
1. Instalar extensión: "C# Dev Kit"
2. Presionar F5 para iniciar debugging
3. Establecer breakpoints

### 16.2 Usar Visual Studio 2022
1. Abrir solución: `Backend/Miro.slnx`
2. Presionar F5 para iniciar debugging
3. Establecer breakpoints

---

## 17. Logs y Diagnóstico

### 17.1 Ver Logs en Consola
```bash
# Ya habilitado en appsettings.json
# Nivel: Information
```

### 17.2 Aumentar Verbosidad
```json
"Logging": {
  "LogLevel": {
    "Default": "Debug",
    "Microsoft.EntityFrameworkCore": "Debug"
  }
}
```

---

## 18. Seguridad

### 18.1 Cambiar JWT Key
En `appsettings.json`:
```json
"Jwt": {
  "Key": "TU_NUEVA_CLAVE_SUPER_SECRETA_AQUI",
  "Issuer": "MiroAPI",
  "Audience": "MiroApp"
}
```

### 18.2 Usar Secrets Manager (Recomendado)
```bash
# Inicializar secrets
dotnet user-secrets init

# Establecer secret
dotnet user-secrets set "Jwt:Key" "tu-clave-secreta"

# Ver secrets
dotnet user-secrets list
```

---

## 19. Performance

### 19.1 Compilación Rápida
```bash
dotnet build --no-restore
```

### 19.2 Ejecución Optimizada
```bash
dotnet run --configuration Release --no-build
```

---

## 20. Soporte y Ayuda

### 20.1 Documentación
- `TRANSFORMACION_PELICULAS.md` - Documentación técnica
- `GUIA_RAPIDA_PELICULAS.md` - Guía de uso
- `ARQUITECTURA_PELICULAS.md` - Arquitectura

### 20.2 Recursos Útiles
- [Documentación de .NET](https://docs.microsoft.com/dotnet)
- [Entity Framework Core](https://docs.microsoft.com/ef/core)
- [ASP.NET Core](https://docs.microsoft.com/aspnet/core)
- [TMDb API](https://www.themoviedb.org/settings/api)

---

## Resumen Rápido

```bash
# 1. Navegar a Backend
cd Backend

# 2. Restaurar dependencias
dotnet restore

# 3. Compilar
dotnet build

# 4. Ejecutar
dotnet run

# 5. Acceder a Swagger
# https://localhost:5001/swagger
```

---

**¡Listo!** La aplicación está lista para usar. 🚀
