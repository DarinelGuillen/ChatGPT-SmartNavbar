// src/js/contentScript.js

import { waitForElement, escapeRegExp } from '../utils/utils.js';
import { loadCategories } from '../data/dataLoader.js';
import { getTriggerKey } from '../data/storage.js';
import { initializeEventHandlers } from '../eventHandlers/eventHandlers.js';
import { initializeDropdown } from '../components/dropdown.js';
import { createNavbar, updateNavbarSelection } from '../components/navbar.js';
import { openModal } from '../components/modal.js';
import { openCanvasEditor } from '../components/canvasEditor.js';

import '../assets/global.css';
import '../assets/components/navbar.css';
import '../assets/components/dropdown.css';
import '../assets/components/tooltip.css';
import '../assets/components/modal.css';
import '../assets/components/input.css';
import '../assets/components/search.css';
import '../assets/components/canvasEditor.css';

(async function () {
  let triggerKey = await getTriggerKey();
  let escapedTriggerKey = escapeRegExp(triggerKey);

  let categories = await loadCategories();

  let selectedCategoryIndex = 0;
  let selectedCategory = categories[selectedCategoryIndex];

  const targetDivSelector = '.draggable.no-draggable-children.sticky.top-0.p-3.mb-1\\.5.flex.items-center.justify-between.z-10.h-header-height.font-semibold.bg-token-main-surface-primary.max-md\\:hidden';
  const targetDiv = await waitForElement(targetDivSelector);

  let dropdownManager = null; // Inicializar como null

  const inputDivSelector = '#prompt-textarea';
  let inputDiv = await waitForElement(inputDivSelector);

  let maximizeButtonContainer;
  let maximizeButton;

  function createExpandButton() {
    if (maximizeButtonContainer && document.contains(maximizeButtonContainer)) {
      return;
    }

    const targetButtonContainer = document.querySelector('.flex.items-end.gap-1\\.5.pl-4.md\\:gap-2');
    if (targetButtonContainer) {
      maximizeButtonContainer = document.createElement('div');
      maximizeButtonContainer.classList.add('flex', 'items-center');

      maximizeButton = document.createElement('button');
      maximizeButton.classList.add(
        'flex', 'items-center', 'justify-center', 'h-8', 'w-8', 'rounded-full',
        'text-token-text-primary', 'dark:text-white', 'focus-visible:outline-black',
        'dark:focus-visible:outline-white', 'mb-1'
      );
      maximizeButton.setAttribute('aria-label', 'Abrir editor');
      maximizeButton.setAttribute('type', 'button');

      const maximizeIcon = document.createElement('img');
      maximizeIcon.src = chrome.runtime.getURL('assets/icons/maximize.svg');
      maximizeIcon.classList.add('w-5', 'h-5');

      maximizeButton.appendChild(maximizeIcon);
      maximizeButtonContainer.appendChild(maximizeButton);

      targetButtonContainer.insertBefore(maximizeButtonContainer, targetButtonContainer.firstChild);

      maximizeButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openCanvasEditor();
      });
    } else {
      console.error('Contenedor del botón de enviar no encontrado. No se puede insertar el botón de maximizar.');
    }
  }

  createExpandButton();

  const state = {
    selectedCategoryIndex,
    selectedCategory,
    triggerKey,
    escapedTriggerKey,
    categories,
    updateNavbarSelection: () => updateNavbarSelection(navbarElements, state.selectedCategoryIndex),
    updateNavbar: updateNavbar,
  };

  const navbarElements = createNavbar(categories, selectedCategoryIndex, (index) => {
    state.selectedCategoryIndex = index;
    state.selectedCategory = categories[state.selectedCategoryIndex];
    state.updateNavbarSelection();
    if (dropdownManager) {
      dropdownManager.updateDropdown(state.selectedCategory, state.escapedTriggerKey);
    }
  });

  navbarElements.navbar.style.flexGrow = '1';

  function createDropdownElements(newInputDiv) {
    const dropdownContainer = document.createElement('div');
    dropdownContainer.classList.add('dropdown-menu', 'hidden');
    dropdownContainer.id = 'dropdown-menu';

    const buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('dropdown-buttons-container', 'm-1');

    const optionsContainer = document.createElement('div');
    optionsContainer.classList.add('options-container');

    const dropdownIndicator = document.createElement('div');
    dropdownIndicator.id = 'dropdown-indicator';
    dropdownIndicator.classList.add('dropdown-indicator');

    buttonsContainer.appendChild(dropdownIndicator);
    buttonsContainer.appendChild(optionsContainer);
    dropdownContainer.appendChild(buttonsContainer);

    return {
      dropdownContainer,
      buttonsContainer,
      optionsContainer,
      dropdownIndicator,
    };
  }

  let dropdownElements = createDropdownElements(inputDiv);

  // Insertar el dropdown en el body
  document.body.appendChild(dropdownElements.dropdownContainer);

  function initializeDropdownManager(currentInputDiv) {
    if (dropdownManager) {
      // Si ya existe un dropdownManager, limpiarlo
      dropdownManager = null;
    }

    const newDropdownElements = createDropdownElements(currentInputDiv);
    document.body.appendChild(newDropdownElements.dropdownContainer);

    const newDropdownManager = initializeDropdown(currentInputDiv, newDropdownElements, state);
    initializeEventHandlers(currentInputDiv, newDropdownManager, state);
    dropdownManager = newDropdownManager;
  }

  // Inicializar el dropdownManager inicialmente
  initializeDropdownManager(inputDiv);

  function insertComponents() {
    if (!document.contains(navbarElements.navbar)) {
      const targetDiv = document.querySelector(targetDivSelector);
      if (targetDiv) {
        const children = targetDiv.children;
        if (children.length >= 3) {
          targetDiv.insertBefore(navbarElements.navbar, children[2]);
        } else {
          targetDiv.appendChild(navbarElements.navbar);
        }
      }
    }

    if (!document.contains(maximizeButtonContainer)) {
      const targetButtonContainer = document.querySelector('.flex.items-end.gap-1\\.5.pl-4.md\\:gap-2');
      if (targetButtonContainer) {
        targetButtonContainer.insertBefore(maximizeButtonContainer, targetButtonContainer.firstChild);
      }
    }

    state.updateNavbarSelection();
  }

  insertComponents();

  const observerConfig = { childList: true, subtree: true };
  const observer = new MutationObserver((mutationsList, observer) => {
    let inputDivChanged = false;

    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        // Verificar si el inputDiv ha sido agregado o removido
        mutation.addedNodes.forEach((node) => {
          if (node.matches && node.matches(inputDivSelector)) {
            inputDiv = node;
            inputDivChanged = true;
          }
        });

        mutation.removedNodes.forEach((node) => {
          if (node.matches && node.matches(inputDivSelector)) {
            inputDivChanged = true;
          }
        });
      }
    }

    if (inputDivChanged) {
      // Re-inicializar el dropdownManager con el nuevo inputDiv
      if (inputDiv) {
        initializeDropdownManager(inputDiv);
      }
    }

    // Reinserta componentes si son eliminados
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        const navbarExists = document.contains(navbarElements.navbar);
        const maximizeExists = document.contains(maximizeButtonContainer);

        if (!navbarExists || !maximizeExists) {
          insertComponents();
        }
      }
    }
  });
  observer.observe(document.body, observerConfig);

  const sendButton = await waitForElement('button[data-testid="send-button"]');
  console.log('Send button:', sendButton);

  function adjustInputSize() {
    if (inputDiv.innerText.trim().length > 0) {
      inputDiv.classList.add('expanded-input');
    } else {
      inputDiv.classList.remove('expanded-input');
    }
  }

  adjustInputSize();

  inputDiv.addEventListener('input', () => {
    adjustInputSize();
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'OPEN_MODAL') {
      openModal(state);
    } else if (message.type === 'TRIGGER_KEY_UPDATED') {
      getTriggerKey().then((newTriggerKey) => {
        if (newTriggerKey !== triggerKey) {
          triggerKey = newTriggerKey;
          escapedTriggerKey = escapeRegExp(triggerKey);
          state.triggerKey = triggerKey;
          state.escapedTriggerKey = escapedTriggerKey;
          if (dropdownManager) {
            dropdownManager.escapedTriggerKey = escapedTriggerKey;
          }
        }
      });
    } else if (message.type === 'USER_DATA_UPDATED') {
      getTriggerKey().then((newTriggerKey) => {
        if (newTriggerKey !== triggerKey) {
          triggerKey = newTriggerKey;
          escapedTriggerKey = escapeRegExp(triggerKey);
          state.triggerKey = triggerKey;
          state.escapedTriggerKey = escapedTriggerKey;
          if (dropdownManager) {
            dropdownManager.escapedTriggerKey = escapedTriggerKey;
          }
        }
      });

      loadCategories().then((newCategories) => {
        categories = newCategories;
        state.categories = newCategories;
        updateNavbar();
        selectedCategoryIndex = 0;
        selectedCategory = categories[selectedCategoryIndex];
        state.selectedCategoryIndex = selectedCategoryIndex;
        state.selectedCategory = selectedCategory;
        state.updateNavbarSelection();
        if (dropdownManager) {
          dropdownManager.updateDropdown(state.selectedCategory, state.escapedTriggerKey);
        }
      });
    }
  });

  function updateNavbar() {
    const { navbar, buttonsContainer, indicator } = navbarElements;
    buttonsContainer.innerHTML = '';

    const visibleCategories = state.categories.filter((cat) => cat.isVisible);

    visibleCategories.forEach((category, index) => {
      const button = document.createElement('button');
      button.classList.add(
        'nav-button', 'bg-hover', 'rounded-2xl', 'px-4', 'py-1', 'text-center',
        'text-white', 'text-sm', 'font-medium', 'focus:outline-none', 'transition-colors',
        'duration-700', 'ease-in-out', 'transform', 'button-animate', 'flex-shrink-0'
      );
      button.style.animationDelay = `${0.2 + index * 0.2}s`;
      button.textContent = category.category;

      if (index === state.selectedCategoryIndex) {
        button.classList.remove('bg-hover');
        button.classList.add('bg-selected-bt', 'active-button');
      }

      button.addEventListener('click', () => {
        state.selectedCategoryIndex = index;
        state.selectedCategory = visibleCategories[state.selectedCategoryIndex];
        state.updateNavbarSelection();
        if (dropdownManager) {
          dropdownManager.updateDropdown(state.selectedCategory, state.escapedTriggerKey);
        }
      });

      buttonsContainer.appendChild(button);
    });

    buttonsContainer.appendChild(indicator);
  }
})();
