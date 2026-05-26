import { useState, useEffect } from 'react';
import { ExternalLink, Loader, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentReading } from '../../services/reading-service';
import { getPrhNewReleases } from '../../services/external-books-service';
import { useSettings } from '../../context/SettingsContext';
import { getT } from '../../i18n';
import './Inicio.css';

export default function Inicio() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const t = getT(settings.language).common;
  const [currentReading, setCurrentReading] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingReco, setLoadingReco] = useState(true);

  // Lectura actual y recomendaciones PRH al montar
  useEffect(() => {
    getCurrentReading()
      .then(setCurrentReading)
      .catch(() => setCurrentReading(null));

    setLoadingReco(true);
    getPrhNewReleases(5)
      .then((data) => {
        setRecommendations(data ?? []);
        setLoadingReco(false);
      })
      .catch((err) => {
        console.error('Error cargando recomendaciones PRH:', err);
        setRecommendations([]);
        setLoadingReco(false);
      });
  }, []);

  return (
    <div className="inicio-content">
      {/* SECCIÓN: CONTINUAR LEYENDO */}
      <section className="reading-now-section">
        <h1>Inicio</h1>
        <div className="section-head">
          <h3>{t.continueReading}</h3>
        </div>
        {currentReading ? (
          <div className="reading-card">
            <div className="reading-cover-container">
              <img
                src={currentReading.book?.imageUrl || currentReading.book?.coverImageUrl || 'https://via.placeholder.com/120x180?text=Sin+portada'}
                alt={currentReading.book?.title}
                className="reading-cover"
              />
            </div>
            <div className="reading-info">
              <h4>{currentReading.book?.title}</h4>
              <p className="author">{currentReading.book?.author}</p>
              {currentReading.book?.totalPages > 0 && (
                <div className="progress-container">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.round((currentReading.currentPage / currentReading.book.totalPages) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {Math.round((currentReading.currentPage / currentReading.book.totalPages) * 100)}% {t.completed}
                  </span>
                </div>
              )}
              <button className="continue-btn" onClick={() => navigate('/mis-libros')}>{t.continueReading}</button>
            </div>
          </div>
        ) : (
          <div className="reading-card">
            <p style={{ color: '#aaa', padding: '1rem' }}>{t.noActiveReading}</p>
          </div>
        )}
      </section>

      {/* SECCIÓN HERO Y BUSCADOR */}
      {/* Buscador removido */}

      {/* SECCIÓN: LIBROS RECOMENDADOS */}
      <section className="books-section">
        <div className="section-head">
          <h3>{t.recommendedInSpanish}</h3>
          <span
            className="orange-link"
            onClick={() => navigate('/recomendaciones')}
            style={{ cursor: 'pointer' }}
          >
            {t.viewAll} &gt;
          </span>
        </div>

        {loadingReco ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '0.5rem' }}>
            <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#aaa', fontSize: '0.9rem' }}>{t.loading}</p>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="books-grid">
            {recommendations.slice(0, 5).map((book, i) => (
              <div
                key={book.id || book.isbn || i}
                className="book-card"
                title={`${book.title} — ${book.author}`}
              >
                {book.coverUrl || book.imageUrl ? (
                  <img src={book.coverUrl || book.imageUrl} alt={book.title} />
                ) : (
                  <div style={{ width: '100%', aspectRatio: '2/3', padding: '0.5rem', fontSize: '0.75rem', textAlign: 'center', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', borderRadius: '20px' }}>
                    {book.title}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#aaa', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>No se encontraron libros recomendados</p>
        )}
      </section>
    </div>
  );
}
