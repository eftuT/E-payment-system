import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUser, 
  FaUsers, 
  FaArrowRight, 
  FaCheckCircle,
  FaCreditCard,
  FaUserCheck
} from 'react-icons/fa';
import { MdPayment } from 'react-icons/md';
import Header from './Header';
import './ServiceNumber.css';

const ServiceNumber = () => {
  const [serviceNumber, setServiceNumber] = useState('');
  const [serviceProviderBIN] = useState(localStorage.getItem('serviceProviderBIN')); 
  const [user, setUser] = useState(null);
  const [paymentFor, setPaymentFor] = useState('');
  const [errors, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("selectedMenu", 5);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDataFromStorage = JSON.parse(localStorage.getItem('userData'));
        if (!userDataFromStorage) {
          navigate("/users");
          return;
        }

        setUser(userDataFromStorage);

        const response = await axios.get(`http://localhost:3000/Users/${userDataFromStorage.id}`);
        const { data } = response;

        const filteredServiceProviders = data.ServiceProviders?.filter(
          (provider) => provider.serviceProviderBIN === serviceProviderBIN
        );

        if (filteredServiceProviders?.length > 0) {
          const serviceNos = filteredServiceProviders.map(
            (provider) => provider.userServiceProvider?.serviceNo
          );
          setServiceNumber(serviceNos.join(', '));
        }
      } catch (error) {
        console.error('Error fetching service number:', error);
        message.error('Failed to fetch service number');
      }
    };

    fetchData();
  }, [navigate, serviceProviderBIN]); // Added missing dependencies

  const handleServiceNumberChange = (event) => {
    setServiceNumber(event.target.value);
  };

  const handlePaymentForChange = (value) => {
    setPaymentFor(value);
    setErrorMessage('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!paymentFor) {
      setErrorMessage('Please select who you are paying for');
      return;
    }

    if (!serviceNumber) {
      setErrorMessage('Service number is required');
      return;
    }

    setLoading(true);
    localStorage.setItem('serviceNo', serviceNumber);
    setTimeout(() => {
      navigate('/payment');
      setLoading(false);
    }, 500);
  };

  return (
    <div className="sn-container">
      <Header />

      <main className="sn-main">
        <div className="sn-card">
          {/* Header */}
          <div className="sn-card-header">
            <div className="sn-header-icon">
              <MdPayment />
            </div>
            <h1>Payment Details</h1>
            <p>Enter your service number to continue</p>
          </div>

          <div className="sn-card-body">
            <form onSubmit={handleSubmit}>
              {/* Payment For Options */}
              <div className="sn-options">
                <label 
                  className={`sn-option ${paymentFor === 'self' ? 'active' : ''}`}
                  onClick={() => handlePaymentForChange('self')}
                >
                  <input
                    type="radio"
                    value="self"
                    checked={paymentFor === 'self'}
                    onChange={() => handlePaymentForChange('self')}
                  />
                  <div className="sn-option-icon self">
                    <FaUser />
                  </div>
                  <div className="sn-option-text">
                    <h4>Myself</h4>
                    <p>Pay for your own account</p>
                  </div>
                  {paymentFor === 'self' && <FaCheckCircle className="sn-option-check" />}
                </label>

                <label 
                  className={`sn-option ${paymentFor === 'other' ? 'active' : ''}`}
                  onClick={() => handlePaymentForChange('other')}
                >
                  <input
                    type="radio"
                    value="other"
                    checked={paymentFor === 'other'}
                    onChange={() => handlePaymentForChange('other')}
                  />
                  <div className="sn-option-icon other">
                    <FaUsers />
                  </div>
                  <div className="sn-option-text">
                    <h4>Someone Else</h4>
                    <p>Pay for another person</p>
                  </div>
                  {paymentFor === 'other' && <FaCheckCircle className="sn-option-check" />}
                </label>
              </div>

              {errors && <div className="sn-error">{errors}</div>}

              {/* User Details - Self */}
              {paymentFor === 'self' && user && (
                <div className="sn-user-details">
                  <div className="sn-user-header">
                    <FaUserCheck className="sn-user-icon" />
                    <h3>Your Details</h3>
                  </div>
                  <div className="sn-user-grid">
                    <div className="sn-user-field">
                      <label>User ID</label>
                      <p>{user.UserID}</p>
                    </div>
                    <div className="sn-user-field">
                      <label>Full Name</label>
                      <p>{user.FirstName} {user.LastName}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Service Number Input */}
              <div className="sn-input-group">
                <label htmlFor="serviceNumber">
                  <FaCreditCard className="sn-input-icon" />
                  Service Number
                </label>
                <input
                  id="serviceNumber"
                  type="text"
                  value={serviceNumber}
                  onChange={handleServiceNumberChange}
                  placeholder="Enter your service number"
                  className="sn-input"
                />
                <p className="sn-input-hint">Enter the service number provided by your provider</p>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="sn-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="sn-spinner">⏳</span>
                ) : (
                  <>
                    Continue <FaArrowRight />
                  </>
                )}
              </button>
            </form>
          </div>

        
        </div>
      </main>
    </div>
  );
};

export default ServiceNumber;