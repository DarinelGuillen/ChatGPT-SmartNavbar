// src/js/modal.js

 
import { getCategories, saveCategories } from '../data/storage.js';
import { loadCategories } from '../data/dataLoader.js';

export function openModal(state) {
  let modal = document.getElementById('extension-modal');
  if (modal) {
    modal.classList.remove('modal-hidden');
    modal.classList.add('modal-show');
    return;
  }

  // Crear el modal
  modal = document.createElement('div');
  modal.id = 'extension-modal';
  modal.classList.add('modal-hidden'); // Comienza oculto

  // Contenedor del contenido del modal
  const modalContent = document.createElement('div');
  modalContent.classList.add('modal-content');

  // Sidebar de categorías
  const sidebar = document.createElement('div');
  sidebar.classList.add('modal-sidebar');

  // Título de categorías
  const categoriesTitle = document.createElement('h2');
  categoriesTitle.textContent = 'Categorías';
  sidebar.appendChild(categoriesTitle);

  // Lista de categorías
  const categoryList = document.createElement('div');
  categoryList.id = 'category-list';
  categoryList.classList.add('modal-category-list');
  sidebar.appendChild(categoryList);

  // Botón para añadir categoría
  const addCategoryBtn = document.createElement('div');
  addCategoryBtn.id = 'add-category-btn';
  addCategoryBtn.classList.add('modal-add-button');
  addCategoryBtn.innerHTML = `
    <img src="${chrome.runtime.getURL('icons/plus-circle.svg')}" />
    Añadir Categoría
  `;
  sidebar.appendChild(addCategoryBtn);

  // Panel principal de prompts
  const mainPanel = document.createElement('div');
  mainPanel.classList.add('modal-main');

  // Botón de cerrar modal
  const closeButton = document.createElement('button');
  closeButton.id = 'close-modal-button';
  closeButton.innerHTML = `
    <img src="${chrome.runtime.getURL('icons/x.svg')}" />
  `;
  mainPanel.appendChild(closeButton);

  // Crear contenedor para el título y el campo de búsqueda
  const titleContainer = document.createElement('div');
  titleContainer.classList.add('title-container');

  // Título principal
  const mainTitle = document.createElement('h1');
  mainTitle.id = 'main-title';
  mainTitle.textContent = 'Selecciona una Categoría';
  titleContainer.appendChild(mainTitle);

  // Contenedor del campo de búsqueda (vacío por defecto)
  const searchContainer = document.createElement('div');
  searchContainer.classList.add('search-container');
  titleContainer.appendChild(searchContainer);

  // Añadir el contenedor del título al panel principal
  mainPanel.appendChild(titleContainer);

  // Lista de prompts
  const promptList = document.createElement('div');
  promptList.id = 'prompt-list';
  promptList.classList.add('modal-prompt-list');
  mainPanel.appendChild(promptList);

  // Botón para añadir prompt
  const addPromptBtn = document.createElement('div');
  addPromptBtn.id = 'add-prompt-btn';
  addPromptBtn.classList.add('modal-add-button');
  addPromptBtn.innerHTML = `
    <img src="${chrome.runtime.getURL('icons/plus-circle.svg')}" />
    Añadir Prompt
  `;
  mainPanel.appendChild(addPromptBtn);

  // Ensamblar el contenido del modal
  modalContent.appendChild(sidebar);
  modalContent.appendChild(mainPanel);
  modal.appendChild(modalContent);

  // Agregar el modal al body
  document.body.appendChild(modal);

  // Mostrar el modal
  modal.classList.remove('modal-hidden');
  modal.classList.add('modal-show');

  // Inicializar la funcionalidad del modal
  initializeModalFunctionality({
    categoryList,
    promptList,
    mainTitle,
    addCategoryBtn,
    addPromptBtn,
    closeButton,
    searchContainer,
    state,
  });
}

