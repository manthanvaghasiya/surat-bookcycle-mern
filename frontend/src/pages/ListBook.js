import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaCloudUploadAlt, FaRupeeSign, FaBook, FaUserEdit, FaTags } from 'react-icons/fa';

const ListBook = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    condition: 'Like New',
    price: '',
    description: ''
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null); // To show the image before uploading

  const { title, author, genre, condition, price, description } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file)); // Create a preview URL
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      toast.error('Please upload an image of the book');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('title', title);
    uploadData.append('author', author);
    uploadData.append('genre', genre);
    uploadData.append('condition', condition);
    uploadData.append('price', price);
    uploadData.append('description', description);
    uploadData.append('image', image);

    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      await axios.post('http://localhost:5000/api/books', uploadData, config);

      toast.success('Book listed successfully!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Error listing book';
      toast.error(message);
    }
  };

  return (
    <div style={pageBackgroundStyle}>
      <div style={containerStyle}>
        
        {/* Header Section */}
        <div style={headerStyle}>
          <h2 style={titleStyle}>Sell Your Book</h2>
          <p style={subtitleStyle}>Turn your old textbooks into cash. It takes less than a minute.</p>
        </div>

        <form onSubmit={onSubmit}>
          
          {/* Section 1: Book Details */}
          <div style={formSectionStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Book Title</label>
              <div style={inputWrapperStyle}>
                <FaBook style={iconStyle} />
                <input 
                  type="text" 
                  name="title" 
                  value={title} 
                  onChange={onChange} 
                  placeholder="e.g. Introduction to Algorithms" 
                  style={inputStyle} 
                  required 
                />
              </div>
            </div>

            <div style={rowStyle}>
              <div style={halfWidthStyle}>
                <label style={labelStyle}>Author</label>
                <div style={inputWrapperStyle}>
                  <FaUserEdit style={iconStyle} />
                  <input 
                    type="text" 
                    name="author" 
                    value={author} 
                    onChange={onChange} 
                    placeholder="e.g. Thomas Cormen" 
                    style={inputStyle} 
                    required 
                  />
                </div>
              </div>
              <div style={halfWidthStyle}>
                <label style={labelStyle}>Genre / Category</label>
                <div style={inputWrapperStyle}>
                  <FaTags style={iconStyle} />
                  <input 
                    type="text" 
                    name="genre" 
                    value={genre} 
                    onChange={onChange} 
                    placeholder="e.g. Computer Science" 
                    style={inputStyle} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Condition */}
          <div style={formSectionStyle}>
            <div style={rowStyle}>
              <div style={halfWidthStyle}>
                <label style={labelStyle}>Condition</label>
                <select 
                  name="condition" 
                  value={condition} 
                  onChange={onChange} 
                  style={{...inputStyle, paddingLeft: '15px'}} // Select doesn't need icon padding
                >
                  <option value="Like New">Like New (Perfect)</option>
                  <option value="Good">Good (Minor wear)</option>
                  <option value="Acceptable">Acceptable (Highlighting/Notes)</option>
                </select>
              </div>

              <div style={halfWidthStyle}>
                <label style={labelStyle}>Price</label>
                <div style={inputWrapperStyle}>
                  <FaRupeeSign style={iconStyle} />
                  <input 
                    type="number" 
                    name="price" 
                    value={price} 
                    onChange={onChange} 
                    placeholder="250" 
                    style={inputStyle} 
                    required 
                  />
                </div>
              </div>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Description</label>
              <textarea 
                name="description" 
                value={description} 
                onChange={onChange} 
                rows="4" 
                placeholder="Tell buyers about the book... (e.g. 'Used for one semester, no markings')"
                style={textareaStyle} 
                required
              ></textarea>
            </div>
          </div>

          {/* Section 3: Image Upload */}
          <div style={formSectionStyle}>
            <label style={labelStyle}>Book Cover Image</label>
            <div style={uploadBoxStyle}>
              <input 
                type="file" 
                onChange={onFileChange} 
                accept="image/*" 
                style={hiddenInputStyle} 
                id="file-upload"
              />
              <label htmlFor="file-upload" style={uploadLabelStyle}>
                {preview ? (
                  <img src={preview} alt="Preview" style={previewImageStyle} />
                ) : (
                  <>
                    <FaCloudUploadAlt style={{fontSize: '3rem', color: '#007bff', marginBottom: '10px'}} />
                    <span style={{fontSize: '1.1rem', fontWeight: '500', color: '#555'}}>Click to Upload Image</span>
                    <span style={{fontSize: '0.9rem', color: '#999'}}>JPG or PNG only</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <button type="submit" style={submitButtonStyle}>Post Listing</button>

        </form>
      </div>
    </div>
  );
};

// --- MODERN STYLES ---

const pageBackgroundStyle = {
  backgroundColor: '#f4f6f8',
  padding: '40px 20px',
  minHeight: '80vh'
};

const containerStyle = {
  maxWidth: '700px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  padding: '40px',
  borderRadius: '12px',
  boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
  border: '1px solid #eaeaea'
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '30px',
  borderBottom: '1px solid #eee',
  paddingBottom: '20px'
};

const titleStyle = {
  margin: '0 0 10px 0',
  color: '#222',
  fontSize: '1.8rem'
};

const subtitleStyle = {
  margin: 0,
  color: '#666'
};

const formSectionStyle = {
  marginBottom: '25px'
};

const rowStyle = {
  display: 'flex',
  gap: '20px',
  marginBottom: '20px',
  flexWrap: 'wrap'
};

const halfWidthStyle = {
  flex: 1,
  minWidth: '200px'
};

const inputGroupStyle = {
  marginBottom: '20px'
};

const labelStyle = {
  display: 'block',
  fontWeight: '600',
  marginBottom: '8px',
  color: '#444',
  fontSize: '0.95rem'
};

const inputWrapperStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
};

const iconStyle = {
  position: 'absolute',
  left: '15px',
  color: '#888',
  zIndex: 1
};

const inputStyle = {
  width: '100%',
  padding: '12px 15px 12px 40px', // Extra padding-left for icon
  borderRadius: '8px',
  border: '1px solid #ddd',
  fontSize: '1rem',
  backgroundColor: '#fcfcfc',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box'
};

const textareaStyle = {
  width: '100%',
  padding: '12px 15px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  fontSize: '1rem',
  backgroundColor: '#fcfcfc',
  outline: 'none',
  minHeight: '100px',
  fontFamily: 'inherit',
  resize: 'vertical',
  boxSizing: 'border-box'
};

const uploadBoxStyle = {
  border: '2px dashed #cce5ff',
  borderRadius: '12px',
  backgroundColor: '#f8fbff',
  textAlign: 'center',
  position: 'relative',
  transition: 'all 0.3s',
  cursor: 'pointer'
};

const hiddenInputStyle = {
  display: 'none'
};

const uploadLabelStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '30px',
  cursor: 'pointer',
  width: '100%',
  boxSizing: 'border-box'
};

const previewImageStyle = {
  maxHeight: '200px',
  maxWidth: '100%',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
};

const submitButtonStyle = {
  width: '100%',
  padding: '15px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  marginTop: '10px',
  boxShadow: '0 4px 12px rgba(0,123,255,0.2)'
};

export default ListBook;