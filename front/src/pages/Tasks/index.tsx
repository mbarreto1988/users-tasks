/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getAllTasks,
  createTask,
  deleteTask,
  updateTask,
} from "../../api/taskService";
import { getAllUsers } from "../../api/userService";
import { toast } from "react-toastify";

type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  userId: number;
  isActive: boolean;
};

const Tasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Task>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksData, usersData] = await Promise.all([
          getAllTasks(),
          user?.role === "admin" ? getAllUsers() : Promise.resolve([]),
        ]);

        const visibleTasks =
          user?.role === "admin"
            ? tasksData
            : tasksData.filter((t: Task) => t.userId === user?.id);

        setTasks(visibleTasks);
        setUsers(usersData);
      } catch (error) {
        console.error("Error al cargar tareas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const created = await createTask({
        ...newTask,
        status: "pending",
        priority: "medium",
        isActive: true,
        userId: user?.id, 
      });

      const createdTask = created.data ? created.data : created;
      const completeTask = { ...createdTask, userId: user?.id || createdTask.userId };

      setTasks((prev) => [completeTask, ...prev]);
      setNewTask({ title: "", description: "" });
      toast.success("Tarea creada correctamente ✅");
    } catch (err) {
      console.error("Error al crear tarea:", err);
      toast.error("Error al crear la tarea ❌");
    }
  };

  const handleDelete = async (task: Task) => {

    if (user?.role !== "admin" && task.userId !== user?.id) {
      toast.error("No podés eliminar tareas de otros usuarios ❌");
      return;
    }

    try {
      await deleteTask(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      toast.info("Tarea eliminada 🗑️");
    } catch {
      toast.error("Error al eliminar tarea ❌");
    }
  };

  const handleEdit = (task: Task) => {

    if (user?.role !== "admin" && task.userId !== user?.id) {
      toast.error("No podés editar tareas de otros usuarios ❌");
      return;
    }

    setEditingId(task.id);
    setEditData({ ...task });
  };

  const handleSave = async (id: number) => {
    try {
      await updateTask(id, editData);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...editData } : t))
      );
      setEditingId(null);
      toast.success("Tarea actualizada correctamente 🎉");
    } catch {
      toast.error("Error al actualizar tarea ❌");
    }
  };

  const getUserName = (userId: number) => {
    const found = users.find((u) => u.id === userId);
    return found ? found.userName : "—";
  };

  if (loading) return <p>Cargando tareas...</p>;

  return (
    <div className="tasks">
      <h2 className="tasks__title">
        {user?.role === "admin"
          ? "Todas las tareas"
          : `Mis tareas — ${user?.userName}`}
      </h2>


      <form className="tasks__form" onSubmit={handleAdd}>
        <input
          placeholder="Título"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        />
        <input
          placeholder="Descripción"
          value={newTask.description}
          onChange={(e) =>
            setNewTask({ ...newTask, description: e.target.value })
          }
        />
        <button type="submit">Agregar</button>
      </form>

      <table className="tasks__table">
        <thead>
          <tr>
            {user?.role === "admin" && <th>Usuario</th>}
            <th>Título</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Prioridad</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id}>
              {user?.role === "admin" && <td>{getUserName(t.userId)}</td>}

              <td>
                {editingId === t.id ? (
                  <input
                    value={editData.title || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, title: e.target.value })
                    }
                  />
                ) : (
                  t.title
                )}
              </td>

              <td>
                {editingId === t.id ? (
                  <input
                    value={editData.description || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        description: e.target.value,
                      })
                    }
                  />
                ) : (
                  t.description
                )}
              </td>

              <td>
                {editingId === t.id ? (
                  <select
                    value={editData.status || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, status: e.target.value })
                    }
                  >
                    <option value="pending">Pendiente</option>
                    <option value="done">Hecha</option>
                  </select>
                ) : (
                  <span className={`status status--${t.status}`}>
                    {t.status === "done" ? "Hecha" : "Pendiente"}
                  </span>
                )}
              </td>

              <td>
                {editingId === t.id ? (
                  <select
                    value={editData.priority || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, priority: e.target.value })
                    }
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                ) : (
                  <span className={`priority priority--${t.priority}`}>
                    {t.priority}
                  </span>
                )}
              </td>

              <td>
                {editingId === t.id ? (
                  <select
                    value={editData.isActive ? "true" : "false"}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        isActive: e.target.value === "true",
                      })
                    }
                  >
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                ) : t.isActive ? (
                  "Sí"
                ) : (
                  "No"
                )}
              </td>

              <td>
                {editingId === t.id ? (
                  <>
                    <button
                      className="btn btn-save"
                      onClick={() => handleSave(t.id)}
                    >
                      Guardar
                    </button>
                    <button
                      className="btn btn-cancel"
                      onClick={() => setEditingId(null)}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-edit"
                      onClick={() => handleEdit(t)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => handleDelete(t)}
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

export default Tasks;
