import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, Modal, Spin, Table, message } from 'antd';
import Dashboard from './Dashboard';


const ServiceNumberGeneration = () => {
    // CSS styles
  const listUser = {
    animation: 'blink 2s infinite',
    display: 'inline-block',
  };

  // CSS keyframes
  const keyframesBlink = `
    @keyframes blink {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }
  `;

    const [form] = Form.useForm();
    const [isListUsersClicked, setIsListUsersClicked] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [userList, setUserList] = useState([]);
    const [formData, setFormData] = useState({
        UserID: '',
        serviceProviderBINs: [],
    });
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [adminData, setAdminData] = useState(JSON.parse(localStorage.getItem('adminData')));
    const [searchInput, setSearchInput] = useState('');
    const [filteredUserList, setFilteredUserList] = useState([]);

    //search for user
    const handleSearch = async (value) => {
        setSearchInput(value);
        const activity = {
            adminName: `Admin ${adminData.user.FirstName}`,
            action: 'Searched for',
            targetAdminName: `${value} in service Number List`,
            timestamp: new Date().getTime(),

        };

        try {
            // Save the admin activity to the database
            await axios.post('http://localhost:3000/admin-activity', activity, {
                headers: {
                    Authorization: adminData.token,
                },
            });

        } catch (error) {
            console.error('Error saving admin search activity:', error);
        }
        // Filter the user list based on the search input
        const filteredUsers = userList.filter((user) =>
            user.serviceProviders.some((provider) =>
                String(provider.serviceNo).toLowerCase().includes(value.toLowerCase()) ||
                String(user.UserID).toLowerCase().includes(value.toLowerCase()) ||
                String(user.FirstName).toLowerCase().includes(value.toLowerCase()) ||
                provider.name.toLowerCase().includes(value.toLowerCase())
            )
        );

        setFilteredUserList(filteredUsers);
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
        localStorage.setItem('selectedMenu', 10);
    }, [adminData, navigate]);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
                <p>Please wait while we check your login status...</p>
            </div>
        );
    }

    const validateForm = async () => {
        try {
            await form.validateFields();
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
          [name]: name === 'serviceProviderBINs' ? value.split(',').map(Number) : value,
        }));
      };


    const handleSubmit = async (e) => {
        if (await validateForm()) {
            try {
                console.log(formData);
                const { UserID, serviceProviderBINs } = formData;
                const formDataToSend = {
                  UserID,
                  serviceProviderBINs: serviceProviderBINs.map(Number),
                };
                const response = await axios.post('http://localhost:3000/Users/associate', formDataToSend);
                const responseData = response.data;

                console.log(formDataToSend);
                if (response.status === 200) {
                    setModalVisible(true);
                    setModalContent(responseData.user);
                    const activity = {
                        adminName: `Admin ${adminData.user.FirstName}`,
                        action: `associated user UserID: \" ${formDataToSend.UserID}\"`,
                        targetAdminName: `with serviceBINs: \" ${formDataToSend.serviceProviderBINs}\"`,
                        timestamp: new Date().getTime(),
                    };

                    // Save the admin activity to the database
                    const response = axios.post('http://localhost:3000/admin-activity', activity, {
                        headers: {
                            Authorization: adminData.token,
                        },
                    });
                    message.success(`user associated successfully with serviceProviderBINs:\"${formDataToSend.serviceProviderBINs}\"`)
              
                } else {
                    console.log('Error:', responseData.message);
                    message.error('Error:', responseData.message);
                }
            } catch (error) {
                console.error('Error associating user with service providers:', error);
                message.error('Error associating user with service providers:', error);
            }
        };
    };

    const columns = [
        {
            title: 'User ID',
            dataIndex: 'UserID',
            key: 'UserID',
        },
        {
            title: 'User Name',
            dataIndex: "FirstName",
            key: 'userName',
        },
        {
            title: 'Service No',
            dataIndex: 'serviceNo',
            key: 'serviceNo',
            render: (text, record) => (
                <span>
                    {record.serviceProviders.map((provider) => (
                        <div key={provider.serviceNo}>{provider.serviceNo}</div>
                    ))}
                </span>
            ),
        },
        {
            title: 'serviceName',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <span>
                    {record.serviceProviders.map((provider) => (
                        <div key={provider.serviceNo}>{provider.name}</div>
                    ))}
                </span>
            ),
        },
    ];


    const handleListUsers = async () => {
        try {
            const response = await axios.get('http://localhost:3000/Users');
            const responseData = response.data;

            if (response.status === 200) {
                const modifiedData = responseData.map((user) => {
                    const serviceProviders = user.ServiceProviders.map((serviceProvider) => ({
                        serviceNo: serviceProvider.userServiceProvider.serviceNo || '',
                        name: serviceProvider.serviceProviderName || ''
                    }));

                    return {
                        ...user,
                        serviceProviders
                    };
                });

                const filteredData = modifiedData.filter((user) => user.serviceProviders.length > 0);
                setUserList(filteredData);
                setIsListUsersClicked(true); // Set the flag to indicate that the "List Users" button has been clicked
            } else {
                console.log('Error:', responseData.message);
                message.error('Error:', responseData.message);
            }
        } catch (error) {
            console.error('Error listing users:', error);
        }
    };
    return (
        <Dashboard content={
            <div>

                <Form form={form} layout="vertical" onFinish={handleSubmit} >
                    <h1>Service Number Generation</h1>
                    <Form.Item label="User ID" name="UserID" rules={[{ required: true, message: 'Please enter the User ID' }]}>
                        <Input name="UserID" onChange={handleChange} placeholder='Enter the User ID' />
                    </Form.Item>
                    <Form.Item
                        label="Service Provider BINs (comma-separated)"
                        name="serviceProviderBINs"
                        rules={[{ required: true, message: 'Please enter the Service Provider BINs' }]}
                    >
                        <Input name="serviceProviderBINs" onChange={handleChange} placeholder='enter the Service Provider BINs' />
                    </Form.Item>
                    <Button type="primary" htmlType="submit">
                        Generate
                    </Button>
                </Form>

                <br />
                <br />
                <Button onClick={handleListUsers} style={listUser}>List Users</Button>

                <Input.Search
                    placeholder="Search User with Service Number"
                    value={searchInput}
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{ marginBottom: '16px' }}
                />
                <Table dataSource={searchInput ? filteredUserList : userList} columns={columns} />

            </div>} />
    );
};
export default ServiceNumberGeneration;

  
 