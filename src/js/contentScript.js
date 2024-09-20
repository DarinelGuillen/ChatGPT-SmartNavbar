// contentScript.js

import { waitForElement } from './utils.js';
import { loadCategories } from './dataLoader.js';
import { createNavbar, updateNavbarSelection } from './navbar.js';
import { createDropdown } from './dropdown.js';
import { initializeEventHandlers } from './eventHandlers.js';
import '../css/styles.css';

(async function() {
  const triggerKey = '<<'; // Cambia esto si es necesario
  const escapedTriggerKey = triggerKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Cargar categorías desde el JSON
  let categories = await loadCategories();

  // Categoría seleccionada por defecto
  let selectedCategoryIndex = 0;
  let selectedCategory = categories[selectedCategoryIndex];

  let navbar;
  let dropdownManager;
  let state; // Mover la declaración de 'state' aquí

  function initializeExtension(div) {
    state = {
      selectedCategoryIndex,
      selectedCategory,
      triggerKey,
      escapedTriggerKey,
      categories, // Añadir 'categories' al estado
      updateNavbarSelection: () => updateNavbarSelection(navbar, state.selectedCategoryIndex)
    };

    // Crear navbar
    navbar = createNavbar(categories, selectedCategoryIndex, (index) => {
      state.selectedCategoryIndex = index;
      state.selectedCategory = categories[state.selectedCategoryIndex];
      state.updateNavbarSelection();
      dropdownManager.updateDropdown(state.selectedCategory, state.escapedTriggerKey);
    });

    // Crear dropdown
    dropdownManager = createDropdown(div, triggerKey);

    // Inicializar manejadores de eventos
    initializeEventHandlers(div, dropdownManager, state); // Pasar 'state' actualizado
  }

  // Esperar al elemento 'prompt-textarea'
  waitForElement('#prompt-textarea', (div) => {
    initializeExtension(div);
  });

  // Listener para el mensaje de actualización de datos de usuario
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'USER_DATA_UPDATED') {
      // Recargar categorías
      loadCategories().then((newCategories) => {
        categories = newCategories;
        state.categories = newCategories; // Actualizar 'state.categories'
        // Actualizar la barra de navegación
        navbar.update(categories);
        // Actualizar selección si es necesario
        state.selectedCategoryIndex = 0; // Por ejemplo, volver a 'Todos'
        state.selectedCategory = categories[state.selectedCategoryIndex];
        state.updateNavbarSelection();
        // Si tienes un dropdownManager, actualiza también las opciones
        if (dropdownManager) {
          dropdownManager.updateDropdown(state.selectedCategory, state.escapedTriggerKey);
        }
      });
    }
  });
})();
