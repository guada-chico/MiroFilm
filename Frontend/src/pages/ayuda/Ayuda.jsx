import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, MessageSquare, Mail, ChevronDown, ChevronUp, Send, X } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { getT } from '../../i18n';
import './Ayuda.css';

export default function Ayuda() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const t = getT(settings.language);
  const [activeIndex, setActiveIndex] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const faqs = [
    {
      pregunta: "¿Cómo añado una película a mis favoritos?",
      respuesta: "Puedes añadir películas a tus favoritos desde la sección de 'Películas' haciendo clic en el icono de corazón en la tarjeta de la película, o desde la página de detalles seleccionando 'Añadir a favoritos'."
    },
    {
      pregunta: "¿Cómo marco una serie como vista?",
      respuesta: "En la sección de 'Series', haz clic en la tarjeta de la serie y selecciona el estado de visualización (Viendo, Completada, Abandonada, etc.) para actualizar tu progreso."
    },
    {
      pregunta: "¿Cómo funcionan las recomendaciones de películas y series?",
      respuesta: "Nuestro sistema analiza tu historial de películas y series vistas, así como tus géneros y directores favoritos, para sugerirte contenido que se adapte a tus preferencias."
    },
    {
      pregunta: "¿Puedo ver el estado de mis películas y series en un lugar?",
      respuesta: "¡Sí! Desde la página de Inicio puedes ver un resumen de tu actividad reciente. También puedes acceder a tus listas de 'Viendo', 'Completadas' y 'Favoritas' desde el menú lateral."
    },
    {
      pregunta: "¿Cómo puedo compartir mis recomendaciones con amigos?",
      respuesta: "Puedes añadir amigos desde la sección de 'Amigos' y ver su actividad. Tus películas y series favoritas aparecerán en tu perfil para que tus amigos las vean."
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      textareaRef.current?.focus();
    }
  }, [isLoading]);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const messageText = inputValue;
    const userMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Existe' : 'No existe');
      console.log('Mensaje a enviar:', messageText);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: messageText,
          conversationHistory: messages
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorData = {};
        
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          const text = await response.text();
          console.error('Respuesta no-JSON:', text);
          errorData = { error: `Error ${response.status}` };
        }
        
        console.error('Error del servidor:', errorData);
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      let data = {};
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Respuesta no-JSON:', text);
        throw new Error('El servidor no devolvió JSON válido');
      }

      console.log('Respuesta del servidor:', data);

      const aiMessage = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: `Lo siento, hubo un error: ${error.message}` 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="ayuda-container">
      <header className="reco-header">
        <div className="reco-title-row">
          <button className="back-btn" onClick={() => navigate('/inicio')}>
            <ArrowLeft size={20} />
          </button>
          <h1>{t.ayuda.title}</h1>
        </div>
        <p>{t.ayuda.subtitle}</p>
      </header>

      <div className="ayuda-grid">
        {/* SECCIÓN DE PREGUNTAS FRECUENTES */}
        <section className="faq-section">
          <h3><HelpCircle size={22} color="#ff6b35" /> {t.ayuda.faq}</h3>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item ${activeIndex === index ? 'active' : ''}`}
                onClick={() => toggleFAQ(index)}
              >
                <div className="faq-question">
                  <span>{faq.pregunta}</span>
                  {activeIndex === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {activeIndex === index && (
                  <div className="faq-answer">
                    <p>{faq.respuesta}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CANALES DE CONTACTO */}
        <aside className="contact-sidebar">
          <div className="contact-card">
            <MessageSquare size={30} color="#ff6b35" />
            <h4>Chatbot de IA</h4>
            <p>Habla con nuestro asistente de IA para obtener ayuda instantánea.</p>
            <button className="contact-btn" onClick={() => setShowChat(true)}>Abrir Chat</button>
          </div>

          <div className="contact-card">
            <Mail size={30} color="#ff6b35" />
            <h4>Soporte por Email</h4>
            <p>Envíanos tus dudas y responderemos en menos de 24h.</p>
            <button className="contact-btn secondary">Enviar Correo</button>
          </div>
        </aside>
      </div>

      {/* MODAL DE CHAT */}
      {showChat && (
        <div className="chat-modal-overlay" onClick={() => setShowChat(false)}>
          <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="chat-header">
              <h2>Asistente de Ayuda</h2>
              <button className="close-btn" onClick={() => setShowChat(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="chat-messages">
              {messages.length === 0 && (
                <div className="chat-welcome">
                  <MessageSquare size={48} color="#ff6b35" />
                  <h3>¡Hola! Soy tu asistente de IA</h3>
                  <p>Puedo ayudarte con preguntas sobre:</p>
                  <ul>
                    <li>Cómo añadir películas a favoritos</li>
                    <li>Cómo marcar series como vistas</li>
                    <li>Cómo funcionan las recomendaciones</li>
                    <li>Información sobre funciones de la app</li>
                  </ul>
                </div>
              )}
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.role}`}>
                  <div className="message-content">
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message assistant">
                  <div className="message-content loading">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta aquí..."
                disabled={isLoading}
                rows="3"
              />
              <button 
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="send-btn"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}