export function saveCategories(categories) {
  return new Promise((resolve) => {

    const categoriesToSave = categories.filter(cat => cat.category !== 'Todos' && cat.id !== 'all');
    chrome.storage.local.set({ categories: categoriesToSave }, () => {
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
            defaultCategories.forEach((cat, index) => {
              cat.id = cat.id || index + 1;
              cat.isPredefined = true;
              cat.isVisible = cat.isVisible !== false;

              cat.options.forEach((option) => {
                option.isVisible = option.isVisible !== false;
                option.isPredefined = true;
              });
            });
            resolve(defaultCategories);
          });
      }
    });
  });
}

export function saveTriggerKey(triggerKey) {
  chrome.storage.local.set({ triggerKey }, () => {});
}

export function getTriggerKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['triggerKey'], (result) => {
      resolve(result.triggerKey || '<<');
    });
  });
}