function initializeModalFunctionality(elements) {
  const {
    categoryList,
    promptList,
    mainTitle,
    addCategoryBtn,
    addPromptBtn,
    closeButton,
    searchContainer,
    state,
  } = elements;

  let categories = [];
  let selectedCategory = null;
  let debounceTimer;

  getCategories().then((loadedCategories) => {
    categories = loadedCategories;

    // Crear la categoría "Todos" que contiene todos los prompts
    const allOptions = [];
    categories.forEach(cat => {
      if (Array.isArray(cat.options)) {
        allOptions.push(...cat.options);
      }
    });

    const todosCategory = {
      id: 'all',
      category: 'Todos',
      options: allOptions,
      isVisible: true,
      isPredefined: true
    };

    // Insertar la categoría "Todos" al inicio de la lista
    categories.unshift(todosCategory);

    renderCategories();
    renderPrompts();
  });

  function renderCategories() {
    // Ordenar categorías según isVisible
    categories.sort((a, b) => {
      if (a.isVisible === b.isVisible) return 0;
      return a.isVisible ? -1 : 1;
    });

    categoryList.innerHTML = '';
    categories.forEach(category => {
      const categoryItem = document.createElement('div');
      categoryItem.className = `modal-category-item ${selectedCategory && selectedCategory.id === category.id ? 'selected' : ''}`;

      // Contar cuántos íconos se mostrarán
      let iconCount = 1; // Siempre se muestra el ícono de visibilidad
      if (category.id !== 'all') {
        iconCount += 3; // Editar, Duplicar, Borrar
      }

      const actionsClass = iconCount >= 4 ? 'modal-category-actions more-icons' : 'modal-category-actions';

      categoryItem.innerHTML = `
        <div class="modal-category-name">${category.category}</div>
        <div class="${actionsClass}">
          <button class="modal-icon-button toggle-visibility-btn" data-id="${category.id}">
            <img src="${chrome.runtime.getURL(category.isVisible ? 'icons/eye.svg' : 'icons/eye-off.svg')}" />
          </button>
          ${category.id !== 'all' ? `
            <button class="modal-icon-button edit-category-btn" data-id="${category.id}">
              <img src="${chrome.runtime.getURL('icons/edit-3.svg')}" />
            </button>
            <button class="modal-icon-button duplicate-category-btn" data-id="${category.id}">
              <img src="${chrome.runtime.getURL('icons/copy.svg')}" />
            </button>
            <button class="modal-icon-button delete-category-btn" data-id="${category.id}">
              <img src="${chrome.runtime.getURL('icons/trash.svg')}" />
            </button>
          ` : ''}
        </div>
      `;

      categoryItem.addEventListener('click', (e) => {
        // Evitar que se active si se hizo clic en las acciones
        if (
          e.target.closest('.toggle-visibility-btn') ||
          e.target.closest('.edit-category-btn') ||
          e.target.closest('.duplicate-category-btn') ||
          e.target.closest('.delete-category-btn')
        ) {
          return;
        }
        selectedCategory = category;
        renderPrompts();
        renderCategories();
      });
      categoryList.appendChild(categoryItem);
    });
  }

  function renderPrompts() {
    promptList.innerHTML = '';

    if (selectedCategory) {
      mainTitle.textContent = `Prompts para ${selectedCategory.category}`;

      if (selectedCategory.id === 'all') {
        if (!searchContainer.querySelector('.category-search')) {
          // Crear el campo de búsqueda
          const searchInput = document.createElement('input');
          searchInput.type = 'text';
          searchInput.placeholder = 'Buscar prompts...';
          searchInput.classList.add('category-search');

          // Añadir evento para filtrar los prompts con debouncing
          searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              filterPrompts(searchInput.value.trim().toLowerCase());
            }, 300);
          });

          // Añadir el campo de búsqueda al contenedor
          searchContainer.appendChild(searchInput);
        }
      } else {
        // Limpiar el contenedor de búsqueda si no es 'all'
        searchContainer.innerHTML = '';
      }

      let promptsToDisplay = selectedCategory.options;

      if (selectedCategory.id === 'all') {
        const searchInput = searchContainer.querySelector('.category-search');
        if (searchInput && searchInput.value.trim() !== '') {
          const searchText = searchInput.value.trim().toLowerCase();
          promptsToDisplay = promptsToDisplay.filter(prompt => {
            return prompt.id.toLowerCase().includes(searchText) || prompt.option.toLowerCase().includes(searchText);
          });
        }
      }

      promptsToDisplay.sort((a, b) => {
        if (a.isVisible === b.isVisible) return 0;
        return a.isVisible ? -1 : 1;
      });

      if (promptsToDisplay.length > 0) {
        promptsToDisplay.forEach(prompt => {
          const promptCard = document.createElement('div');
          promptCard.className = `modal-prompt-card ${prompt.isVisible ? '' : 'opacity-50'}`;

          const canEditPrompt = !prompt.isPredefined;
          const showDuplicatePrompt = selectedCategory.id !== 'all' && canEditPrompt;

          promptCard.innerHTML = `
            <div class="modal-prompt-header">
              <div class="modal-prompt-title">${prompt.id}</div>
              <div class="modal-prompt-actions">
                <button class="modal-icon-button toggle-prompt-visibility-btn" data-id="${prompt.id}">
                  <img src="${chrome.runtime.getURL(prompt.isVisible ? 'icons/eye.svg' : 'icons/eye-off.svg')}" />
                </button>
                ${!prompt.isPredefined ? `
                  <button class="modal-icon-button edit-prompt-btn" data-id="${prompt.id}">
                    <img src="${chrome.runtime.getURL('icons/edit-3.svg')}" />
                  </button>
                  <button class="modal-icon-button duplicate-prompt-btn" data-id="${prompt.id}">
                    <img src="${chrome.runtime.getURL('icons/copy.svg')}" />
                  </button>
                  <button class="modal-icon-button delete-prompt-btn" data-id="${prompt.id}">
                    <img src="${chrome.runtime.getURL('icons/trash.svg')}" />
                  </button>
                ` : `
                  <button class="modal-icon-button edit-prompt-btn" data-id="${prompt.id}">
                    <img src="${chrome.runtime.getURL('icons/edit-3.svg')}" />
                  </button>
                `}
                <button class="modal-icon-button duplicate-prompt-btn" data-id="${prompt.id}">
                  <img src="${chrome.runtime.getURL('icons/copy.svg')}" />
                </button>
              </div>
            </div>
            <p>${prompt.option}</p>
          `;
          promptList.appendChild(promptCard);
        });
      } else {
        promptList.innerHTML = '<p>No se encontraron prompts.</p>';
      }
    } else {
      mainTitle.textContent = 'Selecciona una Categoría';
      searchContainer.innerHTML = '';
      promptList.innerHTML = '';
    }
  }

  function filterPrompts(searchText) {
    const allCategory = categories.find(cat => cat.id === 'all');
    if (allCategory) {
      let promptsToDisplay = allCategory.options.filter(prompt => {
        return prompt.id.toLowerCase().includes(searchText) || prompt.option.toLowerCase().includes(searchText);
      });

      promptsToDisplay.sort((a, b) => {
        if (a.isVisible === b.isVisible) return 0;
        return a.isVisible ? -1 : 1;
      });

      promptList.innerHTML = '';

      if (promptsToDisplay.length > 0) {
        promptsToDisplay.forEach(prompt => {
          const promptCard = document.createElement('div');
          promptCard.className = `modal-prompt-card ${prompt.isVisible ? '' : 'opacity-50'}`;

          const canEditPrompt = !prompt.isPredefined;
          const showDuplicatePrompt = selectedCategory.id !== 'all' && canEditPrompt;

          promptCard.innerHTML = `
            <div class="modal-prompt-header">
              <div class="modal-prompt-title">${prompt.id}</div>
              <div class="modal-prompt-actions">
                <button class="modal-icon-button toggle-prompt-visibility-btn" data-id="${prompt.id}">
                  <img src="${chrome.runtime.getURL(prompt.isVisible ? 'icons/eye.svg' : 'icons/eye-off.svg')}" />
                </button>
                ${canEditPrompt ? `
                  <button class="modal-icon-button edit-prompt-btn" data-id="${prompt.id}">
                    <img src="${chrome.runtime.getURL('icons/edit-3.svg')}" />
                  </button>
                  <button class="modal-icon-button delete-prompt-btn" data-id="${prompt.id}">
                    <img src="${chrome.runtime.getURL('icons/trash.svg')}" />
                  </button>
                  ${showDuplicatePrompt ? `
                    <button class="modal-icon-button duplicate-prompt-btn" data-id="${prompt.id}">
                      <img src="${chrome.runtime.getURL('icons/copy.svg')}" />
                    </button>
                  ` : ''}
                ` : ''}
              </div>
            </div>
            <p>${prompt.option}</p>
          `;
          promptList.appendChild(promptCard);
        });
      } else {
        promptList.innerHTML = '<p>No se encontraron prompts.</p>';
      }
    }
  }

  addCategoryBtn.addEventListener('click', () => {
    openCategoryDialog();
  });

  addPromptBtn.addEventListener('click', () => {
    if (selectedCategory && selectedCategory.id !== 'all') {
      openPromptDialog();
    } else {
      alert('Por favor, selecciona una categoría válida para añadir un prompt.');
    }
  });

  closeButton.addEventListener('click', () => {
    const modal = document.getElementById('extension-modal');
    if (modal) {
      modal.classList.add('modal-hidden');
      modal.classList.remove('modal-show');
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('.toggle-visibility-btn')) {
      const id = e.target.closest('.toggle-visibility-btn').dataset.id;
      if (selectedCategory && selectedCategory.id === 'all') {
        toggleCategoryVisibility(id);
      } else {
        togglePromptVisibility(id);
      }
    }

    if (e.target.closest('.edit-category-btn')) {
      const id = e.target.closest('.edit-category-btn').dataset.id;
      editCategory(id);
    }

    if (e.target.closest('.duplicate-category-btn')) {
      const id = e.target.closest('.duplicate-category-btn').dataset.id;
      duplicateCategory(id);
    }

    if (e.target.closest('.delete-category-btn')) {
      const id = e.target.closest('.delete-category-btn').dataset.id;
      confirmDeleteCategory(id);
    }

    if (e.target.closest('.edit-prompt-btn')) {
      const id = e.target.closest('.edit-prompt-btn').dataset.id;
      editPrompt(id);
    }

    if (e.target.closest('.delete-prompt-btn')) {
      const id = e.target.closest('.delete-prompt-btn').dataset.id;
      deletePrompt(id);
    }

    if (e.target.closest('.duplicate-prompt-btn')) {
      const id = e.target.closest('.duplicate-prompt-btn').dataset.id;
      duplicatePrompt(id);
    }

    if (e.target.closest('.toggle-prompt-visibility-btn')) {
      const id = e.target.closest('.toggle-prompt-visibility-btn').dataset.id;
      togglePromptVisibility(id);
    }
  });

  function toggleCategoryVisibility(id) {
    const category = categories.find(cat => cat.id === id);
    if (category) {
      category.isVisible = !category.isVisible;
      saveCategories(categories).then(() => {
        renderCategories();
        if (selectedCategory && selectedCategory.id === id) {
          renderPrompts();
        }
        notifyContentScript();
      });
    }
  }

  function togglePromptVisibility(promptId) {
    const prompt = selectedCategory.options.find(p => p.id === promptId);
    if (prompt) {
      prompt.isVisible = !prompt.isVisible;
      saveCategories(categories).then(() => {
        renderPrompts();
        notifyContentScript();
      });
    }
  }

  function editCategory(id) {
    const category = categories.find(cat => cat.id === id);
    openCategoryDialog(category);
  }

  function confirmDeleteCategory(id) {
    const category = categories.find(cat => cat.id === id);
    if (category) {
      if (confirm('¿Estás seguro de que deseas eliminar esta categoría y todos los prompts asociados?')) {
        categories = categories.filter(cat => cat.id !== id);
        if (selectedCategory && selectedCategory.id === id) {
          selectedCategory = null;
          renderPrompts();
        }
        saveCategories(categories).then(() => {
          renderCategories();
          notifyContentScript();
        });
      }
    }
  }

  function editPrompt(promptId) {
    const prompt = selectedCategory.options.find(p => p.id === promptId);
    openPromptDialog(prompt);
  }

  function deletePrompt(promptId) {
    if (confirm('¿Estás seguro de que deseas eliminar este prompt?')) {
      selectedCategory.options = selectedCategory.options.filter(p => p.id !== promptId);
      saveCategories(categories).then(() => {
        renderPrompts();
        notifyContentScript();
      });
    }
  }

  function duplicateCategory(id) {
    const category = categories.find(cat => cat.id === id);
    if (category) {
      const newCategory = JSON.parse(JSON.stringify(category));
      newCategory.id = Date.now().toString();
      newCategory.category = `${category.category} - Copia`;
      newCategory.isPredefined = false; // Asegurar que la nueva categoría no es predefinida
      newCategory.options = category.options.map(prompt => {
        const newPrompt = { ...prompt };
        newPrompt.id = `${prompt.id} - Copia`;
        newPrompt.isPredefined = false; // Asegurar que el nuevo prompt no es predefinido
        return newPrompt;
      });
      categories.push(newCategory);
      saveCategories(categories).then(() => {
        renderCategories();
        notifyContentScript();
      });
    }
  }

  function duplicatePrompt(promptId) {
    const prompt = selectedCategory.options.find(p => p.id === promptId);
    if (prompt) {
      const newPrompt = { ...prompt };
      newPrompt.id = `${prompt.id} - Copia`;
      newPrompt.isPredefined = false; // Asegurar que el nuevo prompt no es predefinido
      selectedCategory.options.push(newPrompt);
      saveCategories(categories).then(() => {
        renderPrompts();
        notifyContentScript();
      });
    }
  }

  function openCategoryDialog(category = null) {
    const dialog = document.createElement('div');
    dialog.classList.add('modal-dialog');
    dialog.innerHTML = `
      <div class="modal-dialog-content">
        <h2 class="modal-dialog-title">${category ? 'Editar Categoría' : 'Añadir Nueva Categoría'}</h2>
        <label class="modal-label">Nombre de la Categoría</label>
        <input type="text" id="category-name-input" class="modal-input" value="${category ? category.category : ''}" />
        <div class="modal-dialog-actions">
          <button id="cancel-category-btn" class="modal-btn modal-btn-secondary">Cancelar</button>
          <button id="save-category-btn" class="modal-btn">${category ? 'Guardar Cambios' : 'Guardar Categoría'}</button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);

    const categoryNameInput = dialog.querySelector('#category-name-input');
    const saveCategoryBtn = dialog.querySelector('#save-category-btn');
    const cancelCategoryBtn = dialog.querySelector('#cancel-category-btn');

    saveCategoryBtn.addEventListener('click', () => {
      const name = categoryNameInput.value.trim();
      if (name) {
        if (category) {
          category.category = name;
        } else {
          const newCategory = {
            id: Date.now().toString(),
            category: name,
            options: [],
            isVisible: true,
            isPredefined: false
          };
          categories.push(newCategory);
        }
        saveCategories(categories).then(() => {
          renderCategories();
          dialog.remove();
          notifyContentScript();
        });
      }
    });

    cancelCategoryBtn.addEventListener('click', () => {
      dialog.remove();
    });
  }

  function openPromptDialog(prompt = null) {
    const dialog = document.createElement('div');
    dialog.classList.add('modal-dialog');
    dialog.innerHTML = `
      <div class="modal-dialog-content">
        <h2 class="modal-dialog-title">${prompt ? 'Editar Prompt' : 'Añadir Nuevo Prompt'}</h2>
        <label class="modal-label">ID del Prompt</label>
        <input type="text" id="prompt-id-input" class="modal-input" value="${prompt ? prompt.id : ''}" />
        <label class="modal-label">Contenido del Prompt</label>
        <textarea id="prompt-option-input" class="modal-textarea" rows="5">${prompt ? prompt.option : ''}</textarea>
        <div class="modal-dialog-actions">
          <button id="cancel-prompt-btn" class="modal-btn modal-btn-secondary">Cancelar</button>
          <button id="save-prompt-btn" class="modal-btn">${prompt ? 'Guardar Cambios' : 'Guardar Prompt'}</button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);

    const promptIdInput = dialog.querySelector('#prompt-id-input');
    const promptOptionInput = dialog.querySelector('#prompt-option-input');
    const savePromptBtn = dialog.querySelector('#save-prompt-btn');
    const cancelPromptBtn = dialog.querySelector('#cancel-prompt-btn');

    savePromptBtn.addEventListener('click', () => {
      const id = promptIdInput.value.trim();
      const option = promptOptionInput.value.trim();
      if (id && option) {
        if (prompt) {
          prompt.id = id;
          prompt.option = option;
          prompt.isVisible = prompt.isVisible !== false;
        } else {
          selectedCategory.options.push({ id, option, isVisible: true, isPredefined: false });
        }
        saveCategories(categories).then(() => {
          renderPrompts();
          dialog.remove();
          notifyContentScript();
        });
      }
    });

    cancelPromptBtn.addEventListener('click', () => {
      dialog.remove();
    });
  }

  function notifyContentScript() {
    loadCategories().then((newCategories) => {
      state.categories = newCategories;
      state.updateNavbar();
      state.updateNavbarSelection();
    });
  }
}