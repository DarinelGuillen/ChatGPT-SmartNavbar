

import '../css/popup.css';
import '../css/tailwind.css';
import { getCategories, saveCategories, getTriggerKey, saveTriggerKey } from './storage.js';


document.addEventListener('DOMContentLoaded', async () => {
  const categoriesList = document.getElementById('categories-list');
  const categorySelect = document.getElementById('category-select');
  const addCategoryButton = document.getElementById('add-category-button');
  const addPromptButton = document.getElementById('add-prompt-button');
  const triggerKeyInput = document.getElementById('trigger-key');
  const saveTriggerKeyButton = document.getElementById('save-trigger-key-button');

  let categories = await getCategories();
  const triggerKey = await getTriggerKey();
  triggerKeyInput.value = triggerKey;

  function notifyContentScript() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'USER_DATA_UPDATED' });
      }
    });
  }

  function showModal(title, contentHTML, onSave) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const modalSaveButton = document.getElementById('modal-save-button');
    const modalCancelButton = document.getElementById('modal-cancel-button');

    modalTitle.textContent = title;
    modalContent.innerHTML = contentHTML;

    modalSaveButton.onclick = () => {
      onSave();
      hideModal();
    };

    modalCancelButton.onclick = hideModal;

    modal.classList.add('show');
  }

  function hideModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('show');
  }

  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  function renderCategories() {

    categoriesList.innerHTML = '';
    categorySelect.innerHTML = '';
    console.log('Renderizando categorías...');
    categories.forEach((category, index) => {
      console.log(`Renderizando categoría: ${category.category}`);

      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'category-item';

      const title = document.createElement('h2');
      title.textContent = category.category;
      title.className = 'text-lg font-bold mb-2';
      categoryDiv.appendChild(title);


      const promptsList = document.createElement('ul');
      category.options.forEach((prompt, promptIndex) => {
        console.log(`Renderizando prompt: ${prompt.id}`);
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


      const option = document.createElement('option');
      option.value = category.category;
      option.textContent = category.category;
      categorySelect.appendChild(option);
    });
  }

  function addCategory() {
    const newCategoryName = document.getElementById('new-category-name').value.trim();
    if (newCategoryName && !categories.find(cat => cat.category === newCategoryName)) {
      categories.push({
        category: newCategoryName,
        options: []
      });
      saveCategories(categories);
      notifyContentScript();
      renderCategories();
      document.getElementById('new-category-name').value = '';
      showNotification('Categoría agregada exitosamente');
    } else {
      alert('El nombre de la categoría es inválido o ya existe.');
    }
  }

  function addPrompt() {
    const selectedCategoryName = categorySelect.value;
    const newPromptId = document.getElementById('new-prompt-id').value.trim();
    const newPromptText = document.getElementById('new-prompt-text').value.trim();

    if (selectedCategoryName && newPromptId && newPromptText) {
      const category = categories.find(cat => cat.category === selectedCategoryName);
      if (category) {
        if (!category.options.find(prompt => prompt.id === newPromptId)) {
          category.options.push({
            id: newPromptId,
            option: newPromptText
          });
          saveCategories(categories);
          notifyContentScript();
          renderCategories();
          document.getElementById('new-prompt-id').value = '';
          document.getElementById('new-prompt-text').value = '';
          showNotification('Prompt agregado exitosamente');
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

    showModal('Editar Prompt', `
      <input id="edit-prompt-id" type="text" value="${currentPrompt.id}" class="w-full mb-2 p-2 border rounded" />
      <textarea id="edit-prompt-text" class="w-full p-2 border rounded">${currentPrompt.option}</textarea>
    `, () => {
      const updatedPromptId = document.getElementById('edit-prompt-id').value.trim();
      const updatedPromptText = document.getElementById('edit-prompt-text').value.trim();

      if (updatedPromptId && updatedPromptText) {
        currentPrompt.id = updatedPromptId;
        currentPrompt.option = updatedPromptText;
        saveCategories(categories);
        notifyContentScript();
        renderCategories();
        showNotification('Prompt editado exitosamente');
      } else {
        alert('Los campos no pueden estar vacíos.');
      }
    });
  }

  function deletePrompt(categoryIndex, promptIndex) {
    if (confirm('¿Estás seguro de que deseas eliminar este prompt?')) {
      categories[categoryIndex].options.splice(promptIndex, 1);
      saveCategories(categories);
      notifyContentScript();
      renderCategories();
      showNotification('Prompt eliminado exitosamente');
    }
  }

  function editCategory(categoryIndex) {
    const category = categories[categoryIndex];
    showModal('Editar Categoría', `
      <input id="edit-category-name" type="text" value="${category.category}" class="w-full p-2 border rounded" />
    `, () => {
      const newCategoryName = document.getElementById('edit-category-name').value.trim();
      if (newCategoryName && !categories.find(cat => cat.category === newCategoryName)) {
        category.category = newCategoryName;
        saveCategories(categories);
        notifyContentScript();
        renderCategories();
        showNotification('Categoría editada exitosamente');
      } else {
        alert('El nombre es inválido o ya existe otra categoría con ese nombre.');
      }
    });
  }

  function deleteCategory(categoryIndex) {
    if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      categories.splice(categoryIndex, 1);
      saveCategories(categories);
      notifyContentScript();
      renderCategories();
      showNotification('Categoría eliminada exitosamente');
    }
  }

  addCategoryButton.addEventListener('click', addCategory);
  addPromptButton.addEventListener('click', addPrompt);

  saveTriggerKeyButton.addEventListener('click', () => {
    const newTriggerKey = triggerKeyInput.value.trim();
    if (newTriggerKey) {
      saveTriggerKey(newTriggerKey);
      notifyContentScript();
      showNotification('Tecla de activación guardada.');
    } else {
      showNotification('Por favor, ingresa una tecla de activación válida.');
    }
  });

  renderCategories();
});


document.addEventListener('DOMContentLoaded', () => {
  const openModalButton = document.getElementById('open-modal-button');

  openModalButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'OPEN_MODAL' });
      }
    });
  });
});
