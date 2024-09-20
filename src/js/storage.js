// storage.js

export function saveCategories(categories) {
  chrome.storage.local.set({ categories }, () => {
    console.log('Categorías guardadas.');
  });
}

export function getCategories() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['categories'], (result) => {
      if (result.categories) {
        resolve(result.categories);
      } else {
        // Si no hay categorías guardadas, cargar las predeterminadas
        fetch(chrome.runtime.getURL('data/options.json'))
          .then((response) => response.json())
          .then((defaultCategories) => {
            resolve(defaultCategories);
          });
      }
    });
  });
}
