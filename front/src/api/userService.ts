/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './axiosConfig';

// 🔹 Obtener todos los usuarios
export const getAllUsers = async () => {
  const { data } = await api.get('/users');
  return data.data;
};

// 🔹 Obtener un usuario por ID
export const getUserById = async (id: number) => {
  const { data } = await api.get(`/users/${id}`);
  return data.data || data;
};

// 🔹 Crear usuario
export const createUser = async (userData: unknown) => {
  const { data } = await api.post('/users', userData);
  return data;
};

// 🔹 Actualizar usuario (usa el mismo axiosConfig)
export const updateUser = async (id: number, data: any, token: string) => {
  const res = await api.patch(`/users/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return res.data;
};

// 🔹 Eliminar usuario
export const deleteUser = async (id: number) => {
  const { data } = await api.delete(`/users/${id}`);
  return data;
};
