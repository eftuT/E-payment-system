import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import './style.css';
import axios from 'axios';
import companyLogo from '../image/logoimage.jpg';
import Header from './Header';

const ServiceProvidersDetails = () => {
  const [userData, setUserData] = useState(localStorage.getItem('userData'));
  const navigate = useNavigate();
  const [serviceProviderData, setServiceProviderData] = useState([]);

  useEffect(() => {
    if (!userData) {
      navigate("/users"); // Replace "/user" with the desired URL for the user page
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
    console.log('Selected service provider:', serviceProvider);
    console.log(serviceProvider.serviceProviderBIN);
    localStorage.setItem('serviceProviderBIN', serviceProvider.serviceProviderBIN);
    console.log(localStorage.getItem('serviceProviderBIN'));
    navigate('/serviceNumber'); // Navigate to 'payment' page
  };

  return (
    
   
      <div className='container'>
    <Header/>
    <div className='class'>
    <h1 className='list-header'>Choose the Service Providers you want to make pay </h1>
      <ul>
        {serviceProviderData.map((serviceProvider) => (
          <li key={serviceProvider.id}>
            <button type="primary" className='button' onClick={() => handleServiceProviderClick(serviceProvider)}>
              {serviceProvider.serviceProviderName}
            </button>
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
};

export default ServiceProvidersDetails;