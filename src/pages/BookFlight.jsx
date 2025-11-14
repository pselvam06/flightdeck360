import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { flightsAPI, bookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const BookFlight = () => {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [bookingData, setBookingData] = useState({
    flight: flightId,
    passengerName: user?.name || '',
    contact: user?.contactNumber || '',
    email: user?.email || '',
    totalPassengers: 1,
    assistanceRequired: false
  });

  useEffect(() => {
    fetchFlight();
  }, [flightId]);

  const fetchFlight = async () => {
    try {
      const response = await flightsAPI.getById(flightId);
      setFlight(response.data);
      setLoading(false);
    } catch (error) {
      setError('Flight not found');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await bookingsAPI.create(bookingData);
      toast.success('Booking submitted successfully!');
      navigate('/my-bookings');
    } catch (error) {
      setError(error.response?.data?.message || 'Booking failed');
      toast.error('Booking failed!');
    } finally {
      setSubmitting(false);
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

  if (!flight) {
    return (
      <div className="main-content">
        <Container>
          <Alert variant="danger">
            <h4>Flight Not Found</h4>
            <p>The flight you're trying to book doesn't exist.</p>
            <Button variant="primary" onClick={() => navigate('/flights')}>
              Back to Flights
            </Button>
          </Alert>
        </Container>
      </div>
    );
  }

  const totalAmount = flight.price * bookingData.totalPassengers;

  return (
    <div className="main-content">
      <Container>
        <Row className="justify-content-center">
          <Col lg={10}>
            <h1 className="mb-4">Book Flight</h1>
            
            <Row>
              {/* Flight Details */}
              <Col md={6}>
                <Card className="flight-card mb-4">
                  <Card.Header>
                    <h5 className="mb-0">Flight Details</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h6>{flight.flightName}</h6>
                        <Badge bg="secondary">{flight.flightNumber}</Badge>
                      </div>
                      <h5 className="text-primary">{formatCurrency(flight.price)}</h5>
                    </div>
                    
                    <div className="mb-3">
                      <strong>Route:</strong> {flight.from} → {flight.to}
                    </div>
                    
                    <div className="mb-3">
                      <strong>Departure:</strong> {formatDate(flight.journeyDateTime)}
                    </div>
                    
                    <div className="mb-3">
                      <strong>Duration:</strong> {flight.duration}
                    </div>
                    
                    <div className="mb-3">
                      <strong>Available Seats:</strong> {flight.availableSeats}
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Booking Form */}
              <Col md={6}>
                <Card className="flight-card">
                  <Card.Header>
                    <h5 className="mb-0">Passenger Details</h5>
                  </Card.Header>
                  <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Passenger Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="passengerName"
                          value={bookingData.passengerName}
                          onChange={handleChange}
                          required
                          placeholder="Enter passenger name"
                          autoComplete="name"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Contact Number *</Form.Label>
                        <Form.Control
                          type="tel"
                          name="contact"
                          value={bookingData.contact}
                          onChange={handleChange}
                          required
                          placeholder="Enter contact number"
                          autoComplete="tel"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Email Address *</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={bookingData.email}
                          onChange={handleChange}
                          required
                          placeholder="Enter email address"
                          autoComplete="email"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Number of Passengers *</Form.Label>
                        <Form.Select
                          name="totalPassengers"
                          value={bookingData.totalPassengers}
                          onChange={handleChange}
                          required
                        >
                          {[...Array(Math.min(flight.availableSeats, 10)).keys()].map(num => (
                            <option key={num + 1} value={num + 1}>
                              {num + 1} Passenger{num + 1 > 1 ? 's' : ''}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Text className="text-muted">
                          Maximum {flight.availableSeats} seats available
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Check
                          type="checkbox"
                          name="assistanceRequired"
                          label="I require special assistance"
                          checked={bookingData.assistanceRequired}
                          onChange={handleChange}
                        />
                      </Form.Group>

                      {/* Price Summary */}
                      <Card className="bg-light mb-4">
                        <Card.Body>
                          <h6>Price Summary</h6>
                          <div className="d-flex justify-content-between">
                            <span>{bookingData.totalPassengers} x {formatCurrency(flight.price)}</span>
                            <strong>{formatCurrency(totalAmount)}</strong>
                          </div>
                        </Card.Body>
                      </Card>

                      <div className="d-grid gap-2">
                        <Button
                          variant="primary"
                          type="submit"
                          size="lg"
                          disabled={submitting}
                        >
                          {submitting ? 'Processing...' : `Confirm Booking - ${formatCurrency(totalAmount)}`}
                        </Button>
                        <Button
                          variant="outline-secondary"
                          onClick={() => navigate('/flights')}
                        >
                          Cancel
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BookFlight;