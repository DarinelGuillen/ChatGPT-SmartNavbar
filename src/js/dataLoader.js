

import { getCategories } from './storage.js';

export async function loadCategories() {
  let categories = await getCategories();


  categories = JSON.parse(JSON.stringify(categories));


  categories.sort((a, b) => {
    if (a.isVisible === b.isVisible) return 0;
    return a.isVisible ? -1 : 1;
  });


  categories.forEach(category => {
    if (Array.isArray(category.options)) {
      category.options.sort((a, b) => {
        if (a.isVisible === b.isVisible) return 0;
        return a.isVisible ? -1 : 1;
      });
    }
  });


  const visibleCategories = categories.filter(cat => cat.isVisible);


  const allCategory = {
    category: 'Todos',
    options: []
  };


  allCategory.options = visibleCategories.reduce((acc, cat) => {
    if (Array.isArray(cat.options)) {
      const visibleOptions = cat.options.filter(opt => opt.isVisible);
      return acc.concat(visibleOptions);
    }
    return acc;
  }, []);


  visibleCategories.unshift(allCategory);

  return visibleCategories;
}
