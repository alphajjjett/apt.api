import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

const NavigationBar = () => {
  const [userRole, setUserRole] = useState(null);
  const isLoggedIn = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserRole(decodedToken.role);  // Set the role based on the token
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }
  }, []);

  return (
    <Navbar expand="lg" variant="dark" className="bg-gray-800">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard" className="text-white flex items-center space-x-3">
          <img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Flowbite Logo" />
          <span className="text-2xl font-semibold">Inter-Vehicle Booking</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {isLoggedIn && (
            <Nav className="ml-auto flex items-center space-x-6">
              <Nav.Link as={Link} to="/dashboard" className="text-white hover:bg-gray-700 px-4 py-2 rounded-md">
                หน้าหลัก
              </Nav.Link>

              <NavDropdown title="ภารกิจ" id="missions-dropdown" className="text-white hover:bg-gray-700 px-4 py-2 rounded-md">
                <NavDropdown.Item as={Link} to="/missionslist" className="text-black hover:bg-gray-200">ข้อมูลภารกิจ</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/missions" className="text-black hover:bg-gray-200">สร้างภารกิจ</NavDropdown.Item>
              </NavDropdown>

              <NavDropdown title="รถ" id="vehicle-dropdown" className="text-white hover:bg-gray-700 px-4 py-2 rounded-md">
                <NavDropdown.Item as={Link} to="/vehicle" className="text-black hover:bg-gray-200">ข้อมูลรถ</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/vehicle-status" className="text-black hover:bg-gray-200">สถานะรถ</NavDropdown.Item>
              </NavDropdown>

              <NavDropdown title="จองรถ" id="booking-dropdown" className="text-white hover:bg-gray-700 px-4 py-2 rounded-md">
                <NavDropdown.Item as={Link} to="/booking" className="text-black hover:bg-gray-200">จองรถ</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/booking-status" className="text-black hover:bg-gray-200">สถานะการจองรถ</NavDropdown.Item>
              </NavDropdown>

              <NavDropdown title="คืนรถ" id="return-dropdown" className="text-white hover:bg-gray-700 px-4 py-2 rounded-md">
                <NavDropdown.Item as={Link} to="/return" className="text-black hover:bg-gray-200">คืนรถที่จอง</NavDropdown.Item>
              </NavDropdown>

              <NavDropdown
                title={
                  <span>
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                      alt="User"
                      className="rounded-full w-8 h-8 inline-block mr-2"
                    />
                  </span>
                }
                id="profile-dropdown"
                className="text-white hover:bg-gray-700 px-4 py-2 rounded-md"
              >
                {/* Conditional rendering of profile text based on role */}
                <NavDropdown.Item as={Link} to={userRole === 'admin' ? '/users' : '/users'} className="text-black hover:bg-gray-200">
                  {userRole === 'admin' ? 'ข้อมูลผู้ใช้' : 'โปรไฟล์'}
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/dashboard" className="text-black hover:bg-gray-200">แดชบอร์ด</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout} className="text-black hover:bg-gray-200">
                  ออกจากระบบ
                </NavDropdown.Item>
              </NavDropdown>

            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
