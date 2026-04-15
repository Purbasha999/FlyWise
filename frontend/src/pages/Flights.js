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
  const { 
  setSelectedFlight, 
  setSelectedOutboundFlight, 
  setSelectedReturnFlight, 
  setSearchParams 
} = useBooking();



  const source = urlParams.get('source') || '';
  const destination = urlParams.get('destination') || '';
  const date = urlParams.get('date') || '';
  const passengers = parseInt(urlParams.get('passengers') || '1');

  const [editData, setEditData] = useState({
  date: date || '',
  passengers: passengers || 1
});



  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('price');
  const [outboundFlights, setOutboundFlights] = useState([]);
const [returnFlights, setReturnFlights] = useState([]);

  useEffect(() => {
    setSearchParams({ source, destination, date, passengers });
    fetchFlights();
  }, [source, destination, date,passengers]);

  useEffect(() => {
  setEditData({
    date: date || '',
    passengers: passengers || 1
  });
}, [date, passengers]);

  const [noFlightsOnDate, setNoFlightsOnDate] = useState(false);


const tripType = urlParams.get('tripType');
const returnDate = urlParams.get('returnDate');

const fetchFlights = async () => {
  try {
    setLoading(true);

    if (tripType === 'round') {

      // outbound flights
      const res1 = await searchFlights({
        source,
        destination,
        date,
        passengers
      });

      // return flights
      const res2 = await searchFlights({
        source: destination,
        destination: source,
        date: returnDate,
        passengers
      });
      console.log("OUTBOUND:", res1.data.flights);
console.log("RETURN:", res2.data.flights);
      setOutboundFlights(res1.data.flights || []);
      setReturnFlights(res2.data.flights || []);

    } else {

      const res = await searchFlights({
        source,
        destination,
        date,
        passengers
      });

      setFlights(res.data.flights || []);
    }

  } catch (err) {
    toast.error('Failed to fetch flights');
  } finally {
    setLoading(false);
  }
};

const handleSelectFlight = (flight, type) => {

  if (tripType === 'round') {

    if (type === 'outbound') {
      setSelectedOutboundFlight(flight);
      toast.success("Outbound selected");
      return;
    }

    if (type === 'return') {
      setSelectedReturnFlight(flight);
      toast.success("Return selected");

      navigate('/seats-round?passengers=' + passengers);
    }

  } else {
    setSelectedFlight(flight);
    navigate(`/seats?passengers=${passengers}`);
  }
};
  const sorted = [...flights].sort((a, b) => {
    if (sortBy === 'price') return (a.dynamicPrice || a.basePrice) - (b.dynamicPrice || b.basePrice);
    if (sortBy === 'duration') return a.duration - b.duration;
    if (sortBy === 'departure') return new Date(a.departureTime) - new Date(b.departureTime);
    return 0;
  });

  const handleUpdate = () => {
  let url = `/flights?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&passengers=${editData.passengers}`;

  if (editData.date) {
    url += `&date=${editData.date}`;
  }

  navigate(url); //this triggers re-fetch
};

  return (
    <div className="page-content flights-page">
      {/* Header */}
      <div className="top-search-bar flights-top-bar">

  <div className="route-pill">
    ✈ {source} → {destination}
  </div>

  <div className="field-pill">
    <img src=''></img>
    <input
      type="date"
      value={editData.date}
      onChange={(e) =>
        setEditData({ ...editData, date: e.target.value })
      }
    />
  </div>

  <div className="field-pill">
    👤
    <select
      value={editData.passengers}
      onChange={(e) =>
        setEditData({ ...editData, passengers: Number(e.target.value) })
      }
    >
      {[1,2,3,4,5,6].map(n => (
        <option key={n} value={n}>
          {n} {n === 1 ? 'Adult' : 'Adults'}
        </option>
      ))}
    </select>
  </div>

  <button className="update-btn" onClick={handleUpdate}>
    Update
  </button>

</div>
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
        ) : tripType === 'round' ? (

  outboundFlights.length === 0 && returnFlights.length === 0 ? (

    <div className="no-flights">
      <div className="no-flights-icon">✈️</div>
      <h3>No flights found</h3>
      <p>No outbound or return flights available</p>
      <button className="btn btn-primary" onClick={() => navigate('/')}>
        Search Again
      </button>
    </div>

  ) : (

    <>
      {/* OUTBOUND */}
      <h2 className="section-title">Outbound Flights</h2>
      <div className="flight-list">
        {outboundFlights.map(f => (
          <FlightCard
            key={f._id}
            flight={f}
            passengers={passengers}
            onSelect={() => handleSelectFlight(f, 'outbound')}
          />
        ))}
      </div>

      {/* RETURN */}
      <h2 className="section-title">Return Flights</h2>
      <div className="flight-list">
        {returnFlights.length === 0 ? (
          <div className="no-date-warning">
            ❌ No return flights on selected date  
            <br />
            ✅ Try another date
          </div>
        ) : (
          returnFlights.map(f => (
            <FlightCard
              key={f._id}
              flight={f}
              passengers={passengers}
              onSelect={() => handleSelectFlight(f, 'return')}
            />
          ))
        )}
      </div>
    </>

  )

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
          {tripType === 'round' ? (

  <div>

    <h2 className="section-title">Outbound Flights</h2>
    <div className="flight-list">
      {outboundFlights.map(f => (
        <FlightCard
          key={f._id}
          flight={f}
          passengers={passengers}
          onSelect={() => handleSelectFlight(f, 'outbound')}
        />
      ))}
    </div>

    <h2 className="section-title">Return Flights</h2>
    <div className="flight-list">
      {returnFlights.map(f => (
        <FlightCard
          key={f._id}
          flight={f}
          passengers={passengers}
          onSelect={() => handleSelectFlight(f, 'return')}
        />
      ))}
    </div>

  </div>

) : (

  <div className="flight-list">
    {sorted.map(f => (
      <FlightCard
        key={f._id}
        flight={f}
        passengers={passengers}
        onSelect={handleSelectFlight}
      />
    ))}
  </div>

)}
          </>
        )}
      </div>
    </div>
  );
};

export default Flights;
