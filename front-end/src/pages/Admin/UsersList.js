import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Spin, message } from 'antd';
import axios from 'axios';
import Dashboard from './Dashboard';
import { useNavigate } from 'react-router-dom';

const UsersList = ({ isLoggedIn, setIsLoggedIn }) => {

  // State variables
  const [adminData, setAdminData] = useState(JSON.parse(localStorage.getItem('adminData')));
  const [userData, setUserData] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/Users');
      setUserData(response.data);
    } catch (error) {
      console.error('Failed to fetch users.', error);
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
    localStorage.setItem('selectedMenu', 8);
    fetchUsers();
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



  const handleSearch = (value) => {
    setSearchInput(value);
    const activity = {
      adminName: `Admin ${adminData.user.FirstName}`,
      action: 'Searched for',
      targetAdminName: `${value} in User List`,
    timestamp: new Date().getTime(),
    };

    // Save the admin activity to the database
    axios.post('http://localhost:3000/admin-activity', activity, {
      headers: {
        Authorization: adminData.token,
      },
    });
  };

  const filteredUsers = userData.filter((user) =>
    user.Role === 'User' &&
    (user.UserName.toLowerCase().includes(searchInput.toLowerCase()) ||
      user.FirstName.toLowerCase().includes(searchInput.toLowerCase()) ||
      user.LastName.toLowerCase().includes(searchInput.toLowerCase()) ||
      user.Email.toLowerCase().includes(searchInput.toLowerCase()) ||
      user.Address.toLowerCase().includes(searchInput.toLowerCase()) ||
      (typeof user.PhoneNumber === 'string' &&
        user.PhoneNumber.toLowerCase().includes(searchInput.toLowerCase())))
  );

  const columns = [
    {
      title: 'User ID',
      dataIndex: 'UserID',
      key: 'UserID',
    },
    {
      title: 'First Name',
      dataIndex: 'FirstName',
      key: 'FirstName',
    },
    {
      title: 'Last Name',
      dataIndex: 'LastName',
      key: 'LastName',
    },
    {
      title: 'Gender',
      dataIndex: 'Gender',
      key: 'Gender',
    },
    {
      title: 'User Name',
      dataIndex: 'UserName',
      key: 'UserName',
    },
    {
      title: 'Email',
      dataIndex: 'Email',
      key: 'Email',
    },
    {
      title: 'Phone Number',
      dataIndex: 'PhoneNumber',
      key: 'PhoneNumber',
    },
    {
      title: 'Address',
      dataIndex: 'Address',
      key: 'Address',
    },
    {
      title: 'Role',
      dataIndex: 'Role',
      key: 'Role',
    },
    {
      title: 'Profile Image',
      dataIndex: 'ProfilePicture',
      key: 'ProfilePicture',
      render: (_, user) => (
        <div>
          {user.ProfilePicture && (
            <div>
              <a href={`http://localhost:3000/${user.ProfilePicture}`} download>
                Profile picture
              </a>
              <Button
                type="primary"
                onClick={() => {
                  const downloadLink = document.createElement('a');
                  downloadLink.href = `http://localhost:3000/${user.ProfilePicture}`;
                  downloadLink.download = 'Profile picture';
                  downloadLink.target = '_blank';
                  downloadLink.click();
                }}
              >
                Download
              </Button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <Dashboard isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} content={
      <div>
        <h1>User List</h1>
        <Input.Search
          placeholder="Search User"
          value={searchInput}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ marginBottom: '16px' }}
        />
        <Table
          dataSource={filteredUsers}
          columns={columns}
          rowKey="id"
          scroll={{ x: true }}
        />
      </div>
    } />
  );
};

export default UsersList;