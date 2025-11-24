import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;
  
  const navigate = useNavigate();
  const { login, user } = useContext(AuthContext);

  // If user is already logged in, kick them to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/users/login', {
        email,
        password,
      });

      // Save user data (including token)
      login(response.data);
      
      toast.success('Login successful');
      navigate('/dashboard'); 
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
    }
  };

  return (
    <div className="form-container">
      <h2 style={{textAlign: 'center', marginBottom: '20px'}}>Login</h2>
      <form onSubmit={onSubmit}>
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
        <button type="submit" className="btn btn-success btn-block">
          Login
        </button>
      </form>
      <p style={{marginTop: '15px', textAlign: 'center'}}>
        Don't have an account? <Link to="/register" style={{color: '#007bff'}}>Register</Link>
      </p>
    </div>
  );
};

export default Login;