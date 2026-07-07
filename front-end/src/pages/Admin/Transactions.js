import React, { useState, useEffect } from 'react';
import { Input, Spin, Table, message } from 'antd';
import axios from 'axios';
import Dashboard from './Dashboard';
import { useNavigate } from 'react-router-dom';

const PaymentList = () => {

  // State variables
  const [adminData, setAdminData] = useState(JSON.parse(localStorage.getItem('adminData')));
  const [paymentData, setPaymentData] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPayments = async () => {
    try {
      const response = await axios.get('http://localhost:3000/payment');
      setPaymentData(response.data);
    } catch (error) {
      message.error('Failed to fetch payments.');
    }
  };
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
    localStorage.setItem('selectedMenu', 9);
    fetchPayments();
  }, [adminData, navigate]);


  if (isLoading) {
    return (
      // Show loading spinner while checking login status
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
        <p>Please wait while we check your login status...</p>
      </div>
    );
  }



  const columns = [
    {
      title: 'Transaction No',
      dataIndex: 'TransactionNo',
      key: 'TransactionNo',
    },
    {
      title: 'Payment Date',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Payer ID',
      dataIndex: 'payerID',
      key: 'payerID',
    },
    {
      title: 'Payee ID',
      dataIndex: 'payeeID',
      key: 'payeeID',
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
    },
    {
      title: 'Payment Description',
      dataIndex: 'paymentDescription',
      key: 'paymentDescription',
    },
    {
      title: 'Reference No',
      dataIndex: 'ReferenceNo',
      key: 'ReferenceNo',
    },
  ];

  //search for transaction
  const handleSearch = (value) => {
    setSearchInput(value);
    const activity = {
      adminName: `Admin ${adminData.user.FirstName}`,
      action: 'Searched for',
      targetAdminName: `${value} in Transactions List`,
      timestamp: new Date().getTime(),
    };

    // Save the admin activity to the database
    axios.post('http://localhost:3000/admin-activity', activity, {
      headers: {
        Authorization: adminData.token,
      },
    });
  };

  const filteredTransactions = paymentData.filter((payment) =>
    payment &&
    (payment.TransactionNo.toLowerCase().includes(searchInput.toLowerCase()) ||
      payment.paymentDate.toLowerCase().includes(searchInput.toLowerCase()) ||
      payment.payerID.toLowerCase().includes(searchInput.toLowerCase()) ||
      payment.paymentMethod.toLowerCase().includes(searchInput.toLowerCase()) ||
      payment.paymentDescription.toLowerCase().includes(searchInput.toLowerCase()) ||
      payment.ReferenceNo.toLowerCase().includes(searchInput.toLowerCase()))
  );

  return (<Dashboard content={
    <div>
      <h1>Payment List</h1>
      <Input.Search
        placeholder="Search for Transactions"
        value={searchInput}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ marginBottom: '16px' }}
      />
      <Table dataSource={filteredTransactions} columns={columns} scroll={{ x: true }} />
    </div>} />
  );
};

export default PaymentList;