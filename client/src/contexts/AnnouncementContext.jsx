import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getAnnouncements,
  getActiveAnnouncements,
  getAnnouncementsByCategory,
  getAnnouncementsByBook,
  getAnnouncementCategories,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementActive,
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

  const fetchActiveAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getActiveAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch active announcements');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncementsByCategory = async (category) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAnnouncementsByCategory(category);
      setAnnouncements(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch by category');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncementsByBook = async (bookId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAnnouncementsByBook(bookId);
      setAnnouncements(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch by book');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getAnnouncementCategories();
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories([]);
      }
    } catch {
      setCategories([]);
    }
  };

  const addAnnouncement = async (announcement) => {
    try {
      await createAnnouncement(announcement);
      await fetchAnnouncements();
    } catch (err) {
      setError(err.message || 'Failed to create announcement');
    }
  };

  const editAnnouncement = async (id, updatedData) => {
    try {
      await updateAnnouncement(id, updatedData);
      await fetchAnnouncements();
    } catch (err) {
      setError(err.message || 'Failed to update announcement');
    }
  };

  const removeAnnouncement = async (id) => {
    try {
      await deleteAnnouncement(id);
      await fetchAnnouncements();
    } catch (err) {
      setError(err.message || 'Failed to delete announcement');
    }
  };

  const toggleActiveStatus = async (id) => {
    try {
      await toggleAnnouncementActive(id);
      await fetchAnnouncements();
    } catch (err) {
      setError(err.message || 'Failed to toggle active status');
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
        categories,
        loading,
        error,
        fetchAnnouncements,
        fetchActiveAnnouncements,
        fetchAnnouncementsByCategory,
        fetchAnnouncementsByBook,
        fetchCategories,
        addAnnouncement,
        editAnnouncement,
        removeAnnouncement,
        toggleActiveStatus,
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
