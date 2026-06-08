import client from './client';

export const createReview = (data) => client.post('/reviews', data);
export const getEventReviews = (eventId) => client.get(`/reviews/event/${eventId}`);
export const getMyReviews = () => client.get('/reviews/my');
export const updateReview = (id, data) => client.put(`/reviews/${id}`, data);
export const deleteReview = (id) => client.delete(`/reviews/${id}`);
