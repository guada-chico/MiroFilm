# 🔧 Solución: ReferenceError: process is not defined

## ❌ Problema

El navegador mostraba el error:
```
Uncaught ReferenceError: process is not defined
at api-config.js:5:17
```

## 🔍 Causa

En Vite (a diferencia de Webpack), no se puede usar `process.env` directamente en el código del cliente. Vite proporciona `import.meta.env` para acceder a las variables de entorno.

## ✅ Solución Aplicada

### Cambio en `Frontend/src/services/api-config.js`

**Antes:**
```javascript
const API_URL = process.env.VITE_API_URL || 'http://localhost:5285/api';
```

**Después:**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5285/api';
```

## 🚀 Resultado

✅ Error resuelto
✅ Variables de entorno cargadas correctamente
✅ Frontend conecta con el backend

## 📝 Explicación

En Vite:
- `import.meta.env.VITE_*` - Accede a variables de entorno prefijadas con `VITE_`
- Las variables deben estar en archivos `.env` o `.env.production`
- Vite reemplaza estas variables en tiempo de compilación

## 🔗 Archivos Modificados

- ✅ `Frontend/src/services/api-config.js` - Cambio de `process.env` a `import.meta.env`

## 📊 Variables de Entorno Configuradas

En `Frontend/.env`:
```
VITE_API_URL=http://localhost:5285/api
```

En `Frontend/.env.production`:
```
VITE_API_URL=https://api.mirofilm.com/api
```

## 🎉 ¡Listo!

El error está resuelto. Recarga la página en el navegador y la aplicación debería funcionar correctamente.
