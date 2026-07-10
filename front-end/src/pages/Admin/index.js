import React, { useEffect, useState } from 'react';
import Dashboard from './Dashboard';
import { Layout, Spin, message, Card, Statistic, Row, Col } from 'antd';
import { 
  UserOutlined, 
  BankOutlined, 
  SolutionOutlined, 
  TransactionOutlined,
  DollarOutlined,
  TeamOutlined,
  ShoppingOutlined,
  RiseOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaRocket, FaUsers } from 'react-icons/fa';
import './Home.css';

const Home = ({ content }) => {
  const [adminData, setAdminData] = useState(JSON.parse(localStorage.getItem('adminData')));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminData) {
      setTimeout(() => {
        navigate('/admin/login');
        message.error('Please login to access the dashboard');
      }, 3000);
    } else {
      setIsLoading(false);
    }
  }, [adminData, navigate]);

  if (isLoading) {
    return (
      <div className="home-loading">
        <Spin size="large" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const statsData = [
    { title: 'Total Users', value: 1245, icon: <UserOutlined />, color: '#667eea', bg: '#f0f1ff' },
    { title: 'Total Agents', value: 87, icon: <BankOutlined />, color: '#f5576c', bg: '#fef2f2' },
    { title: 'Service Providers', value: 56, icon: <SolutionOutlined />, color: '#4facfe', bg: '#f0f9ff' },
    { title: 'Total Transactions', value: 3421, icon: <TransactionOutlined />, color: '#22c55e', bg: '#f0fdf4' },
  ];

  return (
    <Dashboard
      content={
        <div className="home-content">
          {/* Welcome Section */}
          <div className="welcome-section">
            <div className="welcome-text">
              <h1>Welcome back, {adminData?.user?.FirstName || 'Admin'}! 👋</h1>
              <p>Here's what's happening with your payment system today</p>
            </div>
            <div className="welcome-badge">
              <FaShieldAlt className="badge-icon" />
              <span>Admin Access</span>
            </div>
          </div>

          {/* Stats Cards */}
          <Row gutter={[16, 16]} className="stats-row">
            {statsData.map((stat, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card className="stat-card">
                  <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className="stat-content">
                    <Statistic
                      title={stat.title}
                      value={stat.value}
                      valueStyle={{ color: '#1a1a2e', fontSize: '24px', fontWeight: 700 }}
                    />
                    <div className="stat-trend">
                      <RiseOutlined /> +12% this month
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h2 className="section-title">Quick Actions</h2>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8} lg={4}>
                <div className="action-card">
                  <BankOutlined className="action-icon" />
                  <span>Add Agent</span>
                </div>
              </Col>
              <Col xs={12} sm={8} lg={4}>
                <div className="action-card">
                  <SolutionOutlined className="action-icon" />
                  <span>Add Provider</span>
                </div>
              </Col>
              <Col xs={12} sm={8} lg={4}>
                <div className="action-card">
                  <UserOutlined className="action-icon" />
                  <span>Add Admin</span>
                </div>
              </Col>
              <Col xs={12} sm={8} lg={4}>
                <div className="action-card">
                  <TransactionOutlined className="action-icon" />
                  <span>View Transactions</span>
                </div>
              </Col>
              <Col xs={12} sm={8} lg={4}>
                <div className="action-card">
                  <AppstoreOutlined className="action-icon" />
                  <span>Generate Bill</span>
                </div>
              </Col>
              <Col xs={12} sm={8} lg={4}>
                <div className="action-card">
                  <DollarOutlined className="action-icon" />
                  <span>Manage Payments</span>
                </div>
              </Col>
            </Row>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity">
            <h2 className="section-title">Recent Activity</h2>
            <Card className="activity-card">
              <div className="activity-item">
                <div className="activity-dot green"></div>
                <div className="activity-content">
                  <p className="activity-text">New agent registration approved</p>
                  <span className="activity-time">2 minutes ago</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-dot blue"></div>
                <div className="activity-content">
                  <p className="activity-text">Service provider added: Ethio Telecom</p>
                  <span className="activity-time">15 minutes ago</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-dot orange"></div>
                <div className="activity-content">
                  <p className="activity-text">Transaction #TXN12345 completed</p>
                  <span className="activity-time">1 hour ago</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-dot purple"></div>
                <div className="activity-content">
                  <p className="activity-text">New admin user created</p>
                  <span className="activity-time">2 hours ago</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      }
    />
  );
};

export default Home;