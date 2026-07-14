import React, { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Modal, Table } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaReceipt, 
  FaFileDownload, 
  FaFilePdf, 
  FaImage,
  FaHistory,
  FaCreditCard,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUser,
  FaCheckCircle

} from 'react-icons/fa';
import { MdPayment, MdDownload, MdReceipt } from 'react-icons/md';
import Header from "./Header";
import "./PaymentHistory.css";

const PaymentHistory = () => {
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem("userData")));
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData) {
      navigate("/users");
      return;
    }

    const storedPaymentHistory = userData.Payments || [];
    setPaymentHistory(storedPaymentHistory);
    localStorage.setItem("userSelectedMenu", 5);
  }, [userData, navigate]);

  const fetchPaymentDetails = async (paymentId) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/Users/${userData.UserId}`);
      const paymentDetails = response.data.payment;
      const customerName = paymentDetails?.Bill?.customerName || 'N/A';
      setSelectedPayment({ ...paymentDetails, customerName });
    } catch (error) {
      console.error("Error fetching payment details:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePicture = (payment) => {
    fetchPaymentDetails(payment.id);
    setModalVisible(true);
  };

  const generatePDF = (payment) => {
    fetchPaymentDetails(payment.id);
    setModalVisible(true);
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
        link.download = `payment-${selectedPayment?.id || 'receipt'}.png`;
        link.click();
      } else if (fileType === "pdf") {
        const dataURL = canvas.toDataURL("image/png");
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const pdf = new jsPDF("p", "mm", "a4");
        pdf.addImage(dataURL, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.save(`payment-${selectedPayment?.id || 'receipt'}.pdf`);
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
      title: "Action",
      key: "action",
      width: 160,
      render: (_, payment) => (
        <div className="ph-actions">
          <button 
            className="ph-action-btn picture" 
            onClick={() => generatePicture(payment)}
            title="Download as Image"
          >
            <FaImage />
          </button>
          <button 
            className="ph-action-btn pdf" 
            onClick={() => generatePDF(payment)}
            title="Download as PDF"
          >
            <FaFilePdf />
          </button>
        </div>
      ),
    },
  ];

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
          {paymentHistory.length === 0 ? (
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
              pagination={{
                pageSize: 5,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} payments`,
              }}
              className="ph-table"
              rowClassName="ph-table-row"
            />
          )}
        </div>
      </main>

      {/* Payment Details Modal */}
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
          >
            <FaImage /> Download Image
          </button>,
          <button 
            key="pdf" 
            className="ph-modal-btn pdf"
            onClick={() => handleDownload("pdf")}
          >
            <FaFilePdf /> Download PDF
          </button>,
        ]}
        className="ph-modal"
        width={560}
      >
        {loading ? (
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