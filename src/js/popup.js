// popup.js

import '../css/popup.css';
import '../css/tailwind.css';
import { getUserCategories, saveUserCategories } from './storage.js';

document.addEventListener('DOMContentLoaded', async () => {
  const categoriesList = document.getElementById('categories-list');
  const categorySelect = document.getElementById('category-select');
  const addCategoryButton = document.getElementById('add-category-button');
  const addPromptButton = document.getElementById('add-prompt-button');

  let userCategories = await getUserCategories();

  function notifyContentScript() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'USER_DATA_UPDATED' });
      }
    });
  }

  function renderCategories() {
    // Limpiar elementos existentes
    categoriesList.innerHTML = '';
    categorySelect.innerHTML = '';

    userCategories.forEach((category, index) => {
      // Crear elemento de categoría
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'category-item';

      const title = document.createElement('h2');
      title.textContent = category.category;
      title.className = 'text-lg font-bold mb-2';
      categoryDiv.appendChild(title);

      // Crear lista de prompts
      const promptsList = document.createElement('ul');
      category.opciones.forEach((prompt, promptIndex) => {
        const promptItem = document.createElement('li');
        promptItem.className = 'prompt-item';

        const promptText = document.createElement('span');
        promptText.textContent = prompt.id;
        promptItem.appendChild(promptText);

        // Botones de editar y eliminar
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

      // Botones de editar y eliminar categoría
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

      // Añadir opción al select de categorías
      const option = document.createElement('option');
      option.value = category.category;
      option.textContent = category.category;
      categorySelect.appendChild(option);
    });
  }

  function addCategory() {
    const newCategoryName = document.getElementById('new-category-name').value.trim();
    if (newCategoryName && !userCategories.find(cat => cat.category === newCategoryName)) {
      userCategories.push({
        category: newCategoryName,
        opciones: []
      });
      saveUserCategories(userCategories);
      notifyContentScript();
      renderCategories();
      document.getElementById('new-category-name').value = '';
    } else {
      alert('El nombre de la categoría es inválido o ya existe.');
    }
  }

  function addPrompt() {
    const selectedCategoryName = categorySelect.value;
    const newPromptId = document.getElementById('new-prompt-id').value.trim();
    const newPromptText = document.getElementById('new-prompt-text').value.trim();

    if (selectedCategoryName && newPromptId && newPromptText) {
      const category = userCategories.find(cat => cat.category === selectedCategoryName);
      if (category) {
        if (!category.opciones.find(prompt => prompt.id === newPromptId)) {
          category.opciones.push({
            id: newPromptId,
            option: newPromptText
          });
          saveUserCategories(userCategories);
          notifyContentScript();
          renderCategories();
          document.getElementById('new-prompt-id').value = '';
          document.getElementById('new-prompt-text').value = '';
        } else {
          alert('Ya existe un prompt con ese ID en esta categoría.');
        }
      }
    } else {
      alert('Por favor, completa todos los campos.');
    }
  }

  function editPrompt(categoryIndex, promptIndex) {
    // Implementar funcionalidad para editar prompt
    const prompt = userCategories[categoryIndex].opciones[promptIndex];
    const newPromptId = prompt.id;
    const newPromptText = prompt.option;

    const updatedPromptId = prompt.id = prompt.id + " (Editado)"; // Ejemplo de edición
    const updatedPromptText = prompt.option = prompt.option + " (Editado)";

    saveUserCategories(userCategories);
    notifyContentScript();
    renderCategories();
  }

  function deletePrompt(categoryIndex, promptIndex) {
    if (confirm('¿Estás seguro de que deseas eliminar este prompt?')) {
      userCategories[categoryIndex].opciones.splice(promptIndex, 1);
      saveUserCategories(userCategories);
      notifyContentScript();
      renderCategories();
    }
  }

  function editCategory(categoryIndex) {
    // Implementar funcionalidad para editar categoría
    const category = userCategories[categoryIndex];
    const newCategoryName = prompt('Editar nombre de la categoría:', category.category);
    if (newCategoryName && !userCategories.find(cat => cat.category === newCategoryName)) {
      category.category = newCategoryName;
      saveUserCategories(userCategories);
      notifyContentScript();
      renderCategories();
    } else {
      alert('El nombre es inválido o ya existe otra categoría con ese nombre.');
    }
  }

  function deleteCategory(categoryIndex) {
    if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      userCategories.splice(categoryIndex, 1);
      saveUserCategories(userCategories);
      notifyContentScript();
      renderCategories();
    }
  }

  addCategoryButton.addEventListener('click', addCategory);
  addPromptButton.addEventListener('click', addPrompt);

  // Renderizar categorías inicialmente
  renderCategories();
});
