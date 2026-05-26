import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, Calendar as CalendarIcon, Trophy, Plus, ArrowLeft } from 'lucide-react';
import { getMyLibrary } from '../../services/reading-service';
import { useSettings } from '../../context/SettingsContext';
import { getT } from '../../i18n';
import './Biblioteca.css';

export default function Biblioteca() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const t = getT(settings.language);
  const [tabActiva, setTabActiva] = useState('leyendo');
  const [misLibrosData, setMisLibrosData] = useState({
    leyendo: [],
    leídos: [],
    'por leer': []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyLibrary()
      .then((library) => {
        // Agrupar por estado
        const grouped = {
          leyendo: library.filter((item) => item.status === 'Reading'),
          leídos: library.filter((item) => item.status === 'Completed'),
          'por leer': library.filter((item) => item.status === 'WantToRead')
        };
        setMisLibrosData(grouped);
      })
      .catch(() => {
        setMisLibrosData({ leyendo: [], leídos: [], 'por leer': [] });
      })
      .finally(() => setLoading(false));
  }, []);

  const retoAnual = { objetivo: 24, leidos: misLibrosData.leídos.length };
  const porcentajeReto = (retoAnual.leidos / retoAnual.objetivo) * 100;

  const lecturaReciente = [
    { dia: 'Hoy', libro: 'Atomic Habits', paginas: 45 },
    { dia: 'Ayer', libro: 'Deep Work', paginas: 20 },
  ];

  return (
    <div className="biblioteca-container">
      <header className="reco-header">
        <div className="reco-title-row">
          <button className="back-btn" onClick={() => navigate('/inicio')}>
            <ArrowLeft size={20} />
          </button>
          <h1>{t.biblioteca.title}</h1>
        </div>
        <p>{t.biblioteca.subtitle}</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card challenge-card">
          <div className="stat-icon-circle">
            <Trophy color="#ff6b35" size={24} />
          </div>
          <div className="stat-info">
            <h3>Desafío 2026</h3>
            <p>{retoAnual.leidos} de {retoAnual.objetivo} libros leídos</p>
            <div className="progress-bar-large">
              <div className="progress-fill" style={{ width: `${Math.min(porcentajeReto, 100)}%` }}></div>
            </div>
          </div>
          <span className="stat-percent">{Math.round(Math.min(porcentajeReto, 100))}%</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon-circle">
            <CheckCircle color="#ff6b35" size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Leídos</h3>
            <p className="big-number">{misLibrosData.leídos.length}</p>
          </div>
        </div>
      </div>

      <div className="main-content-grid">
        <section className="activity-section">
          <div className="section-head">
            <h3>Actividad reciente</h3>
            <CalendarIcon size={20} color="#bbb" />
          </div>
          <div className="activity-list">
            {lecturaReciente.map((log, index) => (
              <div key={index} className="activity-item">
                <div className="activity-date"><span>{log.dia}</span></div>
                <div className="activity-detail">
                  <strong>{log.libro}</strong>
                  <span>{log.paginas} páginas leídas</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="lists-section">
          <div className="list-tabs">
            {['leyendo', 'leídos', 'por leer'].map((tab) => (
              <button 
                key={tab}
                className={`tab ${tabActiva === tab ? 'active' : ''}`}
                onClick={() => setTabActiva(tab)}
              >
                {tab === 'leyendo' ? t.biblioteca.currentlyReading : tab === 'leídos' ? t.biblioteca.completed : t.biblioteca.wantToRead}
              </button>
            ))}
          </div>

          <div className="books-mini-grid">
            {loading ? (
              <p style={{ textAlign: 'center', color: '#aaa' }}>{t.biblioteca.loadingBooks}</p>
            ) : misLibrosData[tabActiva].length > 0 ? (
              misLibrosData[tabActiva].map((item) => {
                const book = item.book || item;
                const progress = item.book?.totalPages > 0
                  ? Math.round((item.currentPage / item.book.totalPages) * 100)
                  : 0;

                return (
                  <div key={item.id} className="book-item-horizontal">
                    <img src={book.imageUrl || book.coverImageUrl || 'https://via.placeholder.com/80x120?text=Sin+portada'} alt={book.title} />
                    <div className="book-item-info">
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        {tabActiva === 'leídos' ? 
                          <CheckCircle size={16} color="#4caf50" /> : 
                          <BookOpen size={16} color="#ff6b35" />
                        }
                        <h4>{book.title}</h4>
                      </div>
                      <p>{book.author}</p>
                      
                      {tabActiva !== 'por leer' && (
                        <div className="mini-progress">
                          <div className="progress-bar-small">
                            <div className="fill" style={{width: `${progress}%`}}></div>
                          </div>
                          <span>{progress}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ textAlign: 'center', color: '#aaa' }}>{t.biblioteca.noBooks}</p>
            )}

            <button className="add-book-btn">
              <Plus size={24} />
              <span>Añadir libro</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}