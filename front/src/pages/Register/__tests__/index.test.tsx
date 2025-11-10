import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import Register from "../index";
import api from "../../../api/axiosConfig";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";


jest.mock("../../../api/axiosConfig");
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));


const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      (
        args[0].includes("not wrapped in act") ||
        args[0].includes("Warning:") ||
        args[0].includes("Error al registrar usuario")
      )
    ) {
      return; 
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

describe("Register Component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it("muestra error si hay campos vacíos", async () => {
    render(<Register />);

    fireEvent.click(screen.getByText("Registrarme"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Completá todos los campos ⚠️");
    });
  });

  it("registra correctamente al usuario", async () => {
    (api.post as jest.Mock).mockResolvedValue({
      data: {
        data: {
          user: { userName: "Matu" },
        },
      },
    });

    render(<Register />);

    fireEvent.change(screen.getByPlaceholderText("Tu nombre"), {
      target: { value: "Matias" },
    });
    fireEvent.change(screen.getByPlaceholderText("Tu apellido"), {
      target: { value: "Barreto" },
    });
    fireEvent.change(screen.getByPlaceholderText("Usuario (ej: Matu)"), {
      target: { value: "Matu" },
    });
    fireEvent.change(screen.getByPlaceholderText("tuemail@mail.com"), {
      target: { value: "matias@mail.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("********"), {
      target: { value: "123456" },
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Registrarme"));
    });

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/register", {
        firstName: "Matias",
        lastName: "Barreto",
        userName: "Matu",
        email: "matias@mail.com",
        password: "123456",
      });
      expect(toast.success).toHaveBeenCalledWith("Usuario Matu registrado 🎉");
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  it("muestra error si la API falla", async () => {
    (api.post as jest.Mock).mockRejectedValue(new Error("Fallo"));

    render(<Register />);

    fireEvent.change(screen.getByPlaceholderText("Tu nombre"), {
      target: { value: "Matias" },
    });
    fireEvent.change(screen.getByPlaceholderText("Tu apellido"), {
      target: { value: "Barreto" },
    });
    fireEvent.change(screen.getByPlaceholderText("Usuario (ej: Matu)"), {
      target: { value: "Matu" },
    });
    fireEvent.change(screen.getByPlaceholderText("tuemail@mail.com"), {
      target: { value: "matias@mail.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("********"), {
      target: { value: "123456" },
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Registrarme"));
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "No se pudo registrar el usuario ❌"
      );
    });
  });
});
