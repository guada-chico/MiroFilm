import { useState } from 'react';

/**
 * Componente de prueba para debuggear el chatbot
 * Úsalo llamando a: <ChatTest />
 * Pon console.log en la consola del navegador (F12)
 */
export default function ChatTest() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testChat = async () => {
    setLoading(true);
    setError('');
    setResponse('');

    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token:', token ? 'Existe ✓' : 'NO EXISTE ❌');

      if (!token) {
        setError('No hay token. Debes estar logueado.');
        setLoading(false);
        return;
      }

      console.log('📤 Enviando mensaje:', message);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: message,
          conversationHistory: []
        })
      });

      console.log('📊 Response Status:', res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error('❌ Error:', errorData);
        setError(`Error ${res.status}: ${errorData.error || 'Desconocido'}`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log('✅ Respuesta recibida:', data);
      setResponse(data.response);
    } catch (err) {
      console.error('🔥 Error de conexión:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #ff6b35', 
      borderRadius: '10px',
      margin: '20px',
      backgroundColor: '#fff5f2'
    }}>
      <h3>🧪 Test del Chatbot</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          style={{ 
            width: '100%', 
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ddd'
          }}
        />
      </div>

      <button
        onClick={testChat}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#ff6b35',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1
        }}
      >
        {loading ? '⏳ Enviando...' : '✈️ Enviar'}
      </button>

      {error && (
        <div style={{ 
          marginTop: '10px', 
          padding: '10px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '5px'
        }}>
          ❌ {error}
        </div>
      )}

      {response && (
        <div style={{ 
          marginTop: '10px', 
          padding: '10px',
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          borderRadius: '5px'
        }}>
          ✅ Respuesta: {response}
        </div>
      )}

      <div style={{ marginTop: '15px', fontSize: '0.9em', color: '#666' }}>
        <p>💡 Abre la consola (F12) para ver los logs detallados</p>
        <p>📝 Mensajes de prueba:</p>
        <ul>
          <li>"¿Cómo añado una película a favoritos?"</li>
          <li>"¿Cómo marco una serie como vista?"</li>
          <li>"¿Cómo funcionan las recomendaciones?"</li>
          <li>"Hola"</li>
        </ul>
      </div>
    </div>
  );
}
