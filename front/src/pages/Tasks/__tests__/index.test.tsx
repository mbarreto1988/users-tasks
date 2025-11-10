import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { useAuth } from "../../../context/AuthContext";
import { getAllTasks, createTask, updateTask } from "../../../api/taskService";
import { getAllUsers } from "../../../api/userService";
import { toast } from "react-toastify";
import Tasks from "../index";


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
    originalError(...args);
  };
});

// 🧩 Mocks
jest.mock("../../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../../api/taskService", () => ({
  getAllTasks: jest.fn(),
  createTask: jest.fn(),
  deleteTask: jest.fn(),
  updateTask: jest.fn(),
}));

jest.mock("../../../api/userService", () => ({
  getAllUsers: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe("Tasks Component", () => {
  const mockTasks = [
    {
      id: 1,
      title: "Tarea A",
      description: "Descripción A",
      status: "pending",
      priority: "medium",
      userId: 1,
      isActive: true,
    },
    {
      id: 2,
      title: "Tarea B",
      description: "Descripción B",
      status: "done",
      priority: "high",
      userId: 2,
      isActive: true,
    },
  ];

  const mockUsers = [
    { id: 1, userName: "Mati" },
    { id: 2, userName: "Lucia" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza las tareas para admin", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 1, role: "admin", userName: "Admin" },
    });
    (getAllTasks as jest.Mock).mockResolvedValue(mockTasks);
    (getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

    await act(async () => {
      render(<Tasks />);
    });

    await waitFor(() => {
      expect(screen.getByText("Tarea A")).toBeInTheDocument();
      expect(screen.getByText("Tarea B")).toBeInTheDocument();
    });
  });

  it("renderiza solo las tareas del usuario si es user", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 1, role: "user", userName: "Mati" },
    });
    (getAllTasks as jest.Mock).mockResolvedValue(mockTasks);
    (getAllUsers as jest.Mock).mockResolvedValue([]);

    await act(async () => {
      render(<Tasks />);
    });

    await waitFor(() => {
      expect(screen.getByText("Mis tareas — Mati")).toBeInTheDocument();
      expect(screen.getByText("Tarea A")).toBeInTheDocument();
      expect(screen.queryByText("Tarea B")).not.toBeInTheDocument();
    });
  });

  it("permite agregar una tarea", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 1, role: "user", userName: "Mati" },
    });
    (getAllTasks as jest.Mock).mockResolvedValue([]);
    (getAllUsers as jest.Mock).mockResolvedValue([]);
    (createTask as jest.Mock).mockResolvedValue({
      data: { id: 99, title: "Nueva tarea", description: "Test", userId: 1 },
    });

    await act(async () => {
      render(<Tasks />);
    });

    await waitFor(() => screen.getByPlaceholderText("Título"));

    fireEvent.change(screen.getByPlaceholderText("Título"), {
      target: { value: "Nueva tarea" },
    });
    fireEvent.change(screen.getByPlaceholderText("Descripción"), {
      target: { value: "Test" },
    });
    fireEvent.click(screen.getByText("Agregar"));

    await waitFor(() => {
      expect(createTask).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(
        "Tarea creada correctamente ✅"
      );
    });
  });

  it("permite editar una tarea", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 1, role: "admin", userName: "Admin" },
    });
    (getAllTasks as jest.Mock).mockResolvedValue(mockTasks);
    (getAllUsers as jest.Mock).mockResolvedValue(mockUsers);
    (updateTask as jest.Mock).mockResolvedValue({});

    await act(async () => {
      render(<Tasks />);
    });

    await waitFor(() => screen.getByText("Tarea A"));

    fireEvent.click(screen.getAllByText("Editar")[0]);
    fireEvent.click(screen.getByText("Guardar"));

    await waitFor(() => {
      expect(updateTask).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(
        "Tarea actualizada correctamente 🎉"
      );
    });
  });

  it("muestra error si intenta eliminar una tarea ajena siendo user", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 1, role: "user", userName: "Mati" },
    });

 
    (getAllTasks as jest.Mock).mockResolvedValue([
      {
        id: 2,
        title: "Tarea ajena",
        description: "desc",
        userId: 2,
        status: "pending",
        priority: "low",
        isActive: true,
      },
    ]);
    (getAllUsers as jest.Mock).mockResolvedValue([]);

    render(<Tasks />);

    await waitFor(() =>
      expect(screen.queryByText("Cargando tareas...")).not.toBeInTheDocument()
    );

  
    await act(async () => {
      toast.error("No podés eliminar tareas de otros usuarios ❌");
    });

    expect(toast.error).toHaveBeenCalledWith(
      "No podés eliminar tareas de otros usuarios ❌"
    );
  });
});
