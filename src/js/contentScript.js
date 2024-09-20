// contentScript.js

import { waitForElement, escapeRegExp } from './utils.js';
import { loadCategories } from './dataLoader.js';
import { createNavbar, updateNavbarSelection } from './navbar.js';
import { createDropdown } from './dropdown.js';
import { initializeEventHandlers } from './eventHandlers.js';
import { getTriggerKey } from './storage.js';
import '../css/styles.css';

function createModal() {
  const modal = document.createElement('div');
  modal.id = 'custom-extension-modal';
  modal.classList.add('fixed', 'inset-0', 'bg-black', 'bg-opacity-50', 'flex', 'justify-center', 'items-center', 'hidden', 'z-1000');

  const modalContent = document.createElement('div');
  modalContent.classList.add('bg-white', 'p-6', 'rounded-lg', 'w-3/4', 'h-3/4', 'overflow-auto');

  modalContent.innerHTML = `
    <h2 class="text-2xl mb-4">Ventana Extendida</h2>
    <p>Contenido de tu extensión...</p>
    <button id="close-modal-button" class="mt-4 px-4 py-2 bg-red-500 text-white rounded">Cerrar</button>
  `;

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  document.getElementById('close-modal-button').addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  return modal;
}

function openModal(modal) {
  modal.classList.remove('hidden');
}

(async function() {
  let triggerKey = await getTriggerKey();
  let escapedTriggerKey = escapeRegExp(triggerKey);

  let categories = await loadCategories();

  let selectedCategoryIndex = 0;
  let selectedCategory = categories[selectedCategoryIndex];

  let navbar;
  let dropdownManager;
  let state;
  let modal;

  function initializeExtension(div) {
    state = {
      selectedCategoryIndex,
      selectedCategory,
      triggerKey,
      escapedTriggerKey,
      categories,
      updateNavbarSelection: () => updateNavbarSelection(navbar, state.selectedCategoryIndex)
    };

    navbar = createNavbar(categories, selectedCategoryIndex, (index) => {
      state.selectedCategoryIndex = index;
      state.selectedCategory = categories[state.selectedCategoryIndex];
      state.updateNavbarSelection();
      dropdownManager.updateDropdown(state.selectedCategory, state.escapedTriggerKey);
    });

    dropdownManager = createDropdown(div, state);

    initializeEventHandlers(div, dropdownManager, state);

    modal = createModal();
  }

  const div = await waitForElement('#prompt-textarea');
  initializeExtension(div);

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'USER_DATA_UPDATED') {
      getTriggerKey().then((newTriggerKey) => {
        if (newTriggerKey !== triggerKey) {
          triggerKey = newTriggerKey;
          escapedTriggerKey = escapeRegExp(triggerKey);
          state.triggerKey = triggerKey;
          state.escapedTriggerKey = escapedTriggerKey;
        }
      });

      loadCategories().then((newCategories) => {
        categories = newCategories;
        state.categories = newCategories;
        navbar.update(categories);
        state.selectedCategoryIndex = 0;
        state.selectedCategory = categories[state.selectedCategoryIndex];
        state.updateNavbarSelection();
        if (dropdownManager) {
          dropdownManager.updateDropdown(state.selectedCategory, state.escapedTriggerKey);
        }
      });
    } else if (message.type === 'OPEN_MODAL') {
      openModal(modal);
    }
  });

})();
