import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import './Dashboard.css';

const fmtDate = (d) => format(new Date(d), 'dd MMM yyyy');
const fmtTime = (d) => format(new Date(d), 'HH:mm');
const fmtDur = (m) => `${Math.floor(m / 60)}h ${m % 60}m`;

const statusColors = {
  CONFIRMED: 'badge-green',
  CANCELLED: 'badge-red',
  PENDING: 'badge-amber',
};

const BookingCard = ({ booking, onCancel }) => {
  const f = booking.flightId;
  const [cancelling, setCancelling] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      setCancelling(true);
      await onCancel(booking._id);
    } finally {
      setCancelling(false);
    }
  };

  if (!f) return null;

  return (
    <div className={`booking-card ${booking.bookingStatus === 'CANCELLED' ? 'cancelled' : ''}`}>
      <div className="bc-top">
        <div className="bc-ref-row">
          <div className="bc-ref">
            <span className="bc-ref-label">Booking Ref</span>
            <span className="bc-ref-num">{booking.bookingRef}</span>
          </div>
          <span className={`badge ${statusColors[booking.bookingStatus]}`}>{booking.bookingStatus}</span>
        </div>

        <div className="bc-flight-row">
          <div className="bc-airline-chip">{f.airlineCode || 'FW'}</div>
          <div className="bc-route-wrap">
            <div className="bc-city-block">
              <div className="bc-time">{fmtTime(f.departureTime)}</div>
              <div className="bc-code">{f.source?.code}</div>
              <div className="bc-city">{f.source?.city}</div>
            </div>
            <div className="bc-mid">
              <div className="bc-dur">{fmtDur(f.duration)}</div>
              <div className="bc-line">── ✈ ──</div>
              <div className="bc-nonstop">Non-stop</div>
            </div>
            <div className="bc-city-block right">
              <div className="bc-time">{fmtTime(f.arrivalTime)}</div>
              <div className="bc-code">{f.destination?.code}</div>
              <div className="bc-city">{f.destination?.city}</div>
            </div>
          </div>
          <div className="bc-price-block">
            <div className="bc-price">₹{booking.priceBreakdown?.totalPrice?.toLocaleString('en-IN')}</div>
            <div className="bc-price-label">Total Paid</div>
          </div>
        </div>

        <div className="bc-meta-row">
          <span className="bc-meta-item">📅 {fmtDate(f.departureTime)}</span>
          <span className="bc-meta-item">💺 {booking.seats?.map(s => s.seatNumber).join(', ')}</span>
          <span className="bc-meta-item">👥 {booking.passengers?.length} passenger{booking.passengers?.length > 1 ? 's' : ''}</span>
          <span className="bc-meta-item">✈ {f.flightNumber}</span>
        </div>
      </div>

      <div className="bc-actions">
        <button className="btn btn-ghost btn-sm" onClick={() => setExpanded(!expanded)}>
          {expanded ? '▲ Hide Details' : '▼ View Details'}
        </button>
        {booking.bookingStatus === 'CONFIRMED' && (
          <button className="btn btn-danger btn-sm" onClick={handleCancel} disabled={cancelling}>
            {cancelling ? <><div className="spinner" /> Cancelling...</> : 'Cancel Booking'}
          </button>
        )}
      </div>

      {expanded && (
        <div className="bc-expanded">
          <div className="bc-exp-section">
            <div className="bc-exp-title">Passengers</div>
            <div className="bc-passengers">
              {booking.passengers?.map((p, i) => (
                <div key={i} className="bc-passenger">
                  <span className="bc-pax-num">{i + 1}</span>
                  <span className="bc-pax-name">{p.name}</span>
                  <span className="bc-pax-age">Age {p.age}</span>
                  <span className="bc-pax-gender">{p.gender}</span>
                  <span className="badge badge-blue">{p.seatNumber}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bc-exp-section">
            <div className="bc-exp-title">Price Breakdown</div>
            <div className="bc-price-table">
              <div className="bc-pr"><span>Base Fare</span><span>₹{booking.priceBreakdown?.basePrice?.toLocaleString('en-IN')}</span></div>
              {booking.priceBreakdown?.demandSurcharge > 0 && <div className="bc-pr surcharge"><span>Demand Surcharge</span><span>+₹{booking.priceBreakdown.demandSurcharge?.toLocaleString('en-IN')}</span></div>}
              {booking.priceBreakdown?.lastMinuteSurcharge > 0 && <div className="bc-pr surcharge"><span>Last-Minute Surcharge</span><span>+₹{booking.priceBreakdown.lastMinuteSurcharge?.toLocaleString('en-IN')}</span></div>}
              {booking.priceBreakdown?.seatCharges > 0 && <div className="bc-pr"><span>Seat Charges</span><span>₹{booking.priceBreakdown.seatCharges?.toLocaleString('en-IN')}</span></div>}
              <div className="bc-pr"><span>Taxes & GST</span><span>₹{booking.priceBreakdown?.taxes?.toLocaleString('en-IN')}</span></div>
              <div className="bc-pr total"><span>Total</span><span>₹{booking.priceBreakdown?.totalPrice?.toLocaleString('en-IN')}</span></div>
            </div>
          </div>

          {booking.bookingStatus === 'CANCELLED' && (
            <div className="bc-cancelled-notice">
              Cancelled on {booking.cancelledAt ? fmtDate(booking.cancelledAt) : 'N/A'}
              {booking.cancellationReason ? ` · ${booking.cancellationReason}` : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getMyBookings();
      setBookings(res.data.bookings);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelBooking(id, { reason: 'Cancelled by user' });
      toast.success('Booking cancelled. Seats released.');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    }
  };

  const filtered = bookings.filter(b => filter === 'ALL' || b.bookingStatus === filter);

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.bookingStatus === 'CONFIRMED').length,
    cancelled: bookings.filter(b => b.bookingStatus === 'CANCELLED').length,
    spent: bookings.filter(b => b.bookingStatus === 'CONFIRMED').reduce((s, b) => s + (b.priceBreakdown?.totalPrice || 0), 0),
  };

  return (
    <div className="page-content dashboard-page">
      <div className="dashboard-header">
        <div className="section">
          <div className="dash-welcome">
            <div className="dash-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <h1 className="dash-title">My Trips</h1>
              <p className="dash-sub">Welcome back, {user?.name?.split(' ')[0]}!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="section dashboard-content">
        {/* Stats */}
        <div className="dash-stats">
          {[
            ['Total Trips', stats.total, '✈'],
            ['Confirmed', stats.confirmed, '✅'],
            ['Cancelled', stats.cancelled, '❌'],
            ['Total Spent', `₹${stats.spent.toLocaleString('en-IN')}`, '💰'],
          ].map(([label, val, icon]) => (
            <div key={label} className="dash-stat-card">
              <div className="dash-stat-icon">{icon}</div>
              <div className="dash-stat-val">{val}</div>
              <div className="dash-stat-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="dash-filters">
          {['ALL', 'CONFIRMED', 'CANCELLED'].map(f => (
            <button key={f} className={`filter-tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'ALL' ? 'All Trips' : f === 'CONFIRMED' ? 'Upcoming' : 'Cancelled'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="dash-loading"><div className="spinner spinner-lg" /><p>Loading your trips...</p></div>
        ) : filtered.length === 0 ? (
          <div className="dash-empty">
            <div className="dash-empty-icon">✈️</div>
            <h3>{filter === 'ALL' ? 'No trips yet' : `No ${filter.toLowerCase()} bookings`}</h3>
            <p>Ready for your next adventure?</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Search Flights</button>
          </div>
        ) : (
          <div className="booking-list">
            {filtered.map(b => (
              <BookingCard key={b._id} booking={b} onCancel={handleCancel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
