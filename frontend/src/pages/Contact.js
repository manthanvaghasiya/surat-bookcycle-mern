import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEnvelope, FaUser, FaPaperPlane, FaHeading } from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const { name, email, subject, message } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send data to the backend API we created earlier
      await axios.post('http://localhost:5000/api/messages', formData);
      
      toast.success('Message sent! We will get back to you shortly.');
      setFormData({ name: '', email: '', subject: '', message: '' }); // Clear form
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    }
  };

  return (
    <div style={pageStyle}>
      <div className="container" style={{maxWidth: '800px'}}>
        <div style={headerStyle}>
            <h1 style={{fontSize: '2.5rem', color: '#2d3748'}}>Contact Us</h1>
            <p style={{color: '#718096'}}>Have a question or feedback? We'd love to hear from you.</p>
        </div>

        <div className="form-container" style={{maxWidth: '100%'}}>
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

                <button type="submit" className="btn btn-primary">
                    <FaPaperPlane /> Send Message
                </button>
            </form>
        </div>
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
const inputStyle = { width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' };
const textareaStyle = { ...inputStyle, padding: '12px', resize: 'vertical' };

export default Contact;