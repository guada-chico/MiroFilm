# ⚡ EJECUTA ESTO PARA QUE FUNCIONE EL CHATBOT

## Paso 1: Abre DOS terminales

### Terminal 1 - Backend
```bash
cd Backend
dotnet clean
dotnet build
dotnet run
```

**Esperado**: Ver algo como:
```
Now listening on: https://localhost:8080
```

### Terminal 2 - Frontend
```bash
cd Frontend
npm run dev
```

**Esperado**: Ver algo como:
```
Local:   http://127.0.0.1:5173/
```

---

## Paso 2: En el navegador

1. Abre `http://localhost:5173`
2. Si no estás logueado, haz login
3. Ve al menú → "Ayuda"
4. Haz clic en "Abrir Chat"

---

## Paso 3: Prueba el Chat

Escribe uno de estos mensajes y presiona Enter:

- "¿Cómo añado una película a favoritos?"
- "¿Cómo marco una serie como vista?"
- "¿Cómo funcionan las recomendaciones?"
- "Hola"
- Cualquier otra pregunta

---

## ✅ Qué debería pasar

1. Ves tu mensaje en naranja (burbuja del usuario)
2. Aparece animación de carga (3 puntos)
3. Recibes una respuesta en gris (burbuja de IA)
4. Sin errores de JSON ✅

---

## ❌ Si Aún Hay Error

### Error: "Unexpected end of JSON input"
- Reconstruye el backend: `dotnet clean && dotnet build && dotnet run`
- Reinicia el frontend: `npm run dev`

### Error 404: "Failed to load resource"
- Verifica que Backend corre en Terminal 1
- Verifica que Frontend corre en Terminal 2
- Recarga el navegador (F5)

### Error 401: "Unauthorized"
- Debes estar logueado
- Ve a Login primero

---

## 🔍 Para Debugging

Abre la consola del navegador (F12) y deberías ver:

```
Token: Existe
Mensaje a enviar: Tu pregunta
Response status: 200
Respuesta del servidor: {response: "Tu respuesta"}
```

---

## 📍 URLs Importantes

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Swagger (API Docs) | https://localhost:8080/swagger |
| Chat Endpoint | POST /api/chat |

---

¡Listo! El chatbot debería funcionar ahora. 🎉
