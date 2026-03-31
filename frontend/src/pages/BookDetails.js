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
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

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
      await axios.post('http://localhost:5000/api/orders', { bookId: book._id, quantity: qty }, config);

      toast.success('Order requested! Awaiting seller approval.');
      navigate('/myorders'); // Redirect to orders page
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('update your phone number')) {
          toast.warning(error.response.data.message);
          navigate('/profile');
      } else {
          toast.error(error.response?.data?.message || 'Purchase failed');
      }
    }
  };

  // Handle Report Button Click
  const handleReport = async () => {
      const reason = window.prompt("Why are you reporting this book? (e.g. Inappropriate content, spam)");
      if (!reason) return;
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.post('http://localhost:5000/api/reports', { book: book._id, reason }, config);
          toast.success("Report submitted to Admins successfully.");
      } catch (error) {
          toast.error("Failed to submit report. Please try again.");
      }
  };

  // Submit Review
  const submitReviewHandler = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`http://localhost:5000/api/books/${id}/reviews`, { rating, comment }, config);
      toast.success('Review submitted successfully');
      setRating(0);
      setComment("");
      // Fetch book data again to update reviews
      const { data } = await axios.get(`http://localhost:5000/api/books/${id}`);
      setBook(data);
    } catch (error) {
       toast.error(error.response?.data?.message || 'Error submitting review');
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
        
        {/* Rating Display */}
        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px'}}>
            <div style={{color: '#ffc107', fontSize: '1.2rem'}}>
                {'★'.repeat(Math.round(book.rating || 0)) + '☆'.repeat(5 - Math.round(book.rating || 0))}
            </div>
            <span style={{color: '#666'}}>({book.numReviews || 0} Reviews)</span>
        </div>

        <p style={{fontSize: '1.2em', color: '#555', margin: '5px 0'}}>by {book.author}</p>
        <h2 style={{color: '#007bff'}}>₹{book.price}</h2>

        <div style={detailBoxStyle}>
            <p><strong>Seller:</strong> {book.user?.full_name}</p>
            <p><strong>Condition:</strong> {book.condition}</p>
            <p><strong>Quantity Available:</strong> {book.quantity}</p>
            <p><strong>Description:</strong><br/>{book.description}</p>
        </div>

        {/* Logic for Buttons */}
        <div style={{marginTop: '20px'}}>
            {book.status !== 'available' && book.quantity <= 0 ? (
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
                <>
                    {/* Quantity Selector */}
                    {book.quantity > 0 && (
                        <div style={{marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <label style={{fontWeight: 'bold'}}>Quantity to Buy:</label>
                            <select 
                                value={qty} 
                                onChange={(e) => setQty(Number(e.target.value))}
                                style={{padding: '5px 10px', borderRadius: '4px', border: '1px solid #ccc'}}
                            >
                                {[...Array(book.quantity).keys()].map((x) => (
                                    <option key={x + 1} value={x + 1}>
                                    {x + 1}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <button onClick={handleBuy} className="btn btn-success btn-block">
                        Buy Now
                    </button>
                </>
            )}

            {/* NEW REPORT BUTTON */}
            {user && user._id !== book.user?._id && (
                <button onClick={handleReport} className="btn btn-outline-danger btn-block" style={{marginTop: '10px'}}>
                    Flag / Report Listing
                </button>
            )}
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <div style={{gridColumn: '1 / -1', marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '30px'}}>
        <h2>Reviews</h2>
        {book.reviews?.length === 0 && <p>No reviews yet. Be the first to review!</p>}
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px'}}>
            {book.reviews?.map((review) => (
                <div key={review._id} style={{padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                        <strong>{review.name}</strong>
                        <span style={{color: '#ffc107'}}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    </div>
                    <p style={{margin: '5px 0 0 0', color: '#555'}}>{review.comment}</p>
                    <small style={{color: '#999'}}>{new Date(review.createdAt).toLocaleDateString()}</small>
                </div>
            ))}
        </div>

        {/* WRITE REVIEW FORM */}
        {user ? (
            <div style={{backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd'}}>
                <h3>Write a Customer Review</h3>
                <form onSubmit={submitReviewHandler}>
                    <div style={{marginBottom: '15px'}}>
                        <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Rating</label>
                        <select 
                            value={rating} 
                            onChange={(e) => setRating(Number(e.target.value))}
                            style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc'}}
                        >
                            <option value="">Select...</option>
                            <option value="1">1 - Poor</option>
                            <option value="2">2 - Fair</option>
                            <option value="3">3 - Good</option>
                            <option value="4">4 - Very Good</option>
                            <option value="5">5 - Excellent</option>
                        </select>
                    </div>
                    <div style={{marginBottom: '15px'}}>
                        <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Comment</label>
                        <textarea
                            rows="3"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical'}}
                            placeholder="Share your thoughts about this book's condition or the seller..."
                        ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary">Submit Review</button>
                </form>
            </div>
        ) : (
            <div style={{backgroundColor: '#f1f8ff', padding: '15px', borderRadius: '8px', color: '#0056b3'}}>
                Please <Link to="/login" style={{fontWeight: 'bold', textDecoration: 'underline'}}>sign in</Link> to write a review
            </div>
        )}
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