// utils.js

export function replaceTextInDiv(el, option, triggerKey) {
  const escapedTriggerKey = triggerKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const sel = window.getSelection();
  if (sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);
  const text = el.innerText;
  const regex = new RegExp(escapedTriggerKey + '.*$', 'i');
  const match = text.match(regex);

  if (match) {
    const before = text.substring(0, match.index);
    const after = text.substring(match.index + match[0].length);

    // Actualizar el contenido del elemento
    el.innerText = before + option + '\n' + after;

    // Colocar el cursor al final del texto insertado
    el.focus();
    const newRange = document.createRange();

    // Obtener el último nodo de texto
    const textNode = el.lastChild;
    const offset = textNode.length;

    newRange.setStart(textNode, offset);
    newRange.collapse(true);

    sel.removeAllRanges();
    sel.addRange(newRange);
  }
}

export function waitForElement(selector) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}