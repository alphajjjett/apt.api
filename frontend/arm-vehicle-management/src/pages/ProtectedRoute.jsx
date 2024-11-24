import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/" replace />; // ถ้าไม่มี token นำไปที่หน้า login
  }

  return children;  // ถ้ามี token ให้แสดง children ปกติ
};

export default ProtectedRoute;
