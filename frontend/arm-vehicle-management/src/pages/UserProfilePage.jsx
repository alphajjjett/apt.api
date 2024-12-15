import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';  // jwtDecode without destructuring
import axios from 'axios';
import '../styles/UserProfilePage.css'; // นำเข้าไฟล์ CSS ที่สร้างขึ้น

const UserProfilePage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableName, setEditableName] = useState("");
  const [editableEmail, setEditableEmail] = useState("");
  const [editableDescription, setEditableDescription] = useState("");

  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditableName(user.name);
    setEditableEmail(user.email);
    setEditableDescription(user.description || "");
  };

  const handleSaveClick = async () => {
    const updatedUser = {
      name: editableName,
      email: editableEmail,
      description: editableDescription,
    };

    try {
      const response = await axios.put(`http://localhost:5000/api/users/${id}`, updatedUser, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });

      setUser(response.data);
      setIsEditing(false);
      fetchUserData();
    } catch (error) {
      setError('Error updating user data');
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`/api/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('No token found, please login again');
        setLoading(false);
        return;
      }

      try {
        const decodedToken = jwtDecode(token);

        if (decodedToken.exp < Date.now() / 1000) {
          setError('Token has expired, please login again');
          setLoading(false);
          return;
        }

        if (decodedToken.id !== id) {
          setError('User not authorized to view this profile');
          setLoading(false);
          return;
        }

        if (isMounted) {
          setUser({
            name: decodedToken.name,
            email: decodedToken.email,
            role: decodedToken.role,
            description: decodedToken.description || "",
          });
        }
      } catch (error) {
        setError('Error decoding token or fetching user data');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="user-profile-container">
      <h2 className="user-profile-title">User Profile</h2>
      {user && (
        <div>
          <div className="user-profile-info">
            <label>Name:</label>
            {isEditing ? (
              <input
                className="user-profile-input"
                type="text"
                value={editableName}
                onChange={(e) => setEditableName(e.target.value)}
              />
            ) : (
              <span>{user.name}</span>
            )}
          </div>
          <div className="user-profile-info">
            <label>Email:</label>
            {isEditing ? (
              <input
                className="user-profile-input"
                type="email"
                value={editableEmail}
                onChange={(e) => setEditableEmail(e.target.value)}
              />
            ) : (
              <span>{user.email}</span>
            )}
          </div>
          <div className="user-profile-info">
            <label>Role:</label> {user.role}
          </div>
          <div className="user-profile-info">
            <label>Description:</label>
            {isEditing ? (
              <textarea
                className="user-profile-textarea"
                value={editableDescription}
                onChange={(e) => setEditableDescription(e.target.value)}
              />
            ) : (
              <span>{user.description}</span>
            )}
          </div>
        </div>
      )}
  
      <button className="user-profile-button" onClick={handleBackClick}>
        Back to Dashboard
      </button>
  
      {isEditing ? (
        <button className="user-profile-button" onClick={handleSaveClick}>
          Save Changes
        </button>
      ) : (
        <button className="user-profile-button" onClick={handleEditClick}>
          Edit Profile
        </button>
      )}
    </div>
  );
};

export default UserProfilePage;
