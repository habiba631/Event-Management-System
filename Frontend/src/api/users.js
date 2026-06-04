import client from './client';

export const getAllUsers = () => client.get('/users');
export const deleteUser = (id) => client.delete(`/users/${id}`);
export const updateSelf = (data) => client.put('/users/me', data);

export const uploadProfilePicture = (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  return client.post('/users/me/profile-picture', formData);
};

export const uploadTaxRegistry = (file) => {
  const formData = new FormData();
  formData.append('taxRegistry', file);
  return client.post('/users/me/tax-registry', formData);
};
