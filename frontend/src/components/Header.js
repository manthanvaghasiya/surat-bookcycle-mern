import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { FaUserCircle, FaSignOutAlt, FaPlus } from 'react-icons/fa';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        if (user && user.token) {
           const config = { headers: { Authorization: `Bearer ${user.token}` } };
           // Catch potential 404s/errors securely
           const { data } = await axios.get('http://localhost:5000/api/messages/unread-count', config);
           setUnreadCount(data.count);
        }
      } catch (err) {
        console.error('Error fetching unread count');
      }
    };
    
    fetchUnread();
    
    // Poll every 30 seconds for a real-time feel
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={headerStyle}>
      <div style={navContainerStyle}>
        {/* Logo */}
        <Link to="/" style={logoLinkStyle}>
          <span style={{color: '#007bff'}}>Surat</span> BookCycle
        </Link>

        {/* Navigation */}
        <nav>
          <ul style={navListStyle}>
            <li><Link to="/" style={linkStyle}>Home</Link></li>
            
            {user ? (
              // LOGGED IN
              <>
               
                <li><Link to="/dashboard" style={linkStyle}>Dashboard</Link></li>
                <li><Link to="/myorders" style={linkStyle}>My Orders</Link></li>
                 <li><Link to="/contact" style={linkStyle}>Contact</Link></li>
                {/* Admin Link (Only shows if admin) */}
                {user.isAdmin && (
                    <li><Link to="/admin" style={{...linkStyle, color: '#dc3545'}}>Admin</Link></li>
                )}

                <li style={profileContainerStyle}>
                    <FaUserCircle style={{fontSize: '1.2rem', color: '#007bff'}} />
                    <Link to="/profile" style={{fontWeight: '600', textDecoration: 'none', color: '#333', position: 'relative'}}>
                        {user.full_name.split(' ')[0]}
                        {unreadCount > 0 && (
                            <span style={badgeCss}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                        )}
                    </Link>
                    <button onClick={onLogout} style={logoutBtnStyle} title="Logout">
                        <FaSignOutAlt />
                    </button>
                </li>
              </>
            ) : (
              // GUEST
              <>
                <li><Link to="/login" style={linkStyle}>Login</Link></li>
                <li><Link to="/register" style={registerBtnStyle}>Register</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

// ... (Keep the same styles as before)
const headerStyle = { backgroundColor: '#ffffff', height: '70px', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
const navContainerStyle = { width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const logoLinkStyle = { fontSize: '1.5rem', fontWeight: '800', color: '#333', textDecoration: 'none', letterSpacing: '-0.5px' };
const navListStyle = { listStyle: 'none', display: 'flex', alignItems: 'center', gap: '25px', margin: 0, padding: 0 };
const linkStyle = { color: '#555', fontWeight: '500', textDecoration: 'none', fontSize: '1rem', transition: 'color 0.2s' };
const actionBtnStyle = { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#e7f1ff', color: '#007bff', padding: '8px 15px', borderRadius: '20px', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' };
const registerBtnStyle = { backgroundColor: '#007bff', color: '#fff', padding: '8px 20px', borderRadius: '4px', textDecoration: 'none', fontWeight: '600' };
const profileContainerStyle = { display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid #eee', paddingLeft: '20px', marginLeft: '10px' };
const logoutBtnStyle = { background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '1.1rem', padding: '5px', display: 'flex', alignItems: 'center' };
const badgeCss = {
  position: 'absolute', top: '-8px', right: '-15px', backgroundColor: '#dc3545',
  color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold'
};

export default Header;