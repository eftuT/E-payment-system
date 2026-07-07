import React, { useState } from 'react';
import { Form, Button, message, Input } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import companyLogo from '../../image/logoimage.jpg';

const AdminLogin = () => {
  // State variables
  const [Identifier, setIdentifier] = useState('');
  const [Password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminData, setAdminData] = useState([]);

  const handleIdentifierChange = (e) => {
    setIdentifier(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: Identifier, Password: Password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data && data.token ) {
          if(data.user.Role === "Admin" || data.user.Role === "SuperAdmin"){
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('adminData', JSON.stringify(data)); // Store adminData as JSON
          setIsLoggedIn(true);
          console.log('Admin logged in successfully');
          message.success('Admin logged in successfully');
          localStorage.setItem('isLoggedInAdmin', true);
          console.log(`${data.token},${data.user.id}`);
          console.log(localStorage.getItem('adminData'));
          console.log(localStorage.getItem('isLoggedInAdmin'));
          navigate(`/admin/dashboard/${data.user.id}`);
        } else if (data.user.Role !== 'Admin' && data.user.Role !== 'SuperAdmin') {
          message.error('You are not authorized to access the admin panel');
          console.error('Unauthorized access');
        }
      }else {
          message.error('server error');
          console.error('Invalid server response:', data);
        }
      } else {
        message.error('Admin login failed');
        message.error('insert valid UserName and Password');
        console.error('Admin login failed:', data.error);
      }
    } catch (error) {
      message.error('An error occurred during admin login');
      console.error('An error occurred during admin login:', error);
    }

    setLoading(false);
    setIdentifier('');
    setPassword('');
  };

  return (
    <div
      style={{
        boxSizing: 'border-box',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "segoe ui", roboto, oxygen, ubuntu, cantarell, "fira sans", "droid sans", "helvetica neue", Arial, sans-serif',
        fontSize: '16px',
        height: '100vh', // Set the height of the container to 100% viewport height
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#435165',
      }}
    >

      <div className='logo' style={{ position: 'absolute', top: '66px', left: '16px' }}>
        <img src={companyLogo} alt='company logo' />
        <div className='company-name'>
          E-payment-system
          <div className='slogan'>your trusted online payment system</div>
        </div>
      </div>

      <div
        className="login"
        style={{
          width: '400px',
          backgroundColor: '#ffffff',
          boxShadow: '0 0 15px 0 rgba(200, 243, 7, 0.3)',
          margin: '150px auto',
          paddingBottom: '15px',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            color: '#5b6574',
            fontSize: '24px',
            padding: '20px 0 20px 0',
            borderBottom: '1px solid #dee0e4',
          }}
        >
          Login
        </h1>
        <Form style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          paddingTop: '20px'
        }} className="form" onFinish={handleSubmit}>
          <label
            htmlFor="identifier"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '50px',
              height: '50px',
              backgroundColor: '#3274d6',
              color: '#ffffff',
            }}
          >
            <UserOutlined className="icon" style={{ color: 'white' }} />
          </label>
          <input
            type="text"
            name="identifier"
            placeholder="Username or Email"
            id="identifier"
            required
            value={Identifier}
            onChange={handleIdentifierChange}
            style={{
              width: '310px',
              height: '50px',
              border: '1px solid #dee0e4',
              marginBottom: '20px',
              padding: '0 15px',
            }}
          />
          <label
            htmlFor="password"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '50px',
              height: '50px',
              backgroundColor: '#3274d6',
              color: '#ffffff',
            }}
          >
            <LockOutlined className="icon" style={{ color: 'white' }} />
          </label>
          <Input.Password
            type="password"
            name="password"
            placeholder="Password"
            id="password"
            required
            value={Password}
            onChange={handlePasswordChange}
            style={{
              width: '310px',
              height: '50px',
              border: '1px solid #dee0e4',
              marginBottom: '20px',
              padding: '0 15px',
            }}
          />
          <Button
            className=".button"
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '20px',
              backgroundColor: '#3274d6',
              border: '0',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'background-color 0.2s',
              height: '50px',
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default AdminLogin;