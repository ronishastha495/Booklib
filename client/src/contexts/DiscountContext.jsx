// src/contexts/DiscountContext.js
import React, { createContext, useContext, useState } from 'react';
import discountService from '../services/discountService';

const DiscountContext = createContext();

export const useDiscounts = () => {
  const context = useContext(DiscountContext);
  if (!context) {
    throw new Error('useDiscounts must be used within a DiscountProvider');
  }
  return context;
};

export const DiscountProvider = ({ children }) => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDiscounts, setActiveDiscounts] = useState([]);

  const fetchAllDiscounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await discountService.getAllDiscounts();
      setDiscounts(data);
    } catch (error) {
      setError('Failed to fetch discounts. Please try again later.');
      console.error("Error fetching all discounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveDiscounts = async () => {
    try {
      const data = await discountService.getActiveDiscounts();
      setActiveDiscounts(data);
    } catch (error) {
      console.error("Error fetching active discounts:", error);
    }
  };

  const createDiscount = async (discountData) => {
    try {
      const result = await discountService.createDiscount(discountData);
      await fetchAllDiscounts();
      return result;
    } catch (error) {
      console.error("Error creating discount:", error);
      throw error;
    }
  };

  const updateDiscount = async (id, discountData) => {
    try {
      const result = await discountService.updateDiscount(id, discountData);
      await fetchAllDiscounts();
      return result;
    } catch (error) {
      console.error(`Error updating discount with id ${id}:`, error);
      throw error;
    }
  };

  const deleteDiscount = async (id) => {
    try {
      const result = await discountService.deleteDiscount(id);
      await fetchAllDiscounts();
      return result;
    } catch (error) {
      console.error(`Error deleting discount with id ${id}:`, error);
      throw error;
    }
  };

  const getDiscountById = async (id) => {
    try {
      return await discountService.getDiscountById(id);
    } catch (error) {
      console.error(`Error getting discount with id ${id}:`, error);
      throw error;
    }
  };

  const value = {
    discounts,
    activeDiscounts,
    loading,
    error,
    fetchAllDiscounts,
    fetchActiveDiscounts,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    getDiscountById,
  };

  return (
    <DiscountContext.Provider value={value}>
      {children}
    </DiscountContext.Provider>
  );
};