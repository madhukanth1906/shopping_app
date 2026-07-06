"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('INR');
  const [rates, setRates] = useState({ INR: 1 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initCurrency = async () => {
      try {
        // Fetch rates relative to INR
        const ratesRes = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
        if (ratesRes.ok) {
          const ratesData = await ratesRes.json();
          setRates(ratesData.rates);
        }

        // Check local storage for manual override
        const savedCurrency = localStorage.getItem('atelier_currency');
        if (savedCurrency) {
          setCurrency(savedCurrency);
        } else {
          // IP Geolocation to auto-set currency
          const ipRes = await fetch('https://ipapi.co/json/');
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            const country = ipData.country_code;
            if (country === 'US') setCurrency('USD');
            else if (country === 'GB') setCurrency('GBP');
            else if (['FR', 'DE', 'IT', 'ES', 'NL'].includes(country)) setCurrency('EUR');
            else setCurrency('INR');
          }
        }
      } catch (e) {
        console.error("Failed to initialize currency", e);
      } finally {
        setIsLoaded(true);
      }
    };
    initCurrency();
  }, []);

  const changeCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('atelier_currency', newCurrency);
  };

  const formatPrice = (priceInINR) => {
    if (!isLoaded || !rates[currency]) {
      return `₹${Number(priceInINR).toFixed(2)}`;
    }
    const converted = Number(priceInINR) * rates[currency];
    const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
    const symbol = symbols[currency] || '₹';
    return `${symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, formatPrice, isLoaded }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
