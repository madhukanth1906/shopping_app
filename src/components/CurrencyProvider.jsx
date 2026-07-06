"use client";
import React, { createContext, useContext, useState } from 'react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('INR');

  const changeCurrency = (newCurrency) => {
    setCurrency('INR'); // Always stick to INR as requested
  };

  const formatPrice = (priceInINR) => {
    return `₹${Number(priceInINR).toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, formatPrice, isLoaded: true }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
