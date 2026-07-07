import React, { useEffect } from 'react';
import { Typography } from 'antd';
import Download from '../image/download.jpg';
import Image from '../image/images.jpg';

import './style.css';
import Header from './Header';

const { Title, Paragraph } = Typography;

const AboutUsPage = () => {
  useEffect(() => {
    localStorage.setItem('userSelectedMenu', '3');
  }, []);

  return (
    <div className="about-us-container">
      <Header />
      <div className="about-us-content" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="about-us-text" style={{ width: '70%' }}>
          <Title level={2} className="about-us-heading">
            About Us
          </Title>
          <div className="about-us-description">
           
            <h1>
              <img
                src={Image}
                alt="Company Logo"
                style={{ float: 'left', width: '250px', height: '200px', marginRight: '20px' }}
              />
              Welcome to E-payment-system, your trusted online payment system.
            </h1>
            <Paragraph>
              Our mission is to revolutionize the way payments are made, offering a seamless digital experience that saves you time and eliminates the need for physical transactions. With our e-payment system, you can effortlessly settle bills, transfer funds, and make payments with just a few clicks.
            </Paragraph>
            <Paragraph>
              We prioritize the security of your financial data. Our platform encrypts sensitive information, ensuring that your transactions are protected and giving you peace of mind. Trust and reliability are at the core of our services, and we strive to deliver the highest level of security and convenience to our users.
            </Paragraph>
            <Paragraph>
            <img
              src={Download}
              alt="Company Logo"
              style={{ float: 'right', width: '250px', height: '200px', marginLeft: '20px' }}
            />
              We are committed to providing exceptional customer service and constantly improving our platform to meet your evolving needs. Whether you are an individual, a business, or an organization, we have tailored solutions to streamline your payment processes and enhance your financial management.
            </Paragraph>
            <Paragraph>
              Thank you for choosing E-payment-system. We look forward to serving you and being your trusted partner for all your online payment requirements.
            </Paragraph>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;