import React, { useState,useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import SeatMap from '../components/common/SeatMap';
import { getFlightPrice,lockSeats } from '../utils/api';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import './SeatSelection.css';

const fmt = (d) => format(new Date(d), 'HH:mm');
const fmtDur = (m) => `${Math.floor(m/60)}h ${m%60}m`;

const SeatSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedFlight, setSelectedFlight, searchParams, setSearchParams, setSelectedSeats } = useBooking();
  const { user, isAuthenticated } = useAuth();
  const [selectedSeatNums, setSelectedSeatNums] = useState([]);
  const [lockExpiry, setLockExpiry] = useState(null);
  const [seatPricing, setSeatPricing] = useState({});
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [fetchingSeat, setFetchingSeat] = useState(null);

  const seatPricingRef = useRef({});

  useEffect(() => {
  if (selectedFlight) {
    localStorage.setItem('selectedFlight', JSON.stringify(selectedFlight));
  }
}, [selectedFlight]);

useEffect(() => {
  if (!searchParams || !searchParams.passengers) {
    const saved = localStorage.getItem('searchParams');
    if (saved) {
      setSearchParams(JSON.parse(saved));
    }
  }
}, []);

  useEffect(() => {
  const saved = localStorage.getItem('selectedFlight');

  if (!selectedFlight && saved) {
    setSelectedFlight(JSON.parse(saved));
    return;
  }

  if (!selectedFlight) {
    navigate('/');
  }
}, [selectedFlight]);

const queryParams = new URLSearchParams(location.search);

const passengers = Number(queryParams.get('passengers') || 1);
  const f = selectedFlight;
  const date=queryParams.get('date');
  const source=queryParams.get('source');
  const destination=queryParams.get('destination');


  const [editData, setEditData] = useState({
  date:'',
  passengers:'1'
});

useEffect(() => {
    setEditData({
      date: date || '',
      passengers: passengers || 1
    });
  }, [date, passengers]);



  if (!selectedFlight || !isAuthenticated || !searchParams) return null;

console.log("PASSENGERS:", passengers);
  const handleSeatsSelected = async (seatNums) => {
    const prev    = selectedSeatNums;
    const added   = seatNums.filter(s => !prev.includes(s));
    const removed = prev.filter(s => !seatNums.includes(s));

  setSelectedSeatNums(seatNums);

  if (removed.length > 0) {
      const updated = { ...seatPricingRef.current };
      removed.forEach(s => delete updated[s]);
      seatPricingRef.current = updated;
      setSeatPricing({ ...updated });
    }

  // if (seatNums.length > 0) {
  //   try {
  //     setLoadingPrice(true);
  //     const res = await getFlightPrice(selectedFlight._id, {
  //       seatNumbers: seatNums,
  //       passengers
  //     });
  //     setPricing(res.data.pricing);
  //   } catch {
  //     toast.error('Failed to calculate price');
  //   } finally {
  //     setLoadingPrice(false);
  //   }
  // } else {
  //   setPricing(null);
  // }
  if (seatNums.length > 0) {
  try {
    setLoadingPrice(true);

    const res = await getFlightPrice(f._id, {
      seatNumbers: seatNums,
      passengers: passengers,
    });

    const p = res.data.pricing;
    console.log("price fetch or not? ",res.data);
    setSeatPricing({
      combined: p   // store full pricing
    });

  } catch {
    toast.error('Failed to calculate price');
  } finally {
    setLoadingPrice(false);
  }
} else {
  setSeatPricing({});
}
};

  const handleContinue = async () => {
  if (selectedSeatNums.length < passengers) {
    toast.error(`Please select ${passengers} seat(s)`);
    return;
  }

  try {
    const priceRes = await getFlightPrice(f._id, {
      seatNumbers: selectedSeatNums,
      passengers: passengers,
    });

    const latestPricing = priceRes.data.pricing;

    const res = await lockSeats({
      flightId: selectedFlight._id,
      seatNumbers: selectedSeatNums
    });

    setLockExpiry(res.data.lockExpiry); 
    setSelectedSeats(selectedSeatNums);

    navigate('/booking-summary',{
      state: { 
        lockExpiry: res.data.lockExpiry,
        pricing: latestPricing
      }
    });

  } catch (err) {
    toast.error(err.response?.data?.message || 'Seats not available anymore');
    setSelectedSeatNums([]); 
  }
};
const pricing = seatPricing.combined || {};

