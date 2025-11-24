import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BookCard from '../components/BookCard';
import { toast } from 'react-toastify';
import { FaSearch, FaBook, FaComments, FaHandshake } from 'react-icons/fa';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const url = keyword 
            ? `http://localhost:5000/api/books?keyword=${keyword}` 
            : 'http://localhost:5000/api/books';
            
        const { data } = await axios.get(url);
        setBooks(data);
        setLoading(false);
      } catch (error) {
        toast.error('Error fetching books');
        setLoading(false);
      }
    };
    fetchBooks();
  }, [keyword]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      
      {/* 1. HERO SECTION */}
      <div style={heroSectionStyle}>
        <div style={heroContentStyle}>
          <h1 style={heroTitleStyle}>
            The Smart Way to Buy & Sell <br/>
            <span style={{color: '#ffc107'}}>Used Books</span> in Surat
          </h1>
          <p style={heroSubtitleStyle}>
            Join your community. Save money on textbooks, 
            make money from old reads, and reduce paper waste.
          </p>
        </div>
      </div>

      {/* 2. FLOATING SEARCH BAR */}
      <div style={searchContainerStyle}>
        <form onSubmit={handleSearch} style={searchFormStyle}>
            <FaSearch style={searchIconStyle} />
            <input 
                type="text" 
                placeholder="Find a book (e.g., 'Java Programming', 'Wings of Fire')..." 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={searchInputStyle}
            />
            <button type="submit" style={searchButtonStyle}>Search</button>
        </form>
      </div>

      {/* 3. HOW IT WORKS (The Professional Touch) */}
      {!keyword && (
        <div className="container" style={featuresSectionStyle}>
            <div style={featureCardStyle}>
                <div style={iconCircleStyle}><FaBook /></div>
                <h3>1. List It</h3>
                <p style={featureTextStyle}>Upload details of your old books in seconds.</p>
            </div>
            <div style={featureCardStyle}>
                <div style={iconCircleStyle}><FaComments /></div>
                <h3>2. Connect</h3>
                <p style={featureTextStyle}>Buyers find your book and request a purchase.</p>
            </div>
            <div style={featureCardStyle}>
                <div style={iconCircleStyle}><FaHandshake /></div>
                <h3>3. Exchange</h3>
                <p style={featureTextStyle}>Meet on campus or nearby to exchange.</p>
            </div>
        </div>
      )}

      {/* 4. LISTINGS GRID */}
      <div className="container" style={{ marginTop: '50px' }}>
        <div style={sectionHeaderWrapper}>
            <h2 style={sectionHeaderStyle}>
              {keyword ? `Search Results` : 'Fresh Recommendations'}
            </h2>
            <div style={resultCountStyle}>
                {books.length} {books.length === 1 ? 'Book' : 'Books'} Found
            </div>
        </div>
        
        {loading ? (
            <p style={{textAlign: 'center', fontSize: '1.2rem', color: '#666'}}>Loading marketplace...</p>
        ) : books.length === 0 ? (
          <div style={emptyStateStyle}>
            <img 
                src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png" 
                alt="No books" 
                style={{width: '80px', opacity: 0.5, marginBottom: '20px'}} 
            />
            <h3>No books found matching your search.</h3>
            <p>Try searching for a different author or check back later.</p>
          </div>
        ) : (
          <div style={gridStyle}>
            {books.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- MODERN STYLES ---

const heroSectionStyle = {
  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', // Deep Professional Blue
  color: 'white',
  padding: '80px 20px 100px 20px',
  textAlign: 'center',
  borderRadius: '0 0 20px 20px',
  position: 'relative',
};

const heroContentStyle = {
  maxWidth: '800px',
  margin: '0 auto',
};

const heroTitleStyle = {
   color: 'white',
  fontSize: '2.8rem',
  fontWeight: '800',
  marginBottom: '20px',
  lineHeight: '1.2',
  letterSpacing: '-1px'
};

const heroSubtitleStyle = {
  fontSize: '1.2rem',
  opacity: '0.9',
  fontWeight: '300',
  lineHeight: '1.6',
  maxWidth: '600px',
  margin: '0 auto'
};

const searchContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  marginTop: '-35px', // Floating effect
  padding: '0 20px',
  position: 'relative',
  zIndex: 10
};

const searchFormStyle = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'white',
  padding: '8px 10px 8px 25px',
  borderRadius: '50px',
  boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
  width: '100%',
  maxWidth: '700px',
  border: '1px solid #eee'
};

const searchIconStyle = {
  color: '#aaa',
  fontSize: '1.2rem',
  marginRight: '15px'
};

const searchInputStyle = {
  border: 'none',
  outline: 'none',
  fontSize: '1.1rem',
  width: '100%',
  color: '#333'
};

const searchButtonStyle = {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '12px 30px',
    borderRadius: '30px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '1rem',
    marginLeft: '10px'
};

const featuresSectionStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '40px',
    marginTop: '60px',
    flexWrap: 'wrap',
    padding: '0 20px'
};

const featureCardStyle = {
    textAlign: 'center',
    maxWidth: '250px'
};

const iconCircleStyle = {
    width: '60px',
    height: '60px',
    backgroundColor: '#e7f1ff',
    color: '#007bff',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '1.5rem',
    margin: '0 auto 15px auto'
};

const featureTextStyle = {
    color: '#666',
    fontSize: '0.95rem',
    lineHeight: '1.5'
};

const sectionHeaderWrapper = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    borderBottom: '1px solid #eee',
    paddingBottom: '15px'
};

const sectionHeaderStyle = {
  fontSize: '1.8rem',
  color: '#222',
  fontWeight: '700',
  margin: 0
};

const resultCountStyle = {
    color: '#777',
    fontWeight: '500'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
  gap: '30px',
};

const emptyStateStyle = {
  textAlign: 'center',
  color: '#888',
  marginTop: '50px',
  padding: '60px',
  backgroundColor: '#f9f9f9',
  borderRadius: '15px',
  border: '1px dashed #ddd'
};

export default Home;