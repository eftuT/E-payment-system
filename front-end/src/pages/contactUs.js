import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MailOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined, 
  FacebookOutlined, 
  TwitterOutlined, 
  InstagramOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import Header from './Header'; // Removed Typography import (not used)
import './ContactUs.css';

const ContactUs = () => {

  useEffect(() => {
    localStorage.setItem("userSelectedMenu", 2);
  }, [])

  return (
    <div className="contact-container">
      <Header />

      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1 className="contact-hero-title">Contact Us</h1>
          <p className="contact-hero-subtitle">
            For any inquiries or assistance, please reach out to our support team
          </p>
          <div className="contact-hero-divider"></div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="contact-info-section">
        <div className="contact-info-wrapper">
          {/* Left Side - Contact Form */}
          <div className="contact-form-container">
            <h2>Send Us a Message</h2>
            <form className="contact-form">
              <div className="form-group">
                <label>Your Name</label>
                <input type="text" placeholder="Enter your full name" />
              </div>
              <div className="form-group">
                <label>Your Email</label>
                <input type="email" placeholder="Enter your email address" />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input type="text" placeholder="Enter subject" />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea rows="4" placeholder="Enter your message"></textarea>
              </div>
              <button type="submit" className="submit-btn">
                Send Message
              </button>
            </form>
          </div>

          {/* Right Side - Contact Details */}
          <div className="contact-info-side">
            <h2>Contact Details</h2>
            
            <div className="info-item">
              <div className="info-icon-wrapper email-icon-wrapper">
                <MailOutlined className="info-icon" />
              </div>
              <div className="info-content">
                <h4>Email</h4>
                <p>support@epaymentsystem.com</p>
                <p className="info-sub">We'll respond within 24 hours</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon-wrapper phone-icon-wrapper">
                <PhoneOutlined className="info-icon" />
              </div>
              <div className="info-content">
                <h4>Phone</h4>
                <p>+251-911-23-76-34</p>
                <p className="info-sub">Mon-Fri 8:30am - 5pm</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon-wrapper address-icon-wrapper">
                <EnvironmentOutlined className="info-icon" />
              </div>
              <div className="info-content">
                <h4>Address</h4>
                <p>Bole, Addis Ababa, Ethiopia</p>
                <p className="info-sub">Visit us in person</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon-wrapper hours-icon-wrapper">
                <ClockCircleOutlined className="info-icon" />
              </div>
              <div className="info-content">
                <h4>Opening Hours</h4>
                <p>Monday - Friday: 8:30am - 5pm</p>
                <p className="info-sub">Saturday - Sunday: Closed</p>
              </div>
            </div>

            {/* Social Media */}
            <div className="social-section">
              <h4>Follow Us</h4>
              <div className="social-links">
                <Link to="#" className="social-link facebook">
                  <FacebookOutlined />
                </Link>
                <Link to="#" className="social-link twitter">
                  <TwitterOutlined />
                </Link>
                <Link to="#" className="social-link instagram">
                  <InstagramOutlined />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ContactUs;