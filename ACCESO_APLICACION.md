# 🚀 Acceso a la Aplicación MiroFilm

## ✅ Estado Actual

Ambos servidores están corriendo:

### Backend (ASP.NET Core)
- **URL**: http://localhost:5285
- **API**: http://localhost:5285/api
- **Swagger**: http://localhost:5285/swagger
- **Estado**: ✅ Corriendo

### Frontend (React + Vite)
- **URL**: http://localhost:5173
- **Estado**: ✅ Corriendo

---

## 🌐 Acceder a la Aplicación

### 1. Abrir en el Navegador
```
http://localhost:5173
```

### 2. Pantalla de Login
Deberías ver la pantalla de login con:
- Campo de Email
- Campo de Contraseña
- Botón "Entrar"
- Opción "¿No tienes cuenta? Regístrate"

---

## 📝 Crear una Cuenta (Registro)

1. Haz clic en **"¿No tienes cuenta? Regístrate"**
2. Completa los campos:
   - **Nombre**: Tu nombre completo
   - **Email**: Tu email
   - **Contraseña**: Mínimo 8 caracteres, una mayúscula y un carácter especial (!@#$%&*.,)
   - **Confirmar Contraseña**: Repite la contraseña
3. Haz clic en **"Registrarse"**
4. Verás un mensaje de éxito
5. Automáticamente volverá a la pantalla de login

---

## 🔐 Iniciar Sesión

1. Ingresa tu **Email**
2. Ingresa tu **Contraseña**
3. Haz clic en **"Entrar"**
4. Si todo es correcto, serás redirigido a la página de inicio

---

## 🔗 URLs Útiles

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | http://localhost:5173 | Aplicación principal |
| Backend API | http://localhost:5285/api | API REST |
| Swagger | http://localhost:5285/swagger | Documentación de API |
| TMDb Search | http://localhost:5285/api/tmdb/search?q=Inception | Buscar películas |
| Películas Populares | http://localhost:5285/api/tmdb/popular | Películas populares |

---

## 🐛 Troubleshooting

### Error: "No se puede conectar con el servidor"

**Solución**:
1. Verifica que el backend está corriendo:
   ```bash
   # En otra terminal
   cd Backend
   dotnet run
   ```
2. Verifica que está en `http://localhost:5285`
3. Recarga la página del frontend (F5)

### Error: "Email o contraseña incorrectos"

**Solución**:
1. Verifica que escribiste correctamente el email y contraseña
2. Si es una cuenta nueva, primero debes registrarte
3. La contraseña debe tener:
   - Mínimo 8 caracteres
   - Una mayúscula
   - Un carácter especial (!@#$%&*.,)

### El login se queda pillado

**Solución**:
1. Abre la consola del navegador (F12)
2. Revisa si hay errores en la pestaña "Console"
3. Verifica que el backend está respondiendo:
   ```bash
   curl http://localhost:5285/api/auth/login
   ```
4. Si no responde, reinicia el backend

### CORS Error

**Solución**:
1. El backend ya tiene CORS habilitado
2. Si aún así tienes problemas, verifica que el backend está en `http://localhost:5285`
3. Recarga la página (Ctrl+Shift+R para limpiar caché)

---

## 📊 Procesos Activos

### Ver procesos en ejecución
```bash
# Backend
Get-Process | Where-Object {$_.ProcessName -like "*dotnet*"}

# Frontend
Get-Process | Where-Object {$_.ProcessName -like "*node*"}
```

### Detener procesos
```bash
# Backend (Ctrl+C en la terminal)
# Frontend (Ctrl+C en la terminal)
```

---

## 🔄 Reiniciar Aplicación

### Opción 1: Reiniciar ambos
```bash
# Terminal 1 - Backend
cd Backend
dotnet run

# Terminal 2 - Frontend
cd Frontend
npm run dev
```

### Opción 2: Limpiar y reiniciar
```bash
# Backend
cd Backend
dotnet clean
dotnet build
dotnet run

# Frontend
cd Frontend
npm install
npm run dev
```

---

## 📱 Características Disponibles

Una vez logueado, tendrás acceso a:

- ✅ **Inicio**: Dashboard principal
- ✅ **Películas**: Búsqueda y exploración
- ✅ **Favoritos**: Tus películas favoritas
- ✅ **Amigos**: Sistema de amistades
- ✅ **Perfil**: Tu perfil de usuario
- ✅ **Ajustes**: Configuración de la aplicación
- ✅ **Ayuda**: Información y soporte

---

## 🎬 Próximos Pasos

1. **Registra una cuenta** con tus datos
2. **Inicia sesión** con tu email y contraseña
3. **Explora películas** usando la búsqueda
4. **Añade favoritos** a tu lista
5. **Invita amigos** a unirse

---

## 📞 Soporte

Si tienes problemas:

1. Revisa la consola del navegador (F12)
2. Revisa los logs del backend
3. Verifica que ambos servidores están corriendo
4. Intenta limpiar el caché del navegador (Ctrl+Shift+R)
5. Reinicia ambos servidores

---

## 🎉 ¡Listo!

La aplicación está lista para usar. Accede a **http://localhost:5173** y comienza a explorar películas.

**Fecha**: 26 de Mayo de 2026
**Versión**: 1.0.0
**Estado**: ✅ Operacional
