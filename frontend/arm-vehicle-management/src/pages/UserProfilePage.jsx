import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; 
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";


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
  const [editablePassword, setEditablePassword] = useState("");
  const [editablePhone, setEditablePhone] = useState("");
  const [profileImage, setProfileImage] = useState(null); 

  const handleEditClick = () => {
    setIsEditing(true);
    setEditableName(user.name);
    setEditableEmail(user.email);
    setEditableDescription(user.description || "");
    setEditablePassword(user.password);
    setEditablePhone(user.phone);
  };

  const handleSaveClick = async () => {
    const updatedUser = {
      name: editableName,
      email: editableEmail,
      description: editableDescription,
      phone: editablePhone,
      profileImage: user.profileImage, 
    };
    if (editablePassword) {
      updatedUser.password = editablePassword;
    }

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
        text: "อัพเดทโปรไฟล์สำเร็จ",
        confirmButtonText: "OK",
      });
    } catch (error) {
      setError("Error updating user data");
      MySwal.fire({
        icon: "error",
        title: "Error!",
        text: "เกิดข้อผิดพลาดในการอัพเดทโปรไฟล์",
        confirmButtonText: "ลองอีกครั้ง",
      });
    }
  };

  const handleCancelClick = () => {
    setEditableName(user.name);
    setEditableEmail(user.email);
    setEditableDescription(user.description || "");
    setEditablePhone(user.phone);
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
    formData.append("id" , id);

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
        text: "เกิดข้อผิดพลาดในการอัพโหลด",
        confirmButtonText: "ลองอีกครั้ง",
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
        text: "อัพเดทรูปโปรไฟล์สำเร็จ",
        confirmButtonText: "OK",
      });
    } catch (error) {
      setError("Error updating user data");
      MySwal.fire({
        icon: "error",
        title: "Error!",
        text: "เกิดข้อผิดพลาดในการอัพเดท",
        confirmButtonText: "ลองอีกครั้ง",
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
            password: decodedToken.password,
            selfid: decodedToken.selfid,
            phone: decodedToken.phone,
            role: decodedToken.role,
            description: decodedToken.description || "",
            profileImage: decodedToken.profileImage || "", 
          };
          setUser(userData);
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="user-profile-container bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto mt-10 font-noto">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 text-center">โปรไฟล์ส่วนตัว</h2>
      {user && (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">รูปโปรไฟล์:</label>
            {isEditing ? (
              <>
                <input
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {profileImage && (
                  <button
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none"
                    onClick={handleImageUpload}
                  >
                    อัพโหลดรูป
                  </button>
                )}
              </>
            ) : (
              <div>
                {user.profileImage ? (
                  <img
                    src={`${user.profileImage}`}
                    alt="Profile"
                    className="w-24 h-24 rounded-full"
                  />
                ) : (
                  <span>ไม่มีรูปโปรไฟล์</span>
                )}
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">หมายเลขประจำตัว:</label>
              <span>{user.selfid}</span>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">ชื่อ-นามสกุล:</label>
            {isEditing ? (
              <input
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                type="text"
                value={editableName}
                onChange={(e) => setEditableName(e.target.value)}
              />
            ) : (
              <span>{user.name}</span>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email:</label>
            {isEditing ? (
              <input
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                type="email"
                value={editableEmail}
                onChange={(e) => setEditableEmail(e.target.value)}
              />
            ) : (
              <span>{user.email}</span>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">รหัสผ่าน:</label>
            {isEditing ? (
              <input
                type="password"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={editablePassword}
                onChange={(e) => setEditablePassword(e.target.value)}
              />
            ) : (
              <span>••••••••</span> 
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">บทบาท:</label> {user.role}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">ตำแหน่ง:</label>
            {isEditing ? (
              <textarea
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={editableDescription}
                onChange={(e) => setEditableDescription(e.target.value)}
              />
            ) : (
              <span>{user.description}</span>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์:</label>
            {isEditing ? (
              <input
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={editablePhone}
                onChange={(e) => setEditablePhone(e.target.value)}
              />
            ) : (
              <span>{user.phone}</span>
            )}
          </div>

          
        </div>
      )}

      {isEditing ? (
        <>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-md shadow-sm hover:bg-green-600 focus:outline-none"
            onClick={handleSaveClick}
          >
            บันทึก
          </button>
          <button
            className="ml-4 px-4 py-2 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600 focus:outline-none"
            onClick={handleCancelClick}
          >
            ยกเลิก
          </button>
        </>
      ) : (
        <button
          className="px-4 py-2 bg-indigo-500 text-white rounded-md shadow-sm hover:bg-indigo-600 focus:outline-none"
          onClick={handleEditClick}
        >
          Edit Profile
        </button>
      )}
    </div>
  );
};

export default UserProfilePage;
