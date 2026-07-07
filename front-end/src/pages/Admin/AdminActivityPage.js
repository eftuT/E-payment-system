import React, { useEffect, useState } from 'react';
import Dashboard from './Dashboard';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Modal, Spin, message, Select } from 'antd';
import axios from 'axios';

const { Option } = Select;

const AdminActivityPage = () => {
  // State variables
  const [adminData, setAdminData] = useState(JSON.parse(localStorage.getItem('adminData')));
  const [adminActivities, setAdminActivities] = useState([]);
  const loggedInAdmin = adminData ? `Admin ${adminData.user.FirstName}` : ''; // Add a check for adminData existence
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [sortOption, setSortOption] = useState('adminName');
  const [sortOrder, setSortOrder] = useState('desc'); // Default sort order

  const navigate = useNavigate();

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
    localStorage.setItem('selectedMenu', 12)
  }, [adminData, navigate]);

  useEffect(() => {
   // Fetch adminActivities from the database
const fetchAdminActivities = async () => {
  try {
      const response = await axios.get('http://localhost:3000/admin-activity');
    setAdminActivities(response.data);
  } catch (error) {
    console.error( error);
    message.error('Failed to fetch adminActivities. Please try again later.');
  }
};

fetchAdminActivities();
  }, []);

  
  useEffect(() => {
    // Filter activities based on the search term and sort them
    if (searchTerm) {
      const filtered = adminActivities.filter((activity) => {
        const searchTermLower = searchTerm.toLowerCase();
        const adminNameLower = activity.adminName.toLowerCase();
        const targetAdminNameLower = activity.targetAdminName.toLowerCase();
        const activityLower = activity.action.toLowerCase();
        const timestamp = new Date(activity.timestamp);
        const date = timestamp.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const time = timestamp.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
        });

        return (
          adminNameLower.includes(searchTermLower) ||
          activityLower.includes(searchTermLower) ||
          targetAdminNameLower.includes(searchTermLower) ||
          date.includes(searchTermLower) ||
          time.includes(searchTermLower)
        );
      });

      const sorted = filtered.sort((a, b) => {
        const valueA = getValueToSortBy(a);
        const valueB = getValueToSortBy(b);

        if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
        if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
        return 0;
      });

      setFilteredActivities(sorted);
    } else {
      const sorted = adminActivities.sort((a, b) => {
        const valueA = getValueToSortBy(a);
        const valueB = getValueToSortBy(b);

        if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
        if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
        return 0;
      });

      setFilteredActivities(sorted);
    }
  }, [adminActivities, searchTerm, sortOrder]);

  const sortActivities = () => {
    // Sort activities based on the selected option and order
    const sorted = [...filteredActivities].sort((a, b) => {
      const valueA = getValueToSortBy(a);
      const valueB = getValueToSortBy(b);

      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      return 0;
    });

    setFilteredActivities(sorted);
  };


  const getValueToSortBy = (activity) => {
    // Get the value to sort activities based on the selected option
    switch (sortOption) {
      case 'adminName':
        return activity.adminName.toLowerCase();
      case 'activity':
        return activity.action.toLowerCase();
      case 'targetAdminName':
        return activity.targetAdminName.toLowerCase();
      case 'time':
        return new Date(activity.timestamp).getTime();
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
        <p>Please wait while we check your login status...</p>
      </div>
    );
  }

  const showModal = () => {
    setModalVisible(true);
  };

  const handleActivityClick = (updatedData) => {
    setModalData(updatedData);
    showModal();
    console.log(updatedData);
  };

  const handleSearch = () => {
    setFilteredActivities(
      adminActivities.filter((activity) => {
        const searchTermLower = searchTerm.toLowerCase();
        const adminNameLower = activity.adminName.toLowerCase();
        const targetAdminNameLower = activity.targetAdminName.toLowerCase();
        const activityLower = activity.action.toLowerCase();
        const timestamp = new Date(activity.timestamp);
        const date = timestamp.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const time = timestamp.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
        });

        return (
          adminNameLower.includes(searchTermLower) ||
          activityLower.includes(searchTermLower) ||
          targetAdminNameLower.includes(searchTermLower) ||
          date.includes(searchTermLower) ||
          time.includes(searchTermLower)
        );
      })
    );
    sortActivities();
  };

  const handleSortChange = (value) => {
    setSortOption(value);
    setSortOrder('desc');
    sortActivities();
  };

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
    sortActivities();
  };

  return (
    <Dashboard
      content={
        <div style={{ width: '100%' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
            Admin Activities
          </h1>
          <div style={{ marginBottom: '20px' }}>
            <Input.Search
              placeholder="Search for activities"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '55%' }}
            />
            <Select
              defaultValue={sortOption}
              style={{ marginLeft: '10px', width: 150 }}
              onChange={handleSortChange}
            >
              <Option value="adminName">Sort by Admin Name</Option>
              <Option value="activity">Sort by Activity</Option>
              <Option value="targetAdminName">Sort by Target Admin Name</Option>
              <Option value="time">Sort by Time</Option>
            </Select>
            <Button onClick={toggleSortOrder}>
              {sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
            </Button>
          </div>
          {filteredActivities.length > 0 ? (
            <ul style={{ padding: '10px', listStyle: 'none' }}>
              {filteredActivities.map((activity, index) => (
                <li
                  key={index}
                  style={{ margin: '10px', width: '100%', textAlign: 'left' }}
                >
                  <p style={{ marginBottom: '5px', lineHeight: '1.5' }}>
                    <strong style={{ fontWeight: 'bold' }}>Activity:</strong>{' '}
                    <span
                      style={{
                        color: activity.adminName === loggedInAdmin ? 'blue' : 'green',
                      }}
                    >
                      {activity.adminName === loggedInAdmin ? 'You' : activity.adminName}
                    </span>{' '}
                    <span
                      style={{
                        color: activity.adminName === loggedInAdmin ? 'blue' : 'green',
                      }}
                    >
                      {activity.action}
                    </span>{' '}
                    <span style={{ color: 'purple' }}>
                      {activity.action === 'Edited' ? (
                        <Link
                          to="#"
                          onClick={() => handleActivityClick(activity.changedData)}
                          style={{ textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          {activity.targetAdminName}
                        </Link>
                      ) : activity.action === 'Deleted' ? (
                        <Link
                          to="#"
                          onClick={() => handleActivityClick(activity.changedData)}
                          style={{ textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          {activity.targetAdminName}
                        </Link>
                      ) : (
                        activity.targetAdminName
                      )}
                    </span>{' '}
                    <span
                      style={{
                        color: activity.adminName === loggedInAdmin ? 'blue' : 'green',
                      }}
                    >
                      at
                    </span>{' '}
                    <span style={{ color: 'teal' }}>
                      {new Date(activity.timestamp).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: 'numeric',
                      })}
                    </span>{' '}
                    <span
                      style={{
                        color: activity.adminName === loggedInAdmin ? 'blue' : 'green',
                      }}
                    >
                      on
                    </span>{' '}
                    <span style={{ color: 'teal' }}>
                      {new Date(activity.timestamp).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </p>
                  <hr style={{ borderTop: '1px solid #ccc' }} />
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontStyle: 'italic' }}>No matching activities found.</p>
          )}

          <Modal visible={modalVisible} onCancel={() => setModalVisible(false)} footer={null}>
            {modalData && (
              <>
                {Object.entries(modalData).map(([key, value]) => (
                  <p key={key}>
                    <strong>{key}: </strong>
                    {typeof value === 'object' ? (
                      <span>{key === 'changes' ? JSON.stringify(value) : ''}</span>
                    ) : (
                      value.toString()
                    )}
                  </p>
                ))}
              </>
            )}
          </Modal>
        </div>
      }
      deletedData={modalData}
    />
  );
};
export default AdminActivityPage;