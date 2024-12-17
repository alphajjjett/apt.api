import React from 'react';
import { Navbar,Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NavigationBar = () => {
  return (
    <Navbar expand="lg" variant="dark" className="bg-gray-800">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard" className="text-white">
          Inter-Vehicle Booking
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto space-x-6">

          <NavDropdown title="โปรไฟล์" id="profile-dropdown" className="text-white hover:bg-gray-700 px-4 py-2 rounded-md">
              <NavDropdown.Item as={Link} to="/users" className="text-black hover:bg-gray-200">ข้อมูลส่วนตัว</NavDropdown.Item>
            </NavDropdown>
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
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;