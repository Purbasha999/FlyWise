import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './PaymentPage.css';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const bookingData = location.state?.bookingData;

  // ❗ guard
  if (!bookingData) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Session expired</h2>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  // ✅ ALL HOOKS INSIDE COMPONENT
  const [upiId, setUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);
  const [showUpiPin, setShowUpiPin] = useState(false);
  const [upiPin, setUpiPin] = useState('');

  const [card, setCard] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const [selectedBank, setSelectedBank] = useState('');
  const [bankLogin, setBankLogin] = useState({
    userId: '',
    password: ''
  });

  const [promo, setPromo] = useState('');
  const [discount, setDiscount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(bookingData.totalPrice);
  const [method, setMethod] = useState('UPI');

  // ✅ PROMO
  const applyPromo = async () => {
    try {
      const res = await axios.post('/api/promo/apply', {
        code: promo,
        totalPrice: bookingData.totalPrice,
        isStudent: true
      });

      setDiscount(res.data.discount);
      setFinalPrice(res.data.finalPrice);
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid promo');
    }
  };

  // ✅ UPI VERIFY (FIXED BUG)
  const handleUpiVerify = () => {
    if (!upiId.includes('@')) {
      alert('Invalid UPI ID');
      return;
    }
    setUpiVerified(true);
  };

  // ✅ PAYMENT
  const handlePayment = () => {
    if (method === 'UPI') {
      if (!upiVerified) {
        alert('Please verify UPI');
        return;
      }

      if (!showUpiPin) {
        setShowUpiPin(true);
        return;
      }

      if (upiPin.length !== 4) {
        alert('Enter valid 4-digit PIN');
        return;
      }
    }

    if (method === 'Card') {
      if (!card.number || !card.cvv || !card.expiry) {
        alert('Fill card details');
        return;
      }
    }

    if (method === 'NetBanking') {
      if (!selectedBank || !bankLogin.userId || !bankLogin.password) {
        alert('Complete bank login');
        return;
      }
    }

    alert(`Paid ₹${finalPrice} via ${method}`);
    navigate('/dashboard');
  };

  return (
    <div className="payment-container">

      {/* LEFT */}
      <div className="payment-left">

        {/* PROMO */}
        <div className="card">
          <h3>Apply Promo Code</h3>

          <div className="promo-box">
            <input
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              placeholder="Enter code"
            />
            <button onClick={applyPromo}>Apply</button>
          </div>
        </div>

        {/* METHODS */}
        <div className="card">
          <h3>Payment Method</h3>

          <div className="payment-options">
            {['UPI', 'Card', 'NetBanking'].map(m => (
              <div
                key={m}
                className={`method-tile ${method === m ? 'active' : ''}`}
                onClick={() => setMethod(m)}
              >
                {m}
              </div>
            ))}
          </div>

          {/* FORMS */}
          <div className="payment-form">

            {/* UPI */}
            {method === 'UPI' && (
              <div className="upi-form">

                <input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="Enter UPI ID"
                />

                <button
                  type="button"
                  onClick={handleUpiVerify}
                  className="verify-btn"
                >
                  {upiVerified ? 'Verified ✓' : 'Verify'}
                </button>

                {showUpiPin && (
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="Enter UPI PIN"
                    value={upiPin}
                    onChange={(e) => setUpiPin(e.target.value)}
                  />
                )}
              </div>
            )}

            {/* CARD */}
            {method === 'Card' && (
              <div className="card-form">
                <input
                  placeholder="Card Number"
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: e.target.value })}
                />

                <div className="card-row">
                  <input
                    placeholder="MM/YY"
                    value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                  />
                  <input
                    placeholder="CVV"
                    value={card.cvv}
                    onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                  />
                </div>

                <input
                  placeholder="Card Holder Name"
                  value={card.name}
                  onChange={(e) => setCard({ ...card, name: e.target.value })}
                />
              </div>
            )}

            {/* NET BANKING */}
            {method === 'NetBanking' && (
              <div className="netbanking-form">

                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                >
                  <option value="">Select Bank</option>
                  <option value="SBI">SBI</option>
                  <option value="HDFC">HDFC</option>
                  <option value="ICICI">ICICI</option>
                </select>

                {selectedBank && (
                  <>
                    <input
                      placeholder="User ID"
                      value={bankLogin.userId}
                      onChange={(e) =>
                        setBankLogin({ ...bankLogin, userId: e.target.value })
                      }
                    />

                    <input
                      type="password"
                      placeholder="Password"
                      value={bankLogin.password}
                      onChange={(e) =>
                        setBankLogin({ ...bankLogin, password: e.target.value })
                      }
                    />
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="payment-right">
        <div className="card summary-card">

          <h3>Payment Summary</h3>

          <div className="price-row">
            <span>Total</span>
            <span>₹{bookingData.totalPrice}</span>
          </div>

          <div className="price-row discount">
            <span>Discount</span>
            <span>-₹{discount}</span>
          </div>

          <hr />

          <div className="price-total">
            ₹{finalPrice}
          </div>

          <button className="pay-btn" onClick={handlePayment}>
            Pay ₹{finalPrice}
          </button>

        </div>
      </div>

    </div>
  );
};

export default PaymentPage;