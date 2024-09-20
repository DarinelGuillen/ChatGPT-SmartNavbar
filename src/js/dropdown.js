// dropdown.js

import { replaceTextInDiv } from './utils.js';

export function createDropdown(div, state) {
  const dropdown = document.createElement('div');
  dropdown.id = 'custom-dropdown';
  dropdown.classList.add(
    'fixed',
    'bg-white',
    'border',
    'border-gray-300',
    'shadow-lg',
    'rounded-md',
    'z-50',
    'hidden',
    'max-h-60',
    'overflow-auto'
  );

  document.body.appendChild(dropdown);

  let currentOptions = [];
  let selectedIndex = -1;

  function updateDropdown(selectedCategory, escapedTriggerKey) {
    dropdown.innerHTML = '';

    const textContent = div.innerText;
    const regex = new RegExp(escapedTriggerKey + '(.*)$', 'i');

    const match = textContent.match(regex);

    if (!match) {
      dropdown.classList.add('hidden');
      selectedIndex = -1;
      return;
    }

    const searchText = match[1].toLowerCase().trim();

    if (!Array.isArray(selectedCategory.opciones)) {
      console.error('selectedCategory.opciones no es un arreglo');
      dropdown.classList.add('hidden');
      selectedIndex = -1;
      return;
    }

    // Calcular puntuaciones y filtrar opciones
    const scoredOptions = selectedCategory.opciones
      .map(item => {
        if (item && item.id) {
          const score = matchSearchText(item.id.toLowerCase(), searchText);
          return { item, score };
        }
        return null;
      })
      .filter(entry => entry && entry.score > 0);

    // Ordenar opciones por puntuación descendente
    scoredOptions.sort((a, b) => b.score - a.score);

    // Obtener solo los items
    currentOptions = scoredOptions.slice(0, 10).map(entry => entry.item);

    if (currentOptions.length > 0) {
      selectedIndex = 0;

      currentOptions.forEach((item, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.textContent = item.id;
        optionDiv.classList.add(
          'px-4',
          'py-2',
          'cursor-pointer',
          'text-gray-700',
          'hover:bg-gray-100'
        );

        if (index === selectedIndex) {
          optionDiv.classList.add('bg-gray-200');
        }

        optionDiv.addEventListener('mouseenter', () => {
          selectedIndex = index;
          updateDropdownSelection();
        });

        optionDiv.addEventListener('click', () => {
          replaceTextInDiv(div, item.option, state.triggerKey);
          dropdown.classList.add('hidden');
          currentOptions = [];
          selectedIndex = -1;
        });

        dropdown.appendChild(optionDiv);
      });

      dropdown.classList.remove('hidden');

      const divRect = div.getBoundingClientRect();
      const dropdownHeight = dropdown.offsetHeight;

      dropdown.style.left = `${divRect.left}px`;
      dropdown.style.top = `${divRect.top - dropdownHeight - 5}px`;
      dropdown.style.minWidth = '150px';
      dropdown.style.zIndex = '1000';

      updateDropdownSelection();
    } else {
      dropdown.classList.add('hidden');
      selectedIndex = -1;
    }
  }

  function updateDropdownSelection() {
    const optionDivs = dropdown.querySelectorAll('div');
    optionDivs.forEach((optionDiv, index) => {
      if (index === selectedIndex) {
        optionDiv.classList.add('bg-gray-200');
      } else {
        optionDiv.classList.remove('bg-gray-200');
      }
    });
  }

  function handleInput(selectedCategory, escapedTriggerKey) {
    updateDropdown(selectedCategory, escapedTriggerKey);
  }

  function handleDocumentClick(e) {
    if (!dropdown.contains(e.target) && e.target !== div) {
      dropdown.classList.add('hidden');
    }
  }

  document.addEventListener('click', handleDocumentClick);

  function matchSearchText(idText, searchText) {
    let score = 0;

    if (idText === searchText) {
      score += 100;
    } else if (idText.startsWith(searchText)) {
      score += 50;
    } else if (idText.includes(searchText)) {
      score += 20;
    }

    const idWords = idText.split(/\s+/);
    const searchWords = searchText.split(/\s+/);

    const prefixMatches = searchWords.filter(sw => idWords.some(iw => iw.startsWith(sw))).length;
    score += prefixMatches * 10;

    const idInitials = idWords.map(word => word[0]).join('').toLowerCase();
    const searchInitials = searchWords.map(word => word[0]).join('').toLowerCase();

    if (idInitials.startsWith(searchInitials)) {
      score += 5;
    }

    return score;
  }

  return {
    updateDropdown,
    updateDropdownSelection,
    handleInput,
    getCurrentOptions() {
      return currentOptions;
    },
    getSelectedIndex() {
      return selectedIndex;
    },
    setSelectedIndex(index) {
      selectedIndex = index;
      updateDropdownSelection();
    },
    clearOptions() {
      currentOptions = [];
      selectedIndex = -1;
    },
    dropdownElement: dropdown
  };
}
