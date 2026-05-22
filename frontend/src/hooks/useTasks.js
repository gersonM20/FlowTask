/**
 * hooks/useTasks.js — Estado asíncrono para la lista de tareas
 *
 * Encapsula el fetch de tareas y las operaciones CRUD locales.
 * Los componentes no necesitan saber nada de fetch, loading states ni API URLs.
 *
 * Patrón de actualización optimista-like:
 *  - createTask: inserta la nueva tarea al inicio de la lista local sin refetch
 *  - updateTask: reemplaza la tarea modificada en la lista local sin refetch
 *  - deleteTask: filtra la tarea eliminada de la lista local sin refetch
 *  Esto hace la UI sentirse instantánea; si el servidor falla, el error se propaga.
 *
 * Nota sobre la dependencia de fetchTasks:
 *  Se usa JSON.stringify(filters) como dependencia de useCallback porque React
 *  compara por referencia los objetos. Si se usara `filters` directamente,
 *  el efecto se ejecutaría en cada render aunque los filtros no cambiaran.
 *
 * Para extender:
 *  - Agregar paginación: pasar page/limit a tasksApi.getAll y manejar el total
 *  - Agregar ordenamiento: incluir sort/order en los filtros
 *  - Agregar caché: guardar los resultados en un Map keyed por JSON.stringify(filters)
 */

import { useState, useEffect, useCallback } from "react";
import { tasksApi } from "../services/api.js";

/**
 * Hook principal de tareas. Carga la lista según los filtros activos
 * y expone las operaciones CRUD.
 *
 * @param {object} filters - Filtros a aplicar: { status, priority, category_id, search }
 */
export function useTasks(filters = {}) {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

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
  // JSON.stringify permite detectar cambios en el contenido del objeto filters
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  // Re-ejecuta el fetch cada vez que cambian los filtros
  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  /** Crea una tarea en el servidor y la agrega al inicio de la lista local */
  const createTask = async (data) => {
    const created = await tasksApi.create(data);
    setTasks(prev => [created, ...prev]);
    return created;
  };

  /** Actualiza una tarea en el servidor y sincroniza la lista local */
  const updateTask = async (id, data) => {
    const updated = await tasksApi.update(id, data);
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  };

  /** Elimina una tarea del servidor y la quita de la lista local */
  const deleteTask = async (id) => {
    await tasksApi.remove(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return { tasks, loading, error, refetch: fetchTasks, createTask, updateTask, deleteTask };
}

/**
 * Hook separado para los KPIs del dashboard.
 * Se separa de useTasks para que los conteos puedan refrescarse
 * de forma independiente sin recargar toda la lista de tareas.
 */
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
