import client from './client';

export const getAdminStats = () => client.get('/admin/stats');
