import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: ''
  });

  const { full_name, email, password, confirm_password } = formData;
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Get the login function from context

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      // Send data to Backend
      const response = await axios.post('http://localhost:5000/api/users', {
        full_name,
        email,
        password,
      });

      // If successful, the backend sends back the user data + token
      // We use the Context to save this data and log the user in immediately
      login(response.data);
      
      toast.success('Registration successful!');
      navigate('/'); // Redirect to Home
    } catch (error) {
      // Handle errors (like "User already exists")
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    }
  };

  return (
    <div className="form-container">
      <h2 style={{textAlign: 'center', marginBottom: '20px'}}>Create Account</h2>
      <form onSubmit={onSubmit}>
        <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              className="form-control"
              name="full_name"
              value={full_name}
              onChange={onChange}
              required
            />
        </div>
        <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={email}
              onChange={onChange}
              required
            />
        </div>
        <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={password}
              onChange={onChange}
              required
            />
        </div>
        <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              className="form-control"
              name="confirm_password"
              value={confirm_password}
              onChange={onChange}
              required
            />
        </div>
        <button type="submit" className="btn btn-primary btn-block">
          Register
        </button>
      </form>
      <p style={{marginTop: '15px', textAlign: 'center'}}>
        Already have an account? <Link to="/login" style={{color: '#007bff'}}>Login</Link>
      </p>
    </div>
  );
};

export default Register;