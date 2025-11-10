import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import Profile from "../index";
import { useAuth } from "../../../context/AuthContext";
import { updateUser } from "../../../api/userService";

jest.mock("../../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../../api/userService", () => ({
  updateUser: jest.fn(),
}));


const mockAlert = jest.fn();
global.alert = mockAlert;

const mockSetItem = jest.fn();
Object.defineProperty(window, "localStorage", {
  value: { setItem: mockSetItem },
});


const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      (
        args[0].includes("not wrapped in act") ||
        args[0].includes("Warning:") ||
        args[0].includes("Error al actualizar:")
      )
    ) {
      return;
    }
    originalError(...args);
  };
});
afterAll(() => {
  console.error = originalError;
});

describe("Profile Component", () => {
  const mockSetUser = jest.fn();
  const mockUser = {
    id: 1,
    userName: "Mati",
    email: "mati@mail.com",
    role: "admin",
  };
  const mockAccessToken = "fakeToken";

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      setUser: mockSetUser,
      accessToken: mockAccessToken,
    });
  });

  it("renderiza correctamente los datos del usuario", () => {
    render(<Profile />);
    expect(screen.getByText("Perfil de Mati")).toBeInTheDocument();
    expect(screen.getByText("Nombre de usuario:")).toBeInTheDocument();
    expect(screen.getByText("Email:")).toBeInTheDocument();
    expect(screen.getByText("Rol:")).toBeInTheDocument();
  });

  it("permite entrar en modo edición", () => {
    render(<Profile />);
    fireEvent.click(screen.getByText("Editar perfil"));
    expect(screen.getByPlaceholderText("Nombre de usuario")).toBeInTheDocument();
    expect(screen.getByText("Guardar")).toBeInTheDocument();
  });

  it("actualiza el perfil correctamente", async () => {
    (updateUser as jest.Mock).mockResolvedValue({});

    render(<Profile />);
    fireEvent.click(screen.getByText("Editar perfil"));

    fireEvent.change(screen.getByPlaceholderText("Nombre de usuario"), {
      target: { value: "Matias" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "nuevo@mail.com" },
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Guardar"));
    });

    await waitFor(() => {
      expect(updateUser).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          userName: "Matias",
          email: "nuevo@mail.com",
        }),
        mockAccessToken
      );
      expect(mockSetUser).toHaveBeenCalledWith(
        expect.objectContaining({
          userName: "Matias",
          email: "nuevo@mail.com",
        })
      );
      expect(mockAlert).toHaveBeenCalledWith("✅ Perfil actualizado correctamente");
      expect(mockSetItem).toHaveBeenCalled();
    });
  });

  it("muestra error si updateUser falla", async () => {
    (updateUser as jest.Mock).mockRejectedValue(new Error("Fallo al actualizar"));

    render(<Profile />);
    fireEvent.click(screen.getByText("Editar perfil"));

    await act(async () => {
      fireEvent.click(screen.getByText("Guardar"));
    });

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        expect.stringContaining("❌ No se pudo actualizar el perfil:")
      );
    });
  });

  it("muestra mensaje si no hay usuario logueado", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      setUser: mockSetUser,
      accessToken: mockAccessToken,
    });
    render(<Profile />);
    expect(screen.getByText("No hay usuario logueado.")).toBeInTheDocument();
  });
});
