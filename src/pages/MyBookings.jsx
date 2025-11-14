import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { bookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingsAPI.getMyBookings();
      setBookings(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="main-content">
        <Container className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Container>
      </div>
    );
  }

  return (
    <div className="main-content">
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>My Bookings</h1>
          <Button variant="outline-primary" onClick={fetchBookings}>
            Refresh
          </Button>
        </div>

        {bookings.length === 0 ? (
          <Alert variant="info" className="text-center">
            <h5>No Bookings Found</h5>
            <p>You haven't made any flight bookings yet.</p>
            <Button variant="primary" href="/flights">
              Book a Flight
            </Button>
          </Alert>
        ) : (
          <Row>
            {bookings.map(booking => (
              <Col lg={6} key={booking._id} className="mb-4">
                <Card className="flight-card h-100">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <strong>{booking.flightNumber}</strong>
                    <Badge bg={getStatusVariant(booking.status)}>
                      {booking.status.toUpperCase()}
                    </Badge>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <h6 className="card-title">{booking.flight?.flightName}</h6>
                      <div className="text-muted small">
                        {formatDate(booking.journeyDate)}
                      </div>
                    </div>

                    <div className="mb-3">
                      <strong>Route:</strong> {booking.from} → {booking.to}
                    </div>

                    <div className="mb-3">
                      <strong>Passenger:</strong> {booking.passengerName}
                    </div>

                    <div className="mb-3">
                      <strong>Contact:</strong> {booking.contact}
                    </div>

                    <div className="mb-3">
                      <strong>Email:</strong> {booking.email}
                    </div>

                    <div className="mb-3">
                      <strong>Passengers:</strong> {booking.totalPassengers}
                    </div>

                    {booking.assistanceRequired && (
                      <div className="mb-3">
                        <Badge bg="info">Special Assistance Required</Badge>
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Total Amount:</strong>
                        <h5 className="text-primary mb-0">{formatCurrency(booking.totalAmount)}</h5>
                      </div>
                      <div className="text-end">
                        <div className="text-muted small">
                          Booked on {formatDate(booking.createdAt)}
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default MyBookings;