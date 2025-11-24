import React from 'react';
import { Link } from 'react-router-dom';

const BookCard = ({ book }) => {
  // Helper to fix image paths (converts backslashes to forward slashes for URLs)
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/150?text=No+Image';
    // If it's already a full URL (from internet), use it. Otherwise, add localhost.
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000/${imagePath.replace(/\\/g, "/")}`;
  };

  return (
    <Link to={`/book/${book._id}`} style={cardLinkStyle}>
      <div style={cardStyle}>
        <div style={imgContainerStyle}>
           <img 
             src={getImageUrl(book.image)} 
             alt={book.title} 
             style={imgStyle} 
             onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
           />
        </div>
        <div style={contentStyle}>
          <h3 style={titleStyle}>{book.title}</h3>
          <p style={authorStyle}>by {book.author}</p>
          <h4 style={priceStyle}>₹{book.price}</h4>
          
          {book.status !== 'available' && (
            <div style={overlayStyle}>
                {book.status === 'reserved' ? 'Pending' : 'Sold Out'}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

// Styles
const cardLinkStyle = { textDecoration: 'none', color: 'inherit' };
const cardStyle = {
  backgroundColor: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  overflow: 'hidden',
  transition: 'transform 0.2s, box-shadow 0.2s',
  position: 'relative',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
};
const imgContainerStyle = { height: '220px', overflow: 'hidden', backgroundColor: '#f1f5f9', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const imgStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const contentStyle = { padding: '15px', textAlign: 'left', flexGrow: 1 };
const titleStyle = { margin: '10px 0 5px', fontSize: '1.1em', fontWeight: '700', color: '#1e293b' };
const authorStyle = { margin: '0', color: '#64748b', fontSize: '0.9em' };
const priceStyle = { margin: '10px 0 0', color: '#2563eb', fontSize: '1.2em', fontWeight: 'bold' };
const overlayStyle = {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(255,255,255,0.85)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    color: '#ef4444', fontWeight: 'bold', fontSize: '1.2em',
    textTransform: 'uppercase', backdropFilter: 'blur(2px)'
};

export default BookCard;