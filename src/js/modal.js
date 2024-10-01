

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
  modal.classList.add('fixed', 'inset-0', 'flex', 'items-center', 'justify-center', 'bg-black', 'bg-opacity-75', 'z-50');

  const modalContent = document.createElement('div');
  modalContent.classList.add('bg-white', 'rounded-lg', 'p-6', 'w-4/5', 'h-4/5', 'overflow-auto');


  const closeButton = document.createElement('button');
  closeButton.textContent = 'Cerrar';
  closeButton.classList.add('btn', 'bg-gray-500', 'text-white', 'mb-4');
  closeButton.addEventListener('click', () => {
    modal.classList.add('hidden');
  });


  const modalTitle = document.createElement('h2');
  modalTitle.textContent = 'Gestionar Prompts y Categorías';
  modalTitle.classList.add('text-xl', 'font-semibold', 'mb-4', 'text-gray-800');


  const newCategorySection = document.createElement('div');
  newCategorySection.classList.add('mb-4', 'w-full');

  const newCategoryInput = document.createElement('input');
  newCategoryInput.type = 'text';
  newCategoryInput.id = 'new-category-name';
  newCategoryInput.placeholder = 'Nombre de la nueva categoría';
  newCategoryInput.classList.add('input-field', 'w-full', 'mb-2', 'p-2', 'border', 'rounded');
  newCategorySection.appendChild(newCategoryInput);

  const addCategoryButton = document.createElement('button');
  addCategoryButton.id = 'add-category-button';
  addCategoryButton.textContent = 'Agregar Categoría';
  addCategoryButton.classList.add('w-full', 'px-4', 'py-2', 'bg-blue-500', 'text-white', 'rounded', 'hover:bg-blue-600');
  newCategorySection.appendChild(addCategoryButton);


  const newPromptSection = document.createElement('div');
  newPromptSection.classList.add('mb-4', 'w-full');

  const categorySelect = document.createElement('select');
  categorySelect.id = 'category-select';
  categorySelect.classList.add('input-field', 'w-full', 'mb-2', 'p-2', 'border', 'rounded');
  newPromptSection.appendChild(categorySelect);

  const newPromptIdInput = document.createElement('input');
  newPromptIdInput.type = 'text';
  newPromptIdInput.id = 'new-prompt-id';
  newPromptIdInput.placeholder = 'ID del Prompt';
  newPromptIdInput.classList.add('input-field', 'w-full', 'mb-2', 'p-2', 'border', 'rounded');
  newPromptSection.appendChild(newPromptIdInput);

  const newPromptTextInput = document.createElement('textarea');
  newPromptTextInput.id = 'new-prompt-text';
  newPromptTextInput.placeholder = 'Texto del Prompt';
  newPromptTextInput.classList.add('input-field', 'w-full', 'mb-2', 'p-2', 'border', 'rounded');
  newPromptSection.appendChild(newPromptTextInput);

  const addPromptButton = document.createElement('button');
  addPromptButton.id = 'add-prompt-button';
  addPromptButton.textContent = 'Agregar Prompt';
  addPromptButton.classList.add('w-full', 'px-4', 'py-2', 'bg-green-500', 'text-white', 'rounded', 'hover:bg-green-600');
  newPromptSection.appendChild(addPromptButton);


  const categoriesList = document.createElement('div');
  categoriesList.id = 'categories-list';
  categoriesList.classList.add('w-full');


  modalContent.appendChild(closeButton);
  modalContent.appendChild(modalTitle);
  modalContent.appendChild(newCategorySection);
  modalContent.appendChild(newPromptSection);
  modalContent.appendChild(categoriesList);


  modal.appendChild(modalContent);


  document.body.appendChild(modal);


  initializeModalFunctionality({
    newCategoryInput,
    addCategoryButton,
    categorySelect,
    newPromptIdInput,
    newPromptTextInput,
    addPromptButton,
    categoriesList,
    state,
  });
}

