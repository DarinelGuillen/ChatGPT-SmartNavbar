// dataLoader.js

import { getCategories } from './storage.js';

export async function loadCategories() {
  let categories = await getCategories();

  // Agregar categoría 'Todos' al inicio
  categories = JSON.parse(JSON.stringify(categories)); // Clonar para evitar mutaciones inesperadas
  categories.unshift({
    category: 'Todos',
    opciones: []
  });

  // Combinar todas las opciones en la categoría 'Todos'
  categories[0].opciones = categories.slice(1).reduce((acc, cat) => {
    if (Array.isArray(cat.opciones)) {
      return acc.concat(cat.opciones);
    }
    return acc;
  }, []);

  return categories;
}
