// src/components/canvasEditor.js

import { getTextFromPromptTextarea, setTextToPromptTextarea } from '../utils/utils.js';

export function openCanvasEditor() {
  let canvasOverlay = document.getElementById('canvas-overlay');
  if (!canvasOverlay) {
    canvasOverlay = document.createElement('div');
    canvasOverlay.id = 'canvas-overlay';
    canvasOverlay.classList.add('canvas-overlay');
    document.body.appendChild(canvasOverlay);
  } else {
    canvasOverlay.classList.remove('hidden');
  }

  let canvasEditor = document.getElementById('canvas-editor');
  if (canvasEditor) {
    canvasEditor.classList.remove('hidden');

    // Actualizar el contenido con el texto más reciente
    const promptText = getTextFromPromptTextarea();
    initializeCanvasEditor(promptText);
    return;
  }

  canvasEditor = document.createElement('div');
  canvasEditor.id = 'canvas-editor';
  canvasEditor.classList.add('canvas-editor');

  const header = document.createElement('div');
  header.classList.add('canvas-header');

  const title = document.createElement('div');
  title.classList.add('canvas-title');
  title.textContent = 'Canvas Editor';
  header.appendChild(title);

  const closeIcon = document.createElement('img');
  closeIcon.src = chrome.runtime.getURL('assets/icons/close.svg');
  closeIcon.classList.add('canvas-close-icon');
  closeIcon.addEventListener('click', () => {
    const text = getTextFromTabs();
    setTextToPromptTextarea(text);

    // Disparar evento input para actualizar el dropdown en el input target
    const promptTextarea = document.getElementById('prompt-textarea');
    if (promptTextarea) {
      const event = new Event('input', { bubbles: true });
      promptTextarea.dispatchEvent(event);
      promptTextarea.focus();
    }
    closeCanvasEditor();
  });
  header.appendChild(closeIcon);

  canvasEditor.appendChild(header);

  const mainContent = document.createElement('div');
  mainContent.classList.add('canvas-main-content');

  // Crear navegación de pestañas
  const tabNav = document.createElement('div');
  tabNav.classList.add('canvas-tab-nav');

  // Crear botón '+' para añadir nuevas pestañas
  const addTabButton = document.createElement('button');
  addTabButton.classList.add('canvas-add-tab-button');
  addTabButton.textContent = '+';
  addTabButton.addEventListener('click', () => {
    addNewTab();
  });

  // Insertar botón '+' en la navegación de pestañas
  tabNav.appendChild(addTabButton);

  // Crear contenedor de contenido de pestañas
  const tabContentContainer = document.createElement('div');
  tabContentContainer.classList.add('canvas-tab-content-container');

  mainContent.appendChild(tabNav);
  mainContent.appendChild(tabContentContainer);

  canvasEditor.appendChild(mainContent);

  const footer = document.createElement('div');
  footer.classList.add('canvas-footer');

  const insertTextButton = document.createElement('button');
  insertTextButton.classList.add('insert-text-button');
  insertTextButton.setAttribute('type', 'button');

  const insertTextIcon = document.createElement('img');
  insertTextIcon.src = chrome.runtime.getURL('assets/icons/file-text.svg');
  insertTextIcon.classList.add('insert-text-icon');
  insertTextButton.appendChild(insertTextIcon);

  const buttonText = document.createElement('span');
  buttonText.textContent = 'Insert Text';
  insertTextButton.appendChild(buttonText);

  insertTextButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    const text = getTextFromTabs();
    setTextToPromptTextarea(text);

    // Disparar evento input para actualizar el dropdown en el input target
    const promptTextarea = document.getElementById('prompt-textarea');
    if (promptTextarea) {
      const inputEvent = new Event('input', { bubbles: true });
      promptTextarea.dispatchEvent(inputEvent);
      promptTextarea.focus();
    }

    closeCanvasEditor();
  });

  footer.appendChild(insertTextButton);

  canvasEditor.appendChild(footer);

  document.body.appendChild(canvasEditor);

  // Inicializar el editor de canvas con el contenido
  const promptText = getTextFromPromptTextarea();
  initializeCanvasEditor(promptText);
}

function closeCanvasEditor() {
  const canvasEditor = document.getElementById('canvas-editor');
  const canvasOverlay = document.getElementById('canvas-overlay');
  if (canvasEditor) {
    canvasEditor.classList.add('hidden');
    // Limpiar el contenido del editor al cerrarlo
    const tabContentContainer = canvasEditor.querySelector('.canvas-tab-content-container');
    if (tabContentContainer) {
      tabContentContainer.innerHTML = '';
    }
    const tabNav = canvasEditor.querySelector('.canvas-tab-nav');
    if (tabNav) {
      tabNav.innerHTML = '';
    }
  }
  if (canvasOverlay) {
    canvasOverlay.classList.add('hidden');
  }

  // Enfocar el div target y disparar evento input
  const promptTextarea = document.getElementById('prompt-textarea');
  if (promptTextarea) {
    const event = new Event('input', { bubbles: true });
    promptTextarea.dispatchEvent(event);
    promptTextarea.focus();
  }
}

