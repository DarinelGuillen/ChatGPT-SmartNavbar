import '../assets/popup.css';
import '../assets/tailwind.css';


import { getTriggerKey, saveTriggerKey } from '../data/storage.js';

document.addEventListener('DOMContentLoaded', async () => {
  const openModalButton = document.getElementById('open-modal-button');
  const triggerKeyInput = document.getElementById('trigger-key');
  const saveTriggerKeyButton = document.getElementById('save-trigger-key-button');

  const triggerKey = await getTriggerKey();
  triggerKeyInput.value = triggerKey;

  openModalButton.addEventListener('click', () => {

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'OPEN_MODAL' });
      } else {
        alert('No se pudo comunicar con la pestaña activa.');
      }
    });
  });

  saveTriggerKeyButton.addEventListener('click', () => {
    const newTriggerKey = triggerKeyInput.value.trim();
    if (newTriggerKey) {
      saveTriggerKey(newTriggerKey);

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'TRIGGER_KEY_UPDATED' });
        }
      });
      alert('Tecla de activación guardada.');
    } else {
      alert('Por favor, ingresa una tecla de activación válida.');
    }
  });
});
