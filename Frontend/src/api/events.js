import client from './client';

export const getAllEvents = (params) => client.get('/events', { params });
export const getEventById = (id) => client.get(`/events/${id}`);
export const createEvent = (data) => client.post('/events', data);
export const updateEvent = (id, data) => client.put(`/events/${id}`, data);
export const deleteEvent = (id) => client.delete(`/events/${id}`);
