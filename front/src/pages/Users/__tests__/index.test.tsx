import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useAuth } from "../../../context/AuthContext";
import { getAllUsers, deleteUser, updateUser } from "../../../api/userService";
import Users from "..";


beforeAll(() => {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("not wrapped in act") ||
        args[0].includes("Warning:") ||
        args[0].includes("ReactDOM.render"))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});


jest.mock("../../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../../api/userService", () => ({
  getAllUsers: jest.fn(),
  deleteUser: jest.fn(),
  updateUser: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe("Users Component", () => {
  const mockUsers = [
    {
      id: 1,
      userName: "Mati",
      email: "mati@mail.com",
      userRole: "user",
      isActive: true,
    },
    {
      id: 2,
      userName: "Lucia",
      email: "lucia@mail.com",
      userRole: "admin",
      isActive: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza correctamente la tabla de usuarios", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: "admin" },
      accessToken: "token",
    });
    (getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

    render(<Users />);

    expect(screen.getByText("Cargando...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Usuarios registrados")).toBeInTheDocument();
      expect(screen.getByText("Mati")).toBeInTheDocument();
      expect(screen.getByText("Lucia")).toBeInTheDocument();
    });
  });

  it("muestra mensaje de permiso denegado si no es admin", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { role: "user" } });

    render(<Users />);
    expect(screen.getByText("No tenés permisos.")).toBeInTheDocument();
  });

  it("permite editar un usuario", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: "admin" },
      accessToken: "token",
    });
    (getAllUsers as jest.Mock).mockResolvedValue(mockUsers);
    (updateUser as jest.Mock).mockResolvedValue({});

    render(<Users />);

    await waitFor(() => screen.getByText("Mati"));

    const editButton = screen.getAllByText("Editar")[0];
    fireEvent.click(editButton);

    const saveButton = screen.getByText("Guardar");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateUser).toHaveBeenCalled();
    });
  });

  it("permite eliminar un usuario", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: "admin" },
      accessToken: "token",
    });
    (getAllUsers as jest.Mock).mockResolvedValue(mockUsers);
    (deleteUser as jest.Mock).mockResolvedValue({});

    render(<Users />);

    await waitFor(() => screen.getByText("Lucia"));

    const deleteButton = screen.getAllByText("Eliminar")[1];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteUser).toHaveBeenCalledWith(2);
    });
  });
});
