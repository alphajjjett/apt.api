import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Admin role still uses jwtDecode
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import LockResetIcon from "@mui/icons-material/LockReset";

const MySwal = withReactContent(Swal);

const Users = () => {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [updatedUser, setUpdatedUser] = useState({});
  const backend = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const handleBackClick = () => {
    navigate("/dashboard");
  };

  const handleProfileClick = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.role === "admin") {
        navigate(`${backend}/admins/${decodedToken.id}`, { replace: true });
      } else {
        MySwal.fire({
          title: "Access Denied",
          text: "You do not have admin access to view this page.",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Invalid token:", error);
      navigate("/", { replace: true });
    }
  };

  const handleCreateAdmin = () => {
    MySwal.fire({
      title: "เพิ่มแอดมิน",
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="ชื่อ-สกุล">' +
        '<input id="swal-input2" class="swal2-input" placeholder="Email">' +
        '<input id="swal-input3" class="swal2-input" placeholder="รหัสผ่าน" type="password">' +
        '<input id="swal-input4" class="swal2-input" placeholder="ตำแหน่ง">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "สร้าง",
      cancelButtonText: "ยกเลิก",
      preConfirm: () => {
        const name = document.getElementById("swal-input1").value;
        const email = document.getElementById("swal-input2").value;
        const password = document.getElementById("swal-input3").value;
        const description = document.getElementById("swal-input4").value;

        if (!name || !email || !password) {
          MySwal.showValidationMessage("กรุณากรอกข้อมูลให้ครบ");
          return;
        }

        return { name, email, password, description };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { name, email, password, description } = result.value;
        try {
          const token = localStorage.getItem("token");
          await axios.post(
            `${backend}/api/admins/register`,
            { name, email, password, description },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          MySwal.fire("Created!", "สร้างแอดมินสำเร็จ", "success");
        } catch (error) {
          MySwal.fire("Error", "เกิดข้อผิดพลาดในการสร้างแอดมิน.", "error");
        }
      }
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
    } else {
      try {
        const decodedToken = jwtDecode(token);
        console.log(decodedToken);

        if (decodedToken.role === "user") {
          navigate(`/profile/${decodedToken.id}`, { replace: true });
        } else if (decodedToken.role === "admin") {
          const fetchUsersAndAdmins = async () => {
            try {
              const responseUsers = await axios.get(
                `${backend}/api/users`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              const responseAdmins = await axios.get(
                `${backend}/api/admins`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              setUsers(responseUsers.data);
              setAdmins(responseAdmins.data); // Set admins data
            } catch (error) {
              setError("Failed to fetch users and admins");
            } finally {
              setLoading(false);
            }
          };
          fetchUsersAndAdmins();
        } else {
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("Invalid token:", error);
        navigate("/", { replace: true });
      }
    }
  }, [navigate]);

  const handleDeleteUser = async (userId) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "ไม่สามารถกู้ข้อมูลกลับได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบข้อมูล",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${backend}/api/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          setUsers(users.filter((user) => user._id !== userId));

          MySwal.fire({
            title: "Deleted!",
            text: "ข้อมูลถูกลบเรียบร้อย",
            icon: "success",
          });
        } catch (error) {
          setError("Failed to delete user");
          MySwal.fire({
            title: "Error",
            text: "เกิดข้อผิดพลาดในการลบข้อมูล",
            icon: "error",
          });
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        MySwal.fire({
          title: "Cancel",
          text: "ยกเลิกการลบ",
          icon: "error",
        });
      }
    });
  };

  const handleResetPassword = (userId, isAdmin = false) => {
    MySwal.fire({
      title: "รีเซ็ตรหัสผ่าน",
      html:
        '<input id="swal-new-password" class="swal2-input" placeholder="รหัสผ่านใหม่" type="password">' +
        '<input id="swal-confirm-password" class="swal2-input" placeholder="ยืนยันรหัสผ่านใหม่" type="password">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "รีเซ็ต",
      cancelButtonText: "ยกเลิก",
      preConfirm: () => {
        const newPassword = document.getElementById("swal-new-password").value;
        const confirmPassword = document.getElementById(
          "swal-confirm-password"
        ).value;

        if (!newPassword || !confirmPassword) {
          MySwal.showValidationMessage("กรุณากรอกรหัสผ่านให้ครบ");
          return false;
        }

        if (newPassword !== confirmPassword) {
          MySwal.showValidationMessage("รหัสผ่านทั้งสองไม่ตรงกัน");
          return false;
        }

        return { newPassword };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { newPassword } = result.value;
        try {
          const token = localStorage.getItem("token");
          const url = isAdmin
            ? `${backend}/api/admins/${userId}`
            : `${backend}/api/users/${userId}`;
          await axios.put(
            url,
            { password: newPassword },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          MySwal.fire("Success", "รีเซ็ตรหัสผ่านเรียบร้อย", "success");
        } catch (error) {
          MySwal.fire("Error", "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน", "error");
        }
      }
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (userId) => {
    try {
      await axios.put(
        `${backend}/api/users/${userId}`,
        updatedUser,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, ...updatedUser } : user
        )
      );
      setEditingUserId(null);
      MySwal.fire({
        title: "Updated!",
        text: "อัพเดทข้อมูลสำเร็จ",
        icon: "success",
      });
    } catch (error) {
      setError("Failed to update user");
      MySwal.fire({
        title: "Error",
        text: "เกิดข้อผิดพลาดในการอัพเดท",
        icon: "error",
      });
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>{error}</p>;
  if (users.length === 0 && admins.length === 0)
    return <p>No users or admins found</p>;

  return (
    <div className="container mx-auto p-4 font-noto">
      <h2 className="text-2xl font-bold mb-4">Users and Admins</h2>

      {/* เดี๋ยวเปลี่ยนมาใช้ MUI */}
      <button
        onClick={handleProfileClick}
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 mt-4 rounded"
      >
        โปรไฟล์ แอดมิน
      </button>

      <button
        onClick={handleCreateAdmin}
        className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded ml-3"
      >
        เพิ่ม แอดมิน
      </button>

      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden mt-4">
        <thead>
          <tr>
            <th className="py-2 px-4 bg-gray-200 text-gray-600">
              ชื่อ-นามสกุล
            </th>
            <th className="py-2 px-4 bg-gray-200 text-gray-600">Email</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-600">รหัสผ่าน</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-600">
              เบอร์โทรศัพท์
            </th>
            <th className="py-2 px-4 bg-gray-200 text-gray-600">บทบาท</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-600">ตำแหน่ง</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {[...users, ...admins].map((user) => (
            <tr key={user._id} className="border-t">
              <td className="py-2 px-4">
                {editingUserId === user._id ? (
                  <input
                    type="text"
                    name="name"
                    value={updatedUser.name || user.name}
                    onChange={handleEditChange}
                    className="border px-2 py-1 rounded"
                  />
                ) : (
                  user.name
                )}
              </td>
              <td className="py-2 px-4">
                {editingUserId === user._id ? (
                  <input
                    type="email"
                    name="email"
                    value={updatedUser.email || user.email}
                    onChange={handleEditChange}
                    className="border px-2 py-1 rounded"
                  />
                ) : (
                  user.email
                )}
              </td>

              <td className="py-2 px-4">
              {user.role !== "admin" && (
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded ml-2"
                  onClick={() => handleResetPassword(user._id)}
                >
                  <LockResetIcon />
                </button>
                )}
              </td>

              <td className="py-2 px-4">{user.phone}</td>
              <td className="py-2 px-4">{user.role}</td>
              <td className="py-2 px-4">
                {editingUserId === user._id ? (
                  <input
                    type="text"
                    name="description"
                    value={updatedUser.description || user.description}
                    onChange={handleEditChange}
                    className="border px-2 py-1 rounded"
                  />
                ) : (
                  user.description
                )}
              </td>
              <td className="py-2 px-4">
                {editingUserId === user._id ? (
                  <>
                    <button
                      onClick={() => handleSaveEdit(user._id)}
                      className="bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded ml-2"
                    >
                      บันทึก
                    </button>
                    <button
                      onClick={() => {
                        setEditingUserId(null); 
                        setUpdatedUser({}); 
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-2 rounded ml-2"
                    >
                      ยกเลิก
                    </button>
                  </>
                ) : (
                  <>
                    {user.role !== "admin" && (
                      <>
                        <button
                          onClick={() => setEditingUserId(user._id)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 rounded ml-2"
                        >
                          แก้ไขข้อมูล
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded ml-2"
                        >
                          ลบข้อมูล
                        </button>
                      </>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={handleBackClick}
        className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 mt-4 rounded"
      >
        กลับยังหน้าหลัก
      </button>
    </div>
  );
};

export default Users;
