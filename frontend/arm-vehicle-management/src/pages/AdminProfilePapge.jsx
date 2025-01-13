import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // นำเข้า useNavigate
import { jwtDecode } from "jwt-decode"; 
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";

const MySwal = withReactContent(Swal);

const AdminProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // สร้างตัวแปร navigate
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableName, setEditableName] = useState("");
  const [editableEmail, setEditableEmail] = useState("");
  const [editableDescription, setEditableDescription] = useState("");
  const [profileImage, setProfileImage] = useState(null); 

  const handleEditClick = () => {
    setIsEditing(true);
    setEditableName(admin.name);
    setEditableEmail(admin.email);
    setEditableDescription(admin.description || "");
  };

  const handleSaveClick = async () => {
    const updatedAdmin = {
      name: editableName,
      email: editableEmail,
      description: editableDescription,
      profileImage: admin.profileImage, 
    };

    try {
      const response = await axios.put(
        `http://localhost:5000/api/admins/${id}`,
        updatedAdmin,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setAdmin(response.data);
      setIsEditing(false);
      fetchAdminData();
      MySwal.fire({
        icon: "success",
        title: "Profile Updated!",
        text: "Your profile has been successfully updated.",
        confirmButtonText: "OK",
      });
    } catch (error) {
      setError("Error updating admin data");
      MySwal.fire({
        icon: "error",
        title: "Error!",
        text: "There was an issue updating your profile.",
        confirmButtonText: "Try Again",
      });
    }
  };

  const handleCancelClick = () => {
    setEditableName(admin.name);
    setEditableEmail(admin.email);
    setEditableDescription(admin.description || "");
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
    const updatedAdmin = {
      name: editableName,
      email: editableEmail,
      description: editableDescription,
      profileImage: imageUrl, 
    };

    try {
      const response = await axios.put(
        `http://localhost:5000/api/admins/${id}`,
        updatedAdmin,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setAdmin(response.data);
      setIsEditing(false);
      MySwal.fire({
        icon: "success",
        title: "Profile Updated!",
        text: "Your profile has been successfully updated.",
        confirmButtonText: "OK",
      });
    } catch (error) {
      setError("Error updating admin data");
      MySwal.fire({
        icon: "error",
        title: "Error!",
        text: "There was an issue updating your profile.",
        confirmButtonText: "Try Again",
      });
    }
  };

  const fetchAdminData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admins/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });  
      setAdmin(response.data); 
    } catch (error) {
      console.error("Error fetching admin data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchAdmin = async () => {
      const token = localStorage.getItem("token");
      fetchAdminData();
      if (!token) {
        setError("No token found, please login again");
        setLoading(false);
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        console.log("Decoded Token:", decodedToken);  
        console.log("Profile ID: ", id);  

        if (decodedToken.exp < Date.now() / 1000) {
          setError("Token has expired, please login again");
          setLoading(false);
          return;
        }

        if (decodedToken.id !== id) {
          setError("Admin not authorized to view this profile");
          setLoading(false);
          return;
        }

        if (isMounted) {
          const adminData = {
            name: decodedToken.name,
            email: decodedToken.email,
            role: decodedToken.role,
            description: decodedToken.description || "",
            profileImage: decodedToken.profileImage || "", 
          };
          setAdmin(adminData);
          console.log("Admin data:", adminData); 
        }
      } catch (error) {
        setError("Error decoding token or fetching admin data");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAdmin();

    return () => {
      isMounted = false;
    };
  }, [id]);

  console.log("admin detail is ===========>", admin)

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-700">โปรไฟล์ แอดมิน</h2>
      {admin && (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600">ชื่อ-นามสกุล:</label>
            {isEditing ? (
              <input
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                type="text"
                value={editableName}
                onChange={(e) => setEditableName(e.target.value)}
              />
            ) : (
              <span>{admin.name}</span>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600">Email:</label>
            {isEditing ? (
              <input
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                type="email"
                value={editableEmail}
                onChange={(e) => setEditableEmail(e.target.value)}
              />
            ) : (
              <span>{admin.email}</span>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600">บทบาท:</label> 
            <span>{admin.role}</span>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600">ตำแหน่ง:</label>
            {isEditing ? (
              <textarea
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={editableDescription}
                onChange={(e) => setEditableDescription(e.target.value)}
              />
            ) : (
              <span>{admin.description}</span>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600">รูปโปรไฟล์:</label>
            {isEditing ? (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1"
                />
                {profileImage && (
                  <button
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    onClick={handleImageUpload}
                  >
                    อัพโหลด
                  </button>
                )}
              </>
            ) : (
              <div>
                {admin.profileImage ? (
                  <img
                    src={`${admin.profileImage}`}
                    alt="Profile"
                    className="h-32 w-32 rounded-full mt-2"
                  />
                ) : (
                  <span>ไม่มีรูปโปรไฟล์</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {isEditing ? (
        <>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            onClick={handleSaveClick}
          >
            บันทึก
          </button>
          <button
            className="ml-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            onClick={handleCancelClick}
          >
            ยกเลิก
          </button>
        </>
      ) : (
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={handleEditClick}
        >
          แก้ไขข้อมูล
        </button>
      )}

      {/* ปุ่มกลับไปยังหน้าผู้ใช้ */}
      <button
        className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        onClick={() => navigate('/users')} // เปลี่ยนเส้นทาง
      >
        กลับไปยังหน้าข้อมูลผู้ใช้
      </button>
    </div>
  );
};

export default AdminProfilePage;
