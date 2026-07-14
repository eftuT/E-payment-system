import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FileTextOutlined, 
  CalendarOutlined, 
  DollarOutlined,
  UserOutlined,
  BankOutlined,
  PercentageOutlined
} from '@ant-design/icons';
import { Button, message, Form, Input, Spin } from 'antd';
import { 
  FaUserPlus, 
  FaFileInvoice, 
  FaCalendarAlt, 
  FaMoneyBillWave,
  FaBuilding,
  FaUser,
  FaPercent,
  FaReceipt
} from 'react-icons/fa';
import Dashboard from './Dashboard';
import { useNavigate } from 'react-router-dom';
import './BillGeneration.css';

const BillGenerationForm = () => {
  const [adminData, setAdminData] = useState(JSON.parse(localStorage.getItem('adminData')));
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    billNumber: '',
    dateIssued: '',
    dueDate: '',
    amountDue: '',
    serviceDescription: '',
    servicePeriod: '',
    serviceCharges: '',
    additionalCharges: '',
    billStatus: "Unpaid",
    serviceProviderBIN: '',
    UserId: '',
    customerName: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchingUser, setSearchingUser] = useState(false);
  const [foundUser, setFoundUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminData) {
      setTimeout(() => {
        navigate('/admin/login');
        message.error('Please login to access the dashboard');
      }, 5000);
    } else {
      setIsLoading(false);
    }
    localStorage.setItem('selectedMenu', 11);
  }, [adminData, navigate]);

  if (isLoading) {
    return (
      <div className="bill-loading">
        <Spin size="large" />
        <p>Loading...</p>
      </div>
    );
  }

  const validateForm = async () => {
    try {
      await form.validateFields();
      setErrors({});
      return true;
    } catch (error) {
      const newErrors = {};
      error.errorFields.forEach((field) => {
        newErrors[field.name[0]] = field.errors[0];
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    // Auto search user
    if (name === 'UserId') {
      if (value && value.trim().length > 5) {
        autoSearchUser(value.trim());
      } else {
        setFoundUser(null);
        setFormData((prev) => ({ ...prev, customerName: '' }));
        form.setFieldsValue({ customerName: '' });
      }
    }
  };

  // ========== AUTO SEARCH USER ==========
  const autoSearchUser = async (userId) => {
    if (!userId || userId.trim() === '' || userId.trim().length < 5) {
      return;
    }

    setSearchingUser(true);
    try {
      const response = await axios.get('http://localhost:3000/Users');
      
      let users = [];
      if (response.data && Array.isArray(response.data)) {
        users = response.data;
      } else if (response.data && response.data.users && Array.isArray(response.data.users)) {
        users = response.data.users;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        users = response.data.data;
      } else {
        users = [response.data];
      }
      
      const user = users.find(u => u.UserID === userId.trim());
      
      if (user) {
        setFoundUser(user);
        // Keep the UserID as the original P... format, not the numeric id
        setFormData((prev) => ({
          ...prev,
          UserId: userId.trim(), // Keep the P... format
          customerName: `${user.FirstName || ''} ${user.LastName || ''}`.trim() || user.UserName || 'Unknown',
        }));
        form.setFieldsValue({
          customerName: `${user.FirstName || ''} ${user.LastName || ''}`.trim() || user.UserName || 'Unknown',
        });
      } else {
        setFoundUser(null);
        setFormData((prev) => ({ ...prev, customerName: '' }));
        form.setFieldsValue({ customerName: '' });
      }
    } catch (error) {
      console.error('Error finding user:', error);
    }
    setSearchingUser(false);
  };

  const handleSubmit = async () => {
    if (await validateForm()) {
      setLoading(true);
      try {
        // Find the numeric id from the UserID string
        let userIdToSend = formData.UserId;
        
        if (foundUser) {
          userIdToSend = foundUser.id; // Send numeric id to API
        } else if (formData.UserId && !isNaN(Number(formData.UserId))) {
          userIdToSend = Number(formData.UserId);
        } else {
          const response = await axios.get('http://localhost:3000/Users');
          let users = [];
          if (response.data && Array.isArray(response.data)) {
            users = response.data;
          } else if (response.data && response.data.users && Array.isArray(response.data.users)) {
            users = response.data.users;
          }
          const user = users.find(u => u.UserID === formData.UserId);
          if (user) {
            userIdToSend = user.id;
            setFoundUser(user);
          } else {
            message.error('User not found. Please enter a valid User ID.');
            setLoading(false);
            return;
          }
        }

        const formDataToSend = {
          billNumber: formData.billNumber,
          dateIssued: formData.dateIssued,
          dueDate: formData.dueDate,
          amountDue: parseFloat(formData.amountDue) || 0,
          serviceDescription: formData.serviceDescription,
          servicePeriod: formData.servicePeriod,
          serviceCharges: parseFloat(formData.serviceCharges) || 0,
          additionalCharges: parseFloat(formData.additionalCharges) || 0,
          billStatus: formData.billStatus || "Unpaid",
          serviceProviderBIN: formData.serviceProviderBIN,
          UserId: userIdToSend, // Send numeric id
          customerName: formData.customerName || 'N/A'
        };

        console.log('Sending data:', formDataToSend);

        const response = await axios.post('http://localhost:3000/bills', formDataToSend);

        if (response.status === 200 || response.status === 201) {
          message.success('Bill registered successfully!');
          
          form.resetFields();
          setFormData({
            billNumber: '',
            dateIssued: '',
            dueDate: '',
            amountDue: '',
            serviceDescription: '',
            servicePeriod: '',
            serviceCharges: '',
            additionalCharges: '',
            billStatus: "Unpaid",
            serviceProviderBIN: '',
            UserId: '',
            customerName: '',
          });
          setFoundUser(null);
          setErrors({});
          setLoading(false);
          
        } else {
          message.error('Failed to register bill. Please try again.');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        
        if (error.response && error.response.data && error.response.data.error) {
          message.error(`Failed to register bill. ${error.response.data.error}`);
        } else if (error.response && error.response.data && error.response.data.message) {
          message.error(`Failed to register bill: ${error.response.data.message}`);
        } else {
          message.error('Failed to register bill. Please try again.');
        }
        setLoading(false);
      }
    }
  };

  return (
    <Dashboard
      content={
        <div className="bill-container">
          <div className="bill-card">
            {/* Header */}
            <div className="bill-header">
              <div className="bill-header-left">
                <div className="bill-icon">
                  <FaFileInvoice />
                </div>
                <div>
                  <h1>Bill Generation</h1>
                  <p>Create a new bill for customers</p>
                </div>
              </div>
              <div className="bill-badge">
                <FaUserPlus /> New Bill
              </div>
            </div>

            <div className="bill-body">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="bill-form"
              >
                <div className="form-grid">
                  {/* Customer Information Section */}
                  <div className="form-group full-width">
                    <h3 className="section-title">Customer Information</h3>
                  </div>

                  {/* User ID */}
                  <div className="form-group">
                    <label>
                      <FaUser className="field-icon" />
                      User ID <span className="required">*</span>
                    </label>
                    <Input
                      name="UserId"
                      placeholder="Enter User ID (e.g., P17833237518405544)"
                      value={formData.UserId}
                      onChange={handleChange}
                      className={errors.UserId ? 'error' : ''}
                      status={errors.UserId ? 'error' : ''}
                      suffix={searchingUser ? <Spin size="small" /> : null}
                    />
                    {errors.UserId && <div className="error-message">{errors.UserId}</div>}
                  </div>

                  {/* Customer Name - Auto-filled */}
                  <div className="form-group">
                    <label>
                      <UserOutlined className="field-icon" />
                      Customer Name <span className="required">*</span>
                    </label>
                    <Input
                      name="customerName"
                      placeholder="Customer name auto-fills"
                      value={formData.customerName}
                      onChange={handleChange}
                      className={errors.customerName ? 'error' : ''}
                      status={errors.customerName ? 'error' : ''}
                    />
                    {errors.customerName && <div className="error-message">{errors.customerName}</div>}
                  </div>

                  {/* Bill Information Section */}
                  <div className="form-group full-width">
                    <h3 className="section-title">Bill Information</h3>
                  </div>

                  {/* Bill Number */}
                  <div className="form-group">
                    <label>
                      <FaReceipt className="field-icon" />
                      Bill Number <span className="required">*</span>
                    </label>
                    <Input
                      name="billNumber"
                      placeholder="Enter bill number"
                      value={formData.billNumber}
                      onChange={handleChange}
                      className={errors.billNumber ? 'error' : ''}
                      status={errors.billNumber ? 'error' : ''}
                    />
                    {errors.billNumber && <div className="error-message">{errors.billNumber}</div>}
                  </div>

                  {/* Date Issued */}
                  <div className="form-group">
                    <label>
                      <FaCalendarAlt className="field-icon" />
                      Date Issued <span className="required">*</span>
                    </label>
                    <Input
                      name="dateIssued"
                      placeholder="YYYY-MM-DD"
                      value={formData.dateIssued}
                      onChange={handleChange}
                      className={errors.dateIssued ? 'error' : ''}
                      status={errors.dateIssued ? 'error' : ''}
                    />
                    {errors.dateIssued && <div className="error-message">{errors.dateIssued}</div>}
                  </div>

                  {/* Due Date */}
                  <div className="form-group">
                    <label>
                      <FaCalendarAlt className="field-icon" />
                      Due Date <span className="required">*</span>
                    </label>
                    <Input
                      name="dueDate"
                      placeholder="YYYY-MM-DD"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className={errors.dueDate ? 'error' : ''}
                      status={errors.dueDate ? 'error' : ''}
                    />
                    {errors.dueDate && <div className="error-message">{errors.dueDate}</div>}
                  </div>

                  {/* Service Information Section */}
                  <div className="form-group full-width">
                    <h3 className="section-title">Service Information</h3>
                  </div>

                  {/* Service Provider BIN */}
                  <div className="form-group">
                    <label>
                      <FaBuilding className="field-icon" />
                      Service Provider BIN <span className="required">*</span>
                    </label>
                    <Input
                      name="serviceProviderBIN"
                      placeholder="Enter BIN"
                      value={formData.serviceProviderBIN}
                      onChange={handleChange}
                      className={errors.serviceProviderBIN ? 'error' : ''}
                      status={errors.serviceProviderBIN ? 'error' : ''}
                    />
                    {errors.serviceProviderBIN && <div className="error-message">{errors.serviceProviderBIN}</div>}
                  </div>

                  {/* Service Description */}
                  <div className="form-group">
                    <label>
                      <FileTextOutlined className="field-icon" />
                      Service Description <span className="required">*</span>
                    </label>
                    <Input
                      name="serviceDescription"
                      placeholder="Enter service description"
                      value={formData.serviceDescription}
                      onChange={handleChange}
                      className={errors.serviceDescription ? 'error' : ''}
                      status={errors.serviceDescription ? 'error' : ''}
                    />
                    {errors.serviceDescription && <div className="error-message">{errors.serviceDescription}</div>}
                  </div>

                  {/* Service Period */}
                  <div className="form-group">
                    <label>
                      <CalendarOutlined className="field-icon" />
                      Service Period <span className="required">*</span>
                    </label>
                    <Input
                      name="servicePeriod"
                      placeholder="Enter service period"
                      value={formData.servicePeriod}
                      onChange={handleChange}
                      className={errors.servicePeriod ? 'error' : ''}
                      status={errors.servicePeriod ? 'error' : ''}
                    />
                    {errors.servicePeriod && <div className="error-message">{errors.servicePeriod}</div>}
                  </div>

                  {/* Service Charges */}
                  <div className="form-group">
                    <label>
                      <FaPercent className="field-icon" />
                      Service Charges <span className="required">*</span>
                    </label>
                    <Input
                      name="serviceCharges"
                      placeholder="Enter service charges"
                      value={formData.serviceCharges}
                      onChange={handleChange}
                      className={errors.serviceCharges ? 'error' : ''}
                      status={errors.serviceCharges ? 'error' : ''}
                    />
                    {errors.serviceCharges && <div className="error-message">{errors.serviceCharges}</div>}
                  </div>

                  {/* Additional Charges */}
                  <div className="form-group">
                    <label>
                      <DollarOutlined className="field-icon" />
                      Additional Charges <span className="required">*</span>
                    </label>
                    <Input
                      name="additionalCharges"
                      placeholder="Enter additional charges"
                      value={formData.additionalCharges}
                      onChange={handleChange}
                      className={errors.additionalCharges ? 'error' : ''}
                      status={errors.additionalCharges ? 'error' : ''}
                    />
                    {errors.additionalCharges && <div className="error-message">{errors.additionalCharges}</div>}
                  </div>

                  {/* Amount Due */}
                  <div className="form-group">
                    <label>
                      <FaMoneyBillWave className="field-icon" />
                      Amount Due <span className="required">*</span>
                    </label>
                    <Input
                      name="amountDue"
                      placeholder="Enter amount due"
                      value={formData.amountDue}
                      onChange={handleChange}
                      className={errors.amountDue ? 'error' : ''}
                      status={errors.amountDue ? 'error' : ''}
                    />
                    {errors.amountDue && <div className="error-message">{errors.amountDue}</div>}
                  </div>
                </div>

                {/* Status - Readonly */}
                <div className="form-group status-group">
                  <label>
                    <FileTextOutlined className="field-icon" />
                    Bill Status
                  </label>
                  <Input
                    value="Unpaid"
                    disabled
                    className="status-input"
                  />
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="submit-btn"
                    disabled={loading}
                  >
                    {loading ? 'Registering...' : 'Generate'}
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      }
    />
  );
};

export default BillGenerationForm;