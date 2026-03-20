import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { searchFlights } from '../utils/api';
import { useBooking } from '../context/BookingContext';
import FlightCard from '../components/common/FlightCard';
import toast from 'react-hot-toast';
import './Flights.css';

const Flights = () => {
  const navigate = useNavigate();
  const [urlParams] = useSearchParams();
  const { setSelectedFlight, setSearchParams } = useBooking();

  const source = urlParams.get('source') || '';
  const destination = urlParams.get('destination') || '';
  const date = urlParams.get('date') || '';
  const passengers = parseInt(urlParams.get('passengers') || '1');

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('price');

  useEffect(() => {
    setSearchParams({ source, destination, date, passengers });
    fetchFlights();
  }, [source, destination, date]);

  const [noFlightsOnDate, setNoFlightsOnDate] = useState(false);

const fetchFlights = async () => {
  try {
    setLoading(true);

    // 1️⃣ Try with date (if provided)
    let res = await searchFlights({ source, destination, date, passengers });

    if (date && res.data.flights.length === 0) {
      
      setNoFlightsOnDate(true);

      const altRes = await searchFlights({ source, destination, passengers });
      setFlights(altRes.data.flights);
    } else {
      setNoFlightsOnDate(false);
      setFlights(res.data.flights);
    }

  } catch (err) {
    toast.error('Failed to fetch flights');
  } finally {
    setLoading(false);
  }
};

  const handleSelectFlight = (flight) => {
    setSelectedFlight(flight);
    navigate('/seats');
  };

  const sorted = [...flights].sort((a, b) => {
    if (sortBy === 'price') return (a.dynamicPrice || a.basePrice) - (b.dynamicPrice || b.basePrice);
    if (sortBy === 'duration') return a.duration - b.duration;
    if (sortBy === 'departure') return new Date(a.departureTime) - new Date(b.departureTime);
    return 0;
  });

  return (
    <div className="page-content flights-page">
      {/* Header */}
      <div className="flights-header">
        <div className="section">
          <div className="flights-breadcrumb">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>← Back</button>
          </div>
          <div className="flights-title-row">
            <div>
              <h1 className="flights-title">{source} → {destination}</h1>
              <p className="flights-meta">
  {date ? date : "All Dates"} · {passengers} passenger...
</p>
            </div>
            <div className="sort-bar">
              <span className="sort-label">Sort by:</span>
              {[['price','Cheapest'],['duration','Fastest'],['departure','Earliest']].map(([v,l]) => (
                <button key={v} className={`sort-btn${sortBy === v ? ' active' : ''}`} onClick={() => setSortBy(v)}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="section flights-content">
        {loading ? (
          <div className="flights-loading">
            <div className="spinner spinner-lg" />
            <p>Searching best flights for you...</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="no-flights">
            <div className="no-flights-icon">✈️</div>
            <h3>No flights found</h3>
            <p>Try different dates or cities</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Search Again</button>
          </div>
        ) : (
          <>
          {noFlightsOnDate && (
        <div className="no-date-warning">
          ❌ No flights available on selected date  
          <br />
          ✅ Showing flights on other dates
        </div>
      )}
          <div className="flight-list">
            {sorted.map(flight => (
              <FlightCard key={flight._id} flight={flight} passengers={passengers} onSelect={handleSelectFlight} />
            ))}
          </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Flights;
