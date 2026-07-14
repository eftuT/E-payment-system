import React, { useEffect, useState } from 'react';
import Dashboard from './Dashboard';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Modal, Spin, message, Select, Table, Tag, Avatar } from 'antd';
import { 
  SearchOutlined, 
  ClockCircleOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  PlusOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  EyeOutlined,
  UserOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { 
  FaUserPlus, 
  FaHistory, 
  FaFileAlt,
  FaFilter
} from 'react-icons/fa';
import axios from 'axios';
import './AdminActivityPage.css';

const { Option } = Select;

const AdminActivityPage = () => {
  const [adminData] = useState(JSON.parse(localStorage.getItem('adminData'))); // Removed setAdminData
  const [adminActivities, setAdminActivities] = useState([]);
  const loggedInAdmin = adminData ? `Admin ${adminData.user.FirstName}` : '';
  const [modalVisible, setModalVisible] = useState(false);
  const [modalActivity, setModalActivity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [sortOption, setSortOption] = useState('time');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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
    localStorage.setItem('selectedMenu', 12);
  }, [adminData, navigate]);

  useEffect(() => {
    const fetchAdminActivities = async () => {
      try {
        const response = await axios.get('http://localhost:3000/admin-activity');
        const filtered = response.data.filter(activity => 
          activity.action?.toLowerCase() !== 'searched for' &&
          activity.action?.toLowerCase() !== 'search'
        );
        setAdminActivities(filtered);
        setFilteredActivities(filtered);
      } catch (error) {
        console.error(error);
        message.error('Failed to fetch adminActivities. Please try again later.');
      }
    };
    fetchAdminActivities();
  }, []);

  // Fixed: Added missing dependency 'getValueToSortBy' - but since it's not defined, we'll use a different approach
  // Actually, the filter/sort logic is already in this useEffect
  useEffect(() => {
    let filtered = [...adminActivities];

    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter((activity) => {
        const adminNameLower = activity.adminName?.toLowerCase() || '';
        const targetAdminNameLower = activity.targetAdminName?.toLowerCase() || '';
        const activityLower = activity.action?.toLowerCase() || '';
        
        return (
          adminNameLower.includes(searchTermLower) ||
          activityLower.includes(searchTermLower) ||
          targetAdminNameLower.includes(searchTermLower)
        );
      });
    }

    filtered.sort((a, b) => {
      let valueA, valueB;
      switch (sortOption) {
        case 'adminName':
          valueA = a.adminName?.toLowerCase() || '';
          valueB = b.adminName?.toLowerCase() || '';
          break;
        case 'activity':
          valueA = a.action?.toLowerCase() || '';
          valueB = b.action?.toLowerCase() || '';
          break;
        case 'targetAdminName':
          valueA = a.targetAdminName?.toLowerCase() || '';
          valueB = b.targetAdminName?.toLowerCase() || '';
          break;
        case 'time':
        default:
          valueA = new Date(a.timestamp).getTime();
          valueB = new Date(b.timestamp).getTime();
          break;
      }

      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      return 0;
    });

    setFilteredActivities(filtered);
  }, [adminActivities, searchTerm, sortOption, sortOrder]);

  if (isLoading) {
    return (
      <div className="activity-loading">
        <Spin size="large" />
        <p>Loading...</p>
      </div>
    );
  }

  // handleSearch is now used in the search input, so we keep it
  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleViewDetails = (activity) => {
    setModalActivity(activity);
    setModalVisible(true);
  };

  const getActionColor = (action) => {
    if (!action) return 'blue';
    const actionLower = action.toLowerCase();
    if (actionLower.includes('edit')) return 'orange';
    if (actionLower.includes('delete')) return 'red';
    if (actionLower.includes('register') || actionLower.includes('create')) return 'green';
    return 'default';
  };

  const getActionIcon = (action) => {
    if (!action) return <FaFileAlt />;
    const actionLower = action.toLowerCase();
    if (actionLower.includes('edit')) return <EditOutlined />;
    if (actionLower.includes('delete')) return <DeleteOutlined />;
    if (actionLower.includes('register') || actionLower.includes('create')) return <PlusOutlined />;
    return <FaFileAlt />;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      full: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };
  };

  const getAdminInitials = (name) => {
    if (!name) return 'A';
    const cleanName = name.replace(/^Admin\s+/, '');
    const parts = cleanName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return parts[0].charAt(0).toUpperCase();
  };

  // ========== EXTRACT TARGET TYPE ==========
  const getTargetType = (targetName) => {
    if (!targetName) return 'Unknown';
    const lower = targetName.toLowerCase();
    if (lower.includes('agent')) return 'Agent';
    if (lower.includes('service provider') || lower.includes('provider')) return 'Service Provider';
    if (lower.includes('admin')) return 'Admin';
    if (lower.includes('user')) return 'User';
    if (lower.includes('bill')) return 'Bill';
    return 'Other';
  };

  // ========== GET TARGET NAME WITHOUT PREFIX ==========
  const getCleanTargetName = (targetName) => {
    if (!targetName) return 'N/A';
    // Remove prefixes like "Agent ", "Service Provider ", "Admin ", "User ", "Bill "
    const prefixes = ['Agent ', 'Service Provider ', 'Admin ', 'User ', 'Bill '];
    let cleanName = targetName;
    for (const prefix of prefixes) {
      if (targetName.toLowerCase().startsWith(prefix.toLowerCase())) {
        cleanName = targetName.substring(prefix.length);
        break;
      }
    }
    return cleanName || targetName;
  };

  // ========== RENDER MODAL CONTENT ==========
  const renderModalContent = () => {
    if (!modalActivity) {
      return <div className="modal-empty">No details available</div>;
    }

    const { adminName, action, targetAdminName, timestamp, changedData } = modalActivity;
    const dateInfo = formatDate(timestamp);
    const isYou = adminName === loggedInAdmin;
    const actionLower = action?.toLowerCase() || '';
    const isRegistered = actionLower.includes('register') || actionLower.includes('create');
    const isEdited = actionLower.includes('edit');
    const isDeleted = actionLower.includes('delete');

    // Get display data
    let displayData = changedData || {};

    return (
      <div className="modal-content">
        {/* Basic Info */}
        <div className="modal-info-grid">
          <div className="modal-info-item">
            <span className="modal-info-label">Admin</span>
            <span className="modal-info-value" style={{ color: isYou ? '#667eea' : '#333' }}>
              {isYou ? 'You' : adminName}
            </span>
          </div>
          <div className="modal-info-item">
            <span className="modal-info-label">Action</span>
            <Tag color={getActionColor(action)} className="modal-info-tag">
              {action}
            </Tag>
          </div>
          <div className="modal-info-item">
            <span className="modal-info-label">Target</span>
            <span className="modal-info-value">{targetAdminName}</span>
          </div>
          <div className="modal-info-item">
            <span className="modal-info-label">Date & Time</span>
            <span className="modal-info-value">{dateInfo.full} at {dateInfo.time}</span>
          </div>
        </div>

        {/* Data - For Registered, Edited, Deleted */}
        {displayData && Object.keys(displayData).length > 0 && (
          <>
            <div className="modal-divider"></div>
            <div className="modal-changed-data">
              <div className="modal-changed-title">
                {isRegistered ? '📋 Registered Information' :
                 isEdited ? '✏️ Changes Made' :
                 isDeleted ? '🗑️ Deleted Information' :
                 'Details'}
              </div>
              <div className="modal-changed-list">
                {Object.entries(displayData).map(([key, value]) => {
                  if (value === null || value === undefined || value === '') return null;
                  if (key === 'id' || key === 'timestamp' || key === 'createdAt' || key === 'updatedAt') return null;
                  if (key === 'UserID' || key === 'UserId') return null;
                  
                  // Handle "changes" object (for edit activities)
                  if (key === 'changes' && typeof value === 'object') {
                    return Object.entries(value).map(([field, change]) => {
                      const fieldLabel = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                      return (
                        <div className="modal-changed-item" key={field}>
                          <span className="modal-changed-field">{fieldLabel}</span>
                          <div className="modal-changed-values">
                            <span className="modal-changed-from">{change.from || 'N/A'}</span>
                            <span className="modal-changed-arrow">→</span>
                            <span className="modal-changed-to">{change.to || 'N/A'}</span>
                          </div>
                        </div>
                      );
                    });
                  }
                  
                  // For regular key-value pairs (registered or deleted data)
                  const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  let displayValue = value;
                  if (typeof value === 'object') {
                    displayValue = JSON.stringify(value, null, 2);
                  }
                  return (
                    <div className="modal-changed-item" key={key}>
                      <span className="modal-changed-field">{label}</span>
                      <span className="modal-changed-value">{String(displayValue)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {(!displayData || Object.keys(displayData).length === 0) && (
          <div className="modal-no-data">No additional information available</div>
        )}
      </div>
    );
  };

  // ========== COLUMNS ==========
  const columns = [
    {
      title: '#',
      key: 'index',
      render: (_, __, index) => <span className="activity-index">{index + 1}</span>,
      width: 50,
    },
    {
      title: 'Admin',
      key: 'admin',
      render: (_, activity) => {
        const isYou = activity.adminName === loggedInAdmin;
        return (
          <div className="activity-admin-cell">
            <Avatar 
              size={32} 
              className="activity-admin-avatar"
              style={{ 
                background: isYou ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'linear-gradient(135deg, #4facfe, #00f2fe)' 
              }}
            >
              {getAdminInitials(activity.adminName)}
            </Avatar>
            <span className="activity-admin-name" style={{ color: isYou ? '#667eea' : '#333' }}>
              {isYou ? 'You' : activity.adminName}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Target Type',
      key: 'targetType',
      width: 120,
      render: (_, activity) => (
        <Tag color={getActionColor(activity.action)} className="target-type-tag">
          {getTargetType(activity.targetAdminName)}
        </Tag>
      ),
    },
    {
      title: 'Target Name',
      key: 'targetName',
      render: (_, activity) => (
        <span className="activity-target-name">
          {getCleanTargetName(activity.targetAdminName)}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, activity) => (
        <Tag color={getActionColor(activity.action)} className="activity-action-tag">
          {getActionIcon(activity.action)} {activity.action}
        </Tag>
      ),
    },
    {
      title: 'Date & Time',
      key: 'datetime',
      render: (_, activity) => {
        const dateInfo = formatDate(activity.timestamp);
        return (
          <div className="activity-datetime">
            <div className="activity-date">{dateInfo.date}</div>
            <div className="activity-time">
              <ClockCircleOutlined className="time-icon" />
              {dateInfo.time}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Details',
      key: 'details',
      width: 100,
      render: (_, activity) => (
        <Button 
          type="link" 
          size="small"
          icon={<EyeOutlined />} 
          className="view-details-btn"
          onClick={() => handleViewDetails(activity)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <Dashboard
      content={
        <div className="activity-container">
          <div className="activity-card">
            {/* Header */}
            <div className="activity-header">
              <div className="activity-header-left">
                <div className="activity-icon">
                  <FaHistory />
                </div>
                <div>
                  <h1>Admin Activities</h1>
                  <p>Track all admin actions and system events</p>
                </div>
              </div>
              <div className="activity-badge">
                <FaUserPlus /> {filteredActivities.length} Activities
              </div>
            </div>

            <div className="activity-body">
              {/* Search and Filter Bar */}
              <div className="activity-controls">
                <Input
                  placeholder="Search by admin, action, or target..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  prefix={<SearchOutlined className="search-icon" />}
                  className="activity-search-input"
                  allowClear
                />
                <div className="activity-sort-controls">
                  <Select
                    value={sortOption}
                    onChange={setSortOption}
                    className="activity-sort-select"
                    suffixIcon={<FaFilter />}
                  >
                    <Option value="time">Sort by Time</Option>
                    <Option value="adminName">Sort by Admin</Option>
                    <Option value="activity">Sort by Action</Option>
                    <Option value="targetName">Sort by Target</Option>
                  </Select>
                  <Button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="activity-sort-btn"
                    icon={sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                  >
                    {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="activity-table-wrapper">
                <Table
                  dataSource={filteredActivities}
                  columns={columns}
                  rowKey="id"
                  scroll={{ x: 1000 }}
                  pagination={{
                    showSizeChanger: true,
                    showTotal: (total, range) => {
                      const totalPages = Math.ceil(total / pageSize);
                      return `Showing ${range[0]}-${range[1]} of ${totalPages} pages`;
                    },
                    showQuickJumper: false,
                  }}
                  className="activity-table"
                  rowClassName="activity-table-row"
                  onChange={(pagination) => {
                    setCurrentPage(pagination.current);
                    setPageSize(pagination.pageSize);
                  }}
                  locale={{ emptyText: 'No activities found.' }}
                />
              </div>
            </div>
          </div>

          {/* Details Modal */}
          <Modal
            title={
              <div className="modal-title">
                <InfoCircleOutlined className="modal-title-icon" /> 
                Activity Details
              </div>
            }
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={[
              <Button key="close" type="primary" onClick={() => setModalVisible(false)}>
                Close
              </Button>,
            ]}
            width={550}
            className="activity-modal"
          >
            {renderModalContent()}
          </Modal>
        </div>
      }
    />
  );
};

export default AdminActivityPage;