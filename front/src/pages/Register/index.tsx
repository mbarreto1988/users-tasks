/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import { toast } from "react-toastify";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.firstName ||
      !form.lastName ||
      !form.userName ||
      !form.email ||
      !form.password
    ) {
      toast.error("Completá todos los campos ⚠️");
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post("/auth/register", form);

      toast.success(`Usuario ${data?.data?.user?.userName} registrado 🎉`);
      navigate("/login");
    } catch (err: any) {
      console.error("Error al registrar usuario:", err);
      toast.error("No se pudo registrar el usuario ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register">
      <h2 className="register__title">Crear cuenta</h2>
      <form className="register__form" onSubmit={handleSubmit}>
        <label htmlFor="firstName">Nombre</label>
        <input
          id="firstName"
          name="firstName"
          placeholder="Tu nombre"
          onChange={handleChange}
        />

        <label htmlFor="lastName">Apellido</label>
        <input
          id="lastName"
          name="lastName"
          placeholder="Tu apellido"
          onChange={handleChange}
        />

        <label htmlFor="userName">Nombre de usuario</label>
        <input
          id="userName"
          name="userName"
          placeholder="Usuario (ej: Matu)"
          onChange={handleChange}
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="tuemail@mail.com"
          onChange={handleChange}
        />

        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="********"
          onChange={handleChange}
        />

        <button type="submit" className="register__btn" disabled={loading}>
          {loading ? "Registrando..." : "Registrarme"}
        </button>
      </form>
    </div>
  );
};

export default Register;
