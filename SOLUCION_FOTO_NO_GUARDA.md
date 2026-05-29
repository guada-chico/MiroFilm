# Solución: Foto de Perfil No Se Guarda 📸

## Problema Identificado

Cuando subes una foto de perfil, parece que se carga (ves la vista previa), pero cuando cierras sesión y vuelves a entrar, la foto no está guardada.

## Causas Posibles

### 1. Carpeta de uploads no existe
La carpeta `wwwroot/uploads/avatars` no existe en el servidor.

### 2. Permisos de escritura insuficientes
El servidor no tiene permisos para escribir en la carpeta.

### 3. URL incorrecta guardada
Se estaba guardando la URL local (data URL) en lugar de la URL del servidor.

## Soluciones Aplicadas

### 1. Frontend - Usar URL del servidor

**Archivo**: `Frontend/src/pages/perfil/Perfil.jsx`

Se cambió para guardar la URL retornada por el servidor:

```javascript
// Antes (❌ Incorrecto)
const response = await updateAvatar(file);
updateUser({ avatarUrl: reader.result }); // Guarda data URL local

// Después (✅ Correcto)
const response = await updateAvatar(file);
updateUser({ avatarUrl: response.avatarUrl }); // Guarda URL del servidor
```

### 2. Backend - Crear carpeta automáticamente

**Archivo**: `Backend/Controllers/UsersController.cs`

El código ya crea la carpeta si no existe:

```csharp
var uploadsDir = Path.Combine(_env.WebRootPath, "uploads", "avatars");
Directory.CreateDirectory(uploadsDir); // ← Crea la carpeta si no existe
```

## Verificación

Para verificar que funciona:

### Paso 1: Sube una foto
1. Ve a **Perfil**
2. Haz clic en el botón de cámara
3. Selecciona una imagen
4. Deberías ver: "Foto actualizada correctamente"

### Paso 2: Verifica que se guardó
1. Abre la consola del navegador (F12)
2. Ve a **Application** → **Local Storage**
3. Busca el token y verifica que sea válido

### Paso 3: Cierra sesión y vuelve a entrar
1. Haz clic en tu avatar en el navbar
2. Haz clic en "Cerrar sesión"
3. Inicia sesión de nuevo
4. **Verifica que la foto siga ahí**

### Paso 4: Verifica en Amigos
1. Ve a **Amigos**
2. Busca a un amigo
3. Deberías ver tu foto en los resultados

## Estructura de Carpetas Requerida

```
Backend/
├── wwwroot/
│   └── uploads/
│       └── avatars/
│           ├── 1_guid1.jpg
│           ├── 2_guid2.png
│           └── ...
```

Si la carpeta no existe, el backend la crea automáticamente.

## Flujo de Guardado Correcto

### Antes (❌ Incorrecto)
```
Usuario sube foto
    ↓
Frontend: Crea data URL local
    ↓
Backend: Guarda archivo en servidor
    ↓
Backend: Retorna URL del servidor
    ↓
Frontend: Guarda data URL local en contexto (INCORRECTO)
    ↓
Cierra sesión
    ↓
Inicia sesión
    ↓
Data URL local no existe → No muestra foto
```

### Después (✅ Correcto)
```
Usuario sube foto
    ↓
Frontend: Crea data URL local (para vista previa)
    ↓
Backend: Guarda archivo en servidor
    ↓
Backend: Retorna URL del servidor
    ↓
Frontend: Guarda URL del servidor en contexto (CORRECTO)
    ↓
Cierra sesión
    ↓
Inicia sesión
    ↓
URL del servidor existe → Muestra foto
```

## Datos Guardados en Base de Datos

```
User
├── Id: 1
├── Name: "Juan"
├── Email: "juan@test.com"
├── PasswordHash: "bcrypt_hash"
└── AvatarUrl: "/uploads/avatars/1_guid.jpg" ← URL del servidor
```

## Archivos Guardados en Servidor

```
wwwroot/uploads/avatars/
├── 1_guid1.jpg
├── 1_guid2.jpg (si cambias la foto)
├── 2_guid3.png
└── ...
```

## Notas Técnicas

### Validaciones Implementadas

- ✅ Solo se aceptan imágenes (jpg, png, gif)
- ✅ Se valida el tipo de archivo
- ✅ Se genera nombre único para evitar conflictos
- ✅ Se crea la carpeta si no existe
- ✅ Se guarda la URL en la base de datos

### Nombres de Archivo

```
{userId}_{Guid}.{extension}

Ejemplo: 1_a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg
```

Esto asegura que:
- Cada usuario tiene sus propias fotos
- No hay conflictos de nombres
- Es fácil identificar a qué usuario pertenece

## Próximas Mejoras

- [ ] Comprimir imágenes antes de guardar
- [ ] Generar thumbnails
- [ ] Limpiar fotos antiguas cuando se cambia
- [ ] Validar tamaño máximo de archivo
- [ ] Agregar progreso de carga

## Soporte

Si la foto aún no se guarda:

1. Verifica que la carpeta `wwwroot/uploads/avatars` exista
2. Verifica que el servidor tenga permisos de escritura
3. Revisa la consola del navegador (F12) para errores
4. Revisa los logs del backend
5. Verifica que el archivo sea una imagen válida

---

**Solución Aplicada**: 29 de Mayo de 2026  
**Estado**: ✅ Completado
