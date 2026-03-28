import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';

const MyOrders = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Orders on Load
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      const fetchOrders = async () => {
        try {
          const config = {
            headers: { Authorization: `Bearer ${user.token}` },
          };
          const { data } = await axios.get('http://localhost:5000/api/orders/myorders', config);
          setOrders(data);
          setLoading(false);
        } catch (error) {
          toast.error('Could not fetch orders');
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [user, navigate]);

  // Handle Mutual Confirm
  const handleMutualConfirm = async (id) => {
    if (!window.confirm('Have you safely received the book from the seller?')) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`http://localhost:5000/api/orders/${id}/mutual-confirm`, {}, config);
      
      // Update UI locally
      setOrders(orders.map(order => 
        order._id === id ? data : order
      ));
      toast.success(data.status === 'Completed' ? 'Purchase Completed!' : 'Confirmed. Waiting for seller...');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error confirming order');
    }
  };

  // Handle Cancel Order
  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel?')) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/orders/${id}/cancel`, {}, config);

      // Update UI locally
      setOrders(orders.map(order => 
        order._id === id ? { ...order, status: 'Cancelled' } : order
      ));
      toast.info('Order Cancelled');
    } catch (error) {
      toast.error('Error cancelling order');
    }
  };

  if (loading) return <h3>Loading...</h3>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{borderBottom: '2px solid #eee', paddingBottom: '10px'}}>My Order History</h2>

      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <div>
          {orders.map((order) => (
            <div key={order._id} style={cardStyle}>
              {/* Header */}
              <div style={headerStyle}>
                <span>Order #{order._id.substring(0, 10)}...</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                <span style={getStatusStyle(order.status)}>{order.status}</span>
              </div>

              {/* Body */}
              <div style={{ padding: '20px' }}>
                <div style={itemStyle}>
                    <div style={{fontWeight: 'bold'}}>
                        {order.bookTitle} <span style={{color: '#666', fontWeight: 'normal'}}> - (Seller: {order.seller?.full_name})</span>
                    </div>
                    <div style={{color: '#007bff', fontWeight: 'bold'}}>
                        ₹{order.totalPrice}
                    </div>
                </div>

                {/* Show seller info if accepted/completed */}
                {(order.status === 'Accepted' || order.status === 'Completed') && order.seller && (
                  <div style={{marginTop: '10px', fontSize: '0.9em', color: '#555', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '5px'}}>
                    <p style={{margin: '2px 0', color: '#333'}}><strong>Meet the seller at:</strong></p>
                    <p style={{margin: '2px 0'}}><strong>Contact:</strong> {order.seller.phone || 'N/A'}</p>
                    <p style={{margin: '2px 0'}}><strong>Address:</strong> {order.seller.address || 'N/A'}</p>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  {order.status === 'Pending Approval' && (
                    <button 
                        onClick={() => handleCancel(order._id)} 
                        className="btn btn-danger" 
                        style={{flex: 1}}
                    >
                        Cancel Request
                    </button>
                  )}
                  {order.status === 'Accepted' && (
                    <button 
                        onClick={() => handleMutualConfirm(order._id)} 
                        className="btn btn-success" 
                        style={{flex: 1}}
                        disabled={order.buyerConfirmed}
                    >
                        {order.buyerConfirmed ? 'Waiting for seller to confirm...' : 'I received this book'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Styles
const cardStyle = {
  backgroundColor: '#fff', border: '1px solid #ddd',
  borderRadius: '8px', marginBottom: '20px', overflow: 'hidden'
};
const headerStyle = {
  backgroundColor: '#f8f9fa', padding: '15px', borderBottom: '1px solid #ddd',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold'
};
const itemStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingBottom: '10px', borderBottom: '1px solid #eee'
};
const getStatusStyle = (status) => {
    const base = { padding: '5px 10px', borderRadius: '15px', fontSize: '0.85em', color: 'white' };
    if (status === 'Pending Approval') return { ...base, backgroundColor: '#ffc107', color: '#333' };
    if (status === 'Accepted') return { ...base, backgroundColor: '#17a2b8' };
    if (status === 'Completed') return { ...base, backgroundColor: '#28a745' };
    if (status === 'Rejected' || status === 'Cancelled') return { ...base, backgroundColor: '#dc3545' };
    return base;
};

export default MyOrders;