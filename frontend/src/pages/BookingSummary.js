import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import AddOnsSection from './AddOnsSection';
import { createBooking, getFlightPrice } from '../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import './BookingSummary.css';

const fmt = (d) => format(new Date(d), 'HH:mm');
const fmtDate = (d) => format(new Date(d), 'dd MMM yyyy');
const fmtDur = (m) => `${Math.floor(m/60)}h ${m%60}m`;

const BookingSummary = () => {
  const navigate = useNavigate();
  const { selectedFlight, selectedSeats, searchParams, setPassengers, clearBooking } = useBooking();
  const { user } = useAuth();
  const passengers = searchParams.passengers || 1;

  const [passengerForms, setPassengerForms] = useState(
    Array.from({ length: passengers }, (_, i) => ({
      name: i === 0 ? user?.name || '' : '',
      age: '',
      gender: 'MALE',
    }))
  );

  const [selectedAddOns, setSelectedAddOns] = useState([]);


  const [booking, setBooking] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  if (!selectedFlight || !selectedSeats.length) {
    navigate('/');
    return null;
  }

  const f = selectedFlight;
  const pb = f.priceBreakdown || {};

  const addOnTotal = selectedAddOns.reduce((sum, item) => sum + item.price, 0);

  const mealTotal = selectedAddOns
  .filter(item => item.type === "meal")
  .reduce((sum, item) => sum + item.price, 0);

const baggageTotal = selectedAddOns
  .filter(item => item.type === "baggage")
  .reduce((sum, item) => sum + item.price, 0);

  const updatePassenger = (i, field, value) => {
    setPassengerForms(forms => forms.map((form, idx) => idx === i ? { ...form, [field]: value } : form));
  };

  const handleConfirm = () => {
  const invalid = passengerForms.find(p => !p.name || !p.age);
  if (invalid) {
    toast.error('Please fill in all passenger details');
    return;
  }

  navigate('/payment', {
    state: {
      bookingData: {
        flight: selectedFlight,
        seatNumbers: selectedSeats,
        passengers: passengerForms,
        addOns: selectedAddOns,
        totalPrice: pb.totalPrice + addOnTotal
      }
    }
  });
};

  if (confirmed) {
    return (
      <div className="page-content confirmation-page">
        <div className="confirm-wrap">
          <div className="confirm-icon">✅</div>
          <h1 className="confirm-title">Booking Confirmed!</h1>
          <p className="confirm-sub">Your booking reference is</p>
          <div className="confirm-ref">{confirmed.bookingRef}</div>
          {confirmed.addOns?.length > 0 && (
  <div className="confirm-addons">
    <strong>Add-ons:</strong>
    {confirmed.addOns.map((item, i) => (
      <div key={i}>
        {item.name} - ₹{item.price}
      </div>
    ))}
  </div>
)}
          <div className="confirm-details card">
            <div className="confirm-route">
              {confirmed.flightId?.source?.city} → {confirmed.flightId?.destination?.city}
            </div>
            <div className="confirm-date">{fmtDate(confirmed.flightId?.departureTime)}</div>
            <div className="confirm-seats">Seats: {confirmed.seats?.map(s => s.seatNumber).join(', ')}</div>
            <div className="confirm-total">Total paid: <strong>₹{confirmed.priceBreakdown?.totalPrice?.toLocaleString('en-IN')}</strong></div>
          </div>
          <div className="confirm-actions">
            <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>View My Trips</button>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Book Another Flight</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content summary-page">
      <div className="summary-header">
        <div className="section">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Back</button>
          <h1 className="summary-title">Booking Summary</h1>
        </div>
      </div>

      <div className="section summary-layout">
        <div className="summary-left">
          <div className="card summary-card">
            <h3 className="sc-title">Passenger Details</h3>
            {passengerForms.map((p, i) => (
              <div key={i} className="passenger-form">
                <div className="pf-label">Passenger {i + 1} · Seat {selectedSeats[i]}</div>
                <div className="pf-fields">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" placeholder="As on ID" value={p.name} onChange={e => updatePassenger(i, 'name', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input className="form-input" type="number" placeholder="25" min="1" max="120" value={p.age} onChange={e => updatePassenger(i, 'age', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-input" value={p.gender} onChange={e => updatePassenger(i, 'gender', e.target.value)}>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <AddOnsSection 
  selected={selectedAddOns} 
  setSelected={setSelectedAddOns} 
/>
        </div>

        <div className="summary-right">
          {/* Flight summary */}
          <div className="card summary-card">
            <h3 className="sc-title">Flight Details</h3>
            <div className="sf-airline-row">
              <div className="sf-badge">{f.airlineCode}</div>
              <div>
                <div className="sf-airline">{f.airline}</div>
                <div className="sf-num">{f.flightNumber} · {f.aircraft}</div>
              </div>
            </div>
            <div className="sf-route">
              <div className="sf-city">
                <div className="sf-time">{fmt(f.departureTime)}</div>
                <div className="sf-code">{f.source?.code}</div>
              </div>
              <div className="sf-arrow-wrap">
                <div className="sf-dur">{fmtDur(f.duration)}</div>
                <div className="sf-line">──── ✈ ────</div>
              </div>
              <div className="sf-city right">
                <div className="sf-time">{fmt(f.arrivalTime)}</div>
                <div className="sf-code">{f.destination?.code}</div>
              </div>
            </div>
            <div className="sf-date">{fmtDate(f.departureTime)}</div>
            <div className="sf-seats-row">
              <span className="sf-seats-label">Selected Seats:</span>
              {selectedSeats.map(s => <span key={s} className="badge badge-blue">{s}</span>)}
            </div>
          </div>

          {/* price */}
          <div className="card summary-card">
            <h3 className="sc-title">Price Breakdown</h3>
            <div className="price-rows">
              <div className="price-row"><span>Base fare ({passengers} pax)</span><span>₹{pb.basePrice?.toLocaleString('en-IN') || f.basePrice * passengers}</span></div>
              {pb.demandSurcharge > 0 && <div className="price-row surcharge"><span>High demand</span><span>+₹{pb.demandSurcharge?.toLocaleString('en-IN')}</span></div>}
              {pb.lastMinuteSurcharge > 0 && <div className="price-row surcharge"><span>Last-minute</span><span>+₹{pb.lastMinuteSurcharge?.toLocaleString('en-IN')}</span></div>}
              {pb.seatCharges > 0 && <div className="price-row"><span>Seat charges</span><span>+₹{pb.seatCharges?.toLocaleString('en-IN')}</span></div>}
              <div className="price-row"><span>Taxes & GST (18%)</span><span>₹{pb.taxes?.toLocaleString('en-IN')}</span></div>
              {mealTotal > 0 && (
                <div className="price-row">
                <span>Meals</span>
                <span>+₹{mealTotal.toLocaleString('en-IN')}</span>
                </div>
              )}

{baggageTotal > 0 && (
  <div className="price-row">
    <span>Excess Baggage</span>
    <span>+₹{baggageTotal.toLocaleString('en-IN')}</span>
  </div>
)}
              <hr className="divider" />
              <div className="price-row total"><span>Total Amount</span><span>₹{(pb.totalPrice+addOnTotal).toLocaleString('en-IN')}</span></div>
            </div>
          </div>

          <button className="btn btn-primary btn-lg btn-full" onClick={handleConfirm} disabled={booking}>
            {booking ? <><div className="spinner" /> Confirming...</> : '✓ Confirm & Pay ₹' + ((pb.totalPrice+addOnTotal).toLocaleString('en-IN') || '')}
          </button>
          <p className="summary-tnc">By confirming, you agree to our Terms & Conditions. Fare includes all taxes.</p>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;
