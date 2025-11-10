/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllUsers, deleteUser, updateUser } from '../../api/userService';
import { toast } from 'react-toastify';

const Users: React.FC = () => {
  const { user, accessToken } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [form, setForm] = useState({ userRole: '', isActive: true });

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError('Error al obtener usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.info('Usuario eliminado 🗑️');
    } catch {
      setError('No se pudo eliminar el usuario');
       toast.error('No se pudo eliminar el usuario ❌');
    }
  };

  const handleEdit = (u: any) => {
    setEditingUserId(u.id);
    setForm({
      userRole: u.userRole,
      isActive: u.isActive,
    });
  };

  const handleSave = async (id: number) => {
    try {
      await updateUser(id, form, accessToken!);
      setEditingUserId(null);
      fetchUsers();
      toast.success('Usuario actualizado correctamente 🎉');
    } catch {
      setError('Error al actualizar usuario');
      toast.error('Error al actualizar usuario ❌');
    }
  };

  if (user?.role !== 'admin') return <p>No tenés permisos.</p>;
  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="users">
      <h2 className="users__title">Usuarios registrados</h2>
      <table className="users__table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Activo</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.userName}</td>
              <td>{u.email}</td>

              <td>
                {editingUserId === u.id ? (
                  <select
                    value={form.userRole}
                    onChange={(e) =>
                      setForm({ ...form, userRole: e.target.value })
                    }
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  u.userRole
                )}
              </td>

              <td>
                {editingUserId === u.id ? (
                  <select
                    value={form.isActive ? 'true' : 'false'}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.value === 'true' })
                    }
                  >
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                ) : u.isActive ? (
                  'Sí'
                ) : (
                  'No'
                )}
              </td>

              <td>
                {editingUserId === u.id ? (
                  <>
                    <button
                      className="btn btn-save"
                      onClick={() => handleSave(u.id)}
                    >
                      Guardar
                    </button>
                    <button
                      className="btn btn-cancel"
                      onClick={() => setEditingUserId(null)}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-edit"
                      onClick={() => handleEdit(u)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => handleDelete(u.id)}
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
