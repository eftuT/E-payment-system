import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaShieldAlt, 
  FaRocket, 
  FaUsers, 
  FaLock, 
  FaMobileAlt,
  FaCheckCircle
} from 'react-icons/fa';
import { MdPayment, MdSecurity } from 'react-icons/md';
import Download from '../image/download.jpg';
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

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1 className="about-hero-title">About Us</h1>
          <p className="about-hero-subtitle">
            Welcome to E-payment-system, your trusted online payment system
          </p>
          <div className="about-hero-divider"></div>
        </div>
      </section>

      {/* Main Content */}
      <main className="about-main">
        <div className="about-content-wrapper">
          {/* Mission Section */}
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

          {/* Security Section */}
          <div className="about-section reverse">
            <div className="about-text-content">
              <div className="about-text">
                <h2>Security First</h2>
                <p>
                  We prioritize the security of your financial data. Our platform encrypts sensitive 
                  information, ensuring that your transactions are protected and giving you peace of mind. 
                  Trust and reliability are at the core of our services, and we strive to deliver the 
                  highest level of security and convenience to our users.
                </p>
              </div>
              <div className="about-image-right">
                <img src={Download} alt="Security" />
              </div>
            </div>
          </div>

          {/* Features Section */}
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

          {/* Closing Section */}
          <div className="about-closing">
            <div className="closing-content">
              <FaCheckCircle className="closing-icon" />
              <h2>Thank You for Choosing Us</h2>
              <p>
                We look forward to serving you and being your trusted partner for all your online 
                payment requirements.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutUsPage;