# 🔧 Guía de Debugging del Chatbot

## El chatbot no contesta - Soluciones

### 1️⃣ **Verificar la Consola del Navegador (F12)**

Abre la consola (F12 en Chrome/Firefox) y mira los logs:

```
Token: Existe (o "No existe")
Mensaje a enviar: [tu mensaje aquí]
Response status: 200 (o algún código de error)
Respuesta del servidor: {...}
```

### 2️⃣ **Errores Comunes**

#### ❌ Error 401 (Unauthorized)
- **Causa**: No hay token o está expirado
- **Solución**: 
  - Verifica que estés logueado
  - Abre DevTools → Aplicación/Storage → localStorage
  - Busca la clave `token` - debe existir

#### ❌ Error 404 (Not Found)
- **Causa**: La ruta `/api/chat` no existe
- **Solución**:
  - Verifica que el backend esté corriendo
  - Abre Swagger en `https://localhost:7292/swagger` (o tu puerto)
  - Deberías ver `POST /api/chat` en la lista de endpoints

#### ❌ Error 500 (Internal Server Error)
- **Causa**: Error en el controlador del backend
- **Solución**:
  - Mira los logs del terminal del backend
  - Verifica que el `ChatbotController.cs` esté bien ubicado

#### ❌ CORS Error
- **Causa**: Frontend y backend en diferentes orígenes
- **Solución**:
  - El CORS ya está configurado en `Program.cs`
  - Verifica que en `appsettings.Development.json` esté todo bien

### 3️⃣ **Pasos para Verificar**

#### Step 1: Verificar que el backend corre
```
GET https://localhost:7292/swagger
```
Deberías ver la documentación de Swagger

#### Step 2: Verificar el endpoint en Swagger
1. En Swagger, busca "Chat"
2. Expande `POST /api/chat`
3. Haz clic en "Try it out"
4. Pega un token JWT válido en el campo Authorization
5. En el body, escribe:
```json
{
  "message": "hola",
  "conversationHistory": []
}
```
6. Haz clic en "Execute"
7. Deberías recibir una respuesta con un mensaje

#### Step 3: Verificar el token en localStorage
```javascript
// En la consola del navegador:
localStorage.getItem('token')
// Deberías ver algo como: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Step 4: Revisar los logs del backend
En el terminal donde corre el backend, deberías ver:
```
info: Miro.Controllers.ChatController[0]
      Chat request recibido: hola
info: Miro.Controllers.ChatController[0]
      Respuesta generada: Gracias por tu pregunta...
```

### 4️⃣ **Verificar la Configuración**

#### Frontend (src/pages/ayuda/Ayuda.jsx)
- ✅ La URL del fetch es `/api/chat`
- ✅ El método es POST
- ✅ El header Authorization incluye el token
- ✅ El body tiene `{ message, conversationHistory }`

#### Backend (Controllers/ChatbotController.cs)
- ✅ Clase se llama `ChatController`
- ✅ Route es `[Route("api/[controller]")]` → /api/chat
- ✅ Método tiene `[HttpPost]`
- ✅ Tiene `[Authorize]` para requerir token
- ✅ El método es `public async Task<IActionResult> SendMessage`

### 5️⃣ **Testing Manual**

#### Opción A: Usar Swagger
1. Ve a `https://localhost:7292/swagger`
2. Busca "Chat"
3. Abre POST /api/chat
4. Click en "Authorize" (arriba a la derecha)
5. Pega: `Bearer [tu token aquí]`
6. Prueba con un mensaje de prueba

#### Opción B: Usar Postman
1. Descarga Postman
2. POST a `https://localhost:7292/api/chat`
3. Headers: `Authorization: Bearer [token]`
4. Body (raw JSON):
```json
{
  "message": "¿Cómo añado una película a favoritos?",
  "conversationHistory": []
}
```

#### Opción C: Usar curl (Terminal)
```bash
curl -X POST https://localhost:7292/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [tu-token-aqui]" \
  -d '{"message":"hola","conversationHistory":[]}'
```

### 6️⃣ **Si Aún No Funciona**

1. **Reinicia el backend**
   - Presiona Ctrl+C en el terminal
   - Ejecuta `dotnet run` de nuevo

2. **Limpia el caché del navegador**
   - Ctrl+Shift+Delete
   - Selecciona "Todo"
   - Borra

3. **Verifica los logs**
   - Abre DevTools (F12)
   - Pestaña "Console"
   - Envía un mensaje
   - Mira los console.log y errores

4. **Comprueba la ruta completa**
   - En DevTools → Network
   - Envía un mensaje
   - Busca la petición a "chat"
   - Mira el URL, método y respuesta

### 7️⃣ **Información Útil**

**Puerto del backend**: Por defecto `https://localhost:7292`
- Puede ser diferente si has cambiado la configuración
- Busca en `launchSettings.json` en Properties/

**Archivo de configuración**: `launchSettings.json`
```json
{
  "profiles": {
    "https": {
      "applicationUrl": "https://localhost:7292;http://localhost:5292"
    }
  }
}
```

**Base URL del frontend**: Asegúrate que sea relativa `/api/chat`
- No uses `http://localhost:...` en el fetch
- React se conectará al mismo origen

## 📝 Logs Esperados

Si todo funciona, deberías ver en el backend:
```
info: Miro.Controllers.ChatController[0]
      Chat request recibido: ¿Cómo añado una película?
info: Miro.Controllers.ChatController[0]
      Respuesta generada: Para añadir una película a tus favoritos...
```

Y en el navegador (Console):
```
Token: Existe
Mensaje a enviar: ¿Cómo añado una película?
Response status: 200
Respuesta del servidor: {response: "Para añadir una película..."}
```

## ✅ Checklist Final

- [ ] Token existe en localStorage
- [ ] Backend corre correctamente
- [ ] Endpoint aparece en Swagger
- [ ] CORS está configurado (ya lo está)
- [ ] Controlador está en la carpeta Controllers
- [ ] Clase se llama ChatController
- [ ] Método tiene [HttpPost] y [Authorize]
- [ ] Frontend envía mensaje al fetch
- [ ] Response status es 200

---

¿Aún no funciona? Comparte los logs de la consola y el error que ves en la red (Network tab en DevTools).
