import React from 'react';

const Footer = () => {
  return (
    <footer style={footerStyle}>
      <p style={{ margin: 0 }}>
        &copy; {new Date().getFullYear()} Surat BookCycle. All Rights Reserved.
      </p>
      <p style={{ margin: '5px 0 0', fontSize: '0.9em', opacity: 0.8 }}>
        Designed by Manthan 
      </p>
    </footer>
  );
};

// --- STYLES ---
const footerStyle = {
  backgroundColor: '#343a40',
  color: '#ffffff',
  textAlign: 'center',
  padding: '20px 0',
  marginTop: 'auto', // Keeps it at the bottom
  fontSize: '0.9rem',
};

export default Footer;