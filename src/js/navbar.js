// navbar.js

export function createNavbar(categories, selectedCategoryIndex, onSelectCategory) {
  const navbar = document.createElement('div');
  navbar.id = 'custom-navbar';
  navbar.classList.add(
    'fixed',
    'top-0',
    'left-1/2',
    'transform',
    '-translate-x-1/2',
    'w-full',
    'max-w-2xl',
    'bg-gray-800',
    'flex',
    'justify-center',
    'items-center',
    'z-50',
    'rounded-b-lg'
  );

  function createTabs(categories) {
    categories.forEach((category, index) => {
      const tab = document.createElement('div');
      tab.textContent = category.category;
      tab.classList.add(
        'px-4',
        'py-2',
        'cursor-pointer',
        'text-gray-200',
        'hover:bg-gray-700'
      );

      if (index === selectedCategoryIndex) {
        tab.classList.add('bg-gray-700');
      }

      tab.addEventListener('click', () => {
        onSelectCategory(index);
      });

      navbar.appendChild(tab);
    });
  }

  createTabs(categories);

  navbar.update = (newCategories) => {
    // Remover pestañas existentes
    navbar.innerHTML = '';

    // Crear nuevas pestañas
    createTabs(newCategories);
  };

  document.body.appendChild(navbar);

  return navbar;
}

export function updateNavbarSelection(navbar, selectedCategoryIndex) {
  const tabs = navbar.querySelectorAll('div');
  tabs.forEach((tab, idx) => {
    if (idx === selectedCategoryIndex) {
      tab.classList.add('bg-gray-700');
    } else {
      tab.classList.remove('bg-gray-700');
    }
  });
}