function initializeCanvasEditor(promptText) {
  const canvasEditor = document.getElementById('canvas-editor');
  if (!canvasEditor) return;

  const tabNav = canvasEditor.querySelector('.canvas-tab-nav');
  const tabContentContainer = canvasEditor.querySelector('.canvas-tab-content-container');

  // Limpiar contenido previo
  tabNav.innerHTML = '';
  tabContentContainer.innerHTML = '';

  // Crear botón '+' para añadir nuevas pestañas
  const addTabButton = document.createElement('button');
  addTabButton.classList.add('canvas-add-tab-button');
  addTabButton.textContent = '+';
  addTabButton.addEventListener('click', () => {
    addNewTab();
  });
  tabNav.appendChild(addTabButton);

  let sections = parsePromptText(promptText);
  if (sections.length === 0) {
    // Si no hay secciones, mostrar ejemplo con 4 pestañas
    sections = [
      { title: 'ExampleTab1', content: 'This is example content for tab 1.' },
      { title: 'ExampleTab2', content: 'This is example content for tab 2.' },
      { title: 'ExampleTab3', content: 'This is example content for tab 3.' },
      { title: 'ExampleTab4', content: 'This is example content for tab 4.' },
    ];
  }

  // Almacenar secciones en canvasEditor para uso posterior
  canvasEditor.sections = sections;

  sections.forEach((section, index) => {
    createTab(section.title, section.content, index);
  });

  // Activar la primera pestaña por defecto
  activateTab(0);
}

function parsePromptText(promptText) {
  const sections = [];
  const parts = promptText.split('--').filter(part => part.trim() !== '');

  parts.forEach(part => {
    const firstSpaceIndex = part.indexOf(' ');
    if (firstSpaceIndex !== -1) {
      const title = part.substring(0, firstSpaceIndex).trim();
      const content = part.substring(firstSpaceIndex + 1).trim();
      sections.push({ title, content });
    } else {
      // Si no hay espacio, todo es título y contenido vacío
      const title = part.trim();
      sections.push({ title, content: '' });
    }
  });
  return sections;
}

function createTab(title, content, index) {
  const canvasEditor = document.getElementById('canvas-editor');
  const tabNav = canvasEditor.querySelector('.canvas-tab-nav');
  const tabContentContainer = canvasEditor.querySelector('.canvas-tab-content-container');

  // Crear botón de pestaña
  const tabButton = document.createElement('button');
  tabButton.classList.add('canvas-tab-button');
  tabButton.textContent = title;
  tabButton.dataset.index = index;

  tabButton.addEventListener('click', () => {
    activateTab(index);
  });

  // Insertar antes del botón '+'
  const addTabButton = tabNav.querySelector('.canvas-add-tab-button');
  tabNav.insertBefore(tabButton, addTabButton);

  // Crear área de contenido de pestaña
  const tabContent = document.createElement('div');
  tabContent.classList.add('canvas-tab-content');
  tabContent.dataset.index = index;

  const titleInput = document.createElement('input');
  titleInput.classList.add('canvas-tab-title-input');
  titleInput.type = 'text';
  titleInput.value = title;

  titleInput.addEventListener('input', () => {
    // Actualizar texto del botón de pestaña al cambiar título
    tabButton.textContent = titleInput.value;
    // Actualizar el título en la sección
    canvasEditor.sections[index].title = titleInput.value;
  });

  const textArea = document.createElement('textarea');
  textArea.classList.add('canvas-tab-textarea');
  textArea.value = content;

  textArea.addEventListener('input', () => {
    // Actualizar el contenido en la sección
    canvasEditor.sections[index].content = textArea.value;
  });

  tabContent.appendChild(titleInput);
  tabContent.appendChild(textArea);

  tabContentContainer.appendChild(tabContent);
}

function activateTab(index) {
  const canvasEditor = document.getElementById('canvas-editor');
  const tabNav = canvasEditor.querySelector('.canvas-tab-nav');
  const tabContentContainer = canvasEditor.querySelector('.canvas-tab-content-container');

  // Desactivar todas las pestañas y ocultar sus contenidos
  const tabButtons = tabNav.querySelectorAll('.canvas-tab-button');
  const tabContents = tabContentContainer.querySelectorAll('.canvas-tab-content');

  tabButtons.forEach(button => {
    if (parseInt(button.dataset.index) === index) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });

  tabContents.forEach(content => {
    if (parseInt(content.dataset.index) === index) {
      content.classList.remove('hidden');
    } else {
      content.classList.add('hidden');
    }
  });
}

function addNewTab() {
  const canvasEditor = document.getElementById('canvas-editor');
  const sections = canvasEditor.sections;

  const newIndex = sections.length;
  const newTitle = `Nueva Pestaña ${newIndex + 1}`;
  const newContent = '';

  sections.push({ title: newTitle, content: newContent });

  createTab(newTitle, newContent, newIndex);
  activateTab(newIndex);
}

function getTextFromTabs() {
  const canvasEditor = document.getElementById('canvas-editor');
  const sections = canvasEditor.sections;

  let text = '';
  sections.forEach(section => {
    text += `--${section.title} ${section.content}\n`;
  });

  return text.trim();
}
