import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { useNavigate, useLocation } from 'react-router-dom';
import SeatMap from '../components/common/SeatMap';
import { lockSeats, getFlightPrice } from '../utils/api';
import toast from 'react-hot-toast';
import './SeatSelectionRound.css';

const SeatSelectionRound = () => {

  const { 
    selectedOutboundFlight, 
    selectedReturnFlight, 
    setSelectedSeats 
  } = useBooking();

  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);

  const passengers = Number(query.get('passengers') || 1);

  const outbound = selectedOutboundFlight;
  const returnFlight = selectedReturnFlight;


  if (!outbound || !returnFlight) {
    return <h2>Please select both flights first</h2>;
  }

  const [seats, setSeats] = useState({
    outbound: [],
    return: []
  });

  const handleContinue = async () => {

    if (seats.outbound.length < passengers) {
      toast.error("Select outbound seats");
      return;
    }

    if (seats.return.length < passengers) {
      toast.error("Select return seats");
      return;
    }

    try {

      const [outPrice, retPrice] = await Promise.all([
        getFlightPrice(outbound._id, {
          seatNumbers: seats.outbound,
          passengers
        }),
        getFlightPrice(returnFlight._id, {
          seatNumbers: seats.return,
          passengers
        })
      ]);

      await Promise.all([
        lockSeats({
          flightId: outbound._id,
          seatNumbers: seats.outbound
        }),
        lockSeats({
          flightId: returnFlight._id,
          seatNumbers: seats.return
        })
      ]);

      setSelectedSeats(seats);

      navigate('/summary-round', {
        state: {
          pricing: {
            outbound: outPrice.data.pricing,
            return: retPrice.data.pricing
          }
        }
      });

    } catch {
      toast.error("Seat locking failed");
    }
  };

  return (
    <div className="round-container">

      <div className="flight-panel">
        <div className="flight-title">Outbound Flight</div>
        <SeatMap
          flightId={outbound._id}
          maxSeats={passengers}
          onSeatsSelected={(s) =>
            setSeats(prev => ({ ...prev, outbound: s }))
          }
        />
      </div>

      <div className="flight-panel">
        <div className="flight-title">Return Flight</div>
        <SeatMap
          flightId={returnFlight._id}
          maxSeats={passengers}
          onSeatsSelected={(s) =>
            setSeats(prev => ({ ...prev, return: s }))
          }
        />
      </div>

      <div className="continue-bar">
        <button className="continue-btn" onClick={handleContinue}>
          Continue →
        </button>
      </div>

    </div>
  );
};

export default SeatSelectionRound;