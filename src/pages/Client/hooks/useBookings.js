import { useState, useEffect } from 'react';
import { getBookings } from '../services/bookingService';

export default function useBookings() {
  const [bookings, setBookings] = useState([
    {
      id: 1,
      bookingRef: 'BK-2026-001',
      serviceName: 'Cottage Rental',
      bookingDate: '2026-08-15',
      timeSlot: 'Morning',
      quantity: 1,
      totalPrice: 600,
      status: 'Confirmed',
    },
    {
      id: 2,
      bookingRef: 'BK-2026-002',
      serviceName: 'Swimming Pool',
      bookingDate: '2026-08-10',
      timeSlot: 'Afternoon',
      quantity: 4,
      totalPrice: 400,
      status: 'Completed',
    },
    {
      id: 3,
      bookingRef: 'BK-2026-003',
      serviceName: 'Room Booking',
      bookingDate: '2026-08-20',
      timeSlot: 'Whole Day',
      quantity: 1,
      totalPrice: 1500,
      status: 'Pending',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Uncomment when backend is ready:
    // const fetchBookings = async () => {
    //   try {
    //     setLoading(true);
    //     const response = await getBookings();
    //     setBookings(response.data);
    //   } catch (err) {
    //     setError(err.message);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchBookings();
  }, []);

  return { bookings, loading, error };
}