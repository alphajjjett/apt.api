import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';

const NavigationBar = () => {
  const [userRole, setUserRole] = useState(null);
  const isLoggedIn = localStorage.getItem('token');
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);

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
        setUserRole(decodedToken.role); 

        // ดึงรูปโปรไฟล์จาก token หรือ backend ถ้า token ไม่มีข้อมูลรูปภาพ
        const fetchProfileImage = async () => {
          try {
            const response = await axios.get(`/api/users/${decodedToken.id}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            });
            setProfileImage(response.data.profileImage); // สมมุติว่ามี field 'profileImage' ที่เก็บ URL ของรูปโปรไฟล์
          } catch (error) {
            console.error('Error fetching profile image:', error);
          }
        };

        if (decodedToken.profileImage) {
          setProfileImage(decodedToken.profileImage); // ถ้า token มีข้อมูลรูปโปรไฟล์
        } else {
          fetchProfileImage(); // ถ้าไม่มีรูปใน token, ไปดึงจาก backend
        }
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
                      src={profileImage ? profileImage : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                      alt="User"
                      className="rounded-full w-8 h-8 inline-block mr-2"
                    />
                  </span>
                }
                id="profile-dropdown"
                className="text-white hover:bg-gray-700 px-4 py-2 rounded-md"
              >
                {userRole === 'admin' ? (
                  <>
                    <NavDropdown.Item as={Link} to="/users" className="text-black hover:bg-gray-200">
                      ข้อมูลผู้ใช้
                    </NavDropdown.Item>
                  </>
                ) : (
                  <NavDropdown.Item as={Link} to="/users" className="text-black hover:bg-gray-200">
                    โปรไฟล์
                  </NavDropdown.Item>
                )}
                <NavDropdown.Item as={Link} to="/dashboard" className="text-black hover:bg-gray-200">
                  แดชบอร์ด
                </NavDropdown.Item>
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
