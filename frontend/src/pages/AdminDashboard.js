import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaBook, FaEnvelope, FaTrash, FaReply, FaShieldAlt, FaShoppingCart } from 'react-icons/fa';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('orders'); // Default to orders
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Security Check
  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/');
      toast.error('Access Denied: Admins Only');
    }
  }, [user, navigate]);

  // 2. Fetch Data
  useEffect(() => {
    if (user && user.isAdmin) {
      fetchData();
    }
  }, [activeTab, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      let url = '';
      
      if (activeTab === 'orders') url = 'http://localhost:5000/api/orders'; // Admin route
      if (activeTab === 'books') url = 'http://localhost:5000/api/books';
      if (activeTab === 'messages') url = 'http://localhost:5000/api/messages';

      const { data } = await axios.get(url, config);
      setData(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error('Error loading data');
    }
  };

  // 3. Delete Item (Generic)
  const deleteItem = async (id) => {
    if (!window.confirm('Are you sure? This action is irreversible.')) return;
    
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      let url = '';
      // Note: We don't usually delete orders, but for admin power:
      if (activeTab === 'orders') {
         // If you want to allow deleting orders, you need a delete route in backend.
         // For now, let's show an alert or implement if needed.
         alert("Order deletion requires a backend route. Currently disabled for safety.");
         return;
      }
      if (activeTab === 'books') url = `http://localhost:5000/api/books/${id}`;
      if (activeTab === 'messages') url = `http://localhost:5000/api/messages/${id}`;

      await axios.delete(url, config);
      setData(data.filter(item => item._id !== id));
      toast.success('Item removed');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div style={pageBackground}>
      <div className="container" style={{maxWidth: '1200px', padding: '40px 20px'}}>
        
        {/* HEADER */}
        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>
                <FaShieldAlt style={{marginRight: '12px', color: '#007bff'}}/>
                Admin Portal
            </h1>
            <p style={subtitleStyle}>Overview and management of the marketplace.</p>
          </div>
          <div style={badgeStyle}>Admin Access Granted</div>
        </div>

        {/* TABS */}
        <div style={tabContainerStyle}>
            <button 
                style={activeTab === 'orders' ? activeTabStyle : tabStyle} 
                onClick={() => setActiveTab('orders')}
            >
                <FaShoppingCart /> Manage Orders
            </button>
            <button 
                style={activeTab === 'books' ? activeTabStyle : tabStyle} 
                onClick={() => setActiveTab('books')}
            >
                <FaBook /> Manage Books
            </button>
            <button 
                style={activeTab === 'messages' ? activeTabStyle : tabStyle} 
                onClick={() => setActiveTab('messages')}
            >
                <FaEnvelope /> Messages
            </button>
        </div>

        {/* DATA CARD */}
        <div style={cardStyle}>
            {loading ? (
                <div style={{padding: '40px', textAlign: 'center', color: '#666'}}>Loading database...</div>
            ) : (
                <div style={{overflowX: 'auto'}}>
                    <table style={tableStyle}>
                        <thead>
                            <tr style={tableHeaderRowStyle}>
                                {activeTab === 'orders' && (
                                    <>
                                        <th style={thStyle}>Order ID</th>
                                        <th style={thStyle}>Book Title</th>
                                        <th style={thStyle}>Buyer</th>
                                        <th style={thStyle}>Seller</th>
                                        <th style={thStyle}>Amount</th>
                                        <th style={thStyle}>Status</th>
                                    </>
                                )}
                                {activeTab === 'books' && (
                                    <>
                                        <th style={thStyle}>Title</th>
                                        <th style={thStyle}>Seller</th>
                                        <th style={thStyle}>Price</th>
                                        <th style={thStyle}>Status</th>
                                        <th style={thStyle}>Actions</th>
                                    </>
                                )}
                                {activeTab === 'messages' && (
                                    <>
                                        <th style={thStyle}>Sender</th>
                                        <th style={thStyle}>Subject</th>
                                        <th style={thStyle}>Message</th>
                                        <th style={thStyle}>Date</th>
                                        <th style={thStyle}>Actions</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{padding: '30px', textAlign: 'center', color: '#888'}}>
                                        No records found.
                                    </td>
                                </tr>
                            ) : data.map(item => (
                                <tr key={item._id} style={trStyle}>
                                    
                                    {/* --- ORDERS ROW --- */}
                                    {activeTab === 'orders' && item.bookTitle && (
                                        <>
                                            <td style={tdStyle}>#{item._id.substring(0, 8)}</td>
                                            <td style={tdStyle}><strong>{item.bookTitle}</strong></td>
                                            <td style={tdStyle}>{item.buyer?.full_name || 'Unknown'}</td>
                                            <td style={tdStyle}>{item.seller?.full_name || 'Unknown'}</td>
                                            <td style={tdStyle}>₹{item.totalPrice}</td>
                                            <td style={tdStyle}>
                                                <span style={getStatusBadge(item.status)}>{item.status}</span>
                                            </td>
                                        </>
                                    )}

                                    {/* --- BOOKS ROW --- */}
                                    {activeTab === 'books' && item.title && (
                                        <>
                                            <td style={tdStyle}>
                                                <strong>{item.title}</strong>
                                                <div style={{fontSize: '0.85rem', color: '#888'}}>{item.author}</div>
                                            </td>
                                            <td style={tdStyle}>{item.user?.full_name || 'Unknown'}</td>
                                            <td style={tdStyle}>₹{item.price}</td>
                                            <td style={tdStyle}>
                                                <span style={getStatusBadge(item.status)}>{item.status}</span>
                                            </td>
                                            <td style={tdStyle}>
                                                <button onClick={() => deleteItem(item._id)} style={deleteBtnStyle} title="Delete Listing">
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </>
                                    )}

                                    {/* --- MESSAGES ROW --- */}
                                    {activeTab === 'messages' && item.message && (
                                        <>
                                            <td style={tdStyle}>
                                                <strong>{item.name}</strong>
                                                <div style={{fontSize: '0.85rem', color: '#888'}}>{item.email}</div>
                                            </td>
                                            <td style={tdStyle}>{item.subject}</td>
                                            <td style={tdStyle}>
                                                {(item.message || '').substring(0, 50)}...
                                            </td>
                                            <td style={tdStyle}>
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </td>
                                            <td style={tdStyle}>
                                                <a href={`mailto:${item.email}`} style={replyBtnStyle} title="Reply">
                                                    <FaReply />
                                                </a>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// --- STYLES (Same as before + Order Styles) ---
const pageBackground = { backgroundColor: '#f8f9fa', minHeight: '90vh' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const titleStyle = { fontSize: '2rem', color: '#1a202c', margin: '0 0 5px 0', display: 'flex', alignItems: 'center' };
const subtitleStyle = { color: '#718096', margin: 0 };
const badgeStyle = { backgroundColor: '#ebf8ff', color: '#3182ce', padding: '8px 16px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: '600', border: '1px solid #bee3f8' };

const tabContainerStyle = { display: 'flex', gap: '15px', marginBottom: '25px', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px' };
const tabStyle = { background: 'none', border: 'none', fontSize: '1rem', color: '#718096', cursor: 'pointer', padding: '10px 20px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' };
const activeTabStyle = { ...tabStyle, backgroundColor: '#3182ce', color: 'white', fontWeight: '600', boxShadow: '0 4px 6px rgba(49, 130, 206, 0.3)' };

const cardStyle = { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const tableHeaderRowStyle = { backgroundColor: '#f7fafc', borderBottom: '1px solid #e2e8f0' };
const thStyle = { padding: '16px 24px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#718096', fontWeight: '600' };
const trStyle = { borderBottom: '1px solid #edf2f7', transition: 'background-color 0.15s' };
const tdStyle = { padding: '16px 24px', fontSize: '0.95rem', color: '#2d3748', verticalAlign: 'middle' };

const deleteBtnStyle = { backgroundColor: '#fff5f5', color: '#e53e3e', border: '1px solid #fed7d7', borderRadius: '6px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const replyBtnStyle = { backgroundColor: '#ebf8ff', color: '#3182ce', border: '1px solid #bee3f8', borderRadius: '6px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' };

const getStatusBadge = (status) => {
    const base = { padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', display: 'inline-block' };
    if (status === 'available' || status === 'Completed') return { ...base, backgroundColor: '#c6f6d5', color: '#22543d' }; 
    if (status === 'sold' || status === 'Cancelled') return { ...base, backgroundColor: '#cbd5e0', color: '#4a5568' }; 
    return { ...base, backgroundColor: '#feebc8', color: '#744210' }; // Pending/Reserved
};

export default AdminDashboard;