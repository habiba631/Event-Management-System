import client from './client';

export const updateSelf = (data) => client.put('/users/me', data);
