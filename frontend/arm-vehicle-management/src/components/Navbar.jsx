import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';

const NavigationBar = () => {
  const isLoggedIn = localStorage.getItem('token');
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  // const [showMissionsDropdown, setShowMissionsDropdown] = useState(false);
  // const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  // const [showReturnDropdown, setShowReturnDropdown] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // เพิ่มตัวแปร isAdmin

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

        // ตั้งค่า isAdmin ถ้า role เป็น admin
        setIsAdmin(decodedToken.role === 'admin'); 

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
          <img src="./logo/logo.png" className="h-14" alt="apd5 logo" />
          <span className="text-2xl font-semibold">ระบบจองรถการปฏิบัติราชการ</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {isLoggedIn && (
            <Nav className="ml-auto flex items-center space-x-6">
              <Nav.Link as={Link} to="/dashboard" className="text-white hover:bg-gray-700 px-4 py-2 rounded-md">
                หน้าหลัก
              </Nav.Link>
              
            <NavDropdown
                title="ภารกิจ"
                id="missions-dropdown"
                className="text-white hover:bg-gray-700 px-4 py-2 rounded-md"
                // onMouseEnter={() => setShowMissionsDropdown(true)}
                // onMouseLeave={() => setShowMissionsDropdown(false)}
                // show={showMissionsDropdown}
              >
                <NavDropdown.Item as={Link} to="/missionslist" className="text-black hover:bg-gray-200">
                  ข้อมูลภารกิจ
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/missions" className="text-black hover:bg-gray-200">
                  สร้างภารกิจ
                </NavDropdown.Item>
            </NavDropdown>

              <NavDropdown
                title="รถ"
                id="vehicle-dropdown"
                className="text-white hover:bg-gray-700 px-4 py-2 rounded-md"
                // onMouseEnter={() => setShowVehicleDropdown(true)}
                // onMouseLeave={() => setShowVehicleDropdown(false)}
                // show={showVehicleDropdown}
              >
                {isAdmin && (
                <NavDropdown.Item as={Link} to="/create-vehicle" className="text-black hover:bg-gray-200">เพิ่มข้อมูลรถ</NavDropdown.Item>
                )}
                <NavDropdown.Item as={Link} to="/vehicle" className="text-black hover:bg-gray-200">ข้อมูลรถ</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/maintenance" className="text-black hover:bg-gray-200">ข้อมูลซ่อมบำรุง</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/fuel" className="text-black hover:bg-gray-200">ข้อมูลการเบิกน้ำมัน</NavDropdown.Item>
              </NavDropdown>

              <NavDropdown
              title="คืนรถ"
              id="return-dropdown"
              className="text-white hover:bg-gray-700 px-4 py-2 rounded-md"
              // onMouseEnter={() => setShowReturnDropdown(true)}
              // onMouseLeave={() => setShowReturnDropdown(false)}
              // show={showReturnDropdown}
            >
                <NavDropdown.Item as={Link} to="/return" className="text-black hover:bg-gray-200">ข้อมูลการคืนรถ</NavDropdown.Item>
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
                {isAdmin ? (
                  <NavDropdown.Item as={Link} to="/users" className="text-black hover:bg-gray-200">
                    ข้อมูลผู้ใช้
                  </NavDropdown.Item>
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
