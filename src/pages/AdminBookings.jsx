import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Spinner, Alert, Button, Dropdown } from 'react-bootstrap';
import { bookingsAPI } from '../services/api';
import { toast } from 'react-toastify';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingsAPI.getAll();
      setBookings(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await bookingsAPI.updateStatus(bookingId, status);
      toast.success(`Booking ${status} successfully!`);
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update booking status!');
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
          <h1>Manage Bookings</h1>
          <Button variant="outline-primary" onClick={fetchBookings}>
            Refresh
          </Button>
        </div>

        {bookings.length === 0 ? (
          <Alert variant="info">
            <h5>No Bookings Found</h5>
            <p>There are no flight bookings to manage.</p>
          </Alert>
        ) : (
          <Card>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Passenger</th>
                    <th>Flight</th>
                    <th>Route</th>
                    <th>Passengers</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Booked On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking._id}>
                      <td>
                        <small className="text-muted">
                          {booking._id.slice(-8).toUpperCase()}
                        </small>
                      </td>
                      <td>
                        <div>
                          <strong>{booking.passengerName}</strong>
                          <br />
                          <small>{booking.email}</small>
                          <br />
                          <small>{booking.contact}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{booking.flight?.flightName}</strong>
                          <br />
                          <Badge bg="secondary">{booking.flightNumber}</Badge>
                        </div>
                      </td>
                      <td>
                        {booking.from} → {booking.to}
                      </td>
                      <td>
                        {booking.totalPassengers}
                        {booking.assistanceRequired && (
                          <Badge bg="info" className="ms-1">Assistance</Badge>
                        )}
                      </td>
                      <td>
                        {formatCurrency(booking.totalAmount)}
                      </td>
                      <td>
                        <Badge bg={getStatusVariant(booking.status)}>
                          {booking.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td>
                        <small>{formatDate(booking.createdAt)}</small>
                      </td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-primary" size="sm" id="dropdown-basic">
                            Actions
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                            <Dropdown.Item
                              onClick={() => updateBookingStatus(booking._id, 'approved')}
                              disabled={booking.status === 'approved'}
                            >
                              Approve
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => updateBookingStatus(booking._id, 'rejected')}
                              disabled={booking.status === 'rejected'}
                            >
                              Reject
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => updateBookingStatus(booking._id, 'pending')}
                              disabled={booking.status === 'pending'}
                            >
                              Set Pending
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
};

export default AdminBookings;