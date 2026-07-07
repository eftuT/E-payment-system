import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import './style.css';
import axios from 'axios';
import Header from './Header';

const ServiceNumber = () => {

  // State variables
  const [userData, setUserData] = useState(localStorage.getItem('userData'));
  const [serviceNumber, setServiceNumber] = useState('');
  const [serviceProviderBIN, setServiceProviderBIN] = useState(localStorage.getItem('serviceProviderBIN'));
  const [bill, setBill] = useState(null);
  const [user, setUser] = useState(null);
  const [data, setData] = useState({});
  const [paymentFor, setPaymentFor] = useState('');
  const [errors, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("selectedMenu", 5);
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retrieve user data from localStorage or API
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData) {
          navigate("/users");
          return;
        }

        setUser(userData);
        console.log(userData.id);


        // Fetch the user data including service providers
        const response = await axios.get(`http://localhost:3000/Users/${userData.id}`);
        const { data } = response;
        console.log(data);

        // Filter service providers based on serviceProviderBIN
        const filteredServiceProviders = data.ServiceProviders.filter(
          (provider) => provider.serviceProviderBIN === serviceProviderBIN
        );

        if (filteredServiceProviders.length > 0) {
          const serviceNos = filteredServiceProviders.map(
            (provider) => provider.userServiceProvider.serviceNo
          );
          setServiceNumber(serviceNos.join(', '));
        }

        console.log(filteredServiceProviders);
        console.log(serviceNumber);
        setData(data);
      } catch (error) {
        console.error('Error fetching service number:', error);
        message.error('Failed to fetch service number');
      }
    };

    fetchData();
  }, []);

  const handleServiceNumberChange = (event) => {
    setServiceNumber(event.target.value);
  };

  const handlePaymentForChange = (event) => {
    setPaymentFor(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!serviceNumber) {
      setErrorMessage('Service number is required');
      return;
    }

    localStorage.setItem('serviceNo', serviceNumber);
    console.log(localStorage.getItem('serviceNo'));
    navigate('/payment', { state: { serviceNumber } });
  };


  return (
    <div className='container'>
      <Header />
      <div className='circle'>
        <p>P</p>
      </div>

      <div className='bodyy' >

        <div className='form-container' >
          <form onSubmit={handleSubmit}>
            <div className='title'>Payment Page
              <div
                className="title-line"
                style={{
                  content: "",
                  position: "relative",
                  height: "3px",
                  width: "25px",
                  left: '10px',
                  transform: "translateX(-50%)",
                  backgroundImage:
                    "linear-gradient(to right, rgb(3, 55, 100), rgb(95, 174, 230))"
                }}
              ></div></div>
            <div>
              <label>
                <input
                  type='radio'
                  value='self'
                  checked={paymentFor === 'self'}
                  onChange={handlePaymentForChange}
                />
                Make payment for myself
              </label>
              <label>
                <input
                  type='radio'
                  value='other'
                  checked={paymentFor === 'other'}
                  onChange={handlePaymentForChange}
                />
                Make payment for someone else
              </label>
            </div>
            {paymentFor === 'self' && user && (
              <>
                <p>User ID: {user.UserID}</p>
                <p>First Name: {user.FirstName}</p>
                <p>Last Name: {user.LastName}</p>
                {/* Display other user details */}
                <label >
                  <br></br>
                  Service Number:
                  <input
                    type='text'
                    value={serviceNumber}
                    onChange={handleServiceNumberChange}
                  />
                </label>
                <button className='button' type='submit'>NEXT</button>
              </>
            )}
            {paymentFor === 'other' && (
              <>
                <label>
                  Service Number:
                  <input
                    type='text'
                    onChange={handleServiceNumberChange}
                  />
                </label>
                <button type='submit'>NEXT</button>
              </>
            )}
            <br />
            {errors && <span>{errors}</span>}
          </form>
        </div>
      </div>
    </div>

  );
};

export default ServiceNumber;