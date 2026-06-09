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
      pregunta: "¿Cómo añado una película o serie a mis favoritos?",
      respuesta: "En la sección de Películas o Series, pasa el cursor sobre cualquier tarjeta y haz clic en el icono de corazón. También puedes hacerlo desde el modal de detalles con el botón 'Añadir a favoritos'. Tus favoritos se guardan en tu cuenta y los puedes ver en la sección Favoritos del menú lateral."
    },
    {
      pregunta: "¿Qué estados puedo asignar a una película o serie?",
      respuesta: "Puedes asignar cuatro estados: Pendiente (la quieres ver), Viendo (la estás viendo ahora), Visto (ya la terminaste) y Abandonado (la dejaste a medias). Para cambiar el estado, pasa el cursor sobre la tarjeta y usa el selector '+ Lista', o abre el modal de detalles y usa el selector 'Estado en mi lista'."
    },
    {
      pregunta: "¿Dónde veo todas mis películas y series organizadas por estado?",
      respuesta: "En la sección Mis Listas del menú lateral. Verás cuatro columnas (Pendiente, Viendo, Visto, Abandonado) tanto para películas como para series. Puedes cambiar el estado de cualquier elemento directamente desde ahí con el selector naranja."
    },
    {
      pregunta: "¿Mis listas y favoritos se guardan aunque cierre la aplicación?",
      respuesta: "Sí. Toda la información se guarda en la base de datos vinculada a tu cuenta. Al iniciar sesión desde cualquier dispositivo o navegador, tus favoritos y estados de visualización estarán disponibles exactamente como los dejaste."
    },
    {
      pregunta: "¿Cómo busco una película o serie concreta?",
      respuesta: "En las secciones de Películas y Series encontrarás una barra de búsqueda en la parte superior. Escribe el título y los resultados se actualizan automáticamente. También puedes filtrar por género usando los botones de colores debajo del buscador."
    },
    {
      pregunta: "¿Cómo funciona la sección de Favoritos?",
      respuesta: "La sección Favoritos muestra en dos columnas tus películas y series favoritas que aún no has marcado como Visto. Es tu lista de contenido pendiente de ver que ya tienes guardado. Puedes eliminar cualquier elemento haciendo clic en el icono de papelera que aparece al pasar el cursor."
    },
    {
      pregunta: "¿Cómo añado amigos y qué puedo ver de ellos?",
      respuesta: "Ve a la sección Amigos del menú lateral. Puedes buscar usuarios por nombre o email y enviarles solicitud de amistad. Una vez aceptada, podrás ver su actividad reciente: qué películas y series han añadido a sus listas o favoritos."
    },
    {
      pregunta: "¿Cómo cambio el idioma o el tema de la aplicación?",
      respuesta: "En la sección Ajustes puedes cambiar el idioma de la interfaz y alternar entre el tema claro y oscuro. Los cambios se aplican de inmediato y se guardan en tus preferencias."
    },
    {
      pregunta: "¿Para qué sirve el chatbot de IA?",
      respuesta: "El asistente de IA está disponible en esta misma página. Puedes hacerle preguntas sobre cómo usar la aplicación, pedir recomendaciones de películas o series, o resolver cualquier duda. Haz clic en 'Abrir Chat' para empezar."
    },
    {
      pregunta: "¿Cómo edito mi perfil?",
      respuesta: "Accede a tu perfil haciendo clic en tu avatar en la barra superior, o navegando a la sección Perfil. Desde ahí puedes cambiar tu foto, nombre y otros datos de tu cuenta."
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
                    <li>Cómo añadir películas y series a favoritos</li>
                    <li>Cómo gestionar tus estados: Pendiente, Viendo, Visto, Abandonado</li>
                    <li>Cómo usar Mis Listas y Favoritos</li>
                    <li>Cómo añadir amigos y ver su actividad</li>
                    <li>Cualquier función de la app</li>
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