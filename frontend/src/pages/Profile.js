import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';

const Profile = () => {
    // Note: assuming AuthContext provides a login or setUser method. If not, token saves locally.
    const { user, login } = useContext(AuthContext); 
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        address: ''
    });

    const { full_name, email, phone, address } = formData;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get('http://localhost:5000/api/users/profile', config);
                setFormData({
                    full_name: data.full_name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    address: data.address || ''
                });
            } catch (err) {
                toast.error('Failed to load profile data');
            }
        };

        if (user && user.token) {
            fetchProfile();
        }
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
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put('http://localhost:5000/api/users/profile', { phone, address }, config);
            
            // Re-login the user in context so token remains standard and trustScore/phone updates across app
            if (login) login(data); 

            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error updating profile');
        }
    };

    return (
        <div style={containerStyle}>
            <h2>My Profile</h2>
            <p style={{marginBottom: '20px', color: '#666'}}>
                Updating your phone number and address is required to buy or accept book orders on the platform.
            </p>
            <form onSubmit={onSubmit} style={formStyle}>
                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Full Name</label>
                    <input type="text" value={full_name} disabled style={inputDisabledStyle}/>
                </div>
                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Email</label>
                    <input type="text" value={email} disabled style={inputDisabledStyle}/>
                </div>
                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Phone Number *</label>
                    <input required type="text" name="phone" value={phone} onChange={onChange} style={inputStyle} placeholder="Enter your mobile number..."/>
                </div>
                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Address / Campus Details *</label>
                    <textarea required name="address" value={address} onChange={onChange} style={{...inputStyle, resize: 'vertical'}} rows="3" placeholder="College, Hostel room, or Neighborhood..."></textarea>
                </div>
                <button type="submit" style={buttonStyle}>Save Changes</button>
            </form>
        </div>
    );
};

// Simple Styles
const containerStyle = { maxWidth: '600px', margin: '40px auto', padding: '30px', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const inputGroupStyle = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontWeight: '600', color: '#333', fontSize: '14px' };
const inputStyle = { padding: '12px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none', fontSize: '15px' };
const inputDisabledStyle = { ...inputStyle, backgroundColor: '#f5f5f5', color: '#888', cursor: 'not-allowed' };
const buttonStyle = { padding: '14px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' };

export default Profile;
