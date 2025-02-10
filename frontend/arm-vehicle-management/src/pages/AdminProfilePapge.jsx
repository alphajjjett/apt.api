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
  const [editablePassword, setEditablePassword] = useState("");
  const [editableDescription, setEditableDescription] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const backend = process.env.REACT_APP_API_URL;

  const handleEditClick = () => {
    setIsEditing(true);
    setEditableName(admin.name);
    setEditableEmail(admin.email);
    setEditableDescription(admin.description || "");
    setEditablePassword(admin.password);
  };

  const handleSaveClick = async () => {
    const updatedAdmin = {
      name: editableName,
      email: editableEmail,
      description: editableDescription,
      profileImage: admin.profileImage,
    };
    if (editablePassword) {
      updatedAdmin.password = editablePassword;
    }

    try {
      const response = await axios.put(
        `${backend}/api/admins/${id}`,
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
        text: "อัพเดทโปรไฟล์เรียบร้อย",
        confirmButtonText: "OK",
      });
    } catch (error) {
      setError("Error updating admin data");
      MySwal.fire({
        icon: "error",
        title: "Error!",
        text: "พบปัญหาในการอัพเดทโปรไฟล์.",
        confirmButtonText: "ลองอีกครั้ง",
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
    formData.append("id", id);

    try {
      const response = await axios.post(`${backend}/api/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const imageUrl = response.data.path;
      await handleSaveProfileImage(imageUrl);
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Upload Failed!",
        text: "พบปัญหาในการอัพโหลดโปรไฟล์",
        confirmButtonText: "ลงอีกครั้ง",
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
        `${backend}/api/admins/${id}`,
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
        text: "อัพเดทโปรไฟล์เรียบร้อย",
        confirmButtonText: "OK",
      });
    } catch (error) {
      setError("Error updating admin data");
      MySwal.fire({
        icon: "error",
        title: "Error!",
        text: "พบปัญหาในการอัพเดทโปรไฟล์",
        confirmButtonText: "ลองอีกครั้ง",
      });
    }
  };

  const fetchAdminData = async () => {
    try {
      const response = await axios.get(`${backend}/api/admins/${id}`, {
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
            password: decodedToken.password,
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg font-noto">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
        โปรไฟล์แอดมิน
      </h2>

      {admin && (
        <div className="space-y-6">
          {/* รูปโปรไฟล์ */}
          <div className="flex flex-col items-center">
            {isEditing ? (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-600 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </>
            ) : (
              <div className="relative">
                {admin.profileImage ? (
                  <img
                    src={admin.profileImage}
                    alt="Profile"
                    className="w-32 h-32 object-cover rounded-full border-4 border-gray-300 shadow-md"
                  />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center bg-gray-200 text-gray-500 rounded-full">
                    ไม่มีรูปโปรไฟล์
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ข้อมูลแอดมิน */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ชื่อ-นามสกุล:
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editableName}
                  onChange={(e) => setEditableName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{admin.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email:
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editableEmail}
                  onChange={(e) => setEditableEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{admin.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                รหัสผ่าน:
              </label>
              {isEditing ? (
                <input
                  type="password"
                  value={editablePassword}
                  onChange={(e) => setEditablePassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="text-gray-900">••••••••</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                บทบาท:
              </label>
              <p className="text-gray-900">{admin.role}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                ตำแหน่ง:
              </label>
              {isEditing ? (
                <textarea
                  value={editableDescription}
                  onChange={(e) => setEditableDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="text-gray-900">{admin.description}</p>
              )}
            </div>
          </div>

          {/* ปุ่มแก้ไขและบันทึก */}
          <div className="flex justify-center gap-4">
            {isEditing ? (
              <>
                <button
                  className="px-6 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600 transition"
                  onClick={handleSaveClick}
                >
                  บันทึก
                </button>
                <button
                  className="px-6 py-2 bg-red-500 text-white rounded-md shadow hover:bg-red-600 transition"
                  onClick={handleCancelClick}
                >
                  ยกเลิก
                </button>
              </>
            ) : (
              <button
                className="px-6 py-2 bg-indigo-500 text-white rounded-md shadow hover:bg-indigo-600 transition"
                onClick={handleEditClick}
              >
                แก้ไขข้อมูล
              </button>
            )}
          </div>

          {/* ปุ่มกลับไปยังหน้าผู้ใช้ */}
          <div className="text-center mt-6">
            <button
              className="px-6 py-2 bg-gray-500 text-white rounded-md shadow hover:bg-gray-600 transition"
              onClick={() => navigate("/users")}
            >
              กลับไปยังหน้าข้อมูลผู้ใช้
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfilePage;
