import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1 style={{ fontSize: '6rem', color: '#e2e8f0', margin: 0 }}>404</h1>
      <h2 style={{ color: '#2d3748' }}>Page Not Found</h2>
      <p style={{ color: '#718096', marginBottom: '30px' }}>
        Oops! The page you are looking for does not exist.
      </p>
      <Link to="/" className="btn btn-primary">
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;