import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaBoxOpen, FaCheckCircle, FaClipboardList, FaUserEdit } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calculate Stats
  const totalBooks = books.length;
  const activeBooks = books.filter(b => b.status === 'available').length;
  const soldBooks = books.filter(b => b.status === 'sold').length;

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      const fetchMyBooks = async () => {
        try {
          const config = {
            headers: { Authorization: `Bearer ${user.token}` },
          };
          const { data } = await axios.get('http://localhost:5000/api/books/mybooks', config);
          setBooks(data);
          setLoading(false);
        } catch (error) {
          toast.error('Could not fetch books');
          setLoading(false);
        }
      };
      fetchMyBooks();
    }
  }, [user, navigate]);

  const deleteBook = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`http://localhost:5000/api/books/${id}`, config);
        setBooks(books.filter((book) => book._id !== id));
        toast.success('Listing removed');
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: '50px'}}>Loading your dashboard...</div>;

  return (
    // 1. FULL WIDTH FIX
    <div style={{ width: '100%', paddingBottom: '50px' }}>
      
      {/* HEADER SECTION */}
      <div style={headerSectionStyle}>
        <div>
            <h1 style={pageTitleStyle}>Seller Dashboard</h1>
            <p style={{color: '#666', margin: 0}}>Manage your inventory and track your sales.</p>
        </div>
        <Link to="/list-book" style={addButtonStyle}>
            <FaPlus style={{marginRight: '8px'}} /> List New Book
        </Link>
      </div>

      {/* STATS ROW */}
      <div style={statsContainerStyle}>
        <div style={statCardStyle}>
            <div style={{...iconBoxStyle, background: '#e7f1ff', color: '#007bff'}}>
                <FaClipboardList />
            </div>
            <div>
                <h3 style={statNumberStyle}>{totalBooks}</h3>
                <p style={statLabelStyle}>Total Listings</p>
            </div>
        </div>
        <div style={statCardStyle}>
            <div style={{...iconBoxStyle, background: '#e6fffa', color: '#00b894'}}>
                <FaBoxOpen />
            </div>
            <div>
                <h3 style={statNumberStyle}>{activeBooks}</h3>
                <p style={statLabelStyle}>Active</p>
            </div>
        </div>
        <div style={statCardStyle}>
            <div style={{...iconBoxStyle, background: '#fff5f5', color: '#ff7675'}}>
                <FaCheckCircle />
            </div>
            <div>
                <h3 style={statNumberStyle}>{soldBooks}</h3>
                <p style={statLabelStyle}>Sold / Completed</p>
            </div>
        </div>
      </div>

      {/* INVENTORY GRID */}
      <h3 style={sectionTitleStyle}>Your Inventory</h3>

      {books.length === 0 ? (
        <div style={emptyStateStyle}>
            <h3>You haven't listed any books yet.</h3>
            <p>Start selling today to clear up space!</p>
            <Link to="/list-book" style={{...addButtonStyle, display: 'inline-block', marginTop: '15px'}}>
                Create First Listing
            </Link>
        </div>
      ) : (
        <div style={gridStyle}>
          {books.map((book) => (
            <div key={book._id} style={cardStyle}>
              {/* Image Header */}
              <div style={imgContainerStyle}>
                <img 
                  src={`http://localhost:5000/${book.image.replace(/\\/g, "/")}`} 
                  alt={book.title} 
                  style={imgStyle} 
                />
                <span style={getBadgeStyle(book.status)}>
                    {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                </span>
              </div>
              
              {/* Content Body */}
              <div style={cardBodyStyle}>
                <h4 style={bookTitleStyle}>{book.title}</h4>
                <div style={priceRowStyle}>
                    <span style={priceStyle}>₹{book.price}</span>
                    <span style={dateStyle}>{new Date(book.createdAt).toLocaleDateString()}</span>
                </div>
                
                {/* BUTTONS ROW: EDIT & DELETE */}
                <div style={{marginTop: 'auto', display: 'flex', gap: '10px'}}>
                    <Link 
                        to={`/edit-book/${book._id}`} 
                        style={editButtonStyle}
                        onClick={(e) => { if(book.status !== 'available') e.preventDefault(); }} 
                        title="Edit Listing"
                    >
                        <FaUserEdit /> Edit
                    </Link>

                    <button 
                        onClick={() => deleteBook(book._id)} 
                        style={book.status !== 'available' ? disabledButtonStyle : deleteButtonStyle}
                        disabled={book.status !== 'available'}
                        title={book.status !== 'available' ? "Sold items cannot be deleted" : "Delete Listing"}
                    >
                        <FaTrash /> Remove
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- STYLES ---

const headerSectionStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px'
};

const pageTitleStyle = { fontSize: '2rem', color: '#2d3436', margin: '0 0 5px 0' };

const addButtonStyle = {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '12px 25px',
    borderRadius: '30px',
    textDecoration: 'none',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0,123,255,0.3)',
    transition: 'transform 0.2s'
};

// Stats
const statsContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
};

const statCardStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #eee',
    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
};

const iconBoxStyle = {
    width: '50px', height: '50px', borderRadius: '12px',
    display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem'
};

const statNumberStyle = { margin: 0, fontSize: '1.8rem', color: '#2d3436' };
const statLabelStyle = { margin: 0, color: '#636e72', fontSize: '0.9rem' };

// Inventory Grid
const sectionTitleStyle = {
    fontSize: '1.4rem', color: '#2d3436', marginBottom: '20px',
    borderBottom: '1px solid #eee', paddingBottom: '10px'
};

const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '25px'
};

const cardStyle = {
    backgroundColor: 'white', borderRadius: '12px', border: '1px solid #eee',
    overflow: 'hidden', transition: 'box-shadow 0.2s', display: 'flex', flexDirection: 'column'
};

const imgContainerStyle = { height: '180px', position: 'relative', backgroundColor: '#f1f2f6' };
const imgStyle = { width: '100%', height: '100%', objectFit: 'cover' };

const cardBodyStyle = { padding: '15px', flexGrow: 1, display: 'flex', flexDirection: 'column' };

const bookTitleStyle = {
    margin: '0 0 10px 0', fontSize: '1.1rem', color: '#2d3436',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
};

const priceRowStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'
};

const priceStyle = { fontSize: '1.1rem', fontWeight: 'bold', color: '#007bff' };
const dateStyle = { fontSize: '0.85rem', color: '#b2bec3' };

// Buttons
const deleteButtonStyle = {
    flex: 1, padding: '10px', border: '1px solid #dc3545', backgroundColor: 'white',
    color: '#dc3545', borderRadius: '6px', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600', transition: 'all 0.2s'
};

const editButtonStyle = {
    flex: 1, padding: '10px', backgroundColor: '#fff', border: '1px solid #007bff',
    color: '#007bff', borderRadius: '6px', textDecoration: 'none', display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600', transition: 'all 0.2s'
};

const disabledButtonStyle = {
    ...deleteButtonStyle, borderColor: '#eee', color: '#ccc', cursor: 'not-allowed'
};

const emptyStateStyle = {
    textAlign: 'center', padding: '60px', backgroundColor: '#f9f9f9',
    borderRadius: '12px', border: '2px dashed #ddd', color: '#636e72'
};

const getBadgeStyle = (status) => {
    const base = {
        position: 'absolute', top: '10px', right: '10px', padding: '5px 12px',
        borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold',
        textTransform: 'uppercase', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    };
    if (status === 'available') return { ...base, backgroundColor: '#00b894', color: 'white' };
    if (status === 'reserved') return { ...base, backgroundColor: '#fdcb6e', color: '#2d3436' };
    return { ...base, backgroundColor: '#636e72', color: 'white' };
};

export default Dashboard;