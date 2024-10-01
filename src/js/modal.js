

import { getCategories, saveCategories } from './storage.js';
import { loadCategories } from './dataLoader.js';

export function openModal(state) {

  let modal = document.getElementById('extension-modal');
  if (modal) {
    modal.classList.remove('hidden');
    return;
  }


  modal = document.createElement('div');
  modal.id = 'extension-modal';
  modal.classList.add('fixed', 'inset-0', 'bg-gray-800', 'bg-opacity-50', 'flex', 'items-center', 'justify-center', 'z-50');


  const modalContent = document.createElement('div');
  modalContent.classList.add('bg-white', 'rounded-lg', 'overflow-hidden', 'flex', 'w-4/5', 'h-4/5');


  const sidebar = document.createElement('div');
  sidebar.classList.add('w-64', 'bg-gray-100', 'p-4', 'overflow-auto', 'flex', 'flex-col');


  const categoriesTitle = document.createElement('h2');
  categoriesTitle.classList.add('text-xl', 'font-bold', 'mb-4');
  categoriesTitle.textContent = 'Categorías';
  sidebar.appendChild(categoriesTitle);


  const categoryList = document.createElement('div');
  categoryList.id = 'category-list';
  categoryList.classList.add('flex-grow', 'overflow-auto');
  sidebar.appendChild(categoryList);


  const addCategoryBtn = document.createElement('button');
  addCategoryBtn.id = 'add-category-btn';
  addCategoryBtn.classList.add('mt-4', 'bg-blue-500', 'text-white', 'px-4', 'py-2', 'rounded', 'flex', 'items-center');
  addCategoryBtn.innerHTML = `
    <img src="${chrome.runtime.getURL('icons/plus-circle.svg')}" class="mr-2 h-4 w-4" />
    Añadir Categoría
  `;
  sidebar.appendChild(addCategoryBtn);


  const mainPanel = document.createElement('div');
  mainPanel.classList.add('flex-1', 'p-4', 'overflow-auto', 'relative');


  const closeButton = document.createElement('button');
  closeButton.id = 'close-modal-button';
  closeButton.classList.add('absolute', 'top-2', 'right-2', 'text-gray-500', 'hover:text-gray-700');
  closeButton.innerHTML = `
    <img src="${chrome.runtime.getURL('icons/x.svg')}" class="h-6 w-6" />
  `;
  mainPanel.appendChild(closeButton);


  const mainTitle = document.createElement('h1');
  mainTitle.id = 'main-title';
  mainTitle.classList.add('text-2xl', 'font-bold', 'mb-4');
  mainTitle.textContent = 'Selecciona una Categoría';
  mainPanel.appendChild(mainTitle);


  const promptList = document.createElement('div');
  promptList.id = 'prompt-list';
  promptList.classList.add('h-[calc(100vh-8rem)]', 'overflow-auto');
  mainPanel.appendChild(promptList);


  const addPromptBtn = document.createElement('button');
  addPromptBtn.id = 'add-prompt-btn';
  addPromptBtn.classList.add('fixed', 'bottom-4', 'right-4', 'bg-blue-500', 'text-white', 'px-4', 'py-2', 'rounded', 'flex', 'items-center');
  addPromptBtn.innerHTML = `
    <img src="${chrome.runtime.getURL('icons/plus-circle.svg')}" class="mr-2 h-4 w-4" />
    Añadir Prompt
  `;
  mainPanel.appendChild(addPromptBtn);


  modalContent.appendChild(sidebar);
  modalContent.appendChild(mainPanel);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);


  initializeModalFunctionality({
    categoryList,
    promptList,
    mainTitle,
    addCategoryBtn,
    addPromptBtn,
    closeButton,
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
    state,
  } = elements;

  let categories = [];
  let selectedCategory = null;
  let editingPrompt = null;
  let editingCategory = null;
  let categoryToDelete = null;


  getCategories().then((loadedCategories) => {
    categories = loadedCategories;
    renderCategories();
    renderPrompts();
  });


  function renderCategories() {
    categoryList.innerHTML = '';
    categories.forEach(category => {
      const categoryItem = document.createElement('div');
      categoryItem.className = `p-2 mb-2 cursor-pointer rounded ${selectedCategory && selectedCategory.id === category.id ? 'bg-blue-200' : 'hover:bg-gray-200'}`;
      categoryItem.innerHTML = `
        <div class="flex justify-between items-center">
          <span>${category.category}</span>
          <div class="flex">
            <button class="toggle-visibility-btn mr-2" data-id="${category.id}">
              <img src="${chrome.runtime.getURL(category.isVisible ? 'icons/eye.svg' : 'icons/eye-off.svg')}" class="h-4 w-4" />
            </button>
            <button class="edit-category-btn mr-2" data-id="${category.id}">
              <img src="${chrome.runtime.getURL('icons/edit-3.svg')}" class="h-4 w-4" />
            </button>
            ${!category.isPredefined ? `
              <button class="delete-category-btn" data-id="${category.id}">
                <img src="${chrome.runtime.getURL('icons/trash.svg')}" class="h-4 w-4 text-red-500" />
              </button>
            ` : ''}
          </div>
        </div>
      `;

      categoryItem.addEventListener('click', (e) => {
        if (e.target.closest('.toggle-visibility-btn') || e.target.closest('.edit-category-btn') || e.target.closest('.delete-category-btn')) {

        } else {
          selectedCategory = category;
          renderPrompts();
          renderCategories();
        }
      });
      categoryList.appendChild(categoryItem);
    });
  }


  function renderPrompts() {
    promptList.innerHTML = '';
    if (selectedCategory) {
      mainTitle.textContent = `Prompts para ${selectedCategory.category}`;
      if (selectedCategory.options && selectedCategory.options.length > 0) {
        selectedCategory.options.forEach(prompt => {
          const promptCard = document.createElement('div');
          promptCard.className = 'mb-4 border rounded p-4';
          promptCard.innerHTML = `
            <div class="flex justify-between items-center mb-2">
              <h3 class="text-lg font-bold">${prompt.id}</h3>
              <div class="flex">
                <button class="edit-prompt-btn mr-2" data-id="${prompt.id}">
                  <img src="${chrome.runtime.getURL('icons/edit-3.svg')}" class="h-4 w-4" />
                </button>
                <button class="delete-prompt-btn" data-id="${prompt.id}">
                  <img src="${chrome.runtime.getURL('icons/trash.svg')}" class="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
            <p>${prompt.option}</p>
          `;
          promptList.appendChild(promptCard);
        });
      } else {
        promptList.innerHTML = '<p>No hay prompts en esta categoría.</p>';
      }
    } else {
      mainTitle.textContent = 'Selecciona una Categoría';
    }
  }


  addCategoryBtn.addEventListener('click', () => {
    openCategoryDialog();
  });


  addPromptBtn.addEventListener('click', () => {
    if (selectedCategory) {
      openPromptDialog();
    } else {
      alert('Por favor, selecciona una categoría primero.');
    }
  });


  closeButton.addEventListener('click', () => {
    const modal = document.getElementById('extension-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  });


  document.addEventListener('click', (e) => {
    if (e.target.closest('.toggle-visibility-btn')) {
      const id = parseInt(e.target.closest('.toggle-visibility-btn').dataset.id);
      toggleCategoryVisibility(id);
    }

    if (e.target.closest('.edit-category-btn')) {
      const id = parseInt(e.target.closest('.edit-category-btn').dataset.id);
      editCategory(id);
    }

    if (e.target.closest('.delete-category-btn')) {
      const id = parseInt(e.target.closest('.delete-category-btn').dataset.id);
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
  });


  function toggleCategoryVisibility(id) {
    const category = categories.find(cat => cat.id === id);
    category.isVisible = !category.isVisible;
    saveCategories(categories).then(() => {
      renderCategories();
      if (selectedCategory && selectedCategory.id === id) {
        renderPrompts();
      }
      notifyContentScript();
    });
  }

  function editCategory(id) {
    const category = categories.find(cat => cat.id === id);
    openCategoryDialog(category);
  }

  function confirmDeleteCategory(id) {
    const category = categories.find(cat => cat.id === id);
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


  function openCategoryDialog(category = null) {
    const dialog = document.createElement('div');
    dialog.classList.add('fixed', 'inset-0', 'bg-gray-800', 'bg-opacity-50', 'flex', 'items-center', 'justify-center', 'z-50');
    dialog.innerHTML = `
      <div class="bg-white rounded p-6 w-96">
        <h2 class="text-xl font-bold mb-4">${category ? 'Editar Categoría' : 'Añadir Nueva Categoría'}</h2>
        <label class="block mb-2">Nombre de la Categoría</label>
        <input type="text" id="category-name-input" class="w-full border px-2 py-1 mb-4" value="${category ? category.category : ''}" />
        <div class="flex justify-end">
          <button id="cancel-category-btn" class="mr-2 px-4 py-2">Cancelar</button>
          <button id="save-category-btn" class="bg-blue-500 text-white px-4 py-2 rounded">${category ? 'Guardar Cambios' : 'Guardar Categoría'}</button>
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
            id: Date.now(),
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
    dialog.classList.add('fixed', 'inset-0', 'bg-gray-800', 'bg-opacity-50', 'flex', 'items-center', 'justify-center', 'z-50');
    dialog.innerHTML = `
      <div class="bg-white rounded p-6 w-96">
        <h2 class="text-xl font-bold mb-4">${prompt ? 'Editar Prompt' : 'Añadir Nuevo Prompt'}</h2>
        <label class="block mb-2">ID del Prompt</label>
        <input type="text" id="prompt-id-input" class="w-full border px-2 py-1 mb-4" value="${prompt ? prompt.id : ''}" />
        <label class="block mb-2">Contenido del Prompt</label>
        <textarea id="prompt-option-input" class="w-full border px-2 py-1 mb-4" rows="5">${prompt ? prompt.option : ''}</textarea>
        <div class="flex justify-end">
          <button id="cancel-prompt-btn" class="mr-2 px-4 py-2">Cancelar</button>
          <button id="save-prompt-btn" class="bg-blue-500 text-white px-4 py-2 rounded">${prompt ? 'Guardar Cambios' : 'Guardar Prompt'}</button>
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
        } else {

          selectedCategory.options.push({ id, option });
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
      state.categories = newCategories.filter(cat => cat.isVisible);
      state.updateNavbar();
      state.updateNavbarSelection();
    });
  }
}
