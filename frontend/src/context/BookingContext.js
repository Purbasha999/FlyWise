import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [searchParams, setSearchParams] = useState({ source: '', destination: '', date: '', passengers: 1 });
  const [seatPricingMap, setSeatPricingMap] = useState({});
const [selectedOutboundFlight, setSelectedOutboundFlight] = useState(null);
const [selectedReturnFlight, setSelectedReturnFlight] = useState(null);
  const clearBooking = () => {
    setSelectedFlight(null);
    setSelectedSeats([]);
    setPassengers([]);
    setSeatPricingMap({});
    setSelectedOutboundFlight(null);
    setSelectedReturnFlight(null);
  };

  return (
    <BookingContext.Provider value={{
      selectedFlight, setSelectedFlight,
      selectedSeats, setSelectedSeats,
      selectedOutboundFlight, setSelectedOutboundFlight,
      selectedReturnFlight,
      passengers, setPassengers,
      searchParams, setSearchParams,
      seatPricingMap,  setSeatPricingMap,
      clearBooking, setSelectedReturnFlight
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider');
  return ctx;
};
