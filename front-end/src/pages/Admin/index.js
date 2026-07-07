import React, { useEffect, useState } from 'react';
import Dashboard from './Dashboard';
import { Layout, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const Home = ({ content }) => {
  const [adminData, setAdminData] = useState(JSON.parse(localStorage.getItem('adminData')));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if adminData exists
    if (!adminData) {
      setTimeout(() => {
        navigate('/admin/login');
        message.error('Please login to access the dashboard');
      }, 5000);
    } else {
      setIsLoading(false);
    }
  }, [adminData, navigate]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
        <p>Please wait while we check your login status...</p>
      </div>
    );
  }

  return (
    <Dashboard
      content={
        <Layout>
          <div
            className="site-layout-background"
            style={{ padding: 24, minHeight: 360, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >

            <h1 style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>
              Welcome to E-Payment, {adminData.user.FirstName}!
            </h1>

            <h2 style={{ fontSize: 20, color: 'rgb(5, 145, 246)', textAlign: 'center', marginBottom: 24 }}>
              E-<span style={{ color: 'rgb(5, 145, 246)' }}>Payment</span> System
            </h2>

            <div
              className="note2"
              style={{
                backgroundColor: 'rgb(240, 240, 240)',
                borderRadius: 8,
                padding: 16,
                marginBottom: 24,
                textAlign: 'center',
              }}
            >
              <h1 style={{ fontSize: 28, fontWeight: 'bold' }}>
                Make Your Life <br /> Easier With <span style={{ color: 'rgb(5, 145, 246)' }}>....</span>
              </h1>
            </div>

            <hr className="horizontal-line" style={{ marginBottom: 24 }} />

            <div
              className="note3"
              style={{ backgroundColor: 'rgb(250, 250, 250)', borderRadius: 8, padding: 16, textAlign: 'center' }}
            >
              <h4 style={{ fontSize: 16 }}>
              </h4>
            </div>
          </div>
        </Layout>
      }
    />
  );
};

export default Home;