import React, { useEffect, useState } from 'react';
import Dashboard from './Dashboard';
import { Spin, message, Card, Statistic, Row, Col, Tag, Tabs, Table, Empty } from 'antd';
import { 
  UserOutlined, 
  BankOutlined, 
  SolutionOutlined, 
  TransactionOutlined,
  DollarOutlined,
  TeamOutlined,
  WalletOutlined,
  CalendarOutlined,
  PieChartOutlined,
  TableOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { FaShieldAlt } from 'react-icons/fa';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './Home.css';

const Home = ({ content }) => {
  const [adminData] = useState(JSON.parse(localStorage.getItem('adminData')));
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
  const [paymentStats, setPaymentStats] = useState({
    paymentMethods: {}
  });
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
      setRecentPayments(payments);
      
      const methodCount = {};
      payments.forEach(p => {
        const method = p.paymentMethod || 'Other';
        methodCount[method] = (methodCount[method] || 0) + 1;
      });
      
      setPaymentStats({
        paymentMethods: methodCount
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const getPaymentMethodData = () => {
    const colors = ['#667eea', '#f5576c', '#4facfe', '#22c55e', '#f59e0b', '#8b5cf6'];
    return Object.entries(paymentStats.paymentMethods).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  };

  const columns = [
    {
      title: 'Transaction ID',
      dataIndex: 'TransactionNo',
      key: 'transactionNo',
      render: (text) => <span className="transaction-id-text">{text || 'N/A'}</span>
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <span className="amount-text">
          ${parseFloat(amount || 0).toFixed(2)}
        </span>
      )
    },
    {
      title: 'Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => (
        <Tag color={method === 'Credit Card' ? 'blue' : method === 'PayPal' ? 'purple' : method === 'Bank Transfer' ? 'green' : 'orange'}>
          {method || 'Unknown'}
        </Tag>
      )
    },
    {
      title: 'Date',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (date) => date || 'N/A'
    },
    {
      title: 'Status',
      key: 'status',
      render: () => (
        <Tag color="success">Completed</Tag>
      )
    }
  ];

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

  const tabItems = [
    {
      key: 'table',
      label: <span><TableOutlined /> Table View</span>,
      children: (
        <Table 
          columns={columns} 
          dataSource={recentPayments.slice(0, 10)} 
          pagination={{ pageSize: 5 }}
          rowKey={(record, index) => index}
          className="payment-table"
        />
      )
    },
    {
      key: 'pie',
      label: <span><PieChartOutlined /> Payment Methods</span>,
      children: (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getPaymentMethodData()}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {getPaymentMethodData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )
    },
    {
      key: 'bar',
      label: <span><BarChartOutlined /> Amount Distribution</span>,
      children: (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={recentPayments.slice(0, 10).map(p => ({
              name: p.TransactionNo || 'N/A',
              amount: parseFloat(p.amount || 0)
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )
    }
  ];

  return (
    <Dashboard
      content={
        <div className="home-content">
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

          {/* Stats Cards - Equal and Responsive */}
          <div className="stats-grid">
            {statsData.map((stat, index) => (
              <Card key={index} className="stat-card">
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
            ))}
          </div>

          <div className="recent-transactions">
            <h2 className="section-title">💳 Recent Transactions</h2>
            <Card className="transaction-card">
              {recentPayments.length > 0 ? (
                <Tabs defaultActiveKey="table" items={tabItems} className="transaction-tabs" />
              ) : (
                <Empty description="No transactions found" />
              )}
            </Card>
          </div>
        </div>
      }
    />
  );
};

export default Home;