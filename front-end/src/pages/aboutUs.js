import React, { useEffect } from 'react';
import { 
  FaShieldAlt, 
  FaRocket, 
  FaUsers, 
  FaLock, 
  FaMobileAlt,
  FaCheckCircle
} from 'react-icons/fa';
import Image from '../image/images.jpg';
import Header from './Header';
import './AboutUs.css';

const AboutUsPage = () => {
  useEffect(() => {
    localStorage.setItem('userSelectedMenu', '3');
  }, []);

  return (
    <div className="about-container">
      <Header />

      <section className="about-hero">
        <div className="about-hero-content">
          <h1 className="about-hero-title">About Us</h1>
          <p className="about-hero-subtitle">
            Welcome to E-payment-system, your trusted online payment system
          </p>
          <div className="about-hero-divider"></div>
        </div>
      </section>

      <main className="about-main">
        <div className="about-content-wrapper">
          <div className="about-section">
            <div className="about-text-content">
              <div className="about-image-left">
                <img src={Image} alt="Payment System" />
              </div>
              <div className="about-text">
                <h2>Our Mission</h2>
                <p>
                  Our mission is to revolutionize the way payments are made, offering a seamless digital 
                  experience that saves you time and eliminates the need for physical transactions. With 
                  our e-payment system, you can effortlessly settle bills, transfer funds, and make 
                  payments with just a few clicks.
                </p>
              </div>
            </div>
          </div>

          <div className="about-features">
            <h2 className="features-title">Why Choose Us</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon security-icon">
                  <FaShieldAlt />
                </div>
                <h3>Secure Transactions</h3>
                <p>End-to-end encryption for all your financial data</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon speed-icon">
                  <FaRocket />
                </div>
                <h3>Lightning Fast</h3>
                <p>Instant payments and real-time transaction processing</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon support-icon">
                  <FaUsers />
                </div>
                <h3>24/7 Support</h3>
                <p>Dedicated customer support whenever you need help</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon mobile-icon">
                  <FaMobileAlt />
                </div>
                <h3>Mobile Friendly</h3>
                <p>Access your payments anytime, anywhere</p>
              </div>
            </div>
          </div>

          <div className="about-trust">
            <div className="trust-grid">
              <div className="trust-card">
                <FaLock className="trust-icon" />
                <div>
                  <h4>Bank-Grade Security</h4>
                  <p>256-bit encryption</p>
                </div>
              </div>
              <div className="trust-card">
                <FaCheckCircle className="trust-icon" />
                <div>
                  <h4>99.9% Uptime</h4>
                  <p>Always available</p>
                </div>
              </div>
              <div className="trust-card">
                <FaUsers className="trust-icon" />
                <div>
                  <h4>10K+ Users</h4>
                  <p>Trusted worldwide</p>
                </div>
              </div>
            </div>
          </div>

      
        </div>
      </main>
    </div>
  );
};

export default AboutUsPage;