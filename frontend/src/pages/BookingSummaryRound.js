import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { useNavigate, useLocation } from 'react-router-dom';
import AddOnsSection from './AddOnsSection';
import toast from 'react-hot-toast';
import './BookingSummaryRound.css'


const BookingSummaryRound = () => {

  const { 
  selectedOutboundFlight, 
  selectedReturnFlight, 
  selectedSeats, 
  searchParams 
} = useBooking();
  const navigate = useNavigate();
  const location = useLocation();

  const pb = location.state?.pricing || {};

  const passengers = searchParams.passengers;

  const outbound = selectedOutboundFlight;
const returnFlight = selectedReturnFlight;

if (!outbound || !returnFlight) {
  return <h2>Please select both flights first</h2>;
}

  const [forms, setForms] = useState(
    Array.from({ length: passengers }, () => ({
      name: '',
      age: '',
      gender: 'MALE'
    }))
  );

  const [addOns, setAddOns] = useState({
  outbound: [],
  return: []
});

  const handleConfirm = () => {

    if (forms.some(p => !p.name || !p.age)) {
      toast.error("Fill passenger details");
      return;
    }

    navigate('/payment', {
      state: {
        bookingData: {
          outbound,
          return: returnFlight,
          outboundSeats: selectedSeats.outbound,
          returnSeats: selectedSeats.return,
          passengers: forms,
          addOns,
          outboundPricing: pb.outbound, 
      returnPricing: pb.return,
          totalPrice:
  (pb.outbound?.totalPrice || 0) +
  (pb.return?.totalPrice || 0) +
  outboundAddOnTotal +
  returnAddOnTotal
        }
      }
    });
  };
  const outboundAddOnTotal = addOns.outbound.reduce((sum, item) => sum + item.price, 0);
const returnAddOnTotal = addOns.return.reduce((sum, item) => sum + item.price, 0);

const outboundMeals = addOns.outbound
  .filter(i => i.type === "meal")
  .reduce((sum, i) => sum + i.price, 0);

const outboundBaggage = addOns.outbound
  .filter(i => i.type === "baggage")
  .reduce((sum, i) => sum + i.price, 0);

const returnMeals = addOns.return
  .filter(i => i.type === "meal")
  .reduce((sum, i) => sum + i.price, 0);

const returnBaggage = addOns.return
  .filter(i => i.type === "baggage")
  .reduce((sum, i) => sum + i.price, 0);
  return (
  <div className="page-content summary-page">

    <div className="summary-header">
      <div className="section">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1 className="summary-title">Booking Summary</h1>
      </div>
    </div>

    <div className="section summary-layout">

      {/* LEFT SIDE */}
      <div className="summary-left">

        {/* PASSENGERS */}
        <div className="card summary-card">
          <h3 className="sc-title">Passenger Details</h3>

          {forms.map((p, i) => (
            <div key={i} className="passenger-form">
              <div className="pf-label">
                Passenger {i + 1} · Seat {selectedSeats.outbound[i]}
              </div>

              <div className="pf-fields">
                <input
                  className="form-input"
                  placeholder="Full Name"
                  value={p.name}
                  onChange={(e) => {
                    const updated = [...forms];
                    updated[i].name = e.target.value;
                    setForms(updated);
                  }}
                />

                <input
                  className="form-input"
                  type="number"
                  placeholder="Age"
                  value={p.age}
                  onChange={(e) => {
                    const updated = [...forms];
                    updated[i].age = e.target.value;
                    setForms(updated);
                  }}
                />

                <select
                  className="form-input"
                  value={p.gender}
                  onChange={(e) => {
                    const updated = [...forms];
                    updated[i].gender = e.target.value;
                    setForms(updated);
                  }}
                >
                  <option>MALE</option>
                  <option>FEMALE</option>
                  <option>OTHER</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* ADDONS */}
        <div className="card summary-card">
          <h3 className="sc-title">Add-ons (Outbound)</h3>
          <AddOnsSection
            selected={addOns.outbound||[]}
            setSelected={(val) =>
              setAddOns(prev => ({ ...prev, outbound: val }))
            }
          />
        </div>

        <div className="card summary-card">
          <h3 className="sc-title">Add-ons (Return)</h3>
          <AddOnsSection
            selected={addOns.return||[]}
            setSelected={(val) =>
              setAddOns(prev => ({ ...prev, return: val }))
            }
          />
        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="summary-right">

        {/* OUTBOUND FLIGHT */}
        <div className="card summary-card">
          <h3 className="sc-title">Outbound Flight</h3>

          <div className="sf-airline-row">
            <div className="sf-badge">{outbound.airlineCode}</div>
            <div>
              <div className="sf-airline">{outbound.airline}</div>
              <div className="sf-num">{outbound.flightNumber}</div>
            </div>
          </div>

          <div className="sf-route">
            <div className="sf-city">
              <div className="sf-time">
                {new Date(outbound.departureTime).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
              </div>
              <div className="sf-code">{outbound.source.code}</div>
            </div>

            <div className="sf-arrow-wrap">✈</div>

            <div className="sf-city right">
              <div className="sf-time">
                {new Date(outbound.arrivalTime).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
              </div>
              <div className="sf-code">{outbound.destination.code}</div>
            </div>
          </div>

          <div className="sf-seats-row">
            {selectedSeats.outbound.map(s => (
              <span key={s} className="badge badge-blue">{s}</span>
            ))}
          </div>
        </div>

        {/* RETURN FLIGHT */}
        <div className="card summary-card">
          <h3 className="sc-title">Return Flight</h3>

          <div className="sf-airline-row">
            <div className="sf-badge">{returnFlight.airlineCode}</div>
            <div>
              <div className="sf-airline">{returnFlight.airline}</div>
              <div className="sf-num">{returnFlight.flightNumber}</div>
            </div>
          </div>

          <div className="sf-route">
            <div className="sf-city">
              <div className="sf-time">
                {new Date(returnFlight.departureTime).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
              </div>
              <div className="sf-code">{returnFlight.source.code}</div>
            </div>

            <div className="sf-arrow-wrap">✈</div>

            <div className="sf-city right">
              <div className="sf-time">
                {new Date(returnFlight.arrivalTime).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
              </div>
              <div className="sf-code">{returnFlight.destination.code}</div>
            </div>
          </div>

          <div className="sf-seats-row">
            {selectedSeats.return.map(s => (
              <span key={s} className="badge badge-blue">{s}</span>
            ))}
          </div>
        </div>

        {/* PRICE */}
        <div className="card summary-card">
  <h3 className="sc-title">Price Breakdown</h3>

  <div className="price-rows">

    {/* OUTBOUND */}
    <div className="price-row">
      <span>Outbound Base</span>
      <span>₹{pb.outbound?.basePrice || 0}</span>
    </div>

    {pb.outbound?.seatCharges > 0 && (
      <div className="price-row">
        <span>Seat Charges</span>
        <span>+₹{pb.outbound.seatCharges}</span>
      </div>
    )}

    <div className="price-row">
      <span>Taxes</span>
      <span>₹{pb.outbound?.taxes || 0}</span>
    </div>

    {outboundMeals > 0 && (
      <div className="price-row">
        <span>Meals</span>
        <span>+₹{outboundMeals}</span>
      </div>
    )}

    {outboundBaggage > 0 && (
      <div className="price-row">
        <span>Baggage</span>
        <span>+₹{outboundBaggage}</span>
      </div>
    )}

    <hr />

    {/* RETURN */}
    <div className="price-row">
      <span>Return Base</span>
      <span>₹{pb.return?.basePrice || 0}</span>
    </div>

    {pb.return?.seatCharges > 0 && (
      <div className="price-row">
        <span>Seat Charges</span>
        <span>+₹{pb.return.seatCharges}</span>
      </div>
    )}

    <div className="price-row">
      <span>Taxes</span>
      <span>₹{pb.return?.taxes || 0}</span>
    </div>

    {returnMeals > 0 && (
      <div className="price-row">
        <span>Meals</span>
        <span>+₹{returnMeals}</span>
      </div>
    )}

    {returnBaggage > 0 && (
      <div className="price-row">
        <span>Baggage</span>
        <span>+₹{returnBaggage}</span>
      </div>
    )}

    <hr />

    {/* TOTAL */}
    <div className="price-row total">
      <span>Total</span>
      <span>
        ₹{
          (pb.outbound?.totalPrice || 0) +
          (pb.return?.totalPrice || 0) +
          outboundAddOnTotal +
          returnAddOnTotal
        }
      </span>
    </div>

  </div>
</div>

        <button className="btn btn-primary btn-lg btn-full" onClick={handleConfirm}>
          Confirm & Pay →
        </button>

      </div>

    </div>
  </div>

);
}


export default BookingSummaryRound;