import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; 
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import "../styles/UserProfilePage.css"; 

const MySwal = withReactContent(Swal);

const UserProfilePage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableName, setEditableName] = useState("");
  const [editableEmail, setEditableEmail] = useState("");
  const [editableDescription, setEditableDescription] = useState("");
  const [profileImage, setProfileImage] = useState(null); 

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
      profileImage: user.profileImage, 
    };

    try {
      const response = await axios.put(
        `http://localhost:5000/api/users/${id}`,
        updatedUser,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setUser(response.data);
      setIsEditing(false);
      fetchUserData();
      MySwal.fire({
        icon: "success",
        title: "Profile Updated!",
        text: "Your profile has been successfully updated.",
        confirmButtonText: "OK",
      });
    } catch (error) {
      setError("Error updating user data");
      MySwal.fire({
        icon: "error",
        title: "Error!",
        text: "There was an issue updating your profile.",
        confirmButtonText: "Try Again",
      });
    }
  };

  const handleCancelClick = () => {
    setEditableName(user.name);
    setEditableEmail(user.email);
    setEditableDescription(user.description || "");
    setIsEditing(false);
  };
  
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
    }
  };

  const handleImageUpload = async () => {
    const formData = new FormData();
    formData.append("file", profileImage);
    formData.append("id" , id)

    try {
      const response = await axios.post(
        "http://localhost:5000/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );


      const imageUrl = response.data.path; 
      await handleSaveProfileImage(imageUrl);
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Upload Failed!",
        text: "There was an issue uploading your profile image.",
        confirmButtonText: "Try Again",
      });
    }
  };

  const handleSaveProfileImage = async (imageUrl) => {
    const updatedUser = {
      name: editableName,
      email: editableEmail,
      description: editableDescription,
      profileImage: imageUrl, 
    };

    try {
      const response = await axios.put(
        `http://localhost:5000/api/users/${id}`,
        updatedUser,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setUser(response.data);
      setIsEditing(false);
      MySwal.fire({
        icon: "success",
        title: "Profile Updated!",
        text: "Your profile has been successfully updated.",
        confirmButtonText: "OK",
      });
    } catch (error) {
      setError("Error updating user data");
      MySwal.fire({
        icon: "error",
        title: "Error!",
        text: "There was an issue updating your profile.",
        confirmButtonText: "Try Again",
      });
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUser(response.data); 
    } catch (error) {
      console.error("Error fetching user data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No token found, please login again");
        setLoading(false);
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        console.log("Decoded Token:", decodedToken);

        if (decodedToken.exp < Date.now() / 1000) {
          setError("Token has expired, please login again");
          setLoading(false);
          return;
        }

        if (decodedToken.id !== id) {
          setError("User not authorized to view this profile");
          setLoading(false);
          return;
        }

        if (isMounted) {
          const userData = {
            name: decodedToken.name,
            email: decodedToken.email,
            role: decodedToken.role,
            description: decodedToken.description || "",
            profileImage: decodedToken.profileImage || "", // เพิ่มการโหลดภาพโปรไฟล์
          };
          setUser(userData);
          console.log("User data:", userData); // ตรวจสอบข้อมูล user
        }
      } catch (error) {
        setError("Error decoding token or fetching user data");
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

  console.log("user detail is ===========>" , user)

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
          <div className="user-profile-info">
            <label>Profile Image:</label>
            {isEditing ? (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {profileImage && (
                  <button
                    className="user-profile-button"
                    onClick={handleImageUpload}
                  >
                    Upload Image
                  </button>
                )}
              </>
            ) : (
              <div>
                {user.profileImage ? (
                  <img
                    src={`${user.profileImage}`}
                    alt="Profile"
                    className="user-profile-image"
                  />
                ) : (
                  <span>No profile image</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {isEditing ? (
        <>
          <button className="user-profile-button" onClick={handleSaveClick}>
            Save Changes
          </button>
          <button className="user-profile-button cancel-button" onClick={handleCancelClick}>
            Cancel
          </button>
        </>
      ) : (
        <button className="user-profile-button" onClick={handleEditClick}>
          Edit Profile
        </button>
      )}

    </div>
  );
};

export default UserProfilePage;
