// dataLoader.js

export async function loadCategories() {
  // Cargar categorías predeterminadas desde options.json
  const response = await fetch(chrome.runtime.getURL('data/options.json'));
  const defaultCategories = await response.json();

  // Cargar categorías del usuario desde chrome.storage.local
  const userCategories = await getUserCategories();

  // Combinar categorías predeterminadas y del usuario
  let categories = defaultCategories.concat(userCategories);

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

// Función para obtener categorías del usuario
async function getUserCategories() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['userCategories'], (result) => {
      resolve(result.userCategories || []);
    });
  });
}
