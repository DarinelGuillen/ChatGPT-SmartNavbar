

import { getCategories } from './storage.js';

export async function loadCategories() {
  let categories = await getCategories();


  categories = JSON.parse(JSON.stringify(categories));


  const visibleCategories = categories.filter(cat => cat.isVisible);


  visibleCategories.unshift({
    category: 'Todos',
    options: []
  });


  visibleCategories[0].options = visibleCategories.slice(1).reduce((acc, cat) => {
    if (Array.isArray(cat.options)) {
      return acc.concat(cat.options);
    }
    return acc;
  }, []);

  return visibleCategories;
}
