import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const NavigationBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          ✈️ FlightDeck360
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/flights">Flights</Nav.Link>
            
            {user && user.role === 'passenger' && (
              <Nav.Link as={Link} to="/my-bookings">My Bookings</Nav.Link>
            )}
            
            {user && user.role === 'admin' && (
              <>
                <Nav.Link as={Link} to="/admin/flights">Manage Flights</Nav.Link>
                <Nav.Link as={Link} to="/admin/bookings">Manage Bookings</Nav.Link>
              </>
            )}
          </Nav>
          
          <Nav>
            {user ? (
              <NavDropdown title={`Welcome, ${user.name}`} id="user-dropdown">
                <NavDropdown.ItemText>
                  <small>{user.email} ({user.role})</small>
                </NavDropdown.ItemText>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;