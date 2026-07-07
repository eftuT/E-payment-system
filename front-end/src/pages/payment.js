import React, { useEffect, useState, useRef } from "react";
import { Button, Form, Input, Modal, message } from "antd";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";
import "./style.css";
import { MailOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";


const Payment = () => {
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem("userData")));
  const [serviceNo, setServiceNumber] = useState(localStorage.getItem('serviceNo'));
  const [serviceProvidersBIN, setServiceProvidersBIN] = useState(localStorage.getItem('serviceProviderBIN'));
  const [user, setUser] = useState(null);
  const [payerId, setPayerId] = useState();
  const [payments, setPayments] = useState([]);
  const [userbill, setUserBill] = useState(null);
  const [banks, setBanks] = useState([]);
  const [form] = Form.useForm();
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
    bankName: "",
    account_holder_name: "",
    account_holder_type: "individual",
  });


  useEffect(()=>{
      localStorage.setItem("userSelectedMenu", 4);
    },[])
    
  useEffect(() => {
    if (!userData) {
      navigate("/users");
      return;
    }
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/Users/serviceNo/${serviceNo}/${serviceProvidersBIN}`);
        setUser(response.data);
        console.log(verificationCode);
        console.log(response.data);
        setPayerId(userData.id);

        // Assuming user has a valid service provider association
        const serviceProviderBIN = response.data.ServiceProviders[0].serviceProviderBIN;
        const userId = response.data.id;
        setUserId(userId);
        console.log("serviceProviderBIN: ", serviceProviderBIN);

        const userBillResponse = await axios.get(`http://localhost:3000/bills/findOne`, {
          params: {
            userId: userId,
            serviceProviderBIN: serviceProviderBIN,
          }
        });
        setUserBill(userBillResponse.data);
        console.log(verificationCode);
      } catch (error) {
        console.error(error);
      }
    };
    

    const fetchBanks = async () => {
      try {
        const response = await axios.get("http://localhost:3000/Agents"); // Replace with your actual endpoint
        setBanks(response.data);
      } catch (error) {
       
        console.error(error);
      }
    };

    fetchData();
    fetchBanks();
  }, []);

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
      // Generate a verification code
      const code = generateVerificationCode();
      setVerificationCode(code);

      // Send the verification code to the fetched email address
      console.log('userId:', userId)
      const response = await axios.post(`http://localhost:3000/Users/verifyUser/${userId}/${code}`);


      console.log('Email sent successfully');
      console.log(code);
      message.success('Email sent successfully');
      setLoading(false);
      // email is successfully sent
    } catch (error) {
      console.error('Error sending email:', error);
      message.error('Error sending email:', error);
    }
  };

  const handleDownload = (fileType) => {
    // Capture the modal container element
    const modalContainer = document.querySelector(".ant-modal-content");

    // Exclude the footer element from the captured canvas
    const footer = modalContainer.querySelector(".footer");
    const buttons = modalContainer.querySelectorAll(".ant-btn");

    // Hide the buttons temporarily
    buttons.forEach((button) => {
      button.style.display = "none";
    });

    if (footer) {
      footer.style.display = "none";
    }

    // Use html2canvas to convert the modal container to a canvas
    html2canvas(modalContainer).then((canvas) => {
      // Restore the display of the buttons and footer elements
      buttons.forEach((button) => {
        button.style.display = "block";
      });

      if (footer) {
        footer.style.display = "block";
      }

      if (fileType === "picture") {
        // Convert the canvas to a base64-encoded PNG image
        const dataURL = canvas.toDataURL("image/png");

        // Create a temporary link element to trigger the download
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = "modal.png";
        link.click();
      } else if (fileType === "pdf") {
        // Convert the canvas to a base64-encoded PNG image
        const dataURL = canvas.toDataURL("image/png");

        // Calculate the dimensions of the PDF document based on the canvas size
        const imgWidth = 210; // A4 page width (in mm)
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Create a new jsPDF instance
        const pdf = new jsPDF("p", "mm", "a4");

        // Add the image to the PDF document
        pdf.addImage(dataURL, "PNG", 0, 0, imgWidth, imgHeight);

        // Save the PDF file
        pdf.save("modal.pdf");
      } else {
        console.error("Invalid file type");
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
      }

      else if (verifyCode !== verificationCode) {
        errorMessage.verificationCode = "Invalid Verification code";
        setErrorMessage(errorMessage);
        return;
      }


      const randomNumber = Math.floor(Math.random() * 1000000000);
      const random = `TXN${randomNumber}`;
      const today = new Date().toISOString().split('T')[0];

      console.log(userbill);

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

      // Create and verify the PaymentMethod
      const paymentMethodResponse = await axios.post(
        "http://localhost:3000/payment",
        paymentData
      );

      // Update the bill status to "paid"
      const response = await axios.put(`http://localhost:3000/bills/${userbill.id}`, {
        billStatus: "paid",
        PaymentId: paymentMethodResponse.data.id,
      });

      if (response) {
        // Payment succeeded
        console.log("Paid");
        message.success('Payment successful');
        setErrorMessage("");
        setDownloadModalVisible(true);
        setPayments(paymentData);
        console.log(payments);

        

      } else {
        // Payment failed
        console.log("Payment failed");
      }
    } catch (error) {
      console.error(error);
    }

  };

  
  const generateVerificationCode = () => {
    const length = 6; // Length of the verification code
    const characters = "0123456789"; // Characters to use for the code
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
    <div className="payment-container">
      <h1>Bill Detail</h1>

      {userbill ? (
        <div key={userbill.billNumber} className="bill-container">
          <div className="bill-header">
            <h2>Bill Number: {userbill.billNumber}</h2>
            <h3>Date Issued: {userbill.dateIssued}</h3>
          </div>
          <div className="bill-details">
            <div className="bill-section">
              <h4>Customer Information</h4>
              <p>Customer Name: {userbill.customerName}</p>
            </div>
            <div className="bill-section">
              <h4>Service Details</h4>
              <p>Description: {userbill.serviceDescription}</p>
              <p>Period: {userbill.servicePeriod}</p>
              <p>Service Charges: {userbill.serviceCharges}</p>
              <p>Additional Charges: {userbill.additionalCharges}</p>
            </div>
            <div className="bill-section">
              <h4>Payment Details</h4>
              <p>Amount Due: {userbill.amountDue}</p>
              <p>Due Date: {userbill.dueDate}</p>
              <p>Bill Status: {userbill.billStatus}</p>
              <p>Total Amount: {userbill.TotalAmount}</p>
            </div>
          </div>
          <Button
            className="pay-btn"
            onClick={() =>
              handlePayment(userbill.billNumber, userbill.serviceProviderBIN)
            }
          >
            Pay Now
          </Button>
        </div>
      ) : (
        <div className="no-bill">
          <h2>No bill available.</h2>
        </div>
      )}

      {showBankAccountForm && (
        <div className="input-container">
          <h2>Bank Account Details</h2>
          <Input
            className="shorter-input"
            name="bankAccountNumber"
            value={bankAccount.bankAccountNumber}
            onChange={handleChange}
            placeholder="Bank Account Number"
          />
          <select
            className="bank-dropdown"
            name="AgentName"
            value={bankAccount.AgentName}
            onChange={handleChange}
          >
            <option value="">Select Bank</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.agentName}>
                {bank.agentName}
              </option>
            ))}
          </select>
