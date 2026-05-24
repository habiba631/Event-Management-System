import client from './client';

export const createCheckoutSession = (data) => client.post('/payments/checkout', data);
export const getSessionStatus = (sessionId) => client.get(`/payments/session/${sessionId}`);
export const cancelSession = (sessionId) => client.post(`/payments/session/${sessionId}/cancel`);
export const getPaymentByBooking = (bookingId) => client.get(`/payments/booking/${bookingId}`);
