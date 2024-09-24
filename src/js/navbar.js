// navbar.js

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
