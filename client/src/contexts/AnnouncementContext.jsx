import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getAnnouncements,
  getAnnouncementCategories,
} from '../services/announcementService';

const AnnouncementContext = createContext();

export const AnnouncementProvider = ({ children }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getAnnouncementCategories();
      setCategories(data);
    } catch (err) {
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchCategories();
  }, []);

  return (
    <AnnouncementContext.Provider
      value={{
        announcements,
        setAnnouncements,
        categories,
        loading,
        error,
        fetchAnnouncements,
        fetchCategories,
      }}
    >
      {children}
    </AnnouncementContext.Provider>
  );
};

export const useAnnouncementContext = () => {
  const context = useContext(AnnouncementContext);
  if (!context) {
    throw new Error('useAnnouncementContext must be used within an AnnouncementProvider');
  }
  return context;
};