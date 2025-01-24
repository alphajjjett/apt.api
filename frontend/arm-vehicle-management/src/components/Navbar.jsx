import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import Swal from 'sweetalert2'; // Import Swal

const NavigationBar = () => {
  const isLoggedIn = localStorage.getItem('token');
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogout = () => {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการออกจากระบบใช่ไหม?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ใช่, ออกจากระบบ!',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        navigate('/');
        window.location.reload();
        Swal.fire(
          'ออกจากระบบแล้ว!',
          'คุณได้ออกจากระบบเรียบร้อยแล้ว',
          'success'
        );
      }
    });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setIsAdmin(decodedToken.role === 'admin');

        const fetchProfileImage = async () => {
          try {
            const response = await axios.get(`/api/users/${decodedToken.id}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            });
            setProfileImage(response.data.profileImage);
          } catch (error) {
            console.error('Error fetching profile image:', error);
          }
        };

        if (decodedToken.profileImage) {
          setProfileImage(decodedToken.profileImage);
        } else {
          fetchProfileImage();
        }
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }
  }, []);

  return (
    <Navbar expand="lg" variant="dark" className="bg-gray-800 font-noto">
      <Container>
        <Navbar.Brand
          as={isLoggedIn ? Link : 'span'} // ถ้าไม่มี token จะไม่เป็นลิงก์
          to={isLoggedIn ? "/main" : "#"} // ถ้าไม่มี token จะไม่ไปที่ /main
          className="text-white flex items-center space-x-3"
        >
          <img src="./logo/logo.png" className="h-14" alt="apd5 logo" />
          <div className="flex flex-col items-start">
            <span className="text-2xl font-semibold">ระบบจองรถการปฏิบัติราชการ</span>
            <span className="text-sm">กองโรงงานสรรพาวุธ 5</span>
          </div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {isLoggedIn && (
            <Nav className="ml-auto flex items-center space-x-6">
              <Nav.Link as={Link} to="/main" className="text-white hover:bg-gray-700 px-4 py-2 rounded-md">
                หน้าหลัก
              </Nav.Link>

              <NavDropdown
                title="ภารกิจ"
                id="missions-dropdown"
                className="text-white hover:bg-gray-700 px-4 py-2 rounded-md"
              >
                {!isAdmin && (
                  <NavDropdown.Item as={Link} to="/missions" className="text-black hover:bg-gray-200">
                    สร้างข้อมูลการจองรถ
                  </NavDropdown.Item>
                )}
                <NavDropdown.Item as={Link} to="/missionslist" className="text-black hover:bg-gray-200">
                  ข้อมูลการจอง
                </NavDropdown.Item>
              </NavDropdown>

              <NavDropdown
                title="รถ"
                id="vehicle-dropdown"
                className="text-white hover:bg-gray-700 px-4 py-2 rounded-md"
              >
                {isAdmin && (
                  <NavDropdown.Item as={Link} to="/create-vehicle" className="text-black hover:bg-gray-200">เพิ่มข้อมูลรถ</NavDropdown.Item>
                )}
                <NavDropdown.Item as={Link} to="/vehicle" className="text-black hover:bg-gray-200">ข้อมูลรถ</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/maintenance" className="text-black hover:bg-gray-200">ข้อมูลซ่อมบำรุง</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/fuel" className="text-black hover:bg-gray-200">ข้อมูลการเบิกเชื้อเพลิง</NavDropdown.Item>
              </NavDropdown>

              <NavDropdown
                title="คืนรถ"
                id="return-dropdown"
                className="text-white hover:bg-gray-700 px-4 py-2 rounded-md"
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
                {isAdmin && (
                  <NavDropdown.Item as={Link} to="/dashboard" className="text-black hover:bg-gray-200">
                    แดชบอร์ด
                  </NavDropdown.Item>
                )}
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
