import { useState, useEffect } from "react";
import { categoriesApi } from "../services/api.js";

// Hook para cargar las categorías disponibles.
// Las categorías raramente cambian, por eso se cargan una sola vez al montar el componente.
export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    categoriesApi.getAll()
      .then(setCategories)
      .catch(console.error)           // error no crítico: los filtros simplemente quedan vacíos
      .finally(() => setLoading(false));
  }, []); // array vacío = solo se ejecuta al montar el componente

  return { categories, loading };
}
