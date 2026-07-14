import React, { useState, useEffect } from 'react';
import { Input, Spin, Table, message, Button, Modal } from 'antd';
import { SearchOutlined, EyeOutlined, DownloadOutlined, DollarOutlined } from '@ant-design/icons';
import { FaUserPlus, FaMoneyBillWave, FaReceipt, FaCalendarAlt, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import Dashboard from './Dashboard';
import { useNavigate } from 'react-router-dom';
import './Transaction.css';

const PaymentList = () => {
  const [adminData] = useState(JSON.parse(localStorage.getItem('adminData'))); // Removed setAdminData
  const [paymentData, setPaymentData] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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
      <div className="payment-loading">
        <Spin size="large" />
        <p>Loading...</p>
      </div>
    );
  }

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setModalVisible(true);
  };

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
    const activity = {
      adminName: `Admin ${adminData.user.FirstName}`,
      action: 'Searched for',
      targetAdminName: `${e.target.value} in Transactions List`,
      timestamp: new Date().getTime(),
    };

    axios.post('http://localhost:3000/admin-activity', activity, {
      headers: { Authorization: adminData.token },
    }).catch(err => console.error('Activity log error:', err));
  };

  const columns = [
    {
      title: '#',
      key: 'index',
      render: (_, __, index) => <span className="payment-index">{index + 1}</span>,
      width: 50,
    },
    {
      title: 'Transaction No',
      dataIndex: 'TransactionNo',
      key: 'TransactionNo',
      render: (text) => <span className="payment-transaction">{text}</span>,
    },
    {
      title: 'Date',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (text) => <span className="payment-date"><FaCalendarAlt className="payment-icon-sm" /> {text}</span>,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (text) => <span className="payment-amount">${parseFloat(text).toFixed(2)}</span>,
    },
    {
      title: 'Payer',
      dataIndex: 'payerID',
      key: 'payerID',
      render: (text) => <span className="payment-payer">{text}</span>,
    },
    {
      title: 'Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (text) => <span className="payment-method">{text}</span>,
    },
    {
      title: 'Reference',
      dataIndex: 'ReferenceNo',
      key: 'ReferenceNo',
      render: (text) => <span className="payment-reference">{text}</span>,
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_, payment) => (
        <Button 
          onClick={() => handleViewDetails(payment)} 
          icon={<EyeOutlined />} 
          className="action-btn view-btn"
        />
      ),
    },
  ];

  const filteredPayments = paymentData.filter((payment) =>
    payment &&
    (payment.TransactionNo?.toLowerCase().includes(searchInput.toLowerCase()) ||
      payment.paymentDate?.toLowerCase().includes(searchInput.toLowerCase()) ||
      payment.payerID?.toLowerCase().includes(searchInput.toLowerCase()) ||
      payment.paymentMethod?.toLowerCase().includes(searchInput.toLowerCase()) ||
      payment.paymentDescription?.toLowerCase().includes(searchInput.toLowerCase()) ||
      payment.ReferenceNo?.toLowerCase().includes(searchInput.toLowerCase()))
  );

  return (
    <Dashboard content={
      <div className="payment-container">
        <div className="payment-card">
          {/* Header */}
          <div className="payment-header">
            <div className="payment-header-left">
              <div className="payment-icon">
                <FaMoneyBillWave />
              </div>
              <div>
                <h1>Payment List</h1>
                <p>View and manage all transactions</p>
              </div>
            </div>
            <div className="payment-badge">
              <DollarOutlined /> {filteredPayments.length} Transactions
            </div>
          </div>

          <div className="payment-body">
            {/* Search Bar */}
            <div className="payment-search-wrapper">
              <Input
                placeholder="Search by transaction, payer, reference or method..."
                value={searchInput}
                onChange={handleSearch}
                prefix={<SearchOutlined className="search-icon" />}
                className="payment-search-input"
                allowClear
              />
            </div>

            {/* Table */}
            <div className="payment-table-wrapper">
              <Table 
                dataSource={filteredPayments} 
                columns={columns} 
                scroll={{ x: 900 }}
                pagination={{
                  showSizeChanger: true,
                  showTotal: (total, range) => {
                    const totalPages = Math.ceil(total / pageSize);
                    return `Showing ${range[0]}-${range[1]} of ${totalPages} pages`;
                  },
                  showQuickJumper: false,
                }}
                className="payment-table"
                rowClassName="payment-table-row"
                rowKey="id"
                onChange={(pagination) => {
                  setCurrentPage(pagination.current);
                  setPageSize(pagination.pageSize);
                }}
              />
            </div>
          </div>
        </div>

        {/* View Details Modal */}
        <Modal
          title={
            <div className="modal-title">
              <FaReceipt className="modal-title-icon" /> Payment Details
            </div>
          }
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setSelectedPayment(null);
          }}
          footer={[
            <Button key="close" onClick={() => {
              setModalVisible(false);
              setSelectedPayment(null);
            }}>
              Close
            </Button>,
          ]}
          width={600}
          className="payment-modal"
        >
          {selectedPayment && (
            <div className="payment-details-modal">
              <div className="payment-details-grid">
                <div className="detail-item">
                  <label>Transaction No</label>
                  <p className="detail-value highlight">{selectedPayment.TransactionNo}</p>
                </div>
                <div className="detail-item">
                  <label>Payment Date</label>
                  <p className="detail-value"><FaCalendarAlt className="detail-icon" /> {selectedPayment.paymentDate}</p>
                </div>
                <div className="detail-item">
                  <label>Amount</label>
                  <p className="detail-value amount">${parseFloat(selectedPayment.amount).toFixed(2)}</p>
                </div>
                <div className="detail-item">
                  <label>Payment Method</label>
                  <p className="detail-value">{selectedPayment.paymentMethod}</p>
                </div>
                <div className="detail-item">
                  <label>Payer ID</label>
                  <p className="detail-value">{selectedPayment.payerID}</p>
                </div>
                <div className="detail-item">
                  <label>Reference No</label>
                  <p className="detail-value">{selectedPayment.ReferenceNo}</p>
                </div>
                <div className="detail-item full-width">
                  <label>Description</label>
                  <p className="detail-value">{selectedPayment.paymentDescription || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    } />
  );
};

export default PaymentList;