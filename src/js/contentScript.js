// contentScript.js

import { waitForElement, escapeRegExp } from './utils.js';
import { loadCategories } from './dataLoader.js';
import { createNavbar, updateNavbarSelection } from './navbar.js';
import { createDropdown } from './dropdown.js';
import { initializeEventHandlers } from './eventHandlers.js';
import { getTriggerKey } from './storage.js';
import '../css/styles.css';

(async function() {
  // Obtener el triggerKey desde el almacenamiento
  let triggerKey = await getTriggerKey();
  let escapedTriggerKey = escapeRegExp(triggerKey);

  // Cargar categorías desde el JSON
  let categories = await loadCategories();

  // Categoría seleccionada por defecto
  let selectedCategoryIndex = 0;
  let selectedCategory = categories[selectedCategoryIndex];

  let navbar;
  let dropdownManager;
  let state;

  function initializeExtension(div) {
    state = {
      selectedCategoryIndex,
      selectedCategory,
      triggerKey,
      escapedTriggerKey,
      categories,
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
    dropdownManager = createDropdown(div, state);

    // Inicializar manejadores de eventos
    initializeEventHandlers(div, dropdownManager, state);
  }

  // Esperar al elemento 'prompt-textarea'
  const div = await waitForElement('#prompt-textarea');
  initializeExtension(div);

  // Listener para el mensaje de actualización de datos de usuario
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'USER_DATA_UPDATED') {
      // Si el triggerKey ha cambiado, actualizarlo
      getTriggerKey().then((newTriggerKey) => {
        if (newTriggerKey !== triggerKey) {
          triggerKey = newTriggerKey;
          escapedTriggerKey = escapeRegExp(triggerKey);
          state.triggerKey = triggerKey;
          state.escapedTriggerKey = escapedTriggerKey;
        }
      });

      // Recargar categorías
      loadCategories().then((newCategories) => {
        categories = newCategories;
        state.categories = newCategories;
        // Actualizar la barra de navegación
        navbar.update(categories);
        // Actualizar selección si es necesario
        state.selectedCategoryIndex = 0; // Por ejemplo, volver a 'Todos'
        state.selectedCategory = categories[state.selectedCategoryIndex];
        state.updateNavbarSelection();
        // Actualizar el dropdown
        if (dropdownManager) {
          dropdownManager.updateDropdown(state.selectedCategory, state.escapedTriggerKey);
        }
      });
    }
  });

})();
