import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import Login from "../index";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axiosConfig";


jest.mock("../../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("../../../api/axiosConfig");


const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("not wrapped in act") ||
        args[0].includes("Warning:") ||
        args[0].includes("ReactDOM.render"))
    ) {
      return;
    }
    originalError(...args);
  };
});
afterAll(() => {
  console.error = originalError;
});

describe("Login Component", () => {
  const mockLogin = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ login: mockLogin });
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it("renderiza el formulario correctamente", () => {
    render(<Login />);

    expect(screen.getByText("Iniciar sesión")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Contraseña")).toBeInTheDocument();
  });

  it("realiza el login exitosamente", async () => {
    (api.post as jest.Mock).mockResolvedValue({
      data: {
        data: {
          tokens: { accessToken: "mockToken" },
          user: { id: 1, userName: "Mati", email: "mati@mail.com" },
        },
      },
    });

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "mati@mail.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
      target: { value: "123456" },
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Entrar"));
    });

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/login", {
        email: "mati@mail.com",
        password: "123456",
      });
      expect(mockLogin).toHaveBeenCalledWith("mockToken", {
        id: 1,
        userName: "Mati",
        email: "mati@mail.com",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("muestra error si las credenciales son incorrectas", async () => {
    (api.post as jest.Mock).mockRejectedValue({
      response: { data: { message: "Credenciales inválidas" } },
    });

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "mati@mail.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
      target: { value: "wrongpass" },
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Entrar"));
    });

    await waitFor(() => {
      expect(screen.getByText("Credenciales inválidas")).toBeInTheDocument();
    });
  });

  it("muestra mensaje genérico si no hay detalle de error", async () => {
    (api.post as jest.Mock).mockRejectedValue(new Error("Error al iniciar sesión"));

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "mati@mail.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
      target: { value: "123456" },
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Entrar"));
    });

    await waitFor(() => {
      expect(screen.getByText("Error al iniciar sesión")).toBeInTheDocument();
    });
  });
});
