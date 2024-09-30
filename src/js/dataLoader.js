

import { getCategories } from './storage.js';

export async function loadCategories() {
  let categories = await getCategories();


  categories = JSON.parse(JSON.stringify(categories));
  categories.unshift({
    category: 'Todos',
    options: []
  });


  categories[0].options = categories.slice(1).reduce((acc, cat) => {
    if (Array.isArray(cat.options)) {
      return acc.concat(cat.options);
    }
    return acc;
  }, []);

  return categories;
}
