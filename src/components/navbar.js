export function createNavbar(categories, selectedCategoryIndex, onSelectCategory) {
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

export function updateNavbarSelection(navbarElements, selectedCategoryIndex) {
  const { buttonsContainer, indicator } = navbarElements;
  const buttons = buttonsContainer.querySelectorAll('.nav-button');

  buttons.forEach((button, idx) => {
    button.classList.remove('bg-selected-bt', 'active-button');
    button.classList.add('bg-hover');
    if (idx === selectedCategoryIndex) {
      button.classList.remove('bg-hover');
      button.classList.add('bg-selected-bt', 'active-button');
    }
  });

  const activeButton = buttons[selectedCategoryIndex];
  updateIndicator(indicator, activeButton);
}

export function updateIndicator(indicator, button) {
  const left = button.offsetLeft;
  const width = button.offsetWidth;
  const indicatorWidth = width * 0.8;
  const indicatorLeft = left + width * 0.1;
  indicator.style.left = `${indicatorLeft}px`;
  indicator.style.width = `${indicatorWidth}px`;
}