<br />
          {errors.bankAccount && <span className="error-message" >{errors.bankAccount}</span>}

          <Input
            className="verification-input"
            value={verifyCode}
            onChange={handleVerificationCodeChange}
            placeholder="Verification Code"
          />
          <Button
            className="verify-email-btn"
            icon={<MailOutlined />}
            onClick={sendVerificationEmail}
            loading={loading}
          >
            {loading ? 'Sending Verification Code' : 'Send Verification Code'}
          </Button>
          <br />

          {errors.verificationCode && <span className="error-message">{errors.verificationCode}</span>}
          <br />

          <Button className="pay" onClick={handleBankAccountSubmit}>
            Pay
          </Button>
        </div>
      )}
      <Modal
        title="Bank Account Details"
        visible={downloadModalVisible}
        onCancel={() => {
          setDownloadModalVisible(false);
          navigateToUserPage();
        }}
        footer={[
          <Button key="back" onClick = {() => {setDownloadModalVisible(false); 
            navigateToUserPage();}}>
            Close
          </Button>,
          <Button key="picture" type="primary" onClick={() => handleDownload("picture")}>
            Download as Picture
          </Button>,
          <Button key="pdf" type="primary" onClick={() => handleDownload("pdf")}>
            Download as PDF
          </Button>
        ]}
      >


        {userbill && (
          <div className="payment-details">
            <h2>Payment Information:</h2>
            <p>TransactionNo: {payments.TransactionNo}</p>
            <p>Payment Method: Credit card</p>
            <p>
              Description: {payments.paymentDescription}
            </p>
            <p>
              Reference Number:  {payments.ReferenceNo}
            </p>
            <p>Customer Name: {userbill.customerName}</p>
            <p>
              Total Amount:  {payments.amount}
            </p>
            <p>
              Payment Date:  {payments.paymentDate}
            </p>
            <p>
              Payer:  {userData.FirstName + ' ' + userData.LastName}
            </p>
            <p> </p>
            <p>
              Payment Date:  {payments.paymentDate}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Payment;