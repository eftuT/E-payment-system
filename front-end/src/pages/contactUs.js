import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, FacebookOutlined, TwitterOutlined, InstagramOutlined } from '@ant-design/icons';
import { Typography, Space } from 'antd';
import companyLogo from '../image/logoimage.jpg';
import USER from '../image/himage3.jpg';
import './style.css';
import Header from './Header';

const { Title, Paragraph } = Typography;

const ContactUs = () => {

  useEffect(()=>{
    localStorage.setItem("userSelectedMenu", 2);
  },[])

  return (
    <div className="container">
      <div className="overlay-curve"></div>
      <Header />

      <div className="body" style={{ textAlign:'center' }}>
        <Title className="contactus" style={{ marginTop: '50px' }}>Contact Us</Title>
        <Paragraph className="contactus-description">For any inquiries or assistance, please reach out to our support team:</Paragraph>
        <div className="contact-info">
          <Space>
            <MailOutlined className="contact-icon" />
            <Title level={5}>Email:</Title>
          </Space>
          <Paragraph>support@epaymentsystem.com</Paragraph>
        </div>
        <div className="contact-info">
          <Space>
            <PhoneOutlined className="contact-icon" />
            <Title level={5}>Phone:</Title>
          </Space>
          <Paragraph>+251-911-23-76-34</Paragraph>
        </div>
        <div className="contact-info">
          <Space>
            <EnvironmentOutlined className="contact-icon" />
            <Title level={5}>Mailing Address:</Title>
          </Space>
          <Paragraph>Bole, Addis Ababa, Ethiopia</Paragraph>
        </div>

        {/* Additional Information */}
        <div className="additional-info">
          <Title level={4}>Opening Hours:</Title>
          <Paragraph>Monday - Friday: 8:30am - 5pm</Paragraph>
        </div>

        <div className="additional-info">
          <Title level={4}>Social Media:</Title>
          <ul className="social-media-list">
            <li>
              <Link to="#">
                <FacebookOutlined className="social-media-icon" />
              </Link>
            </li>
            <li>
              <Link to="#">
                <TwitterOutlined className="social-media-icon" />
              </Link>
            </li>
            <li>
              <Link to="#">
                <InstagramOutlined className="social-media-icon" />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;