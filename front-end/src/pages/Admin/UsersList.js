import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Spin, message, Avatar } from 'antd';
import { SearchOutlined, UserOutlined, DownloadOutlined } from '@ant-design/icons';
import { FaUserPlus, FaUsers, FaEnvelope, FaPhone, FaHome } from 'react-icons/fa';
import axios from 'axios';
import Dashboard from './Dashboard';
import { useNavigate } from 'react-router-dom';
import './UsersList.css';

const UsersList = ({ isLoggedIn, setIsLoggedIn }) => {
  const [adminData] = useState(JSON.parse(localStorage.getItem('adminData'))); // Removed setAdminData
  const [userData, setUserData] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/Users');
      console.log('Users response:', response.data);
      
      let users = [];
      if (Array.isArray(response.data)) {
        users = response.data;
      } else if (response.data && response.data.users && Array.isArray(response.data.users)) {
        users = response.data.users;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        users = response.data.data;
      } else {
        users = [response.data];
      }
      
      const filtered = users.filter(user => user.Role === 'User');
      console.log('Filtered users (Role = User):', filtered);
      
      setUserData(filtered);
      setFilteredUsers(filtered);
    } catch (error) {
      console.error('Failed to fetch users.', error);
      setUserData([]);
      setFilteredUsers([]);
      message.error('Failed to fetch users. Please try again.');
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
    localStorage.setItem('selectedMenu', 8);
    fetchUsers();
  }, [adminData, navigate]);

  if (isLoading) {
    return (
      <div className="users-loading">
        <Spin size="large" />
        <p>Loading...</p>
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

    axios.post('http://localhost:3000/admin-activity', activity, {
      headers: { Authorization: adminData.token },
    }).catch(error => console.error('Failed to log admin activity:', error));

    const filtered = userData.filter((user) =>
      user.UserName?.toLowerCase().includes(value.toLowerCase()) ||
      user.FirstName?.toLowerCase().includes(value.toLowerCase()) ||
      user.LastName?.toLowerCase().includes(value.toLowerCase()) ||
      user.Email?.toLowerCase().includes(value.toLowerCase()) ||
      user.Address?.toLowerCase().includes(value.toLowerCase()) ||
      user.UserID?.toLowerCase().includes(value.toLowerCase()) ||
      user.PhoneNumber?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when searching
  };

  const getUserInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'U';
  };

  const columns = [
    {
      title: '#',
      key: 'index',
      render: (_, __, index) => <span className="user-index">{index + 1}</span>,
      width: 50,
    },
    {
      title: 'User',
      key: 'user',
      render: (_, user) => (
        <div className="user-info-wrapper">
          {user.ProfilePicture ? (
            <Avatar 
              src={`http://localhost:3000/${user.ProfilePicture}`} 
              size={40} 
              className="user-avatar-img"
            />
          ) : (
            <Avatar 
              size={40} 
              className="user-avatar-initial"
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
            >
              {getUserInitials(user.FirstName, user.LastName)}
            </Avatar>
          )}
          <span className="user-full-name">{user.FirstName || ''} {user.LastName || ''}</span>
        </div>
      ),
    },
    {
      title: 'User ID',
      dataIndex: 'UserID',
      key: 'UserID',
      render: (text) => <span className="user-id">{text || 'N/A'}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'Email',
      key: 'Email',
      render: (text) => <span className="user-email"><FaEnvelope className="user-icon-sm" /> {text || 'N/A'}</span>,
    },
    {
      title: 'Phone',
      dataIndex: 'PhoneNumber',
      key: 'PhoneNumber',
      render: (text) => <span className="user-phone"><FaPhone className="user-icon-sm" /> {text || 'N/A'}</span>,
    },
    {
      title: 'Username',
      dataIndex: 'UserName',
      key: 'UserName',
      render: (text) => <span className="user-username">{text || 'N/A'}</span>,
    },
    {
      title: 'Gender',
      dataIndex: 'Gender',
      key: 'Gender',
      render: (text) => <span className="user-gender">{text || 'N/A'}</span>,
    },
    {
      title: 'Address',
      dataIndex: 'Address',
      key: 'Address',
      render: (text) => <span className="user-address"><FaHome className="user-icon-sm" /> {text || 'N/A'}</span>,
    },
  ];

  return (
    <Dashboard isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} 
      content={
        <div className="users-container">
          <div className="users-card">
            {/* Header */}
            <div className="users-header">
              <div className="users-header-left">
                <div className="users-icon">
                  <FaUsers />
                </div>
                <div>
                  <h1>Users List</h1>
                  <p>Manage all registered users</p>
                </div>
              </div>
              <div className="users-badge">
                <FaUserPlus /> {filteredUsers.length} Users
              </div>
            </div>

            <div className="users-body">
              {/* Search Bar */}
              <div className="users-search-wrapper">
                <Input
                  placeholder="Search users by name, email, phone, address or ID..."
                  value={searchInput}
                  onChange={(e) => handleSearch(e.target.value)}
                  prefix={<SearchOutlined className="search-icon" />}
                  className="users-search-input"
                  allowClear
                />
              </div>

              {/* Table */}
              <div className="users-table-wrapper">
                <Table
                  dataSource={filteredUsers}
                  columns={columns}
                  rowKey="UserID"
                  scroll={{ x: 1000 }}
                  pagination={{
                    current: currentPage,
                    pageSize: 10,
                    total: filteredUsers.length,
                    showSizeChanger: false,
                    showTotal: (total, range) => {
                      return `Showing ${range[0]}-${range[1]} of ${total} users`;
                    },
                    onChange: (page, pageSize) => {
                      setCurrentPage(page);
                      setPageSize(pageSize);
                    },
                    showQuickJumper: false,
                    position: ['bottomRight'],
                    size: 'default',
                  }}
                  className="users-table"
                  rowClassName="users-table-row"
                  locale={{ emptyText: 'No users found.' }}
                />
              </div>
            </div>
          </div>
        </div>
      } 
    />
  );
};

export default UsersList;