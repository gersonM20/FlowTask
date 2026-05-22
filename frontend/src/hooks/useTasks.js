import { useState, useEffect, useCallback } from "react";
import { tasksApi } from "../services/api.js";

// Hook principal para gestión de tareas.
// Encapsula fetch, estados de carga/error y las operaciones CRUD,
// para que el componente Dashboard no mezcle lógica de datos con lógica de UI.
export function useTasks(filters = {}) {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // useCallback con JSON.stringify(filters) como dependencia para que React
  // detecte cambios en el objeto filters aunque sea una referencia nueva
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tasksApi.getAll(filters);
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      // finally garantiza que loading vuelve a false incluso si hay error
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  // Re-ejecuta fetchTasks cada vez que cambien los filtros
  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Crea una tarea y la añade al principio de la lista local (optimistic-like update)
  const createTask = async (data) => {
    const created = await tasksApi.create(data);
    setTasks(prev => [created, ...prev]);
    return created;
  };

  // Actualiza una tarea en la lista local sin necesidad de recargar todo
  const updateTask = async (id, data) => {
    const updated = await tasksApi.update(id, data);
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  };

  // Elimina la tarea del estado local tras confirmar el borrado en el servidor
  const deleteTask = async (id) => {
    await tasksApi.remove(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return { tasks, loading, error, refetch: fetchTasks, createTask, updateTask, deleteTask };
}

// Hook separado para los KPIs del dashboard.
// Los stats se cargan de forma independiente para poder refrescarlos
// sin recargar la lista completa de tareas.
export function useTaskStats() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tasksApi.getStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
