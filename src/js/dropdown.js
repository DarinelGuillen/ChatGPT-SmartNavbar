

import { replaceTextInDiv } from './utils.js';

export function initializeDropdown(div, dropdownElements, state) {
  const { dropdownContainer, buttonsContainer, dropdownIndicator } = dropdownElements;


  document.body.appendChild(dropdownContainer);

  let currentOptions = [];
  let selectedIndex = -1;
  let dropdownVisible = false;

  function updateDropdownIndicator(button) {

  }

  function showDropdown() {
    dropdownContainer.classList.remove('hidden');
    dropdownContainer.classList.add('dropdown-menu-show');
    if (buttonsContainer.children.length > 0) {
      selectedIndex = 0;
      selectDropdownButton(selectedIndex);

    }
    dropdownVisible = true;
  }

  function hideDropdown() {
    dropdownContainer.classList.add('hidden');
    dropdownContainer.classList.remove('dropdown-menu-show');
    Array.from(buttonsContainer.children).forEach((btn) =>
      btn.classList.remove('active-dropdown-button')
    );
    dropdownVisible = false;
    selectedIndex = -1;

    window.removeEventListener('resize', handleWindowChange);
    window.removeEventListener('scroll', handleWindowChange);
  }

  function selectDropdownButton(index) {
    if (index < 0 || index >= buttonsContainer.children.length) return;
    Array.from(buttonsContainer.children).forEach((btn) =>
      btn.classList.remove('active-dropdown-button')
    );
    const button = buttonsContainer.children[index];
    button.classList.add('active-dropdown-button');
    selectedIndex = index;
    button.scrollIntoView({ block: 'nearest' });
  }

  function updateDropdown(selectedCategory, escapedTriggerKey) {
    buttonsContainer.innerHTML = '';
    currentOptions = [];

    const textContent = div.innerText;
    const regex = new RegExp(escapedTriggerKey + '(.*)$', 'i');

    const match = textContent.match(regex);

    if (!match) {
      hideDropdown();
      return;
    }

    const searchText = match[1].toLowerCase().trim();

    if (!Array.isArray(selectedCategory.opciones)) {
      console.error('selectedCategory.opciones no es un arreglo');
      hideDropdown();
      return;
    }


    const scoredOptions = selectedCategory.opciones
      .map((item) => {
        if (item && item.id) {
          const score = matchSearchText(item.id.toLowerCase(), searchText);
          return { item, score };
        }
        return null;
      })
      .filter((entry) => entry && entry.score > 0);


    scoredOptions.sort((a, b) => b.score - a.score);


    currentOptions = scoredOptions.slice(0, 10).map((entry) => entry.item);

    if (currentOptions.length > 0) {
      currentOptions.forEach((item, index) => {
        const button = document.createElement('button');
        button.classList.add(
          'dropdown-button', 'bg-hover', 'rounded', 'px-2', 'py-1', 'text-white',
          'text-sm', 'font-medium', 'focus:outline-none', 'transition-colors', 'duration-700',
          'ease-in-out', 'transform', 'dropdown-button-animate'
        );
        button.textContent = item.id;

        button.addEventListener('click', () => {
          replaceTextInDiv(div, item.option, state.triggerKey);
          hideDropdown();
        });

        buttonsContainer.appendChild(button);
      });

      showDropdown();


      const rect = div.getBoundingClientRect();
      dropdownContainer.style.left = `${rect.left + window.scrollX}px`;
      dropdownContainer.style.top = `${rect.top + window.scrollY - dropdownContainer.offsetHeight}px`;
      dropdownContainer.style.minWidth = `${rect.width}px`;

      dropdownContainer.style.position = 'fixed';
      dropdownContainer.style.zIndex = '1000';


      window.addEventListener('resize', handleWindowChange);
      window.addEventListener('scroll', handleWindowChange);
    } else {
      hideDropdown();
    }
  }

  function handleWindowChange() {
    if (dropdownVisible) {
      const rect = div.getBoundingClientRect();
      dropdownContainer.style.left = `${rect.left + window.scrollX}px`;
      dropdownContainer.style.top = `${rect.top + window.scrollY - dropdownContainer.offsetHeight}px`;
    }
  }

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

    const prefixMatches = searchWords.filter((sw) =>
      idWords.some((iw) => iw.startsWith(sw))
    ).length;
    score += prefixMatches * 10;

    const idInitials = idWords.map((word) => word[0]).join('').toLowerCase();
    const searchInitials = searchWords.map((word) => word[0]).join('').toLowerCase();

    if (idInitials.startsWith(searchInitials)) {
      score += 5;
    }

    return score;
  }

  function handleInput(selectedCategory, escapedTriggerKey) {
    updateDropdown(selectedCategory, escapedTriggerKey);
  }

  function handleDocumentClick(e) {
    if (!dropdownContainer.contains(e.target) && e.target !== div) {
      hideDropdown();
    }
  }

  document.addEventListener('click', handleDocumentClick);

  return {
    updateDropdown,
    handleInput,
    getCurrentOptions() {
      return currentOptions;
    },
    getSelectedIndex() {
      return selectedIndex;
    },
    setSelectedIndex(index) {
      selectedIndex = index;
      selectDropdownButton(index);
    },
    clearOptions() {
      currentOptions = [];
      selectedIndex = -1;
    },
    dropdownElement: dropdownContainer,
  };
}
