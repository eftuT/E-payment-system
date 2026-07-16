import React, { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Modal, Table, message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaReceipt, 
  FaFilePdf, 
  FaImage,
  FaHistory,
  FaCreditCard,
  FaCalendarAlt,
  FaCheckCircle
} from 'react-icons/fa';
import { MdPayment, MdReceipt } from 'react-icons/md';
import Header from "./Header";
import "./PaymentHistory.css";

const PaymentHistory = () => {
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem("userData"))); 
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData) {
      navigate("/users");
      return;
    }
    
    localStorage.setItem("userSelectedMenu", 5);
    fetchLatestPayments();
  }, []);

  const fetchLatestPayments = async () => {
    setFetchingHistory(true);
    try {
      const response = await axios.get(`http://localhost:3000/Users/${userData.id}`);
      
      if (response.data.success) {
        const freshUser = response.data.user;
        setPaymentHistory(freshUser.Payments || []);
        localStorage.setItem("userData", JSON.stringify(freshUser));
        setUserData(freshUser);
      }
    } catch (error) {
      console.error("Error fetching latest payments:", error);
      message.error("Could not refresh payment history.");
      setPaymentHistory(userData.Payments || []);
    } finally {
      setFetchingHistory(false);
    }
  };

  const fetchPaymentDetails = async (paymentId) => {
    setLoadingModal(true);
    try {
      const response = await axios.get(`http://localhost:3000/payment/${paymentId}`);
      const paymentDetails = response.data;
      const customerName = paymentDetails?.Bill?.customerName || 'N/A';
      setSelectedPayment({ ...paymentDetails, customerName });
    } catch (error) {
      console.error("Error fetching payment details:", error);
      message.error("Failed to load payment details.");
    } finally {
      setLoadingModal(false);
    }
  };

  const openReceiptModal = (payment) => {
    setModalVisible(true);
    fetchPaymentDetails(payment.id);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedPayment(null);
  };

  const handleDownload = (fileType) => {
    const modalContainer = document.querySelector(".payment-details-modal");
    if (!modalContainer) return;

    const buttons = modalContainer.querySelectorAll("button");
    buttons.forEach((button) => {
      button.style.display = "none";
    });

    const footer = modalContainer.querySelector(".modal-footer");
    if (footer) {
      footer.style.display = "none";
    }

    html2canvas(modalContainer).then((canvas) => {
      buttons.forEach((button) => {
        button.style.display = "block";
      });
      if (footer) {
        footer.style.display = "block";
      }

      if (fileType === "picture") {
        const dataURL = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = `payment-${selectedPayment?.TransactionNo || 'receipt'}.png`;
        link.click();
      } else if (fileType === "pdf") {
        const dataURL = canvas.toDataURL("image/png");
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const pdf = new jsPDF("p", "mm", "a4");
        pdf.addImage(dataURL, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.save(`payment-${selectedPayment?.TransactionNo || 'receipt'}.pdf`);
      }
    });
  };

  const columns = [
    {
      title: "#",
      dataIndex: "id",
      key: "id",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "Transaction No",
      dataIndex: "TransactionNo",
      key: "TransactionNo",
      render: (text) => <span className="ph-transaction-id">{text}</span>,
    },
    {
      title: "Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (text) => (
        <span className="ph-method-badge">
          <FaCreditCard className="ph-method-icon" />
          {text || 'Credit Card'}
        </span>
      ),
    },
    {
      title: "Description",
      dataIndex: "paymentDescription",
      key: "paymentDescription",
      render: (text) => <span className="ph-description">{text}</span>,
    },
    {
      title: "Reference",
      dataIndex: "ReferenceNo",
      key: "ReferenceNo",
      render: (text) => <span className="ph-reference">{text}</span>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text) => <span className="ph-amount">${text}</span>,
    },
    {
      title: "Date",
      dataIndex: "paymentDate",
      key: "paymentDate",
      render: (text) => (
        <span className="ph-date">
          <FaCalendarAlt className="ph-date-icon" />
          {text}
        </span>
      ),
    },
    {
      title: "Receipt",
      key: "action",
      width: 120,
      render: (_, payment) => (
        <button 
          className="ph-receipt-btn"
          onClick={() => openReceiptModal(payment)}
          title="View Receipt"
        >
          <FaReceipt /> Receipt
        </button>
      ),
    },
  ];

  const itemRender = (current, type, originalElement) => {
    if (type === 'prev') {
      return <a className="ph-pagination-arrow">‹</a>;
    }
    if (type === 'next') {
      return <a className="ph-pagination-arrow">›</a>;
    }
    return originalElement;
  };

  return (
    <div className="ph-container">
      <Header />

      <main className="ph-main">
        <div className="ph-header">
          <div className="ph-header-left">
            <div className="ph-header-icon">
              <FaHistory />
            </div>
            <div>
              <h1>Payment History</h1>
              <p>View and download your payment receipts</p>
            </div>
          </div>
          <div className="ph-header-badge">
            <FaReceipt className="ph-badge-icon" />
            <span>{paymentHistory.length} Payments</span>
          </div>
        </div>

        <div className="ph-table-wrapper">
          {fetchingHistory ? (
            <div className="ph-loading-table">
               <h3>Loading recent payments...</h3>
            </div>
          ) : paymentHistory.length === 0 ? (
            <div className="ph-empty">
              <MdReceipt className="ph-empty-icon" />
              <h3>No Payment History</h3>
              <p>You haven't made any payments yet</p>
            </div>
          ) : (
            <Table
              dataSource={paymentHistory}
              columns={columns}
              scroll={{ x: true }}
              rowKey="id"
              pagination={{
                pageSize: 5,
                showSizeChanger: false,
                itemRender: itemRender,
              }}
              className="ph-table"
              rowClassName="ph-table-row"
            />
          )}
        </div>
      </main>

      <Modal
        title={
          <div className="ph-modal-header">
            <FaReceipt className="ph-modal-icon" />
            <span>Payment Receipt</span>
          </div>
        }
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={[
          <button 
            key="picture" 
            className="ph-modal-btn picture"
            onClick={() => handleDownload("picture")}
            disabled={loadingModal || !selectedPayment}
          >
            <FaImage /> Download Image
          </button>,
          <button 
            key="pdf" 
            className="ph-modal-btn pdf"
            onClick={() => handleDownload("pdf")}
            disabled={loadingModal || !selectedPayment}
          >
            <FaFilePdf /> Download PDF
          </button>,
        ]}
        className="ph-modal"
        width={560}
      >
        {loadingModal ? (
          <div className="ph-modal-loading">
            <span className="ph-spinner">⏳</span>
            <p>Loading payment details...</p>
          </div>
        ) : (
          selectedPayment && (
            <div className="payment-details-modal">
              <div className="ph-receipt">
                <div className="ph-receipt-header">
                  <MdPayment className="ph-receipt-icon" />
                  <h3>Payment Information</h3>
                </div>
                <div className="ph-receipt-body">
                  <div className="ph-receipt-row">
                    <span>Transaction No</span>
                    <span className="ph-receipt-value">{selectedPayment.TransactionNo}</span>
                  </div>
                  <div className="ph-receipt-row">
                    <span>Reference No</span>
                    <span className="ph-receipt-value">{selectedPayment.ReferenceNo}</span>
                  </div>
                  <div className="ph-receipt-row">
                    <span>Payment Method</span>
                    <span className="ph-receipt-value">Credit Card</span>
                  </div>
                  <div className="ph-receipt-row">
                    <span>Description</span>
                    <span className="ph-receipt-value">{selectedPayment.paymentDescription}</span>
                  </div>
                  <div className="ph-receipt-row">
                    <span>Total Amount</span>
                    <span className="ph-receipt-value amount">${selectedPayment.amount}</span>
                  </div>
                  <div className="ph-receipt-row">
                    <span>Payment Date</span>
                    <span className="ph-receipt-value">{selectedPayment.paymentDate}</span>
                  </div>
                  <div className="ph-receipt-row">
                    <span>Payer</span>
                    <span className="ph-receipt-value">{userData?.FirstName + ' ' + userData?.LastName}</span>
                  </div>
                  <div className="ph-receipt-row">
                    <span>Customer</span>
                    <span className="ph-receipt-value">{selectedPayment.customerName || 'N/A'}</span>
                  </div>
                </div>
                <div className="ph-receipt-footer">
                  <FaCheckCircle className="ph-receipt-check" />
                  <span>Payment Successful</span>
                </div>
              </div>
            </div>
          )
        )}
      </Modal>
    </div>
  );
};

export default PaymentHistory;