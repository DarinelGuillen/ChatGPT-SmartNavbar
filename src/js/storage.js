

export function saveCategories(categories) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ categories }, () => {
      console.log('Categorías guardadas.');
      resolve();
    });
  });
}

export function getCategories() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['categories'], (result) => {
      if (result.categories) {
        resolve(result.categories);
      } else {

        fetch(chrome.runtime.getURL('data/options.json'))
          .then((response) => response.json())
          .then((defaultCategories) => {
            resolve(defaultCategories);
          });
      }
    });
  });
}

export function saveTriggerKey(triggerKey) {
  chrome.storage.local.set({ triggerKey }, () => {
    console.log('Trigger key guardada.');
  });
}

export function getTriggerKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['triggerKey'], (result) => {
      resolve(result.triggerKey || '<<');
    });
  });
}
