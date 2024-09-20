// storage.js

export function saveUserCategories(userCategories) {
  chrome.storage.local.set({ userCategories }, () => {
    console.log('Categorías del usuario guardadas.');
  });
}

export function getUserCategories() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['userCategories'], (result) => {
      resolve(result.userCategories || []);
    });
  });
}
