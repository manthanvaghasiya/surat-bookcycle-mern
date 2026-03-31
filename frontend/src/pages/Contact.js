import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEnvelope, FaUser, FaPaperPlane, FaHeading } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';

const Contact = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const { name, email, subject, message } = formData;
  const [messages, setMessages] = useState([]);
  const [replyTexts, setReplyTexts] = useState({});

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (user && user.token) {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data } = await axios.get('http://localhost:5000/api/messages/my-messages', config);
          setMessages(data);
          
          try {
            await axios.put('http://localhost:5000/api/messages/mark-read', {}, config);
          } catch(e) {}
        }
      } catch (err) {
        console.error('Error fetching messages');
      }
    };
    fetchMessages();
  }, [user]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const config = user && user.token ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
      
      const { data } = await axios.post('http://localhost:5000/api/messages', formData, config);
      
      toast.success('Message sent! We will get back to you shortly.');
      setFormData({ name: '', email: '', subject: '', message: '' }); 
      
      if (user) {
          setMessages([data, ...messages]);
      }
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleReplyChange = (id, text) => {
    setReplyTexts(prev => ({ ...prev, [id]: text }));
  };

  const handleUserReply = async (messageId) => {
    const text = replyTexts[messageId];
    if (!text) return;
    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data: updatedMsg } = await axios.put(`http://localhost:5000/api/messages/${messageId}/user-reply`, { replyText: text }, config);
        
        setMessages(prev => prev.map(m => m._id === messageId ? updatedMsg : m));
        setReplyTexts(prev => ({ ...prev, [messageId]: '' }));
        toast.success('Reply sent!');
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to send reply');
    }
  };

  return (
    <div style={pageStyle}>
      <div className="container" style={{maxWidth: '800px'}}>
        <div style={headerStyle}>
            <h1 style={{fontSize: '2.5rem', color: '#2d3748'}}>Support Center</h1>
            <p style={{color: '#718096'}}>Create a new ticket or manage your existing requests below.</p>
        </div>

        <div className="form-container" style={{maxWidth: '100%', marginBottom: '40px', padding: '30px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
            <h3 style={{marginBottom: '20px', color: '#2d3748', borderBottom: '2px solid #edf2f7', paddingBottom: '10px'}}>Open a New Ticket</h3>
            <form onSubmit={onSubmit}>
                <div style={rowStyle}>
                    <div style={groupStyle}>
                        <label style={labelStyle}>Your Name</label>
                        <div style={inputWrapper}>
                            <FaUser style={iconStyle} />
                            <input type="text" name="name" value={name} onChange={onChange} style={inputStyle} required placeholder="John Doe" />
                        </div>
                    </div>
                    <div style={groupStyle}>
                        <label style={labelStyle}>Email Address</label>
                        <div style={inputWrapper}>
                            <FaEnvelope style={iconStyle} />
                            <input type="email" name="email" value={email} onChange={onChange} style={inputStyle} required placeholder="john@example.com" />
                        </div>
                    </div>
                </div>

                <div style={{marginBottom: '20px'}}>
                    <label style={labelStyle}>Subject</label>
                    <div style={inputWrapper}>
                        <FaHeading style={iconStyle} />
                        <input type="text" name="subject" value={subject} onChange={onChange} style={inputStyle} required placeholder="How do I buy a book?" />
                    </div>
                </div>

                <div style={{marginBottom: '20px'}}>
                    <label style={labelStyle}>Message</label>
                    <textarea name="message" value={message} onChange={onChange} rows="5" style={textareaStyle} required placeholder="Type your message here..."></textarea>
                </div>

                <button type="submit" className="btn btn-primary" style={{padding: '10px 25px'}}>
                    <FaPaperPlane style={{marginRight: '8px'}}/> Send Message
                </button>
            </form>
        </div>

        {user && messages.length > 0 && (
            <div className="tickets-container" style={{maxWidth: '100%'}}>
               <h3 style={{marginBottom: '20px', color: '#2d3748', borderBottom: '2px solid #edf2f7', paddingBottom: '10px'}}>My Support History</h3>
               <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                   {messages.map(msg => (
                       <div key={msg._id} style={ticketCardStyle}>
                           <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                               <h4 style={{margin: 0, color: '#2c5282'}}>{msg.subject}</h4>
                               <span style={{
                                   padding: '4px 12px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase',
                                   backgroundColor: msg.status === 'Resolved' || msg.status === 'Replied' ? '#c6f6d5' : (msg.status === 'Awaiting User' ? '#bee3f8' : '#feebc8'),
                                   color: msg.status === 'Resolved' || msg.status === 'Replied' ? '#22543d' : (msg.status === 'Awaiting User' ? '#2c5282' : '#744210')
                               }}>
                                   {msg.status}
                               </span>
                           </div>
                           <div style={{color: '#a0aec0', fontSize: '0.8rem', marginBottom: '15px'}}>
                               Ticket opened on {new Date(msg.createdAt).toLocaleDateString()}
                           </div>
                           
                           <div style={{...replyBoxStyle, padding: '15px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto'}}>
                               {msg.conversation && msg.conversation.length > 0 ? (
                                   msg.conversation.map((c, i) => (
                                       <div key={i} style={{alignSelf: c.sender === 'User' ? 'flex-end' : 'flex-start', maxWidth: '85%'}}>
                                            <div style={{
                                                padding: '10px 14px', borderRadius: '18px', fontSize: '0.95rem',
                                                backgroundColor: c.sender === 'User' ? '#3182ce' : '#edf2f7',
                                                color: c.sender === 'User' ? 'white' : '#2d3748',
                                                borderBottomRightRadius: c.sender === 'User' ? '4px' : '18px',
                                                borderBottomLeftRadius: c.sender === 'Admin' ? '4px' : '18px',
                                                lineHeight: '1.4'
                                            }}>
                                                {c.text}
                                            </div>
                                            <div style={{fontSize: '0.7rem', color: '#a0aec0', marginTop: '4px', textAlign: c.sender === 'User' ? 'right' : 'left'}}>
                                                {c.sender === 'User' ? 'You' : 'Admin'} • {new Date(c.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                       </div>
                                   ))
                               ) : (
                                   /* Fallback */
                                   <div style={{alignSelf: 'flex-end', maxWidth: '85%'}}>
                                        <div style={{padding: '10px 14px', borderRadius: '18px', fontSize: '0.95rem', backgroundColor: '#3182ce', color: 'white', borderBottomRightRadius: '4px'}}>{msg.message}</div>
                                        <div style={{fontSize: '0.7rem', color: '#a0aec0', marginTop: '4px', textAlign: 'right'}}>You</div>
                                   </div>
                               )}
                           </div>

                           {msg.status !== 'Resolved' && msg.status !== 'Replied' && msg.status !== 'Completed' ? (
                               <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
                                   <input 
                                       type="text" 
                                       placeholder="Type a reply..." 
                                       style={{...inputStyle, flex: 1, borderRadius: '20px'}}
                                       value={replyTexts[msg._id] || ''}
                                       onChange={(e) => handleReplyChange(msg._id, e.target.value)}
                                       onKeyPress={(e) => { if (e.key === 'Enter') handleUserReply(msg._id); }}
                                   />
                                   <button onClick={() => handleUserReply(msg._id)} className="btn btn-primary" style={{borderRadius: '20px', padding: '0 25px'}}>Reply</button>
                               </div>
                           ) : (
                               <div style={{textAlign: 'center', color: '#a0aec0', fontSize: '0.85rem', marginTop: '15px', fontStyle: 'italic'}}>
                                   This ticket is resolved and closed to new replies.
                               </div>
                           )}
                       </div>
                   ))}
               </div>
            </div>
        )}
      </div>
    </div>
  );
};

// Styles
const pageStyle = { padding: '40px 0', minHeight: '80vh' };
const headerStyle = { textAlign: 'center', marginBottom: '40px' };
const rowStyle = { display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' };
const groupStyle = { flex: 1, minWidth: '250px' };
const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568' };
const inputWrapper = { position: 'relative', display: 'flex', alignItems: 'center' };
const iconStyle = { position: 'absolute', left: '15px', color: '#cbd5e0' };
const inputStyle = { width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' };
const textareaStyle = { ...inputStyle, padding: '12px', resize: 'vertical' };

const ticketCardStyle = { border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' };
const replyBoxStyle = { backgroundColor: '#f8f9fa', border: '1px solid #e2e8f0', borderRadius: '8px' };

export default Contact;