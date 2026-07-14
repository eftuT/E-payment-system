import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaShieldAlt, FaLock, FaRocket, FaCheckCircle, FaMobileAlt } from 'react-icons/fa';
import { BsFillShieldLockFill, BsClockFill } from 'react-icons/bs';
import BodyPhoto from '../image/pimage1.jpg';
import Bill from '../image/bimage2.png';
import Security from '../image/simage.png';
import Cash from '../image/mimage.png';
import Header from './Header.js';
import './HomePage.css';

const HomePage = () => {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  useEffect(() => {
    localStorage.setItem("userSelectedMenu", 1);
  }, []);

  const features = [
    {
      id: 1,
      icon: Bill,
      title: 'Digital Bill Settlement',
      description: 'Effortlessly settle bills digitally, saving time and eliminating physical transactions.',
      bgColor: '#667eea',
      iconBg: '#e8ecff'
    },
    {
      id: 2,
      icon: Cash,
      title: 'Secure Transactions',
      description: 'Encrypting financial data ensures secure transactions, providing peace of mind.',
      bgColor: '#764ba2',
      iconBg: '#f3ecff'
    },
    {
      id: 3,
      icon: Security,
      title: 'Innovative Solutions',
      description: 'Revolutionize payments with our secure, convenient, and innovative e-payment system.',
      bgColor: '#f093fb',
      iconBg: '#fef0ff'
    }
  ];

  return (
    <div className="homepage-container">
      <Header />
      
      {/* Main Content - Fits in One Screen */}
      <main className="homepage-main">
        <div className="homepage-content">
          {/* Left Side - Hero Text */}
          <div className="hero-text">
            <div className="hero-badge">
              <FaShieldAlt className="badge-icon" />
              Secure & Trusted
            </div>
            <h1 className="hero-title">
              E-<span className="highlight">Payment</span> System
            </h1>
            <h2 className="hero-subtitle">
              Make Your Life Easier With <span className="highlight">...</span>
            </h2>
            <div className="hero-divider"></div>
            <p className="hero-description">
              Welcome to E-payment-system, your trusted online payment system. 
              We are dedicated to providing secure, convenient, and innovative 
              e-payment solutions to make your life easier.
            </p>
            <div className="hero-buttons">
              <Link to="/serviceProviders" className="btn-primary">
                Get Started <FaArrowRight className="btn-arrow" />
              </Link>
              <Link to="/aboutUs" className="btn-secondary">
                Learn More
              </Link>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="hero-image">
            <div className="image-wrapper">
              <img src={BodyPhoto} alt="Payment System" className="hero-img" />
              <div className="floating-badge badge-1">
                <FaLock className="badge-icon-sm" />
                <span>100% Secure</span>
              </div>
              <div className="floating-badge badge-2">
                <BsClockFill className="badge-icon-sm" />
                <span>Instant</span>
              </div>
              <div className="floating-badge badge-3">
                <FaCheckCircle className="badge-icon-sm" />
                <span>Trusted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features - Full Size Cards */}
        <div className="features-row">
          {features.map((feature) => (
            <div 
              key={feature.id}
              className={`feature-card ${hoveredFeature === feature.id ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredFeature(feature.id)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className="feature-card-inner">
                <div 
                  className="feature-icon-wrapper"
                  style={{ background: feature.iconBg }}
                >
                  <img 
                    src={feature.icon} 
                    alt={feature.title} 
                    className="feature-icon" 
                  />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-hover-effect">
                  <span className="feature-learn-more">
                    Learn More <FaArrowRight className="feature-arrow" />
                  </span>
                </div>
              </div>
              <div 
                className="feature-glow"
                style={{ background: `radial-gradient(circle at center, ${feature.bgColor}22 0%, transparent 70%)` }}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomePage;