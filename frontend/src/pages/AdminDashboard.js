import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaBook, FaEnvelope, FaTrash, FaReply, FaShieldAlt, FaShoppingCart, FaUsers, FaFlag, FaCog, FaDownload, FaCheck, FaTimes } from 'react-icons/fa';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('orders'); 
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalActiveBooks: 0, totalCompletedOrders: 0 });
  const [loading, setLoading] = useState(true);

  // For Settings Tab
  const [settingsForm, setSettingsForm] = useState({ announcementText: '', isAnnouncementActive: false });

  // 1. Security Check & Stats Fetch
  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/');
      toast.error('Access Denied: Admins Only');
    } else {
      fetchStats();
    }
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/users/admin/stats', config);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats', error);
    }
  };

  // 2. Fetch Tab Data
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
      
      if (activeTab === 'orders') url = 'http://localhost:5000/api/orders';
      else if (activeTab === 'books') url = 'http://localhost:5000/api/books';
      else if (activeTab === 'messages') url = 'http://localhost:5000/api/messages';
      else if (activeTab === 'users') url = 'http://localhost:5000/api/users';
      else if (activeTab === 'reports') url = 'http://localhost:5000/api/reports/admin';
      else if (activeTab === 'settings') {
          const { data } = await axios.get('http://localhost:5000/api/settings');
          setSettingsForm({ announcementText: data.announcementText || '', isAnnouncementActive: data.isAnnouncementActive || false });
          setLoading(false);
          return;
      }

      if (url) {
        const { data } = await axios.get(url, config);
        setData(data);
      }
      setLoading(false);
    } catch (error) {
           setLoading(false);
      if (activeTab !== 'settings') toast.error('Error loading data');
    }
  };

  // generic delete
  const deleteItem = async (id) => {
    if (!window.confirm('Are you sure? This action is irreversible.')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      let url = '';
      if (activeTab === 'books') url = `http://localhost:5000/api/books/${id}`;
      else if (activeTab === 'messages') url = `http://localhost:5000/api/messages/${id}`;
      else return;

      await axios.delete(url, config);
      setData(data.filter(item => item._id !== id));
      toast.success('Item removed');
      fetchStats(); // Update stats
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  // Users: Ban/Unban
  const toggleBan = async (id) => {
    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data: resData } = await axios.put(`http://localhost:5000/api/users/${id}/ban`, {}, config);
        toast.success(resData.message);
        setData(data.map(u => u._id === id ? { ...u, isBanned: resData.isBanned } : u));
    } catch (error) { toast.error('Failed to toggle ban'); }
  };

  // Orders: Override
  const overrideOrder = async (id, decision) => {
      if (!window.confirm(`Are you sure you want to force order to ${decision}?`)) return;
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data: resData } = await axios.put(`http://localhost:5000/api/orders/${id}/admin-override`, { decision }, config);
          toast.success(`Order forced to ${decision}`);
          setData(data.map(o => o._id === id ? resData : o));
          fetchStats(); // update stats 
      } catch (error) { toast.error('Failed to override order'); }
  };

  // Orders: CSV Export
  const downloadCSV = async () => {
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` }, responseType: 'blob' };
          const response = await axios.get('http://localhost:5000/api/orders/export/csv', config);
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'orders.csv');
          document.body.appendChild(link);
          link.click();
      } catch (error) { toast.error('Failed to download CSV'); }
  };

  // Reports: Resolve / Dismiss
  const handleReport = async (id, action, deleteBook = false) => {
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          if (action === 'resolve') {
              await axios.put(`http://localhost:5000/api/reports/admin/${id}/resolve`, { deleteBook }, config);
              toast.success('Report resolved' + (deleteBook ? ' and book deleted.' : '.'));
          } else {
              await axios.put(`http://localhost:5000/api/reports/admin/${id}/dismiss`, {}, config);
              toast.success('Report dismissed.');
          }
          setData(data.filter(r => r._id !== id));
          fetchStats();
      } catch (error) { toast.error(`Failed to ${action} report`); }
  };

  // Settings: Save
  const saveSettings = async (e) => {
      e.preventDefault();
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.put('http://localhost:5000/api/settings/admin', settingsForm, config);
          toast.success('Settings updated globally');
      } catch (error) { toast.error('Failed to update settings'); }
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

        {/* STATS ROW */}
        <div style={statsContainerStyle}>
          <div style={statCardStyle}>
              <h3 style={statNumberStyle}>{stats.totalUsers}</h3><p style={statLabelStyle}>Total Users</p>
          </div>
          <div style={statCardStyle}>
              <h3 style={statNumberStyle}>{stats.totalActiveBooks}</h3><p style={statLabelStyle}>Active Books</p>
          </div>
          <div style={statCardStyle}>
              <h3 style={statNumberStyle}>{stats.totalCompletedOrders}</h3><p style={statLabelStyle}>Completed Orders</p>
          </div>
        </div>

        {/* TABS */}
        <div style={tabContainerStyle}>
            <button style={activeTab === 'orders' ? activeTabStyle : tabStyle} onClick={() => setActiveTab('orders')}>
                <FaShoppingCart /> Orders
            </button>
            <button style={activeTab === 'books' ? activeTabStyle : tabStyle} onClick={() => setActiveTab('books')}>
                <FaBook /> Books
            </button>
            <button style={activeTab === 'users' ? activeTabStyle : tabStyle} onClick={() => setActiveTab('users')}>
                <FaUsers /> Users
            </button>
            <button style={activeTab === 'reports' ? activeTabStyle : tabStyle} onClick={() => setActiveTab('reports')}>
                <FaFlag /> Reports
            </button>
            <button style={activeTab === 'messages' ? activeTabStyle : tabStyle} onClick={() => setActiveTab('messages')}>
                <FaEnvelope /> Messages
            </button>
            <button style={activeTab === 'settings' ? activeTabStyle : tabStyle} onClick={() => setActiveTab('settings')}>
                <FaCog /> Settings
            </button>
        </div>

        {/* DATA CARD */}
        <div style={cardStyle}>
            {activeTab === 'orders' && (
                <div style={{padding: '15px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end'}}>
                    <button onClick={downloadCSV} className="btn btn-secondary" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <FaDownload /> Download Orders CSV
                    </button>
                </div>
            )}

            {loading ? (
                <div style={{padding: '40px', textAlign: 'center', color: '#666'}}>Loading database...</div>
            ) : activeTab === 'settings' ? (
                <div style={{padding: '30px', maxWidth: '600px'}}>
                    <h3>Global Site Settings</h3>
                    <form onSubmit={saveSettings}>
                        <div className="form-group mb-3">
                            <label><strong>Announcement Banner Text</strong></label>
                            <input type="text" className="form-control" value={settingsForm.announcementText} onChange={e => setSettingsForm({...settingsForm, announcementText: e.target.value})} placeholder="e.g. Server maintenance tonight at 11 PM" />
                        </div>
                        <div className="form-check mb-4">
                            <input type="checkbox" className="form-check-input" id="announcementCheck" checked={settingsForm.isAnnouncementActive} onChange={e => setSettingsForm({...settingsForm, isAnnouncementActive: e.target.checked})} />
                            <label className="form-check-label" htmlFor="announcementCheck">Enable Banner Globally</label>
                        </div>
                        <button type="submit" className="btn btn-primary">Save Settings</button>
                    </form>
                </div>
            ) : (
                <div style={{overflowX: 'auto'}}>
                    <table style={tableStyle}>
                        <thead>
                            <tr style={tableHeaderRowStyle}>
                                {activeTab === 'orders' && (
                                    <>
                                        <th style={thStyle}>Order ID</th><th style={thStyle}>Book Title</th><th style={thStyle}>Entities</th><th style={thStyle}>Amount</th><th style={thStyle}>Status</th><th style={thStyle}>Override</th>
                                    </>
                                )}
                                {activeTab === 'books' && (
                                    <>
                                        <th style={thStyle}>Title</th><th style={thStyle}>Seller</th><th style={thStyle}>Price</th><th style={thStyle}>Status</th><th style={thStyle}>Actions</th>
                                    </>
                                )}
                                {activeTab === 'messages' && (
                                    <>
                                        <th style={thStyle}>Sender</th><th style={thStyle}>Subject</th><th style={thStyle}>Message</th><th style={thStyle}>Date</th><th style={thStyle}>Actions</th>
                                    </>
                                )}
                                {activeTab === 'users' && (
                                    <>
                                        <th style={thStyle}>Name</th><th style={thStyle}>Email</th><th style={thStyle}>Contact Info</th><th style={thStyle}>Joined</th><th style={thStyle}>Status</th><th style={thStyle}>Action</th>
                                    </>
                                )}
                                {activeTab === 'reports' && (
                                    <>
                                        <th style={thStyle}>Book Flagged</th><th style={thStyle}>Reporter</th><th style={thStyle}>Reason</th><th style={thStyle}>Actions</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr><td colSpan="6" style={{padding: '30px', textAlign: 'center', color: '#888'}}>No records found.</td></tr>
                            ) : data.map(item => (
                                <tr key={item._id} style={trStyle}>
                                    
                                    {/* ORDERS ROW */}
                                    {activeTab === 'orders' && (
                                        <>
                                            <td style={tdStyle}>#{item._id.substring(0, 8)}</td>
                                            <td style={tdStyle}><strong>{item.bookTitle}</strong></td>
                                            <td style={tdStyle}>
                                                <div style={{fontSize: '0.85em'}}>B: {item.buyer?.full_name}</div>
                                                <div style={{fontSize: '0.85em'}}>S: {item.seller?.full_name}</div>
                                            </td>
                                            <td style={tdStyle}>₹{item.totalPrice}</td>
                                            <td style={tdStyle}><span style={getStatusBadge(item.status)}>{item.status}</span></td>
                                            <td style={tdStyle}>
                                                {(item.status === 'Pending Approval' || item.status === 'Accepted') && (
                                                    <div style={{display: 'flex', gap: '5px'}}>
                                                        <button onClick={() => overrideOrder(item._id, 'Completed')} className="btn btn-sm btn-success" title="Force Complete"><FaCheck /></button>
                                                        <button onClick={() => overrideOrder(item._id, 'Cancelled')} className="btn btn-sm btn-danger" title="Force Cancel"><FaTimes /></button>
                                                    </div>
                                                )}
                                            </td>
                                        </>
                                    )}

                                    {/* BOOKS ROW */}
                                    {activeTab === 'books' && (
                                        <>
                                            <td style={tdStyle}><strong>{item.title}</strong><div style={{fontSize: '0.85rem', color: '#888'}}>{item.author}</div></td>
                                            <td style={tdStyle}>{item.user?.full_name || 'Unknown'}</td>
                                            <td style={tdStyle}>₹{item.price}</td>
                                            <td style={tdStyle}><span style={getStatusBadge(item.status)}>{item.status}</span></td>
                                            <td style={tdStyle}>
                                                <button onClick={() => deleteItem(item._id)} style={deleteBtnStyle} title="Delete"><FaTrash /></button>
                                            </td>
                                        </>
                                    )}

                                    {/* MESSAGES ROW */}
                                    {activeTab === 'messages' && (
                                        <>
                                            <td style={tdStyle}><strong>{item.name}</strong><div style={{fontSize: '0.85rem', color: '#888'}}>{item.email}</div></td>
                                            <td style={tdStyle}>{item.subject}</td>
                                            <td style={tdStyle}>{(item.message || '').substring(0, 50)}...</td>
                                            <td style={tdStyle}>{new Date(item.createdAt).toLocaleDateString()}</td>
                                            <td style={tdStyle}>
                                                <button onClick={() => deleteItem(item._id)} style={deleteBtnStyle} title="Delete"><FaTrash /></button>
                                                &nbsp;
                                                <a href={`mailto:${item.email}`} style={replyBtnStyle} title="Reply"><FaReply /></a>
                                            </td>
                                        </>
                                    )}

                                    {/* USERS ROW */}
                                    {activeTab === 'users' && (
                                        <>
                                            <td style={tdStyle}><strong>{item.full_name}</strong> {item.isAdmin && <span style={{color: 'blue', fontSize: '0.8em'}}>(Admin)</span>}</td>
                                            <td style={tdStyle}>{item.email}</td>
                                            <td style={tdStyle}>
                                                <div style={{fontSize: '0.85em'}}>📞 {item.phone || 'N/A'}</div>
                                                <div style={{fontSize: '0.85em'}}>🏠 {item.address || 'N/A'}</div>
                                            </td>
                                            <td style={tdStyle}>{new Date(item.createdAt).toLocaleDateString()}</td>
                                            <td style={tdStyle}>
                                                {item.isBanned ? <span style={getStatusBadge('Cancelled')}>Banned</span> : <span style={getStatusBadge('Completed')}>Active</span>}
                                            </td>
                                            <td style={tdStyle}>
                                                {!item.isAdmin && (
                                                    <button onClick={() => toggleBan(item._id)} className={`btn btn-sm ${item.isBanned ? 'btn-success' : 'btn-danger'}`}>
                                                        {item.isBanned ? 'Unban' : 'Ban'}
                                                    </button>
                                                )}
                                            </td>
                                        </>
                                    )}

                                    {/* REPORTS ROW */}
                                    {activeTab === 'reports' && (
                                        <>
                                            <td style={tdStyle}>
                                                <strong>{item.book?.title || 'Deleted Book'}</strong>
                                                <div style={{fontSize: '0.8em'}}>Seller: {item.book?.user?.full_name || 'N/A'}</div>
                                            </td>
                                            <td style={tdStyle}>{item.reporter?.full_name || 'Unknown'}</td>
                                            <td style={tdStyle}>{item.reason}</td>
                                            <td style={tdStyle}>
                                                <button onClick={() => handleReport(item._id, 'resolve', true)} className="btn btn-sm btn-danger" style={{display: 'block', width: '100%', marginBottom: '5px'}}>Delete Book</button>
                                                <button onClick={() => handleReport(item._id, 'dismiss')} className="btn btn-sm btn-secondary" style={{display: 'block', width: '100%'}}>Dismiss</button>
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

// --- STYLES ---
const pageBackground = { backgroundColor: '#f8f9fa', minHeight: '90vh' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const titleStyle = { fontSize: '2rem', color: '#1a202c', margin: '0 0 5px 0', display: 'flex', alignItems: 'center' };
const subtitleStyle = { color: '#718096', margin: 0 };
const badgeStyle = { backgroundColor: '#ebf8ff', color: '#3182ce', padding: '8px 16px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: '600', border: '1px solid #bee3f8' };

const statsContainerStyle = { display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' };
const statCardStyle = { flex: 1, minWidth: '150px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' };
const statNumberStyle = { margin: 0, fontSize: '2rem', color: '#2b6cb0' };
const statLabelStyle = { margin: 0, color: '#4a5568', fontWeight: 'bold' };

const tabContainerStyle = { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '25px', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px' };
const tabStyle = { background: 'none', border: 'none', fontSize: '1rem', color: '#718096', cursor: 'pointer', padding: '10px 15px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' };
const activeTabStyle = { ...tabStyle, backgroundColor: '#3182ce', color: 'white', fontWeight: '600', boxShadow: '0 4px 6px rgba(49, 130, 206, 0.3)' };

const cardStyle = { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };
const tableHeaderRowStyle = { backgroundColor: '#f7fafc', borderBottom: '1px solid #e2e8f0' };
const thStyle = { padding: '16px 24px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#718096', fontWeight: '600' };
const trStyle = { borderBottom: '1px solid #edf2f7', transition: 'background-color 0.15s' };
const tdStyle = { padding: '16px 24px', fontSize: '0.95rem', color: '#2d3748', verticalAlign: 'middle' };

const deleteBtnStyle = { backgroundColor: '#fff5f5', color: '#e53e3e', border: '1px solid #fed7d7', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
const replyBtnStyle = { backgroundColor: '#ebf8ff', color: '#3182ce', border: '1px solid #bee3f8', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' };

const getStatusBadge = (status) => {
    const base = { padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', display: 'inline-block' };
    if (status === 'available' || status === 'Completed') return { ...base, backgroundColor: '#c6f6d5', color: '#22543d' }; 
    if (status === 'sold' || status === 'Cancelled') return { ...base, backgroundColor: '#cbd5e0', color: '#4a5568' }; 
    return { ...base, backgroundColor: '#feebc8', color: '#744210' }; // Pending/Reserved
};

export default AdminDashboard;