import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaCloudUploadAlt, FaRupeeSign, FaBook, FaUserEdit, FaTags, FaSave } from 'react-icons/fa';

const EditBook = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams(); // Get Book ID from URL

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    condition: '',
    price: '',
    description: ''
  });

  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState(''); // To show the old image
  const [preview, setPreview] = useState(null);

  const { title, author, genre, condition, price, description } = formData;

  // 1. Fetch Existing Data on Load
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/books/${id}`);
        setFormData({
            title: data.title,
            author: data.author,
            genre: data.genre,
            condition: data.condition,
            price: data.price,
            description: data.description
        });
        setCurrentImage(data.image);
      } catch (error) {
        toast.error('Error loading book details');
        navigate('/dashboard');
      }
    };
    fetchBook();
  }, [id, navigate]);

  const onChange = (e) => {
    setFormData((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const uploadData = new FormData();
    uploadData.append('title', title);
    uploadData.append('author', author);
    uploadData.append('genre', genre);
    uploadData.append('condition', condition);
    uploadData.append('price', price);
    uploadData.append('description', description);
    
    // Only append image if user selected a NEW one
    if (image) {
        uploadData.append('image', image);
    }

    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      await axios.put(`http://localhost:5000/api/books/${id}`, uploadData, config);

      toast.success('Book updated successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  // Reusing the Modern Styles from ListBook (Simplified for brevity)
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '15px' };

  return (
    <div className="container" style={{maxWidth: '700px', marginTop: '40px'}}>
      <div className="form-container" style={{maxWidth: '100%', padding: '40px'}}>
        <h2 style={{textAlign: 'center', marginBottom: '30px'}}>Edit Listing</h2>
        
        <form onSubmit={onSubmit}>
            <label>Title</label>
            <input type="text" name="title" value={title} onChange={onChange} style={inputStyle} required />

            <div style={{display: 'flex', gap: '20px'}}>
                <div style={{flex: 1}}>
                    <label>Author</label>
                    <input type="text" name="author" value={author} onChange={onChange} style={inputStyle} required />
                </div>
                <div style={{flex: 1}}>
                    <label>Price (₹)</label>
                    <input type="number" name="price" value={price} onChange={onChange} style={inputStyle} required />
                </div>
            </div>

            <div style={{display: 'flex', gap: '20px'}}>
                <div style={{flex: 1}}>
                    <label>Genre</label>
                    <input type="text" name="genre" value={genre} onChange={onChange} style={inputStyle} />
                </div>
                <div style={{flex: 1}}>
                    <label>Condition</label>
                    <select name="condition" value={condition} onChange={onChange} style={inputStyle}>
                        <option value="Like New">Like New</option>
                        <option value="Good">Good</option>
                        <option value="Acceptable">Acceptable</option>
                    </select>
                </div>
            </div>

            <label>Description</label>
            <textarea name="description" value={description} onChange={onChange} rows="4" style={inputStyle} required></textarea>

            <label>Book Image</label>
            <div style={{marginBottom: '20px', textAlign: 'center'}}>
                {/* Show New Preview OR Old Image */}
                {preview ? (
                    <img src={preview} alt="New" style={{height: '150px', borderRadius: '8px'}} />
                ) : (
                    <img 
                        src={currentImage ? `http://localhost:5000/${currentImage.replace(/\\/g, "/")}` : ''} 
                        alt="Current" 
                        style={{height: '150px', borderRadius: '8px', opacity: 0.6}} 
                    />
                )}
                <p style={{fontSize: '0.9em', color: '#666'}}>
                    {image ? 'New image selected' : 'Current image (upload new to change)'}
                </p>
                <input type="file" onChange={onFileChange} accept="image/*" />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
                <FaSave /> Save Changes
            </button>
        </form>
      </div>
    </div>
  );
};

export default EditBook;