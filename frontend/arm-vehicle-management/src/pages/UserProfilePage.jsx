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
  const backend = process.env.REACT_APP_API_URL;

  const handleEditClick = () => {
    setIsEditing(true);
    setEditableName(user.name);
    setEditableEmail(user.email);
    setEditableDescription(user.description || "");
    setEditablePassword(user.password);
    setEditablePhone(user.phone);
  };

  const handleSaveClick = async () => {
    console.log("profileImage is ", profileImage);
    const formData = new FormData();
    formData.append("name", editableName);
    formData.append("email", editableEmail);
    formData.append("description", editableDescription);
    formData.append("phone", editablePhone);
    formData.append("file", profileImage);
    if (editablePassword) {
      formData.append("password", editablePassword);
    }

    try {
      const response = await axios.put(`${backend}/api/users/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("response.data.token)", response.data.token);

      setUser(response.data.updatedUser);
      localStorage.setItem("token", response.data.token);
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

  // const handleImageUpload = async () => {
  //   const formData = new FormData();
  //   formData.append("file", profileImage);
  //   formData.append("id", id);

  //   try {
  //     const response = await axios.post(`${backend}/api/upload`, formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //         Authorization: `Bearer ${localStorage.getItem("token")}`,
  //       },
  //     });

  //     const imageUrl = response.data.path;
  //     await handleSaveProfileImage(imageUrl);
  //   } catch (error) {
  //     MySwal.fire({
  //       icon: "error",
  //       title: "Upload Failed!",
  //       text: "เกิดข้อผิดพลาดในการอัพโหลด",
  //       confirmButtonText: "ลองอีกครั้ง",
  //     });
  //   }
  // };

  // const handleSaveProfileImage = async (imageUrl) => {
  //   const updatedUser = {
  //     name: editableName,
  //     email: editableEmail,
  //     description: editableDescription,
  //     profileImage: imageUrl,
  //   };

  //   try {
  //     const response = await axios.put(
  //       `${backend}/api/users/${id}`,
  //       updatedUser,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //         },
  //       }
  //     );

  //     setUser(response.data);
  //     setIsEditing(false);
  //     MySwal.fire({
  //       icon: "success",
  //       title: "Profile Updated!",
  //       text: "อัพเดทรูปโปรไฟล์สำเร็จ",
  //       confirmButtonText: "OK",
  //     });
  //   } catch (error) {
  //     setError("Error updating user data");
  //     MySwal.fire({
  //       icon: "error",
  //       title: "Error!",
  //       text: "เกิดข้อผิดพลาดในการอัพเดท",
  //       confirmButtonText: "ลองอีกครั้ง",
  //     });
  //   }
  // };

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

  return(
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-lg font-noto border border-gray-200">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-900 text-center">
        โปรไฟล์ส่วนตัว
      </h2>

      {user && (
        <div className="space-y-6">
          {/* รูปโปรไฟล์ */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <img
                src={user.profileImage || "/default-profile.png"}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-gray-300 shadow-sm"
              />
              {isEditing && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-3 block w-full text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border file:border-gray-300 file:text-sm file:font-medium file:bg-gray-50 hover:file:bg-gray-100"
                />
              )}
            </div>
          </div>

          {/* ข้อมูลโปรไฟล์ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* หมายเลขประจำตัว */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                หมายเลขประจำตัว:
              </label>
              <p className="text-lg font-semibold text-gray-800">
                {user.selfid}
              </p>
            </div>

            {/* ชื่อ */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ชื่อ-นามสกุล:
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editableName}
                  onChange={(e) => setEditableName(e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-800">
                  {user.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email:
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editableEmail}
                  onChange={(e) => setEditableEmail(e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="text-gray-700">{user.email}</p>
              )}
            </div>

            {/* รหัสผ่าน */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                รหัสผ่าน:
              </label>
              {isEditing ? (
                <input
                  type="password"
                  value={editablePassword}
                  onChange={(e) => setEditablePassword(e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="text-gray-500">••••••••</p>
              )}
            </div>

            {/* ตำแหน่ง */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ตำแหน่ง:
              </label>
              {isEditing ? (
                <textarea
                  value={editableDescription}
                  onChange={(e) => setEditableDescription(e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="text-gray-700">
                  {user.description || "ไม่มีข้อมูล"}
                </p>
              )}
            </div>

            {/* เบอร์โทรศัพท์ */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                เบอร์โทรศัพท์:
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editablePhone}
                  onChange={(e) => setEditablePhone(e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="text-gray-700">{user.phone || "ไม่มีข้อมูล"}</p>
              )}
            </div>

            {/* บทบาท */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                บทบาท:
              </label>
              <p className="text-gray-700">{user.role}</p>
            </div>
          </div>

          {/* ปุ่ม */}
          <div className="mt-6 flex justify-center gap-4">
            {isEditing ? (
              <>
                <button
                  className="px-6 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-200 ease-in-out"
                  onClick={handleSaveClick}
                >
                  บันทึก
                </button>
                <button
                  className="px-6 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition duration-200 ease-in-out"
                  onClick={handleCancelClick}
                >
                  ยกเลิก
                </button>
              </>
            ) : (
              <button
                className="px-6 py-2 bg-indigo-500 text-white rounded-lg shadow-md hover:bg-indigo-600 transition duration-200 ease-in-out"
                onClick={handleEditClick}
              >
                แก้ไขโปรไฟล์
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
