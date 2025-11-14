import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Table, 
  Badge, 
  Spinner, 
  Alert, 
  Modal, 
  Form,
  InputGroup
} from 'react-bootstrap';
import { flightsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const AdminFlights = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  const [flightData, setFlightData] = useState({
    flightNumber: '',
    flightName: '',
    from: '',
    to: '',
    journeyDateTime: '',
    price: '',
    duration: '',
    availableSeats: 180
  });

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      console.log('🛫 Fetching flights...');
      const response = await flightsAPI.getAll();
      setFlights(response.data);
      console.log('✅ Flights fetched:', response.data.length);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching flights:', error);
      toast.error('Failed to load flights');
      setLoading(false);
    }
  };

  const handleShowModal = (flight = null) => {
    if (flight) {
      setEditingFlight(flight);
      // Format date for datetime-local input
      const journeyDate = new Date(flight.journeyDateTime);
      const formattedDate = journeyDate.toISOString().slice(0, 16);
      
      setFlightData({
        flightNumber: flight.flightNumber,
        flightName: flight.flightName,
        from: flight.from,
        to: flight.to,
        journeyDateTime: formattedDate,
        price: flight.price.toString(),
        duration: flight.duration,
        availableSeats: flight.availableSeats
      });
    } else {
      setEditingFlight(null);
      setFlightData({
        flightNumber: '',
        flightName: '',
        from: '',
        to: '',
        journeyDateTime: '',
        price: '',
        duration: '',
        availableSeats: 180
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFlight(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFlightData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('📤 Submitting flight data:', flightData);
      
      if (editingFlight) {
        await flightsAPI.update(editingFlight._id, flightData);
        toast.success('Flight updated successfully!');
        console.log('✅ Flight updated');
      } else {
        await flightsAPI.create(flightData);
        toast.success('Flight created successfully!');
        console.log('✅ Flight created');
      }
      
      fetchFlights();
      handleCloseModal();
    } catch (error) {
      console.error('❌ Flight operation failed:', error);
      const errorMessage = error.response?.data?.message || 'Operation failed!';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (flightId) => {
    if (window.confirm('Are you sure you want to delete this flight? This action cannot be undone.')) {
      try {
        console.log('🗑️ Deleting flight:', flightId);
        await flightsAPI.delete(flightId);
        toast.success('Flight deleted successfully!');
        console.log('✅ Flight deleted');
        fetchFlights();
      } catch (error) {
        console.error('❌ Delete failed:', error);
        toast.error('Failed to delete flight!');
      }
    }
  };

  // Filter flights based on search term
  const filteredFlights = flights.filter(flight =>
    flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flight.flightName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flight.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flight.to.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getSeatStatusVariant = (seats) => {
    if (seats > 50) return 'success';
    if (seats > 10) return 'warning';
    return 'danger';
  };

  if (loading) {
    return (
      <div className="main-content">
        <Container className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading flights...</span>
          </Spinner>
        </Container>
      </div>
    );
  }

  return (
    <div className="main-content">
      <Container>
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1>Manage Flights</h1>
            <p className="text-muted">Create, edit, and manage flight schedules</p>
          </div>
          <Button variant="primary" onClick={() => handleShowModal()}>
            + Add New Flight
          </Button>
        </div>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3>{flights.length}</h3>
                <p className="text-muted mb-0">Total Flights</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-success">
                  {flights.filter(f => f.availableSeats > 50).length}
                </h3>
                <p className="text-muted mb-0">High Availability</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-warning">
                  {flights.filter(f => f.availableSeats <= 50 && f.availableSeats > 10).length}
                </h3>
                <p className="text-muted mb-0">Limited Seats</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-danger">
                  {flights.filter(f => f.availableSeats <= 10).length}
                </h3>
                <p className="text-muted mb-0">Almost Full</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Search and Filter */}
        <Card className="mb-4">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text>🔍</InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search flights by number, name, route..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={6} className="text-end">
                <Button 
                  variant="outline-secondary" 
                  onClick={fetchFlights}
                  disabled={loading}
                >
                  🔄 Refresh
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Flights Table */}
        {filteredFlights.length === 0 ? (
          <Alert variant="info" className="text-center">
            <h5>No Flights Found</h5>
            <p>
              {searchTerm ? 'No flights match your search criteria.' : 'Get started by adding your first flight.'}
            </p>
            {!searchTerm && (
              <Button variant="primary" onClick={() => handleShowModal()}>
                Add Your First Flight
              </Button>
            )}
          </Alert>
        ) : (
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                Flights ({filteredFlights.length} of {flights.length})
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Flight Details</th>
                      <th>Route</th>
                      <th>Departure</th>
                      <th>Price</th>
                      <th>Seats</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFlights.map(flight => (
                      <tr key={flight._id}>
                        <td>
                          <div>
                            <strong className="d-block">{flight.flightName}</strong>
                            <Badge bg="secondary" className="mt-1">{flight.flightNumber}</Badge>
                            <small className="d-block text-muted mt-1">
                              Duration: {flight.duration}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{flight.from}</strong>
                            <span className="mx-2">→</span>
                            <strong>{flight.to}</strong>
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{formatDate(flight.journeyDateTime)}</strong>
                          </div>
                        </td>
                        <td>
                          <strong className="text-primary">
                            {formatCurrency(flight.price)}
                          </strong>
                        </td>
                        <td>
                          <Badge bg={getSeatStatusVariant(flight.availableSeats)}>
                            {flight.availableSeats} seats
                          </Badge>
                        </td>
                        <td>
                          {flight.availableSeats > 50 ? (
                            <Badge bg="success">Available</Badge>
                          ) : flight.availableSeats > 0 ? (
                            <Badge bg="warning">Limited</Badge>
                          ) : (
                            <Badge bg="danger">Full</Badge>
                          )}
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleShowModal(flight)}
                              title="Edit Flight"
                            >
                              ✏️ Edit
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(flight._id)}
                              title="Delete Flight"
                            >
                              🗑️ Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Add/Edit Flight Modal */}
        <Modal show={showModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {editingFlight ? 'Edit Flight' : 'Add New Flight'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Flight Number *</Form.Label>
                    <Form.Control
                      type="text"
                      name="flightNumber"
                      value={flightData.flightNumber}
                      onChange={handleChange}
                      required
                      placeholder="e.g., AI-101"
                      autoComplete="off"
                    />
                    <Form.Text className="text-muted">
                      Unique flight identifier
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Flight Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="flightName"
                      value={flightData.flightName}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Air India Express"
                      autoComplete="off"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Departure City *</Form.Label>
                    <Form.Control
                      type="text"
                      name="from"
                      value={flightData.from}
                      onChange={handleChange}
                      required
                      placeholder="e.g., New York"
                      autoComplete="off"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Destination City *</Form.Label>
                    <Form.Control
                      type="text"
                      name="to"
                      value={flightData.to}
                      onChange={handleChange}
                      required
                      placeholder="e.g., London"
                      autoComplete="off"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Departure Date & Time *</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="journeyDateTime"
                      value={flightData.journeyDateTime}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Duration *</Form.Label>
                    <Form.Control
                      type="text"
                      name="duration"
                      value={flightData.duration}
                      onChange={handleChange}
                      placeholder="e.g., 2h 30m"
                      required
                      autoComplete="off"
                    />
                    <Form.Text className="text-muted">
                      Flight duration in hours and minutes
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Price (USD) *</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>$</InputGroup.Text>
                      <Form.Control
                        type="number"
                        name="price"
                        value={flightData.price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        required
                        autoComplete="off"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Available Seats *</Form.Label>
                    <Form.Control
                      type="number"
                      name="availableSeats"
                      value={flightData.availableSeats}
                      onChange={handleChange}
                      min="1"
                      max="500"
                      required
                      autoComplete="off"
                    />
                    <Form.Text className="text-muted">
                      Maximum seating capacity
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingFlight ? 'Update Flight' : 'Create Flight'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </div>
  );
};

export default AdminFlights;