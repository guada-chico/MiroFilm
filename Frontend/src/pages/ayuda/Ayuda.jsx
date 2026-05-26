import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, HelpCircle, MessageSquare, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { getT } from '../../i18n';
import './Ayuda.css';

export default function Ayuda() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const t = getT(settings.language);
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      pregunta: "¿Cómo añado un libro a mi biblioteca?",
      respuesta: "Puedes añadir libros desde la sección de 'Recomendaciones' haciendo clic en la tarjeta del libro y seleccionando 'Añadir a mi biblioteca', o usando el botón '+' en tu sección de Mis Libros."
    },
    {
      pregunta: "¿Puedo cambiar mi objetivo de lectura anual?",
      respuesta: "¡Sí! Ve a la sección de Ajustes o haz clic directamente en tu tarjeta de Desafío en 'Mis Libros' para editar tu meta de libros anuales."
    },
    {
      pregunta: "¿Cómo funcionan las recomendaciones?",
      respuesta: "Nuestro sistema analiza tus libros leídos y tus autores favoritos para sugerirte nuevas historias que se adapten a tus gustos literarios."
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
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

      {/* BUSCADOR DE AYUDA */}
      <div className="ayuda-search-section">
        <div className="search-bar-ayuda">
          <Search size={20} color="#bbb" />
          <input type="text" placeholder="Busca una pregunta o tema..." />
        </div>
      </div>

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
            <h4>Chat en vivo</h4>
            <p>Habla con nuestro equipo de soporte ahora mismo.</p>
            <button className="contact-btn">Iniciar Chat</button>
          </div>

          <div className="contact-card">
            <Mail size={30} color="#ff6b35" />
            <h4>Soporte por Email</h4>
            <p>Envíanos tus dudas y responderemos en menos de 24h.</p>
            <button className="contact-btn secondary">Enviar Correo</button>
          </div>
        </aside>
      </div>
    </div>
  );
}