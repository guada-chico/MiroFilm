# ✅ Instrucciones Finales para Usar el Chatbot

## 🔴 PROBLEMA ENCONTRADO

El frontend estaba intentando conectarse a `/api/chat` pero el navegador no podía encontrar el backend porque:
- Backend corre en: `https://localhost:8080`
- Frontend corre en: `http://localhost:5173`
- No había proxy configurado

## ✅ SOLUCIÓN APLICADA

He actualizado `vite.config.js` para hacer proxy de `/api` al backend.

---

## 🚀 PASOS PARA QUE FUNCIONE

### 1. Detén todo (si está corriendo)
```bash
Ctrl+C en el terminal del backend
Ctrl+C en el terminal del frontend
```

### 2. Reconstruye el Backend
```bash
cd Backend
dotnet clean
dotnet build
dotnet run
```

Deberías ver:
```
Now listening on: https://localhost:8080
Now listening on: http://localhost:5286
```

### 3. Inicia el Frontend
En otra terminal:
```bash
cd Frontend
npm run dev
```

Deberías ver:
```
Local:   http://127.0.0.1:5173/
```

### 4. Abre el navegador
- Ve a `http://localhost:5173`
- Login si es necesario
- Ve a "Ayuda"
- Haz clic en "Abrir Chat"
- Escribe: "¿Cómo añado una película a favoritos?"
- Presiona Enter

### 5. Verifica la consola (F12)
Deberías ver:
```
Token: Existe
Mensaje a enviar: ¿Cómo añado una película a favoritos?
Response status: 200
Respuesta del servidor: {response: "Para añadir una película..."}
```

---

## 🔍 Si Aún Hay Error 404

1. **Verifica que Swagger funciona**
   - Abre: `https://localhost:8080/swagger`
   - Busca "Chat"
   - Deberías ver `POST /api/chat`

2. **Verifica que el proxy está configurado**
   - Abre DevTools (F12)
   - Ve a "Network"
   - Envía un mensaje
   - Busca la petición "chat"
   - Debe mostrar que va a `https://localhost:8080`

3. **Si el proxy no funciona**
   - Cierra el frontend
   - Ejecuta: `npm run dev` de nuevo
   - Intenta enviar un mensaje

---

## 📊 Arquitectura Final

```
Frontend (http://localhost:5173)
    |
    ├─ /api/chat (proxy via Vite)
    |
    ↓
Backend (https://localhost:8080)
    |
    ├─ ChatController.cs
    |
    ├─ GenerateAIResponse()
    |
    └─ Retorna: { response: "..." }
```

---

## ✨ Características del Chatbot

### Reconoce palabras clave:
- **película + favorito** → Cómo añadir a favoritos
- **serie + vista** → Cómo marcar como vista
- **recomendación** → Cómo funcionan
- **inicio/actividad** → Cómo ver estado
- **amigo/compartir** → Cómo compartir
- **ayuda/help** → Resumen general

### Interfaz:
- ✅ Modal popup
- ✅ Chat bubbles (usuario/IA)
- ✅ Animación de carga
- ✅ Responsive
- ✅ Soporte para Enter

---

## 🐛 Troubleshooting Rápido

| Error | Causa | Solución |
|-------|-------|----------|
| 404 | Backend no corre | `dotnet run` en Backend |
| 404 | Proxy no configurado | Reinicia frontend: `npm run dev` |
| 401 | No hay token | Loguéate primero |
| Empty response | Error en backend | Ver logs del backend terminal |
| CORS error | No debería haber | CORS ya está configurado |

---

## 📝 Archivos Modificados

- `Frontend/vite.config.js` - ✅ Proxy agregado
- `Backend/Controllers/ChatController.cs` - ✅ Nuevo endpoint
- `Frontend/src/pages/ayuda/Ayuda.jsx` - ✅ Componente chat
- `Frontend/src/pages/ayuda/Ayuda.css` - ✅ Estilos chat

---

## 🎯 Próximos Pasos (Opcional)

### Mejorar el Chatbot con IA Real

Usa cualquiera de estas APIs:

#### OpenAI (Recomendado)
```csharp
// 1. Instalar
Install-Package OpenAI

// 2. En appsettings.json
"OpenAI": {
  "ApiKey": "sk-...",
  "Model": "gpt-3.5-turbo"
}

// 3. En ChatController
var client = new OpenAIClient(apiKey);
var response = await client.ChatCompletions.CreateChatCompletion(
  new CreateChatCompletionRequest { Messages = messages }
);
```

#### Google Gemini
```csharp
Install-Package Google.GenerativeAI
```

#### Anthropic Claude
```csharp
Install-Package Anthropic
```

---

## ✅ Checklist Final

- [ ] Backend corre sin errores
- [ ] Frontend corre sin errores
- [ ] Puedes acceder a `http://localhost:5173`
- [ ] Swagger muestra el endpoint `/api/chat`
- [ ] El chat envía mensajes
- [ ] Recibes respuestas del chatbot
- [ ] La consola (F12) muestra los logs correctos

---

**¡Listo! El chatbot ahora debería funcionar correctamente.** 🎉

Si aún hay problemas, comparte:
1. El error que ves en la consola (F12)
2. Los logs del backend
3. El response status en Network tab
