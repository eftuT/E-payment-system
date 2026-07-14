import React, { useEffect, useState, useRef } from "react";
import { Button, Form, Input, Modal, message } from "antd";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";
import { 
  MailOutlined, 
  CheckCircleOutlined,
  DollarOutlined,
  UserOutlined,
  BankOutlined,
  FileTextOutlined
} from "@ant-design/icons";
import { 
  FaCreditCard, 
  FaReceipt, 
  FaCalendarAlt,
  FaCheckCircle,
  FaArrowRight
} from "react-icons/fa";
import { MdPayment, MdSecurity } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "./Payment.css";

const Payment = () => {
  const [userData] = useState(JSON.parse(localStorage.getItem("userData"))); // Removed setUserData
  const [serviceNo] = useState(localStorage.getItem('serviceNo')); // Removed setServiceNumber
  const [serviceProvidersBIN] = useState(localStorage.getItem('serviceProviderBIN')); // Removed setServiceProvidersBIN
  const [user, setUser] = useState(null);
  const [payerId, setPayerId] = useState();
  const [payments, setPayments] = useState([]);
  const [userbill, setUserBill] = useState(null);
  const [banks, setBanks] = useState([]);
  const [form] = Form.useForm(); // form is actually used in the JSX, so we keep it
  const [userId, setUserId] = useState();
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const formRef = useRef(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [errors, setErrorMessage] = useState('');
  const [showBankAccountForm, setShowBankAccountForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [bankAccount, setBankAccount] = useState({
    bankAccountNumber: "",
    AgentName: "",
    account_holder_name: "",
    account_holder_type: "individual",
  });

  useEffect(() => {
    localStorage.setItem("userSelectedMenu", 4);
  }, []);

  // Fixed useEffect dependencies
  useEffect(() => {
    if (!userData) {
      navigate("/users");
      return;
    }
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/Users/serviceNo/${serviceNo}/${serviceProvidersBIN}`);
        setUser(response.data);
        setPayerId(userData.id);
        const serviceProviderBIN = response.data.ServiceProviders[0].serviceProviderBIN;
        const userId = response.data.id;
        setUserId(userId);

        const userBillResponse = await axios.get(`http://localhost:3000/bills/findOne`, {
          params: {
            userId: userId,
            serviceProviderBIN: serviceProviderBIN,
          }
        });
        setUserBill(userBillResponse.data);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchBanks = async () => {
      try {
        const response = await axios.get("http://localhost:3000/Agents");
        setBanks(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
    fetchBanks();
  }, [navigate, serviceNo, serviceProvidersBIN, userData]); // Added all missing dependencies

  const handlePayment = (billNumber, serviceProviderBIN) => {
    setShowBankAccountForm(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setBankAccount((prevBankAccount) => ({
      ...prevBankAccount,
      [name]: value,
    }));
  };

  const sendVerificationEmail = async () => {
    try {
      setLoading(true);
      const code = generateVerificationCode();
      setVerificationCode(code);
      await axios.post(`http://localhost:3000/Users/verifyUser/${userId}/${code}`);
      message.success('Verification code sent successfully');
      setLoading(false);
    } catch (error) {
      console.error('Error sending email:', error);
      message.error('Error sending verification code');
      setLoading(false);
    }
  };

  const handleDownload = (fileType) => {
    const modalContainer = document.querySelector(".payment-modal-content");
    if (!modalContainer) return;

    const footer = modalContainer.querySelector(".modal-footer");
    const buttons = modalContainer.querySelectorAll(".ant-btn");

    buttons.forEach((button) => {
      button.style.display = "none";
    });

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
        link.download = "payment_receipt.png";
        link.click();
      } else if (fileType === "pdf") {
        const dataURL = canvas.toDataURL("image/png");
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const pdf = new jsPDF("p", "mm", "a4");
        pdf.addImage(dataURL, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.save("payment_receipt.pdf");
      }
    });
  };

  const handleBankAccountSubmit = async () => {
    try {
      let errorMessage = {};
      if (!verifyCode || !bankAccount.bankAccountNumber || !bankAccount.AgentName) {
        if (!bankAccount.bankAccountNumber || !bankAccount.AgentName) {
          errorMessage.bankAccount = "Bank Account Number and Bank selection are required";
        }
        if (!verifyCode) {
          errorMessage.verificationCode = "Verification code is required";
        }
        setErrorMessage(errorMessage);
        return;
      } else if (verifyCode !== verificationCode) {
        errorMessage.verificationCode = "Invalid Verification code";
        setErrorMessage(errorMessage);
        return;
      }

      const randomNumber = Math.floor(Math.random() * 1000000000);
      const random = `TXN${randomNumber}`;
      const today = new Date().toISOString().split('T')[0];

      const paymentData = {
        TransactionNo: random,
        paymentDate: today,
        amount: userbill.TotalAmount,
        UserId: payerId,
        serviceProviderBIN: localStorage.getItem('serviceProviderBIN'),
        paymentMethod: "Credit card",
        paymentDescription: `Payment for ${userbill.serviceDescription} services`,
        ReferenceNo: userbill.billNumber,
      };

      const paymentMethodResponse = await axios.post("http://localhost:3000/payment", paymentData);
      await axios.put(`http://localhost:3000/bills/${userbill.id}`, {
        billStatus: "paid",
        PaymentId: paymentMethodResponse.data.id,
      });

      message.success('Payment successful!');
      setErrorMessage("");
      setDownloadModalVisible(true);
      setPayments(paymentData);
    } catch (error) {
      console.error(error);
      message.error('Payment failed. Please try again.');
    }
  };

  const generateVerificationCode = () => {
    const length = 6;
    const characters = "0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }
    return code;
  };

  const handleVerificationCodeChange = (event) => {
    setVerifyCode(event.target.value);
  };

  const navigateToUserPage = () => {
    setDownloadModalVisible(false);
    navigate('/serviceProviders');
  };

  return (
    <div className="payment-page">
      <Header />

      <main className="payment-main">
        <div className="payment-header">
          <div className="payment-header-left">
            <MdPayment className="payment-header-icon" />
            <div>
              <h1>Bill Payment</h1>
              <p>Complete your payment securely</p>
            </div>
          </div>
          <div className="payment-header-badge">
            <MdSecurity /> Secure Payment
          </div>
        </div>

        {userbill ? (
          <div className="bill-card">
            <div className="bill-card-header">
              <div className="bill-card-title">
                <FaReceipt className="bill-icon" />
                <h2>Bill Details</h2>
              </div>
              <span className={`bill-status ${userbill.billStatus === 'paid' ? 'paid' : 'unpaid'}`}>
                {userbill.billStatus || 'Unpaid'}
              </span>
            </div>

            <div className="bill-card-body">
              <div className="bill-row">
                <div className="bill-field">
                  <label>Bill Number</label>
                  <p><strong>{userbill.billNumber}</strong></p>
                </div>
                <div className="bill-field">
                  <label>Date Issued</label>
                  <p><FaCalendarAlt className="field-icon" /> {userbill.dateIssued}</p>
                </div>
              </div>

              <div className="bill-divider"></div>

              <div className="bill-row">
                <div className="bill-field">
                  <label><UserOutlined /> Customer</label>
                  <p>{userbill.customerName}</p>
                </div>
                <div className="bill-field">
                  <label><FileTextOutlined /> Description</label>
                  <p>{userbill.serviceDescription}</p>
                </div>
              </div>

              <div className="bill-row">
                <div className="bill-field">
                  <label>Service Period</label>
                  <p>{userbill.servicePeriod}</p>
                </div>
                <div className="bill-field">
                  <label>Due Date</label>
                  <p><FaCalendarAlt className="field-icon" /> {userbill.dueDate}</p>
                </div>
              </div>

              <div className="bill-divider"></div>

              <div className="bill-amount-section">
                <div className="bill-amount-item">
                  <span>Service Charges</span>
                  <span>${userbill.serviceCharges}</span>
                </div>
                <div className="bill-amount-item">
                  <span>Additional Charges</span>
                  <span>${userbill.additionalCharges}</span>
                </div>
                <div className="bill-amount-item total">
                  <span>Total Amount</span>
                  <span>${userbill.TotalAmount}</span>
                </div>
              </div>
            </div>

            <div className="bill-card-footer">
              <button 
                className="pay-now-btn"
                onClick={() => handlePayment(userbill.billNumber, userbill.serviceProviderBIN)}
              >
                Pay Now <FaArrowRight />
              </button>
            </div>
          </div>
        ) : (
          <div className="no-bill-card">
            <FaReceipt className="no-bill-icon" />
            <h3>No Bill Available</h3>
            <p>You don't have any pending bills at the moment</p>
          </div>
        )}

        {/* Payment Form */}
        {showBankAccountForm && (
          <div className="payment-form-card">
            <h2><BankOutlined /> Bank Account Details</h2>
            <div className="payment-form">
              <div className="form-group">
                <label>Bank Account Number</label>
                <Input
                  name="bankAccountNumber"
                  value={bankAccount.bankAccountNumber}
                  onChange={handleChange}
                  placeholder="Enter your bank account number"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Select Bank</label>
                <select
                  className="form-select"
                  name="AgentName"
                  value={bankAccount.AgentName}
                  onChange={handleChange}
                >
                  <option value="">Choose a bank</option>
                  {banks.map((bank) => (
                    <option key={bank.id} value={bank.agentName}>
                      {bank.agentName}
                    </option>
                  ))}
                </select>
              </div>

              {errors.bankAccount && <span className="error-text">{errors.bankAccount}</span>}

              <div className="form-group verification-group">
                <label>Verification Code</label>
                <div className="verification-wrapper">
                  <Input
                    value={verifyCode}
                    onChange={handleVerificationCodeChange}
                    placeholder="Enter 6-digit code"
                    className="form-input verification-input"
                    maxLength={6}
                  />
                  <button 
                    className="verify-btn"
                    onClick={sendVerificationEmail}
                    disabled={loading}
                  >
                    <MailOutlined /> {loading ? 'Sending...' : 'Get Code'}
                  </button>
                </div>
                {errors.verificationCode && <span className="error-text">{errors.verificationCode}</span>}
              </div>

              <button 
                className="submit-payment-btn"
                onClick={handleBankAccountSubmit}
              >
                <FaCheckCircle /> Complete Payment
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Success Modal */}
      <Modal
        title={
          <div className="modal-success-title">
            <CheckCircleOutlined className="success-icon" />
            Payment Successful!
          </div>
        }
        open={downloadModalVisible}
        onCancel={() => {
          setDownloadModalVisible(false);
          navigateToUserPage();
        }}
        footer={[
          <Button key="back" className="modal-btn-close" onClick={() => { setDownloadModalVisible(false); navigateToUserPage(); }}>
            Close
          </Button>,
          <Button key="picture" className="modal-btn-download" onClick={() => handleDownload("picture")}>
            Download as Picture
          </Button>,
          <Button key="pdf" className="modal-btn-download primary" onClick={() => handleDownload("pdf")}>
            Download as PDF
          </Button>
        ]}
        className="payment-modal"
        width={580}
      >
        {userbill && (
          <div className="payment-modal-content">
            <div className="modal-receipt">
              <div className="receipt-header">
                <FaReceipt className="receipt-icon" />
                <h3>Payment Receipt</h3>
              </div>
              <div className="receipt-body">
                <div className="receipt-row">
                  <span>Transaction No:</span>
                  <span className="receipt-value">{payments.TransactionNo}</span>
                </div>
                <div className="receipt-row">
                  <span>Reference No:</span>
                  <span className="receipt-value">{payments.ReferenceNo}</span>
                </div>
                <div className="receipt-row">
                  <span>Customer:</span>
                  <span className="receipt-value">{userbill.customerName}</span>
                </div>
                <div className="receipt-row">
                  <span>Payer:</span>
                  <span className="receipt-value">{userData.FirstName + ' ' + userData.LastName}</span>
                </div>
                <div className="receipt-row">
                  <span>Amount:</span>
                  <span className="receipt-value amount">${payments.amount}</span>
                </div>
                <div className="receipt-row">
                  <span>Payment Date:</span>
                  <span className="receipt-value">{payments.paymentDate}</span>
                </div>
                <div className="receipt-row">
                  <span>Method:</span>
                  <span className="receipt-value">Credit Card</span>
                </div>
                <div className="receipt-row full">
                  <span>Description:</span>
                  <span className="receipt-value">{payments.paymentDescription}</span>
                </div>
              </div>
              <div className="receipt-footer">
                <CheckCircleOutlined /> Payment Completed Successfully
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Payment;