import { getCategories, saveCategories } from '../data/storage.js';
import { loadCategories } from '../data/dataLoader.js';

export function openModal(state) {
  let modal = document.getElementById('extension-modal');
  if (modal) {
    modal.classList.remove('modal-hidden');
    modal.classList.add('modal-show');
    return;
  }

  modal = document.createElement('div');
  modal.id = 'extension-modal';
  modal.classList.add('modal-hidden');

  const modalContent = document.createElement('div');
  modalContent.classList.add('modal-content');

  const sidebar = document.createElement('div');
  sidebar.classList.add('modal-sidebar');

  const categoriesTitle = document.createElement('h2');
  categoriesTitle.textContent = 'Categorías';
  sidebar.appendChild(categoriesTitle);

  const categoryList = document.createElement('div');
  categoryList.id = 'category-list';
  categoryList.classList.add('modal-category-list');
  sidebar.appendChild(categoryList);

  const addCategoryBtn = document.createElement('div');
  addCategoryBtn.id = 'add-category-btn';
  addCategoryBtn.classList.add('modal-add-button');
  addCategoryBtn.innerHTML = `
    <img src="${chrome.runtime.getURL('assets/icons/plus-circle.svg')}" />
    Añadir Categoría
  `;
  sidebar.appendChild(addCategoryBtn);

  const mainPanel = document.createElement('div');
  mainPanel.classList.add('modal-main');

  const closeButton = document.createElement('button');
  closeButton.id = 'close-modal-button';
  closeButton.innerHTML = `
    <img src="${chrome.runtime.getURL('assets/icons/x.svg')}" />
  `;
  mainPanel.appendChild(closeButton);

  const titleContainer = document.createElement('div');
  titleContainer.classList.add('title-container');

  const mainTitle = document.createElement('h1');
  mainTitle.id = 'main-title';
  mainTitle.textContent = 'Selecciona una Categoría';
  titleContainer.appendChild(mainTitle);

  const searchContainer = document.createElement('div');
  searchContainer.classList.add('search-container');
  titleContainer.appendChild(searchContainer);

  mainPanel.appendChild(titleContainer);

  const promptList = document.createElement('div');
  promptList.id = 'prompt-list';
  promptList.classList.add('modal-prompt-list');
  mainPanel.appendChild(promptList);

  const addPromptBtn = document.createElement('div');
  addPromptBtn.id = 'add-prompt-btn';
  addPromptBtn.classList.add('modal-add-button');
  addPromptBtn.innerHTML = `
    <img src="${chrome.runtime.getURL('assets/icons/plus-circle.svg')}" />
    Añadir Prompt
  `;
  mainPanel.appendChild(addPromptBtn);

  modalContent.appendChild(sidebar);
  modalContent.appendChild(mainPanel);
  modal.appendChild(modalContent);

  document.body.appendChild(modal);

  modal.classList.remove('modal-hidden');
  modal.classList.add('modal-show');

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

    categories.unshift(todosCategory);

    renderCategories();
    renderPrompts();
  });

  function renderCategories() {
    categories.sort((a, b) => {
      if (a.isVisible === b.isVisible) return 0;
      return a.isVisible ? -1 : 1;
    });

    categoryList.innerHTML = '';
    categories.forEach(category => {
      const categoryItem = document.createElement('div');
      categoryItem.className = `modal-category-item ${selectedCategory && selectedCategory.id === category.id ? 'selected' : ''}`;

      let iconCount = 1;
      if (category.id !== 'all') {
        iconCount += 3;
      }

      const actionsClass = iconCount >= 4 ? 'modal-category-actions more-icons' : 'modal-category-actions';

      categoryItem.innerHTML = `
        <div class="modal-category-name">${category.category}</div>
        <div class="${actionsClass}">
          <button class="modal-icon-button toggle-visibility-btn" data-id="${category.id}">
            <img src="${chrome.runtime.getURL(category.isVisible ? 'assets/icons/eye.svg' : 'assets/icons/eye-off.svg')}" />
          </button>
          ${!category.isPredefined && category.id !== 'all' ? `
            <button class="modal-icon-button edit-category-btn" data-id="${category.id}">
              <img src="${chrome.runtime.getURL('assets/icons/edit-3.svg')}" />
            </button>
            <button class="modal-icon-button duplicate-category-btn" data-id="${category.id}">
              <img src="${chrome.runtime.getURL('assets/icons/copy.svg')}" />
            </button>
            <button class="modal-icon-button delete-category-btn" data-id="${category.id}">
              <img src="${chrome.runtime.getURL('assets/icons/trash.svg')}" />
            </button>
          ` : `
            <button class="modal-icon-button duplicate-category-btn" data-id="${category.id}">
              <img src="${chrome.runtime.getURL('assets/icons/copy.svg')}" />
            </button>
          `}
        </div>
      `;

      categoryItem.addEventListener('click', (e) => {
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
          const searchInput = document.createElement('input');
          searchInput.type = 'text';
          searchInput.placeholder = 'Buscar prompts...';
          searchInput.classList.add('category-search');

          searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              filterPrompts(searchInput.value.trim().toLowerCase());
            }, 300);
          });

          searchContainer.appendChild(searchInput);
        }
      } else {
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
                  <img src="${chrome.runtime.getURL(prompt.isVisible ? 'assets/icons/eye.svg' : 'assets/icons/eye-off.svg')}" />
                </button>
                <button class="modal-icon-button edit-prompt-btn" data-id="${prompt.id}">
                  <img src="${chrome.runtime.getURL('assets/icons/edit-3.svg')}" />
                </button>
                ${!prompt.isPredefined ? `
                  <button class="modal-icon-button duplicate-prompt-btn" data-id="${prompt.id}">
                    <img src="${chrome.runtime.getURL('assets/icons/copy.svg')}" />
                  </button>
                  <button class="modal-icon-button delete-prompt-btn" data-id="${prompt.id}">
                    <img src="${chrome.runtime.getURL('assets/icons/trash.svg')}" />
                  </button>
                ` : `
                  <button class="modal-icon-button duplicate-prompt-btn" data-id="${prompt.id}">
                    <img src="${chrome.runtime.getURL('assets/icons/copy.svg')}" />
                  </button>
                `}
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
                  <img src="${chrome.runtime.getURL(prompt.isVisible ? 'assets/icons/eye.svg' : 'assets/icons/eye-off.svg')}" />
                </button>
                <button class="modal-icon-button edit-prompt-btn" data-id="${prompt.id}">
                  <img src="${chrome.runtime.getURL('assets/icons/edit-3.svg')}" />
                </button>
                ${!prompt.isPredefined ? `
                  <button class="modal-icon-button duplicate-prompt-btn" data-id="${prompt.id}">
                    <img src="${chrome.runtime.getURL('assets/icons/copy.svg')}" />
                  </button>
                  <button class="modal-icon-button delete-prompt-btn" data-id="${prompt.id}">
                    <img src="${chrome.runtime.getURL('assets/icons/trash.svg')}" />
                  </button>
                ` : `
                  <button class="modal-icon-button duplicate-prompt-btn" data-id="${prompt.id}">
                    <img src="${chrome.runtime.getURL('assets/icons/copy.svg')}" />
                  </button>
                `}
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
    if (selectedCategory && selectedCategory.id !== 'all' && !selectedCategory.isPredefined) {
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
    const prompt = selectedCategory.options.find(p => p.id === promptId);
    if (prompt && !prompt.isPredefined) {
      if (confirm('¿Estás seguro de que deseas eliminar este prompt?')) {
        selectedCategory.options = selectedCategory.options.filter(p => p.id !== promptId);
        saveCategories(categories).then(() => {
          renderPrompts();
          notifyContentScript();
        });
      }
    }
  }

  function duplicateCategory(id) {
    const category = categories.find(cat => cat.id === id);
    if (category) {
      const newCategory = JSON.parse(JSON.stringify(category));
      newCategory.id = Date.now().toString();
      newCategory.category = `${category.category} - Copia`;
      newCategory.isPredefined = false;
      newCategory.options = category.options.map(prompt => {
        const newPrompt = { ...prompt };
        newPrompt.id = `${prompt.id} - Copia`;
        newPrompt.isPredefined = false;
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
      newPrompt.isPredefined = false;
      selectedCategory.options.push(newPrompt);
      saveCategories(categories).then(() => {
        renderPrompts();
        notifyContentScript();
      });
    }
  }

  function openCategoryDialog(category = null) {
    const dialogOverlay = document.createElement('div');
    dialogOverlay.classList.add('modal-dialog-overlay', 'show');

    const dialogContent = document.createElement('div');
    dialogContent.classList.add('modal-dialog-content');

    dialogContent.innerHTML = `
      <button class="modal-dialog-close-button">
        <img src="${chrome.runtime.getURL('assets/icons/x.svg')}" />
      </button>
      <h2>${category ? 'Editar Categoría' : 'Añadir Nueva Categoría'}</h2>
      <label class="modal-label">Nombre de la Categoría</label>
      <input type="text" id="category-name-input" class="modal-input" value="${category ? category.category : ''}" />
      <div class="modal-dialog-actions">
        <button id="cancel-category-btn" class="modal-btn modal-btn-secondary">Cancelar</button>
        <button id="save-category-btn" class="modal-btn">${category ? 'Guardar Cambios' : 'Guardar Categoría'}</button>
      </div>
    `;

    dialogOverlay.appendChild(dialogContent);

    const mainModal = document.getElementById('extension-modal');
    mainModal.appendChild(dialogOverlay);

    const categoryNameInput = dialogContent.querySelector('#category-name-input');
    const saveCategoryBtn = dialogContent.querySelector('#save-category-btn');
    const cancelCategoryBtn = dialogContent.querySelector('#cancel-category-btn');
    const closeButton = dialogContent.querySelector('.modal-dialog-close-button');

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
          dialogOverlay.remove();
          notifyContentScript();
        });
      }
    });

    cancelCategoryBtn.addEventListener('click', () => {
      dialogOverlay.remove();
    });

    closeButton.addEventListener('click', () => {
      dialogOverlay.remove();
    });
  }

  function openPromptDialog(prompt = null) {
    const dialogOverlay = document.createElement('div');
    dialogOverlay.classList.add('modal-dialog-overlay', 'show');

    const dialogContent = document.createElement('div');
    dialogContent.classList.add('modal-dialog-content');

    dialogContent.innerHTML = `
      <button class="modal-dialog-close-button">
        <img src="${chrome.runtime.getURL('assets/icons/x.svg')}" />
      </button>
      <h2>${prompt ? 'Editar Prompt' : 'Añadir Nuevo Prompt'}</h2>
      <label class="modal-label">ID del Prompt</label>
      <input type="text" id="prompt-id-input" class="modal-input" value="${prompt ? prompt.id : ''}" />
      <label class="modal-label">Contenido del Prompt</label>
      <textarea id="prompt-option-input" class="modal-textarea" rows="10" placeholder="Escribe tu prompt aquí. Usa Shift + Enter para saltos de línea y Tab para tabulaciones.">${prompt ? prompt.option : ''}</textarea>
      <div class="modal-dialog-actions">
        <button id="cancel-prompt-btn" class="modal-btn modal-btn-secondary">Cancelar</button>
        <button id="save-prompt-btn" class="modal-btn">${prompt ? 'Guardar Cambios' : 'Guardar Prompt'}</button>
      </div>
    `;

    dialogOverlay.appendChild(dialogContent);

    const mainModal = document.getElementById('extension-modal');
    mainModal.appendChild(dialogOverlay);

    const promptIdInput = dialogContent.querySelector('#prompt-id-input');
    const promptOptionInput = dialogContent.querySelector('#prompt-option-input');
    const savePromptBtn = dialogContent.querySelector('#save-prompt-btn');
    const cancelPromptBtn = dialogContent.querySelector('#cancel-prompt-btn');
    const closeButton = dialogContent.querySelector('.modal-dialog-close-button');

    savePromptBtn.addEventListener('click', () => {
      const id = promptIdInput.value.trim();
      const option = promptOptionInput.value.trim();
      if (id && option) {
        if (prompt) {
          prompt.id = id;
          prompt.option = option;

        } else {
          selectedCategory.options.push({ id, option, isVisible: true, isPredefined: false });
        }
        saveCategories(categories).then(() => {
          renderPrompts();
          dialogOverlay.remove();
          notifyContentScript();
        });
      } else {
        alert('Por favor, completa todos los campos.');
      }
    });

    cancelPromptBtn.addEventListener('click', () => {
      dialogOverlay.remove();
    });

    closeButton.addEventListener('click', () => {
      dialogOverlay.remove();
    });

    promptOptionInput.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = promptOptionInput.selectionStart;
        const end = promptOptionInput.selectionEnd;


        promptOptionInput.value = promptOptionInput.value.substring(0, start) + '\t' + promptOptionInput.value.substring(end);


        promptOptionInput.selectionStart = promptOptionInput.selectionEnd = start + 1;
      }


      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        const start = promptOptionInput.selectionStart;
        const end = promptOptionInput.selectionEnd;


        promptOptionInput.value = promptOptionInput.value.substring(0, start) + '\n' + promptOptionInput.value.substring(end);


        promptOptionInput.selectionStart = promptOptionInput.selectionEnd = start + 1;
      }
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
