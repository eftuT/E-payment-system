import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowRight, 
  FaBuilding, 
  FaSearch,
  FaShieldAlt
} from 'react-icons/fa';
import { MdPayment } from 'react-icons/md';
import Header from './Header';
import './ServiceProviders.css';

const ServiceProvidersDetails = () => {
  const [userData, setUserData] = useState(localStorage.getItem('userData'));
  const navigate = useNavigate();
  const [serviceProviderData, setServiceProviderData] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!userData) {
      navigate("/users");
      return;
    }
    fetchServiceProviders();
    localStorage.setItem("userSelectedMenu", 5);
  }, []);

  const fetchServiceProviders = async () => {
    try {
      const response = await axios.get('http://localhost:3000/serviceproviders');
      setServiceProviderData(response.data);
    } catch (error) {
      message.error('Failed to fetch service providers.');
    }
  };

  const handleServiceProviderClick = (serviceProvider) => {
    localStorage.setItem('serviceProviderBIN', serviceProvider.serviceProviderBIN);
    navigate('/serviceNumber');
  };

  const filteredProviders = serviceProviderData.filter(provider =>
    provider.serviceProviderName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sp-container">
      <Header />

      {/* Hero Section */}
      <section className="sp-hero">
        <div className="sp-hero-content">
         
          <h1>Choose Your Service Provider</h1>
          <p>Select from our trusted partners to make secure payments</p>
          <div className="sp-hero-divider"></div>
          
          {/* Search Bar */}
          <div className="sp-search-wrapper">
            <FaSearch className="sp-search-icon" />
            <input
              type="text"
              placeholder="Search service providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sp-search-input"
            />
            <button className="sp-search-btn">
              <FaArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* Providers Grid */}
      <section className="sp-grid-section">
        <div className="sp-grid-header">
          <h2>Available Service Providers</h2>
          <span className="sp-count">{filteredProviders.length} providers</span>
        </div>

        {filteredProviders.length === 0 ? (
          <div className="sp-empty">
            <FaBuilding className="sp-empty-icon" />
            <h3>No providers found</h3>
            <p>Try adjusting your search</p>
          </div>
        ) : (
          <div className="sp-grid">
            {filteredProviders.map((provider, index) => (
              <div 
                key={provider.id} 
                className={`sp-card ${hoveredCard === index ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleServiceProviderClick(provider)}
              >
                <div className="sp-card-number"></div>
                
                <div className="sp-card-icon">
                  <FaBuilding />
                </div>
                
                <h3 className="sp-card-name">{provider.serviceProviderName}</h3>
                
               

                <div className="sp-card-footer">
                  <span className="sp-card-action">
                    Pay Now <FaArrowRight className="sp-action-arrow" />
                  </span>
                </div>

                <div className="sp-card-glow"></div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ServiceProvidersDetails;