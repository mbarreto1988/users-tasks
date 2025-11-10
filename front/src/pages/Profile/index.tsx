/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateUser } from "../../api/userService";

const Profile: React.FC = () => {
  const { user, setUser, accessToken } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    userName: user?.userName || "",
    email: user?.email || "",
    role: user?.role || "",
    currentPassword: "",
    newPassword: ""
  });

  if (!user) return <p>No hay usuario logueado.</p>;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload: any = {
        userName: form.userName,
        email: form.email,
        userRole: form.role
      };

      if (form.currentPassword && form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.password = form.newPassword;
      }

      await updateUser(user.id, payload, accessToken!);
      const updatedUser = {
        ...user,
        userName: form.userName,
        email: form.email,
        role: form.role  as "admin" | "user"
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      alert("✅ Perfil actualizado correctamente");

      setEditMode(false);
    } catch (err: any) {
      console.error("Error al actualizar:", err);
      alert(
        "❌ No se pudo actualizar el perfil: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  return (
    <div className="profile">
      <h2 className="profile__title">Perfil de {user.userName}</h2>

      {!editMode ? (
        <div className="profile__info">
          <p>
            <strong>Nombre de usuario:</strong> {user.userName}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Rol:</strong> {user.role}
          </p>

          <button
            className="profile__btn profile__btn--edit"
            onClick={() => setEditMode(true)}
          >
            Editar perfil
          </button>
        </div>
      ) : (
        <form className="profile__form" onSubmit={handleSave}>
          <label>Nombre de usuario</label>
          <input
            type="text"
            name="userName"
            value={form.userName}
            onChange={handleChange}
            placeholder="Nombre de usuario"
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
          />

          <label>Rol</label>
          {user.role === "admin" ? (
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          ) : (
            <input
              type="text"
              name="role"
              value={form.role}
              disabled
              placeholder="Rol"
            />
          )}

          <hr />

          <h4>Cambiar contraseña</h4>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            placeholder="Contraseña actual"
          />

          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            placeholder="Nueva contraseña"
          />

          <div className="profile__buttons">
            <button type="submit" className="profile__btn profile__btn--save">
              Guardar
            </button>
            <button
              type="button"
              className="profile__btn profile__btn--cancel"
              onClick={() => setEditMode(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Profile;
