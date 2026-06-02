# 🧪 Cómo Testear el Chatbot

## Opción 1: Test Automático (Recomendado)

### Paso 1: Importa el componente de test
En cualquier página donde quieras testear (ej: `Ayuda.jsx`), añade:

```jsx
import ChatTest from '../../components/ChatTest';

// En el JSX:
<ChatTest />
```

### Paso 2: Abre la consola (F12)
- Presiona `F12` en Chrome/Firefox
- Ve a la pestaña "Console"

### Paso 3: Usa el componente
- Escribe un mensaje en el input
- Haz clic en "Enviar"
- Mira los logs en la consola

Deberías ver algo como:
```
🔑 Token: Existe ✓
📤 Enviando mensaje: ¿Cómo añado una película?
📊 Response Status: 200
✅ Respuesta recibida: {response: "Para añadir una película..."}
```

---

## Opción 2: Test Manual en Swagger

### Paso 1: Abre Swagger
- URL: `https://localhost:7292/swagger` (ajusta el puerto si es diferente)

### Paso 2: Busca "Chat"
- Debería haber una sección "Chat"
- Expande `POST /api/chat`

### Paso 3: Autoriza
- Haz clic en el botón "Authorize" (arriba a la derecha)
- Pega tu token JWT completo (sin "Bearer")
- Ejemplo: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Haz clic en "Authorize"

### Paso 4: Prueba
- Haz clic en "Try it out"
- En el campo `body`, escribe:
```json
{
  "message": "¿Cómo añado una película a favoritos?",
  "conversationHistory": []
}
```
- Haz clic en "Execute"
- Deberías ver:
  - Response code: 200
  - Response body con tu respuesta

---

## Opción 3: Test con Curl (Terminal)

Abre terminal y ejecuta:

```bash
# Primero obtén tu token (guárdalo de un login anterior)
TOKEN="tu_token_jwt_aqui"

curl -X POST https://localhost:7292/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "¿Cómo añado una película a favoritos?",
    "conversationHistory": []
  }'
```

Deberías recibir:
```json
{
  "response": "Para añadir una película a tus favoritos..."
}
```

---

## Opción 4: Test con Postman

1. Descarga Postman si no lo tienes
2. Crea una nueva petición POST
3. URL: `https://localhost:7292/api/chat`
4. Tab "Headers":
   - Key: `Authorization`
   - Value: `Bearer [tu_token]`
   - Key: `Content-Type`
   - Value: `application/json`
5. Tab "Body" → Raw → JSON:
```json
{
  "message": "¿Cómo funciona el chatbot?",
  "conversationHistory": []
}
```
6. Haz clic en "Send"

---

## 🔍 Debugging: Qué Significa Cada Log

### ✅ Todo Funciona
```
🔑 Token: Existe ✓
📤 Enviando mensaje: Tu pregunta
📊 Response Status: 200
✅ Respuesta recibida: {response: "..."}
```

### ❌ Error 401 (Unauthorized)
```
📊 Response Status: 401
❌ Error: 401: Unauthorized
```
**Solución**: Tu token está expirado o no existe. Loguéate de nuevo.

### ❌ Error 404 (Not Found)
```
📊 Response Status: 404
❌ Error: 404: Not Found
```
**Solución**: 
- Backend no está corriendo (ejecuta `dotnet run`)
- La URL es incorrecta
- Verifica que sea `/api/chat` exactamente

### ❌ Error 500 (Server Error)
```
📊 Response Status: 500
❌ Error: 500: Error al procesar el mensaje
```
**Solución**: 
- Mira el terminal del backend para ver el error
- Puede ser un problema en el controlador

### ❌ No hay token
```
🔑 Token: NO EXISTE ❌
```
**Solución**: 
- Debes estar logueado primero
- Ve a Login y haz login
- Luego recarga la página

---

## 📋 Checklist Antes de Testear

- [ ] Estás logueado en la aplicación
- [ ] El backend está corriendo (`dotnet run`)
- [ ] El frontend está corriendo (`npm run dev`)
- [ ] La consola del navegador está abierta (F12)
- [ ] Puedes acceder a Swagger sin errores

---

## 💡 Mensajes de Prueba Que Funcionan

Estos mensajes deberían generar respuestas:

1. **"¿Cómo añado una película a favoritos?"**
   - Busca: película + favorito

2. **"¿Cómo marco una serie como vista?"**
   - Busca: serie + vista

3. **"¿Cómo funcionan las recomendaciones?"**
   - Busca: recomendación

4. **"¿Cómo veo mi actividad?"**
   - Busca: inicio + actividad

5. **"¿Cómo añado amigos?"**
   - Busca: amigo + compartir

6. **"Necesito ayuda"**
   - Respuesta por defecto

---

## 🔧 Si Aún No Funciona

### Paso 1: Verifica el Backend
```bash
# En la carpeta Backend
dotnet run
```
Deberías ver:
```
Building...
Build succeeded.
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:7292
      Now listening on: http://localhost:5292
```

### Paso 2: Verifica que existe en Swagger
- Abre `https://localhost:7292/swagger`
- Busca "Chat" o "chat"
- Debería aparecer `POST /api/chat`

### Paso 3: Mira los logs del backend
Cuando envías un mensaje, el terminal debe mostrar:
```
info: Miro.Controllers.ChatController[0]
      Chat request recibido: Tu mensaje
info: Miro.Controllers.ChatController[0]
      Respuesta generada: La respuesta del IA
```

Si NO ves estos logs:
- El controlador no se está ejecutando
- Verifica que el archivo esté en `Backend/Controllers/ChatbotController.cs`
- Verifica que el nombre de la clase es `ChatController`

### Paso 4: Reinicia todo
1. Cierra el terminal del backend (Ctrl+C)
2. Recarga el navegador (F5)
3. Ejecuta `dotnet run` de nuevo
4. Intenta enviar un mensaje

---

## 📊 Estructura de la Petición

**Frontend envía:**
```json
{
  "message": "tu pregunta aquí",
  "conversationHistory": []
}
```

**Backend responde:**
```json
{
  "response": "respuesta del IA"
}
```

---

## ❓ Preguntas Frecuentes

**P: ¿Por qué dice "No hay token"?**
R: No estás logueado. Ve a Login e ingresa.

**P: ¿Por qué no llega la petición al backend?**
R: El backend no está corriendo. Ejecuta `dotnet run`.

**P: ¿Por qué 404 Not Found?**
R: La URL es incorrecta o el controlador no existe. Verifica `/api/chat`.

**P: ¿Por qué 401 Unauthorized?**
R: El token está expirado. Loguéate de nuevo.

**P: ¿Por qué 500 Server Error?**
R: Error en el controlador. Mira los logs del backend.

---

¡Ahora estás listo para testear! 🚀