function initializeModalFunctionality(elements) {
  const {
    newCategoryInput,
    addCategoryButton,
    categorySelect,
    newPromptIdInput,
    newPromptTextInput,
    addPromptButton,
    categoriesList,
    state,
  } = elements;

  let categories = [];


  getCategories().then((loadedCategories) => {
    categories = loadedCategories;
    renderCategories();
  });

  function renderCategories() {
    categoriesList.innerHTML = '';
    categorySelect.innerHTML = '';

    categories.forEach((category, index) => {

      const option = document.createElement('option');
      option.value = category.category;
      option.textContent = category.category;
      categorySelect.appendChild(option);


      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'category-item';

      const title = document.createElement('h2');
      title.textContent = category.category;
      title.className = 'text-lg font-bold mb-2';
      categoryDiv.appendChild(title);

      const promptsList = document.createElement('ul');
      category.options.forEach((prompt, promptIndex) => {
        const promptItem = document.createElement('li');
        promptItem.className = 'prompt-item';

        const promptText = document.createElement('span');
        promptText.textContent = prompt.id;
        promptItem.appendChild(promptText);

        const buttonsDiv = document.createElement('div');

        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.className = 'btn btn-sm bg-yellow-500 text-white mr-2';
        editButton.onclick = () => editPrompt(index, promptIndex);
        buttonsDiv.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.className = 'btn btn-sm bg-red-500 text-white';
        deleteButton.onclick = () => deletePrompt(index, promptIndex);
        buttonsDiv.appendChild(deleteButton);

        promptItem.appendChild(buttonsDiv);
        promptsList.appendChild(promptItem);
      });

      categoryDiv.appendChild(promptsList);

      const categoryButtonsDiv = document.createElement('div');
      categoryButtonsDiv.className = 'mt-2';

      const editCategoryButton = document.createElement('button');
      editCategoryButton.textContent = 'Editar Categoría';
      editCategoryButton.className = 'btn btn-sm bg-blue-500 text-white mr-2';
      editCategoryButton.onclick = () => editCategory(index);
      categoryButtonsDiv.appendChild(editCategoryButton);

      const deleteCategoryButton = document.createElement('button');
      deleteCategoryButton.textContent = 'Eliminar Categoría';
      deleteCategoryButton.className = 'btn btn-sm bg-red-500 text-white';
      deleteCategoryButton.onclick = () => deleteCategory(index);
      categoryButtonsDiv.appendChild(deleteCategoryButton);

      categoryDiv.appendChild(categoryButtonsDiv);

      categoriesList.appendChild(categoryDiv);
    });
  }

  function addCategory() {
    const newCategoryName = newCategoryInput.value.trim();
    if (newCategoryName && !categories.find(cat => cat.category === newCategoryName)) {
      categories.push({
        category: newCategoryName,
        options: []
      });
      saveCategories(categories).then(() => {
        renderCategories();
        newCategoryInput.value = '';
        notifyContentScript();
      });
    } else {
      alert('El nombre de la categoría es inválido o ya existe.');
    }
  }

  function addPrompt() {
    const selectedCategoryName = categorySelect.value;
    const newPromptId = newPromptIdInput.value.trim();
    const newPromptText = newPromptTextInput.value.trim();

    if (selectedCategoryName && newPromptId && newPromptText) {
      const category = categories.find(cat => cat.category === selectedCategoryName);
      if (category) {
        if (!category.options.find(prompt => prompt.id === newPromptId)) {
          category.options.push({
            id: newPromptId,
            option: newPromptText
          });
          saveCategories(categories).then(() => {
            renderCategories();
            newPromptIdInput.value = '';
            newPromptTextInput.value = '';
            notifyContentScript();
          });
        } else {
          alert('Ya existe un prompt con ese ID en esta categoría.');
        }
      }
    } else {
      alert('Por favor, completa todos los campos.');
    }
  }

  function editPrompt(categoryIndex, promptIndex) {
    const currentPrompt = categories[categoryIndex].options[promptIndex];
    const updatedPromptId = prompt('Editar ID del Prompt:', currentPrompt.id);
    if (updatedPromptId !== null) {
      const updatedPromptText = prompt('Editar Texto del Prompt:', currentPrompt.option);
      if (updatedPromptText !== null) {
        currentPrompt.id = updatedPromptId.trim();
        currentPrompt.option = updatedPromptText.trim();
        saveCategories(categories).then(() => {
          renderCategories();
          notifyContentScript();
        });
      }
    }
  }

  function deletePrompt(categoryIndex, promptIndex) {
    if (confirm('¿Estás seguro de que deseas eliminar este prompt?')) {
      categories[categoryIndex].options.splice(promptIndex, 1);
      saveCategories(categories).then(() => {
        renderCategories();
        notifyContentScript();
      });
    }
  }

  function editCategory(categoryIndex) {
    const category = categories[categoryIndex];
    const newCategoryName = prompt('Editar Nombre de la Categoría:', category.category);
    if (newCategoryName !== null && newCategoryName.trim() !== '') {
      if (!categories.find(cat => cat.category === newCategoryName.trim())) {
        category.category = newCategoryName.trim();
        saveCategories(categories).then(() => {
          renderCategories();
          notifyContentScript();
        });
      } else {
        alert('El nombre es inválido o ya existe otra categoría con ese nombre.');
      }
    }
  }

  function deleteCategory(categoryIndex) {
    if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      categories.splice(categoryIndex, 1);
      saveCategories(categories).then(() => {
        renderCategories();
        notifyContentScript();
      });
    }
  }

  function notifyContentScript() {

    loadCategories().then((newCategories) => {
      state.categories = newCategories;
      state.updateNavbar();
      state.updateNavbarSelection();
    });
  }


  addCategoryButton.addEventListener('click', addCategory);
  addPromptButton.addEventListener('click', addPrompt);
}
