import client from './client';

export const createBooking = (data) => client.post('/bookings', data);
export const getAllBookings = (params) => client.get('/bookings', { params });
export const updateBooking = (id, data) => client.put(`/bookings/${id}`, data);
export const deleteBooking = (id) => client.delete(`/bookings/${id}`);
