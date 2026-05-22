/**
 * hooks/useCategories.js — Carga la lista de categorías
 *
 * Las categorías se cargan una sola vez al montar el componente porque
 * cambian con muy poca frecuencia comparado con las tareas.
 *
 * Para extender:
 *  - Agregar refetch manual si se crean categorías desde el mismo componente
 *  - Agregar createCategory / deleteCategory si se necesita CRUD inline
 */

import { useState, useEffect } from "react";
import { categoriesApi } from "../services/api.js";

/**
 * @returns {{ categories: Array, loading: boolean }}
 */
export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    categoriesApi.getAll()
      .then(setCategories)
      .catch(console.error)           // error no crítico: los selects quedan vacíos
      .finally(() => setLoading(false));
  }, []); // [] = ejecutar solo al montar, nunca al actualizar

  return { categories, loading };
}
