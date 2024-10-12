// src/utils/utils.js

let previewTooltip;

export function showPromptPreview(content, anchorElement) {
  if (!previewTooltip) {
    previewTooltip = document.createElement('div');
    previewTooltip.classList.add('prompt-preview-tooltip');
    document.body.appendChild(previewTooltip);
  }

  previewTooltip.textContent = content.substring(0, 100) + (content.length > 100 ? '...' : '');

  const rect = anchorElement.getBoundingClientRect();
  previewTooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
  previewTooltip.style.left = `${rect.left + window.scrollX}px`;

  previewTooltip.classList.add('visible');
}

export function hidePromptPreview() {
  if (previewTooltip) {
    previewTooltip.classList.remove('visible');
  }
}

export function replaceTextInDiv(el, option, triggerKey) {
  const escapedTriggerKey = escapeRegExp(triggerKey);
  const sel = window.getSelection();
  if (sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);
  const text = el.innerText;
  const regex = new RegExp(escapedTriggerKey + '.*$', 'i');
  const match = text.match(regex);

  if (match) {
    const before = text.substring(0, match.index);
    const after = text.substring(match.index + match[0].length);

    // Escapa caracteres especiales de HTML
    const escapedOption = option
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Reemplaza \n por <br> y \t por espacios no separables (&nbsp;)
    const formattedOption = escapedOption
      .replace(/\n/g, '<br>')
      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');

    el.innerHTML = before + formattedOption + '<br>' + after;

    el.focus();
    const newRange = document.createRange();

    const lastNode = el.lastChild;
    if (lastNode) {
      if (lastNode.nodeType === Node.TEXT_NODE) {
        const offset = lastNode.length;
        newRange.setStart(lastNode, offset);
      } else {
        newRange.setStartAfter(lastNode);
      }
      newRange.collapse(true);

      sel.removeAllRanges();
      sel.addRange(newRange);
    }

    // Disparar evento input
    const event = new Event('input', { bubbles: true });
    el.dispatchEvent(event);
  }
}

export function waitForElement(selector) {
  return new Promise((resolve) => {
    const element = document.querySelector(selector);
    if (element) {
      return resolve(element);
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        resolve(el);
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getTextFromPromptTextarea() {
  const promptTextarea = document.getElementById('prompt-textarea');
  if (promptTextarea) {
    const text = getPlainTextFromContentEditable(promptTextarea);
    console.log('Texto obtenido del promptTextarea:', text);
    return text;
  }
  return '';
}

function getPlainTextFromContentEditable(element) {
  let text = '';
  const childNodes = element.childNodes;

  for (const node of childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === 'BR') {
        text += '\n';
      } else if (node.tagName === 'P' || node.tagName === 'DIV') {
        const childText = getPlainTextFromContentEditable(node);
        text += childText + '\n';
      } else {
        text += node.textContent;
      }
    }
  }

  return text;
}

export function setTextToPromptTextarea(text) {
  const promptTextarea = document.getElementById('prompt-textarea');
  if (promptTextarea) {
    promptTextarea.focus();

    // Limpiamos el contenido existente
    promptTextarea.innerHTML = '';

    // Dividimos el texto en líneas y creamos un <p> por línea
    const lines = text.split('\n');
    for (const line of lines) {
      const p = document.createElement('p');
      if (line === '') {
        p.appendChild(document.createElement('br'));
      } else {
        p.textContent = line;
      }
      promptTextarea.appendChild(p);
    }

    // Movemos el cursor al final
    moveCaretToEnd(promptTextarea);

    // Disparamos el evento input
    const event = new Event('input', { bubbles: true });
    promptTextarea.dispatchEvent(event);

    console.log('Texto establecido en promptTextarea:', text);
  }
}

function moveCaretToEnd(element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);

  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}
