import React, { useEffect, useState } from "react";
import { Button, Input, Modal, message } from "antd";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";

import Header from "./Header";
import "./Payment.css";

import {
  CheckCircleOutlined,
  UserOutlined,
  BankOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

import {
  FaReceipt,
  FaCalendarAlt,
  FaCheckCircle,
  FaArrowRight,
} from "react-icons/fa";

import { MdPayment, MdSecurity } from "react-icons/md";

const Payment = () => {
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("userData") || "null");
  const serviceNo = localStorage.getItem("serviceNo");
  const serviceProviderBIN = localStorage.getItem("serviceProviderBIN");

  const [payerId, setPayerId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userBill, setUserBill] = useState(null);
  const [banks, setBanks] = useState([]);
  const [payments, setPayments] = useState({});
  const [loading, setLoading] = useState(false);
  const [showBankAccountForm, setShowBankAccountForm] = useState(false);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [errors, setErrors] = useState({});

  const [bankAccount, setBankAccount] = useState({
    bankAccountNumber: "",
    AgentName: "",
    account_holder_name: "",
    account_holder_type: "individual",
  });

  useEffect(() => {
    localStorage.setItem("userSelectedMenu", 4);

    if (!userData) {
      navigate("/users");
      return;
    }

    fetchData();
    fetchBanks();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (!serviceNo || !serviceProviderBIN) {
        message.error("Missing service information.");
        return;
      }

      const response = await axios.get(
        `http://localhost:3000/Users/serviceNo/${serviceNo}/${serviceProviderBIN}`
      );

      const fetchedUser = response.data.user;

      if (!fetchedUser) {
        message.error("User not found.");
        return;
      }

      setPayerId(userData.id);

      const currentUserId = fetchedUser.id;
      setUserId(currentUserId);

      const provider = fetchedUser.ServiceProviders?.[0];

      if (!provider) {
        message.warning("No service provider found.");
        return;
      }

      const billResponse = await axios.get(
        "http://localhost:3000/bills/findOne",
        {
          params: {
            userId: currentUserId,
            serviceProviderBIN: provider.serviceProviderBIN,
          },
        }
      );

      if (billResponse.data) {
        setUserBill(billResponse.data);
      } else {
        setUserBill(null);
      }
    } catch (error) {
      if (error.response) {
        message.error(
          error.response.data?.message || "Unable to load payment information."
        );
      } else {
        message.error("Network error.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBanks = async () => {
    try {
      const response = await axios.get("http://localhost:3000/Agents");
      setBanks(response.data || []);
    } catch (error) {
      message.error("Unable to load banks.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBankAccount((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePayment = () => {
    setShowBankAccountForm(true);
  };

  const handleBankAccountSubmit = async () => {
    const validationErrors = {};

    if (!bankAccount.bankAccountNumber.trim()) {
      validationErrors.bankAccountNumber = "Bank account number is required.";
    }

    if (!bankAccount.AgentName) {
      validationErrors.AgentName = "Please select your bank.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!userBill) {
      message.error("No bill found.");
      return;
    }

    try {
      setLoading(true);

      const transactionNo = "TXN" + Date.now();

      const paymentData = {
        TransactionNo: transactionNo,
        paymentDate: new Date().toISOString().split("T")[0],
        amount: userBill.TotalAmount,
        UserId: payerId,
        serviceProviderBIN,
        paymentMethod: "Credit Card",
        paymentDescription: `Payment for ${userBill.serviceDescription}`,
        ReferenceNo: userBill.billNumber,
      };

      const paymentResponse = await axios.post(
        "http://localhost:3000/payment",
        paymentData
      );

      await axios.put(`http://localhost:3000/bills/${userBill.id}`, {
        billStatus: "paid",
        PaymentId: paymentResponse.data.id,
      });

      setPayments(paymentData);
      setErrors({});
      setDownloadModalVisible(true);
      message.success("Payment completed successfully.");
    } catch (error) {
      message.error("Payment failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (type) => {
    const receipt = document.querySelector(".payment-modal-content");

    if (!receipt) return;

    const footer = receipt.querySelector(".modal-footer");
    const buttons = receipt.querySelectorAll(".ant-btn");

    buttons.forEach((btn) => {
      btn.style.display = "none";
    });

    if (footer) footer.style.display = "none";

    try {
      const canvas = await html2canvas(receipt);

      buttons.forEach((btn) => {
        btn.style.display = "block";
      });

      if (footer) footer.style.display = "block";

      if (type === "picture") {
        const link = document.createElement("a");
        link.download = "payment_receipt.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      }

      if (type === "pdf") {
        const pdf = new jsPDF("p", "mm", "a4");
        const width = 210;
        const height = (canvas.height * width) / canvas.width;
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, width, height);
        pdf.save("payment_receipt.pdf");
      }
    } catch (error) {
      message.error("Failed to download receipt.");
    }
  };

  const navigateToUserPage = () => {
    setDownloadModalVisible(false);
    navigate("/serviceProviders");
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
            <MdSecurity />
            Secure Payment
          </div>
        </div>

        {loading && (
          <div className="payment-loading">
            <h3>Loading payment information...</h3>
          </div>
        )}

        {!loading && userBill && (
          <div className="bill-card">
            <div className="bill-card-header">
              <div className="bill-card-title">
                <FaReceipt className="bill-icon" />
                <h2>Bill Details</h2>
              </div>
              <span
                className={`bill-status ${
                  userBill.billStatus === "paid" ? "paid" : "unpaid"
                }`}
              >
                {userBill.billStatus || "Unpaid"}
              </span>
            </div>

            <div className="bill-card-body">
              <div className="bill-row">
                <div className="bill-field">
                  <label>Bill Number</label>
                  <p>
                    <strong>{userBill.billNumber}</strong>
                  </p>
                </div>
                <div className="bill-field">
                  <label>Date Issued</label>
                  <p>
                    <FaCalendarAlt className="field-icon" /> {userBill.dateIssued}
                  </p>
                </div>
              </div>

              <div className="bill-divider" />

              <div className="bill-row">
                <div className="bill-field">
                  <label>
                    <UserOutlined /> Customer
                  </label>
                  <p>{userBill.customerName}</p>
                </div>
                <div className="bill-field">
                  <label>
                    <FileTextOutlined /> Description
                  </label>
                  <p>{userBill.serviceDescription}</p>
                </div>
              </div>

              <div className="bill-row">
                <div className="bill-field">
                  <label>Service Period</label>
                  <p>{userBill.servicePeriod}</p>
                </div>
                <div className="bill-field">
                  <label>Due Date</label>
                  <p>
                    <FaCalendarAlt className="field-icon" /> {userBill.dueDate}
                  </p>
                </div>
              </div>

              <div className="bill-divider" />

              <div className="bill-amount-section">
                <div className="bill-amount-item">
                  <span>Service Charges</span>
                  <span>${userBill.serviceCharges}</span>
                </div>
                <div className="bill-amount-item">
                  <span>Additional Charges</span>
                  <span>${userBill.additionalCharges}</span>
                </div>
                <div className="bill-amount-item total">
                  <span>Total Amount</span>
                  <span>${userBill.TotalAmount}</span>
                </div>
              </div>
            </div>

            <div className="bill-card-footer">
              <button
                className="pay-now-btn"
                onClick={handlePayment}
                disabled={userBill.billStatus === "paid"}
              >
                {userBill.billStatus === "paid" ? (
                  "Already Paid"
                ) : (
                  <>
                    Pay Now
                    <FaArrowRight />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {!loading && !userBill && (
          <div className="no-bill-card">
            <FaReceipt className="no-bill-icon" />
            <h3>No Bill Available</h3>
            <p>There are no pending bills for this service number.</p>
          </div>
        )}

        {showBankAccountForm && (
          <div className="payment-form-card">
            <h2>
              <BankOutlined /> Bank Account Details
            </h2>

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
                {errors.bankAccountNumber && (
                  <span className="error-text">{errors.bankAccountNumber}</span>
                )}
              </div>

              <div className="form-group">
                <label>Select Bank</label>
                <select
                  name="AgentName"
                  value={bankAccount.AgentName}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">-- Select Bank --</option>
                  {banks.length > 0 ? (
                    banks.map((bank) => (
                      <option key={bank.id} value={bank.agentName}>
                        {bank.agentName}
                      </option>
                    ))
                  ) : (
                    <option disabled>No banks available</option>
                  )}
                </select>
                {errors.AgentName && (
                  <span className="error-text">{errors.AgentName}</span>
                )}
              </div>

              {userBill && (
                <div className="payment-summary">
                  <h3>Payment Summary</h3>
                  <div className="summary-row">
                    <span>Reference No.</span>
                    <span>{userBill.billNumber}</span>
                  </div>
                  <div className="summary-row">
                    <span>Customer</span>
                    <span>{userBill.customerName}</span>
                  </div>
                  <div className="summary-row">
                    <span>Description</span>
                    <span>{userBill.serviceDescription}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total Amount</span>
                    <strong>${userBill.TotalAmount}</strong>
                  </div>
                </div>
              )}

              <Button
                type="primary"
                size="large"
                block
                icon={<FaCheckCircle />}
                loading={loading}
                onClick={handleBankAccountSubmit}
                className="submit-payment-btn"
              >
                Complete Payment
              </Button>
            </div>
          </div>
        )}
      </main>

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
          <Button
            key="back"
            className="modal-btn-close"
            onClick={() => {
              setDownloadModalVisible(false);
              navigateToUserPage();
            }}
          >
            Close
          </Button>,
          <Button
            key="picture"
            className="modal-btn-download"
            onClick={() => handleDownload("picture")}
          >
            Download as Picture
          </Button>,
          <Button
            key="pdf"
            className="modal-btn-download primary"
            onClick={() => handleDownload("pdf")}
          >
            Download as PDF
          </Button>,
        ]}
        className="payment-modal"
        width={580}
      >
        {userBill && (
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
                  <span className="receipt-value">{userBill.customerName}</span>
                </div>
                <div className="receipt-row">
                  <span>Payer:</span>
                  <span className="receipt-value">
                    {userData.FirstName + " " + userData.LastName}
                  </span>
                </div>
                <div className="receipt-row">
                  <span>Amount:</span>
                  <span className="receipt-value amount">
                    ${payments.amount}
                  </span>
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
                  <span className="receipt-value">
                    {payments.paymentDescription}
                  </span>
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