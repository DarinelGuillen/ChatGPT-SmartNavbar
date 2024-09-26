

import { waitForElement, escapeRegExp } from './utils.js';
import { loadCategories } from './dataLoader.js';
import { getTriggerKey } from './storage.js';
import { initializeEventHandlers } from './eventHandlers.js';
import { initializeDropdown } from './dropdown.js';
import { updateNavbarSelection } from './navbar.js';
import '../css/contentScript.css';

function createNavbar(categories, selectedCategoryIndex, onSelectCategory) {

  const navbar = document.createElement('div');
  navbar.classList.add(
    'relative', 'flex', 'justify-center', 'items-center', 'bg-navbar', 'text-white',
    'rounded-2xl', 'p-1', 'overflow-hidden', 'navbar-animate', 'flex-grow'
  );


  const buttonsContainer = document.createElement('div');
  buttonsContainer.classList.add(
    'relative', 'flex', 'items-center', 'gap-x-4', 'no-scrollbar', 'overflow-x-hidden',
    'buttons-container'
  );
  buttonsContainer.id = 'buttons-container';
  buttonsContainer.setAttribute('tabindex', '0');


  categories.forEach((category, index) => {
    const button = document.createElement('button');
    button.classList.add(
      'nav-button', 'bg-hover', 'rounded-2xl', 'px-4', 'py-1', 'text-center',
      'text-white', 'text-sm', 'font-medium', 'focus:outline-none', 'transition-colors',
      'duration-700', 'ease-in-out', 'transform', 'button-animate', 'flex-shrink-0'
    );
    button.style.animationDelay = `${0.2 + index * 0.2}s`;
    button.textContent = category.category;

    if (index === selectedCategoryIndex) {
      button.classList.remove('bg-hover');
      button.classList.add('bg-selected-bt', 'active-button');
    }

    button.addEventListener('click', () => {
      onSelectCategory(index);
    });

    buttonsContainer.appendChild(button);
  });


  const indicator = document.createElement('div');
  indicator.id = 'indicator';
  indicator.classList.add('indicator');

  buttonsContainer.appendChild(indicator);
  navbar.appendChild(buttonsContainer);

  return {
    navbar,
    buttonsContainer,
    indicator,
  };
}

(async function () {
  let triggerKey = await getTriggerKey();
  let escapedTriggerKey = escapeRegExp(triggerKey);

  let categories = await loadCategories();

  let selectedCategoryIndex = 0;
  let selectedCategory = categories[selectedCategoryIndex];


  const targetDivSelector = '.draggable.no-draggable-children.sticky.top-0.p-3.mb-1\\.5.flex.items-center.justify-between.z-10.h-header-height.font-semibold.bg-token-main-surface-primary.max-md\\:hidden';
  const targetDiv = await waitForElement(targetDivSelector);


  const navbarElements = createNavbar(categories, selectedCategoryIndex, (index) => {
    selectedCategoryIndex = index;
    selectedCategory = categories[selectedCategoryIndex];
    updateNavbarSelection(navbarElements, selectedCategoryIndex);
    dropdownManager.updateDropdown(selectedCategory, escapedTriggerKey);
  });


  const children = targetDiv.children;
  if (children.length >= 3) {
    targetDiv.insertBefore(navbarElements.navbar, children[2]);
  } else {
    targetDiv.appendChild(navbarElements.navbar);
  }


  navbarElements.navbar.style.flexGrow = '1';


  const inputDiv = await waitForElement('#prompt-textarea');
  const dropdownElements = createDropdown(inputDiv);

  const state = {
    selectedCategoryIndex,
    selectedCategory,
    triggerKey,
    escapedTriggerKey,
    categories,
    updateNavbarSelection: () => updateNavbarSelection(navbarElements, selectedCategoryIndex),
  };

  const dropdownManager = initializeDropdown(inputDiv, dropdownElements, state);

  initializeEventHandlers(inputDiv, dropdownManager, state);

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

      function openExtendedWindow() {


        alert('Ventana extendida abierta');
      }

      loadCategories().then((newCategories) => {
        categories = newCategories;
        state.categories = newCategories;
        updateNavbar(navbarElements, categories);
        selectedCategoryIndex = 0;
        selectedCategory = categories[selectedCategoryIndex];
        state.selectedCategoryIndex = selectedCategoryIndex;
        state.selectedCategory = selectedCategory;
        state.updateNavbarSelection();
        if (dropdownManager) {
          dropdownManager.updateDropdown(selectedCategory, escapedTriggerKey);
        }
      });
    }
  });
})();

function updateNavbar(navbarElements, categories) {
  const { buttonsContainer, indicator } = navbarElements;
  buttonsContainer.innerHTML = '';
  categories.forEach((category, index) => {
    const button = document.createElement('button');
    button.classList.add(
      'nav-button', 'bg-hover', 'rounded-2xl', 'px-4', 'py-1', 'text-center',
      'text-white', 'text-sm', 'font-medium', 'focus:outline-none', 'transition-colors',
      'duration-700', 'ease-in-out', 'transform', 'button-animate', 'flex-shrink-0'
    );
    button.style.animationDelay = `${0.2 + index * 0.2}s`;
    button.textContent = category.category;

    if (index === 0) {
      button.classList.remove('bg-hover');
      button.classList.add('bg-selected-bt', 'active-button');
    }

    button.addEventListener('click', () => {

    });

    buttonsContainer.appendChild(button);
  });

  buttonsContainer.appendChild(indicator);
}

function updateIndicator(indicator, button) {
  const left = button.offsetLeft;
  const width = button.offsetWidth;
  const indicatorWidth = width * 0.8;
  const indicatorLeft = left + width * 0.1;
  indicator.style.left = `${indicatorLeft}px`;
  indicator.style.width = `${indicatorWidth}px`;
}

function createDropdown(div) {

  const dropdownContainer = document.createElement('div');
  dropdownContainer.classList.add('dropdown-menu', 'hidden');
  dropdownContainer.id = 'dropdown-menu';


  const buttonsContainer = document.createElement('div');
  buttonsContainer.classList.add('dropdown-buttons-container', 'm-1');


  const dropdownIndicator = document.createElement('div');
  dropdownIndicator.id = 'dropdown-indicator';
  dropdownIndicator.classList.add('indicator');

  buttonsContainer.appendChild(dropdownIndicator);
  dropdownContainer.appendChild(buttonsContainer);


  document.body.appendChild(dropdownContainer);

  return {
    dropdownContainer,
    buttonsContainer,
    dropdownIndicator,
  };
}
