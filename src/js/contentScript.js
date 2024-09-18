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
  const categories = await loadCategories();

  // Categoría seleccionada por defecto
  let selectedCategoryIndex = 0;
  let selectedCategory = categories[selectedCategoryIndex];

  function initializeExtension(div) {
    const state = {
      selectedCategoryIndex,
      selectedCategory,
      triggerKey,
      escapedTriggerKey,
      updateNavbarSelection: () => updateNavbarSelection(navbar, state.selectedCategoryIndex)
    };

    // Crear navbar
    const navbar = createNavbar(categories, selectedCategoryIndex, (index) => {
      state.selectedCategoryIndex = index;
      state.selectedCategory = categories[state.selectedCategoryIndex];
      state.updateNavbarSelection();
      dropdownManager.updateDropdown(state.selectedCategory, state.escapedTriggerKey);
    });

    // Crear dropdown
    const dropdownManager = createDropdown(div, triggerKey);

    // Inicializar manejadores de eventos
    initializeEventHandlers(div, dropdownManager, categories, state);
  }

  // Esperar al elemento 'prompt-textarea'
  waitForElement('#prompt-textarea', (div) => {
    initializeExtension(div);
  });
})();
