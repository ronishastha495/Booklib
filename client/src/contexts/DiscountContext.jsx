import React, { createContext, useContext, useEffect, useState } from 'react';
import discountService from '../services/discountService';

const DiscountContext = createContext();

export const useDiscounts = () => useContext(DiscountContext);

export const DiscountProvider = ({ children }) => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDiscounts, setActiveDiscounts] = useState([]);

  const fetchAllDiscounts = async () => {
    try {
      const data = await discountService.getAllDiscounts();
      setDiscounts(data);
    } catch (error) {
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

  useEffect(() => {
    fetchAllDiscounts();
    fetchActiveDiscounts();
  }, []);

  const value = {
    discounts,
    activeDiscounts,
    loading,
    fetchAllDiscounts,
    fetchActiveDiscounts,
    createDiscount: discountService.createDiscount,
    updateDiscount: discountService.updateDiscount,
    deleteDiscount: discountService.deleteDiscount,
    getDiscountById: discountService.getDiscountById,
  };

  return (
    <DiscountContext.Provider value={value}>
      {children}
    </DiscountContext.Provider>
  );
};
