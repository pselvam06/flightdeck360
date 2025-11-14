import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { flightsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Flights = () => {
  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    journeyDate: ''
  });
  
  const { user } = useAuth();

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      const response = await flightsAPI.getAll();
      setFlights(response.data);
      setFilteredFlights(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching flights:', error);
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const params = {};
      if (searchParams.from) params.from = searchParams.from;
      if (searchParams.to) params.to = searchParams.to;
      if (searchParams.journeyDate) params.journeyDate = searchParams.journeyDate;
      
      const response = await flightsAPI.getAll(params);
      setFilteredFlights(response.data);
    } catch (error) {
      console.error('Error searching flights:', error);
    }
    
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value
    });
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
          <h1>Available Flights</h1>
        </div>

        {/* Search Form */}
        <Card className="mb-4 flight-card">
          <Card.Body>
            <h5 className="card-title">Search Flights</h5>
            <Form onSubmit={handleSearch}>
              <Row className="g-3 align-items-end">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>From</Form.Label>
                    <Form.Control
                      type="text"
                      name="from"
                      value={searchParams.from}
                      onChange={handleInputChange}
                      placeholder="City or Airport"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>To</Form.Label>
                    <Form.Control
                      type="text"
                      name="to"
                      value={searchParams.to}
                      onChange={handleInputChange}
                      placeholder="City or Airport"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="journeyDate"
                      value={searchParams.journeyDate}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Button variant="primary" type="submit" className="w-100">
                    Search Flights
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {/* Flights List */}
        {filteredFlights.length === 0 ? (
          <Alert variant="info" className="text-center">
            <h5>No flights found</h5>
            <p>Try adjusting your search criteria</p>
            <Button 
              variant="outline-primary" 
              onClick={() => {
                setSearchParams({ from: '', to: '', journeyDate: '' });
                fetchFlights();
              }}
            >
              Clear Search
            </Button>
          </Alert>
        ) : (
          <Row>
            {filteredFlights.map(flight => (
              <Col md={6} lg={4} key={flight._id} className="mb-4">
                <Card className="flight-card h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="card-title mb-0">{flight.flightName}</h6>
                      <Badge bg="secondary">{flight.flightNumber}</Badge>
                    </div>
                    
                    <div className="mb-3">
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong>{flight.from}</strong>
                          <br />
                          <small className="text-muted">
                            {formatDate(flight.journeyDateTime)}
                          </small>
                        </div>
                        <div className="text-end">
                          <strong>{flight.to}</strong>
                          <br />
                          <small className="text-muted">
                            {flight.duration}
                          </small>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <small className="text-muted">
                        Seats: {flight.availableSeats}
                      </small>
                      <h5 className="text-primary mb-0">
                        {formatCurrency(flight.price)}
                      </h5>
                    </div>

                    {user ? (
                      <Button
                        as={Link}
                        to={`/book-flight/${flight._id}`}
                        variant="primary"
                        className="w-100"
                      >
                        Book Now
                      </Button>
                    ) : (
                      <Button
                        as={Link}
                        to="/login"
                        variant="outline-primary"
                        className="w-100"
                      >
                        Login to Book
                      </Button>
                    )}
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

export default Flights;