const runningBase = pricing.basePrice || 0;
const runningTax = pricing.taxes || 0;
const runningTotal = pricing.totalPrice || 0;

  // Merge surcharges by name across all selected seats
  const surchargeEntries = (pricing.appliedRules || []).map(rule => [
  rule.name,
  rule.charge
]);

//edit query, top bar

const someLoading = fetchingSeat !== null;



const handleUpdateSearch = () => {
  const { source, destination, date, passengers } = editData;

  let url = `/flights?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&passengers=${passengers}`;

  if (date) {
    url += `&date=${date}`;
  }

  navigate(url); 
};

  
  return (
    
    <div className="page-content seats-page">
      <div className="seats-header">
        <div className="section">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Back to Results</button>
          <h1 className="seats-title">Select Your Seats</h1>
          <p className="seats-meta">
            Select {passengers} seat{passengers > 1 ? 's' : ''} for your journey
          </p>
        </div>
      </div>

      <div className="section seats-layout">
        {/* Left: seat map */}
        <div className="seats-map-col">
          <div className="card seats-map-card">
            <div className="card-inner-header">
              <h3>Cabin View</h3>
              <span className="badge badge-blue">{f.flightNumber}</span>
            </div>
            <SeatMap
              key={passengers}
              flightId={f._id}
              maxSeats={passengers}
              onSeatsSelected={handleSeatsSelected}
              userId={user?._id}
            />
          </div>
        </div>

        {/* Right: flight info + price */}
        <div className="seats-info-col">
          {/* Flight card */}
          <div className="card seats-flight-card">
            <div className="sfc-airline-badge">{f.airlineCode}</div>
            <div className="sfc-route">
              <div className="sfc-city">
                <div className="sfc-time">{fmt(f.departureTime)}</div>
                <div className="sfc-code">{f.source.code}</div>
                <div className="sfc-name">{f.source.city}</div>
              </div>
              <div className="sfc-mid">
                <div className="sfc-dur">{fmtDur(f.duration)}</div>
                <div className="sfc-arrow">✈</div>
                <div className="sfc-nonstop">Non-stop</div>
              </div>
              <div className="sfc-city right">
                <div className="sfc-time">{fmt(f.arrivalTime)}</div>
                <div className="sfc-code">{f.destination.code}</div>
                <div className="sfc-name">{f.destination.city}</div>
              </div>
            </div>
            <div className="sfc-airline-name">{f.airline} · {f.aircraft}</div>
          </div>

          {/* Lock timer */}
          {lockExpiry && (
            <div className="lock-notice">
              <span className="lock-icon">🔒</span>
              <div>
                <strong>Seats locked!</strong>
                <p>Complete booking before {format(new Date(lockExpiry), 'HH:mm')} or seats will auto-release</p>
              </div>
            </div>
          )}

          {/* ── Live price panel ── */}
          <div className="card price-card">
            <h3 className="price-card-title">
              Price Breakdown
              {someLoading && <span className="price-fetching-badge">Updating…</span>}
            </h3>

            {selectedSeatNums.length === 0 ? (
              <p className="price-hint">Select a seat to see pricing</p>
            ) : (
              <div className="price-rows">
                <div className="price-row">
                  <span>Base fare ({selectedSeatNums.length}/{passengers} seat{passengers > 1 ? 's' : ''})</span>
                  <span>₹{runningBase.toLocaleString('en-IN')}</span>
                </div>

                {surchargeEntries.length > 0
                  ? surchargeEntries.map(([name, total]) => (
                      <div className="price-row surcharge" key={name}>
                        <span>{name}</span>
                        <span>+₹{total.toLocaleString('en-IN')}</span>
                      </div>
                    ))
                  : (pricing.appliedRules || []).length > 0 && (
                      <div className="price-row">
                        <span style={{ color: '#94a3b8' }}>No surcharges apply</span>
                      </div>
                    )
                }

                <div className="price-row">
                  <span>Taxes &amp; GST (18%)</span>
                  <span>₹{runningTax.toLocaleString('en-IN')}</span>
                </div>

                <hr className="divider" />
                <div className="price-row total">
                  <span>Total {selectedSeatNums.length < passengers ? `(so far)` : ''}</span>
                  <span>₹{runningTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
          </div>

          <button
            className="btn btn-primary btn-lg btn-full"
            onClick={handleContinue}
            disabled={selectedSeatNums.length < passengers || someLoading}
          >
            Continue to Booking →
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
