import React, { useState, useEffect } from 'react';
import { Table, Button, message, Input, Spin, Avatar } from 'antd';
import { SearchOutlined, UserOutlined, DownloadOutlined } from '@ant-design/icons';
import { FaUserPlus, FaUserCog, FaEnvelope, FaPhone, FaHome } from 'react-icons/fa';
import axios from 'axios';
import Dashboard from './Dashboard';
import { useNavigate } from 'react-router-dom';
import './AdminsList.css';

const AdminsList = ({ isLoggedIn, setIsLoggedIn }) => {
  const [adminData] = useState(JSON.parse(localStorage.getItem('adminData')));
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
      
      const filtered = users.filter(user => user.Role === 'Admin' || user.Role === 'SuperAdmin');
      console.log('Filtered admins:', filtered);
      
      setUserData(filtered);
      setFilteredUsers(filtered);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      setUserData([]);
      setFilteredUsers([]);
      message.error('Failed to fetch admins. Please try again.');
    }
  };

  useEffect(() => {
    if (!adminData) {
      setTimeout(() => {
        message.error('Please login to access the dashboard');
        navigate('/admin/login');
      }, 5000);
    } else {
      setIsLoading(false);
    }
    localStorage.setItem('selectedMenu', 7);
    fetchUsers();
  }, [adminData, navigate]);

  if (isLoading) {
    return (
      <div className="admins-loading">
        <Spin size="large" />
        <p>Loading...</p>
      </div>
    );
  }

  const handleSearch = async (value) => {
    setSearchInput(value);
    setCurrentPage(1);
    
    const activity = {
      adminName: `Admin ${adminData?.user?.FirstName || 'Unknown'}`,
      action: 'Searched for',
      targetAdminName: `${value} in Admin List`,
      timestamp: new Date().getTime(),
    };

    try {
      await axios.post('http://localhost:3000/admin-activity', activity, {
        headers: { Authorization: adminData?.token },
      });
    } catch (error) {
      console.error('Error saving admin search activity:', error);
    }

    const filtered = userData.filter((user) => {
      const searchLower = value.toLowerCase();
      return (
        (user.UserName?.toLowerCase() || '').includes(searchLower) ||
        (user.FirstName?.toLowerCase() || '').includes(searchLower) ||
        (user.LastName?.toLowerCase() || '').includes(searchLower) ||
        (user.Email?.toLowerCase() || '').includes(searchLower) ||
        (user.Address?.toLowerCase() || '').includes(searchLower) ||
        (user.PhoneNumber?.toString().toLowerCase() || '').includes(searchLower)
      );
    });
    setFilteredUsers(filtered);
  };

  const getUserInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'A';
  };

  const columns = [
    {
      title: '#',
      key: 'index',
      render: (_, __, index) => <span className="admin-index">{index + 1}</span>,
      width: 50,
    },
    {
      title: 'Admin',
      key: 'admin',
      render: (_, user) => (
        <div className="admin-info-wrapper">
          {user.ProfilePicture ? (
            <Avatar 
              src={`http://localhost:3000/${user.ProfilePicture}`} 
              size={40} 
              className="admin-avatar-img"
            />
          ) : (
            <Avatar 
              size={40} 
              className="admin-avatar-initial"
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
            >
              {getUserInitials(user.FirstName, user.LastName)}
            </Avatar>
          )}
          <span className="admin-full-name">{user.FirstName || ''} {user.LastName || ''}</span>
        </div>
      ),
    },
    {
      title: 'Gender',
      dataIndex: 'Gender',
      key: 'Gender',
      render: (text) => <span className="admin-gender">{text || 'N/A'}</span>,
    },
    {
      title: 'Username',
      dataIndex: 'UserName',
      key: 'UserName',
      render: (text) => <span className="admin-username">{text || 'N/A'}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'Email',
      key: 'Email',
      render: (text) => <span className="admin-email"><FaEnvelope className="admin-icon-sm" /> {text || 'N/A'}</span>,
    },
    {
      title: 'Phone',
      dataIndex: 'PhoneNumber',
      key: 'PhoneNumber',
      render: (text) => <span className="admin-phone"><FaPhone className="admin-icon-sm" /> {text || 'N/A'}</span>,
    },
    {
      title: 'Address',
      dataIndex: 'Address',
      key: 'Address',
      render: (text) => <span className="admin-address"><FaHome className="admin-icon-sm" /> {text || 'N/A'}</span>,
    },
    {
      title: 'Role',
      dataIndex: 'Role',
      key: 'Role',
      render: (text) => <span className="admin-role">{text || 'N/A'}</span>,
    },
  ];

  return (
    <Dashboard isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} 
      content={
        <div className="admins-container">
          <div className="admins-card">
            <div className="admins-header">
              <div className="admins-header-left">
                <div className="admins-icon">
                  <FaUserCog />
                </div>
                <div>
                  <h1>Admins List</h1>
                  <p>Manage all registered administrators</p>
                </div>
              </div>
              <div className="admins-badge">
                <FaUserPlus /> {filteredUsers.length} Admins
              </div>
            </div>

            <div className="admins-body">
              <div className="admins-search-wrapper">
                <Input
                  placeholder="Search admins by name, email, phone, address or username..."
                  value={searchInput}
                  onChange={(e) => handleSearch(e.target.value)}
                  prefix={<SearchOutlined className="search-icon" />}
                  className="admins-search-input"
                  allowClear
                />
              </div>

              <div className="admins-table-wrapper">
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
                      return `Showing ${range[0]}-${range[1]} of ${total} admins`;
                    },
                    onChange: (page, pageSize) => {
                      setCurrentPage(page);
                      setPageSize(pageSize);
                    },
                    showQuickJumper: false,
                    position: ['bottomRight'],
                    size: 'default',
                  }}
                  className="admins-table"
                  rowClassName="admins-table-row"
                  locale={{ emptyText: 'No admins found.' }}
                />
              </div>
            </div>
          </div>
        </div>
      } 
    />
  );
};

export default AdminsList;