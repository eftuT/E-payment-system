import React, { useEffect, useState } from 'react';
import Dashboard from './Dashboard';
import { Spin, message, Card, Statistic, Row, Col, Tag } from 'antd';
import { 
  UserOutlined, 
  BankOutlined, 
  SolutionOutlined, 
  TransactionOutlined,
  DollarOutlined,
  TeamOutlined,
  WalletOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { FaShieldAlt } from 'react-icons/fa';
import axios from 'axios';
import './Home.css';

const Home = ({ content }) => {
  const [adminData] = useState(JSON.parse(localStorage.getItem('adminData'))); // Removed setAdminData
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAgents: 0,
    totalServiceProviders: 0,
    totalAdmins: 0,
    totalPayments: 0,
    totalBills: 0,
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminData) {
      setTimeout(() => {
        navigate('/admin/login');
        message.error('Please login to access the dashboard');
      }, 3000);
    } else {
      fetchDashboardData();
      fetchRecentPayments();
    }
  }, [adminData, navigate]);

  const extractArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.users && Array.isArray(data.users)) return data.users;
    if (data.agents && Array.isArray(data.agents)) return data.agents;
    if (data.serviceproviders && Array.isArray(data.serviceproviders)) return data.serviceproviders;
    if (data.payments && Array.isArray(data.payments)) return data.payments;
    if (data.bills && Array.isArray(data.bills)) return data.bills;
    return [data];
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const usersRes = await axios.get('http://localhost:3000/Users');
      const users = extractArray(usersRes.data);
      const userCount = users.filter(u => u.Role === 'User').length;
      const adminCount = users.filter(u => u.Role === 'Admin' || u.Role === 'SuperAdmin').length;

      const agentsRes = await axios.get('http://localhost:3000/agents');
      const agents = extractArray(agentsRes.data);
      const agentCount = agents.length;

      const providersRes = await axios.get('http://localhost:3000/serviceproviders');
      const providers = extractArray(providersRes.data);
      const providerCount = providers.length;

      const paymentsRes = await axios.get('http://localhost:3000/payment');
      const payments = extractArray(paymentsRes.data);
      const paymentCount = payments.length;

      const billsRes = await axios.get('http://localhost:3000/bills');
      const bills = extractArray(billsRes.data);
      const billCount = bills.length;

      setStats({
        totalUsers: userCount,
        totalAgents: agentCount,
        totalServiceProviders: providerCount,
        totalAdmins: adminCount,
        totalPayments: paymentCount,
        totalBills: billCount,
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      message.error('Failed to load dashboard data');
      setIsLoading(false);
    }
  };

  const fetchRecentPayments = async () => {
    try {
      const paymentsRes = await axios.get('http://localhost:3000/payment');
      const payments = extractArray(paymentsRes.data);
      setRecentPayments(payments.slice(0, 5));
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="home-loading">
        <Spin size="large" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const statsData = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers, 
      icon: <UserOutlined />, 
      color: '#667eea', 
      bg: '#f0f1ff'
    },
    { 
      title: 'Total Agents', 
      value: stats.totalAgents, 
      icon: <BankOutlined />, 
      color: '#f5576c', 
      bg: '#fef2f2'
    },
    { 
      title: 'Service Providers', 
      value: stats.totalServiceProviders, 
      icon: <SolutionOutlined />, 
      color: '#4facfe', 
      bg: '#f0f9ff'
    },
    { 
      title: 'Total Admins', 
      value: stats.totalAdmins, 
      icon: <TeamOutlined />, 
      color: '#8b5cf6', 
      bg: '#f5f0ff'
    },
    { 
      title: 'Total Payments', 
      value: stats.totalPayments, 
      icon: <DollarOutlined />, 
      color: '#22c55e', 
      bg: '#f0fdf4'
    },
    { 
      title: 'Total Bills', 
      value: stats.totalBills, 
      icon: <WalletOutlined />, 
      color: '#f59e0b', 
      bg: '#fef3c7'
    },
  ];

  return (
    <Dashboard
      content={
        <div className="home-content">
          {/* Welcome Section */}
          <div className="welcome-section">
            <div className="welcome-text">
              <h1>Welcome back, {adminData?.user?.FirstName || 'Admin'}! 👋</h1>
              <p>Here's an overview of your payment system</p>
            </div>
            <div className="welcome-badge">
              <FaShieldAlt className="badge-icon" />
              <span>Admin Access</span>
            </div>
          </div>

          {/* Stats Cards */}
          <Row gutter={[16, 16]} className="stats-row">
            {statsData.map((stat, index) => (
              <Col xs={24} sm={12} lg={6} xl={4} key={index}>
                <Card className="stat-card">
                  <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className="stat-content">
                    <Statistic
                      title={stat.title}
                      value={stat.value}
                      valueStyle={{ color: '#1a1a2e', fontSize: '22px', fontWeight: 700 }}
                    />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Recent Transactions */}
          <div className="recent-transactions">
            <h2 className="section-title">💳 Recent Transactions</h2>
            <Card className="transaction-card">
              {recentPayments.length > 0 ? (
                <div className="transaction-list">
                  {recentPayments.map((payment, index) => (
                    <div key={index} className="transaction-item">
                      <div className="transaction-left">
                        <div className="transaction-icon">
                          <TransactionOutlined />
                        </div>
                        <div className="transaction-info">
                          <div className="transaction-id">{payment.TransactionNo || 'N/A'}</div>
                          <div className="transaction-meta">
                            <Tag color="blue">{payment.paymentMethod || 'Unknown'}</Tag>
                            <span className="transaction-date">
                              <CalendarOutlined /> {payment.paymentDate || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="transaction-amount">
                        ${parseFloat(payment.amount || 0).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-transactions">
                  <p>No transactions found</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      }
    />
  );
};

export default Home;