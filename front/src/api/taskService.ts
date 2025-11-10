import api from './axiosConfig';

export const getAllTasks = async () => {
  const { data } = await api.get('/tasks');
  return data.data;
};

export const getTaskById = async (id: number) => {
  const { data } = await api.get(`/tasks/${id}`);
  return data.data || data;
};

export const createTask = async (taskData: unknown) => {
  const { data } = await api.post('/tasks', taskData);
  return data;
};

export const updateTask = async (id: number, taskData: unknown) => {
  const { data } = await api.put(`/tasks/${id}`, taskData);
  return data;
};

export const deleteTask = async (id: number) => {
  const { data } = await api.delete(`/tasks/${id}`);
  return data;
};
