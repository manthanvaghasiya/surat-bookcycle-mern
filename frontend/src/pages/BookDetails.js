import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';

const BookDetails = () => {
  const { id } = useParams(); // Get ID from URL
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Book Data
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/books/${id}`);
        setBook(data);
        setLoading(false);
      } catch (error) {
        toast.error('Book not found');
        navigate('/');
      }
    };
    fetchBook();
  }, [id, navigate]);

  // Handle Buy Button Click
  const handleBuy = async () => {
    if (!window.confirm(`Are you sure you want to buy "${book.title}"?`)) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      // Call the Order API
      await axios.post('http://localhost:5000/api/orders', { bookId: book._id }, config);

      toast.success('Order requested! Awaiting seller approval.');
      navigate('/myorders'); // Redirect to orders page
    } catch (error) {
      toast.error(error.response?.data?.message || 'Purchase failed');
    }
  };

  if (loading) return <h3>Loading...</h3>;

  return (
    <div style={containerStyle}>
      <div style={imageSectionStyle}>
        <img 
          src={`http://localhost:5000/${book.image.replace(/\\/g, "/")}`} 
          alt={book.title} 
          style={{width: '100%', borderRadius: '8px'}} 
        />
      </div>
      
      <div style={infoSectionStyle}>
        <h1 style={{marginTop: 0}}>{book.title}</h1>
        <p style={{fontSize: '1.2em', color: '#555'}}>by {book.author}</p>
        <h2 style={{color: '#007bff'}}>₹{book.price}</h2>

        <div style={detailBoxStyle}>
            <p><strong>Seller:</strong> {book.user?.full_name}</p>
            <p><strong>Condition:</strong> {book.condition}</p>
            <p><strong>Description:</strong><br/>{book.description}</p>
        </div>

        {/* Logic for Buttons */}
        <div style={{marginTop: '20px'}}>
            {book.status !== 'available' ? (
                <button className="btn btn-danger btn-block" disabled>
                    {book.status === 'reserved' ? 'Reserved / Pending' : 'Sold Out'}
                </button>
            ) : !user ? (
                <Link to="/login" className="btn btn-primary btn-block">
                    Login to Buy
                </Link>
            ) : user._id === book.user._id ? (
                <button className="btn btn-secondary btn-block" disabled>
                    This is your listing
                </button>
            ) : (
                <button onClick={handleBuy} className="btn btn-success btn-block">
                    Buy Now
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

// Styles
const containerStyle = {
    display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px',
    backgroundColor: '#fff', padding: '30px', borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
};
const imageSectionStyle = { minWidth: '0' }; // Fixes grid overflow issues
const infoSectionStyle = { display: 'flex', flexDirection: 'column' };
const detailBoxStyle = {
    backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px',
    border: '1px solid #eee', marginTop: '20px', flexGrow: 1
};

export default BookDetails;