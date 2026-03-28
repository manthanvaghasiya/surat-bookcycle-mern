import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AnnouncementBanner = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/settings');
        setSettings(data);
      } catch (error) {
        console.error('Error fetching settings', error);
      }
    };
    fetchSettings();
  }, []);

  if (!settings || !settings.isAnnouncementActive || !settings.announcementText) return null;

  return (
    <div style={bannerStyle}>
      {settings.announcementText}
    </div>
  );
};

const bannerStyle = {
  backgroundColor: '#007bff',
  color: 'white',
  textAlign: 'center',
  padding: '10px 20px',
  fontWeight: 'bold',
  zIndex: 1000,
  width: '100%',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

export default AnnouncementBanner;
