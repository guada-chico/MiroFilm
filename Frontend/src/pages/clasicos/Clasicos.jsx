import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, BookOpen, ExternalLink, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { getClassicsByPage, searchGutendexBooks } from '../../services/external-books-service';
import { useSettings } from '../../context/SettingsContext';
import { getT } from '../../i18n';
import './Clasicos.css';

export default function Clasicos() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const t = getT(settings.language);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const loadPage = async (page) => {
    setLoading(true);
    try {
      const data = await getClassicsByPage(page);
      setBooks(data ?? []);
      setCurrentPage(page);
      setIsSearchMode(false);
    } catch (err) {
      console.error('Error cargando página:', err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage(1);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      // Si el buscador está vacío, volver a cargar la página 1
      loadPage(1);
      return;
    }
    setIsSearching(true);
    setIsSearchMode(true);
    try {
      const results = await searchGutendexBooks(searchQuery);
      setBooks(results ?? []);
      setCurrentPage(1);
    } catch {
      setBooks([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Si el usuario borra todo el contenido, volver a mostrar todos los libros
    if (!value.trim() && isSearchMode) {
      loadPage(1);
    }
  };

  const handleNextPage = () => {
    loadPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      loadPage(currentPage - 1);
    }
  };

  return (
    <div className="clasicos-container">
      <header className="reco-header">
        <div className="reco-title-row">
          <button className="back-btn" onClick={() => navigate('/inicio')}>
            <ArrowLeft size={20} />
          </button>
          <h1>{t.clasicos.title}</h1>
        </div>
        <p>{t.clasicos.subtitle}</p>
      </header>

      {/* Buscador */}
      <form className="search-bar-clasicos" onSubmit={handleSearch}>
        <Search size={20} color="#bbb" />
        <input
          type="text"
          placeholder={t.clasicos.searchPlaceholder}
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <button type="submit" disabled={isSearching}>
          {isSearching ? t.clasicos.searching : t.clasicos.search}
        </button>
      </form>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '0.5rem' }}>
          <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#aaa', fontSize: '0.9rem' }}>{t.clasicos.loadingClassics}</p>
        </div>
      ) : books.length > 0 ? (
        <div className="clasicos-grid">
          {books.map((book, i) => (
            <div 
              key={book.id || book.isbn || i} 
              className="clasico-card"
              style={{ cursor: book.readUrl ? 'pointer' : 'default' }}
              onClick={() => book.readUrl && window.open(book.readUrl, '_blank')}
              title={book.readUrl ? 'Haz clic para leer' : book.title}
            >
              <div className="clasico-cover">
                {book.coverUrl || book.imageUrl ? (
                  <img src={book.coverUrl || book.imageUrl} alt={book.title} />
                ) : (
                  <div className="no-cover">
                    <BookOpen size={32} color="#ccc" />
                  </div>
                )}
              </div>
              
              <div className="clasico-info">
                <h4>{book.title}</h4>
                <p className="clasico-author">{book.authors ? book.authors.join(', ') : book.author}</p>
                {book.readUrl && (
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#ff6b35', fontSize: '0.75rem' }}>
                    <ExternalLink size={12} />
                    <span>Leer en línea</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: '#aaa', marginTop: '3rem' }}>
          <BookOpen size={48} color="#ddd" />
          <p style={{ marginTop: '1rem' }}>
            {t.clasicos.noResults}
          </p>
        </div>
      )}

      {/* Paginación */}
      {!isSearchMode && books.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '2rem', padding: '1rem' }}>
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: currentPage === 1 ? '#e0e0e0' : '#ff6b35',
              color: currentPage === 1 ? '#999' : 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              transition: 'background 0.2s'
            }}
          >
            <ChevronLeft size={18} />
            Anterior
          </button>
          <span style={{ color: '#666', fontWeight: 600 }}>
            Página {currentPage}
          </span>
          <button
            onClick={handleNextPage}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: '#ff6b35',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#e55a25'}
            onMouseLeave={(e) => e.target.style.background = '#ff6b35'}
          >
            Siguiente
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
