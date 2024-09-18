// dataLoader.js

export async function loadCategories() {
  const response = await fetch(chrome.runtime.getURL('data/options.json'));
  const categories = await response.json();

  // Agregar categoría 'Todos' al inicio
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
