# Configuración del Chatbot de IA

## 📝 Descripción General
Se ha implementado un chatbot de IA en la sección de Ayuda para responder preguntas frecuentes sobre la aplicación MiroFilm.

## 🎯 Características Implementadas

### Frontend (React)
- **Componente Chat Modal**: Modal que se abre desde la sección de Ayuda
- **Interfaz de Usuario**: 
  - Historial de mensajes con estilos diferenciados para usuario y asistente
  - Mensaje de bienvenida con topics disponibles
  - Animación de carga (loading) mientras el servidor procesa la respuesta
  - Textarea para escribir mensajes
  - Botón para enviar mensajes
  - Soporte para enviar con Enter + Shift para salto de línea

### Backend (C#)
- **Controlador ChatController**: Maneja las peticiones POST a `/api/chat`
- **Autorización**: Solo usuarios autenticados pueden usar el chat (requiere JWT token)
- **Procesamiento de Mensajes**: Basado en palabras clave para responder preguntas sobre:
  - Cómo añadir películas a favoritos
  - Cómo marcar series como vistas
  - Cómo funcionan las recomendaciones
  - Cómo ver el estado de películas y series
  - Cómo compartir con amigos

## 🚀 Cómo Usar

1. **Abrir el Chat**:
   - Ve a la sección "Ayuda" en el menú lateral
   - Haz clic en "Abrir Chat" en la tarjeta "Chatbot de IA"

2. **Enviar un Mensaje**:
   - Escribe tu pregunta en el textarea
   - Presiona "Enter" o haz clic en el botón de envío
   - El asistente responderá instantáneamente

3. **Cerrar el Chat**:
   - Haz clic en la "X" en la esquina superior derecha del chat
   - O haz clic fuera del modal

## 🔧 Mejoras Futuras

Para mejorar el chatbot con una IA más potente:

### Opción 1: OpenAI API (Recomendado)
```csharp
// Instalar paquete NuGet
Install-Package OpenAI

// Configurar en appsettings.json
"OpenAI": {
  "ApiKey": "tu-clave-aqui",
  "Model": "gpt-3.5-turbo"
}

// Usar en el controlador
var openaiClient = new OpenAIClient(apiKey);
var chatCompletion = await openaiClient.GetChatCompletionAsync(messages);
```

### Opción 2: Google Gemini API
```csharp
// Similar a OpenAI, usar SDK de Google
```

### Opción 3: Anthropic Claude
```csharp
// Similar a OpenAI, usar SDK de Anthropic
```

## 📋 Estructura del Controlador

```
ChatController
├── SendMessage(ChatMessage) - POST /api/chat
└── GenerateAIResponse(string) - Lógica de respuestas basada en palabras clave
```

## 🔐 Seguridad
- Las peticiones requieren autenticación JWT
- Se valida que el mensaje no esté vacío
- Se implementa manejo de errores
- Los logs capturan cualquier error en el procesamiento

## 📱 Diseño Responsivo
- En escritorio: Modal con ancho máximo de 500px
- En móvil: Modal ocupa el 100% del ancho
- El chat se posiciona en la esquina inferior derecha en escritorio
- En móvil, ocupa toda la pantalla

## 🎨 Estilos Agregados

### Archivos modificados:
- `Frontend/src/pages/ayuda/Ayuda.jsx` - Lógica del chat
- `Frontend/src/pages/ayuda/Ayuda.css` - Estilos del chat (200+ líneas nuevas)

### Clases CSS principales:
- `.chat-modal-overlay` - Fondo oscuro
- `.chat-modal` - Contenedor principal del chat
- `.chat-header` - Encabezado con gradiente
- `.chat-messages` - Área de mensajes
- `.message` - Mensaje individual
- `.message.user` - Mensaje del usuario (naranja)
- `.message.assistant` - Mensaje del asistente (gris)

## 📊 Flujo de Comunicación

```
Usuario escribe pregunta
    ↓
Frontend envía POST a /api/chat con token JWT
    ↓
Backend valida usuario y mensaje
    ↓
Backend busca respuesta basada en palabras clave
    ↓
Backend retorna respuesta en JSON
    ↓
Frontend muestra respuesta en el chat
```

## 🐛 Troubleshooting

### El chat no abre:
- Verifica que estés autenticado
- Comprueba que el token JWT está en localStorage

### Las respuestas no aparecen:
- Abre la consola del navegador (F12) para ver errores
- Verifica que el backend está corriendo
- Asegúrate de que la ruta `/api/chat` existe

### Error de CORS:
- Si el frontend y backend están en diferentes puertos, verifica la configuración CORS en Program.cs

## 📧 Soporte
Para preguntas o sugerencias sobre el chatbot, contacta al equipo de desarrollo.
