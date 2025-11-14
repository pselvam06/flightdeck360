import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="main-content">
      {/* Hero Section */}
      <div className="hero-section text-center text-white mb-5 py-5">
        <Container>
          <h1 className="display-4 fw-bold">✈️ FlightDeck360</h1>
          <p className="lead">Your Ultimate Flight Booking Experience</p>
          <p className="mb-4">
            Book flights, manage your bookings, and explore amazing destinations with our easy-to-use platform.
          </p>
          
          {!user ? (
            <div>
              <Button 
                as={Link} 
                to="/register" 
                variant="light" 
                size="lg" 
                className="me-3"
              >
                Get Started
              </Button>
              <Button 
                as={Link} 
                to="/flights" 
                variant="outline-light" 
                size="lg"
              >
                Browse Flights
              </Button>
            </div>
          ) : (
            <Button 
              as={Link} 
              to="/flights" 
              variant="light" 
              size="lg"
            >
              Book a Flight
            </Button>
          )}
        </Container>
      </div>

      {/* Features Section */}
      <Container>
        <Row className="g-4">
          <Col md={4}>
            <Card className="h-100 flight-card text-center">
              <Card.Body>
                <div className="fs-1 mb-3">🎫</div>
                <Card.Title>Easy Booking</Card.Title>
                <Card.Text>
                  Search and book flights in just a few clicks with our intuitive booking system.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="h-100 flight-card text-center">
              <Card.Body>
                <div className="fs-1 mb-3">📱</div>
                <Card.Title>Real-time Status</Card.Title>
                <Card.Text>
                  Track your booking status in real-time and receive instant updates.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="h-100 flight-card text-center">
              <Card.Body>
                <div className="fs-1 mb-3">🔒</div>
                <Card.Title>Secure & Reliable</Card.Title>
                <Card.Text>
                  Your data is protected with enterprise-grade security measures.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;