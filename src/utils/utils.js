

let previewTooltip;

export function showPromptPreview(content, anchorElement) {
  if (!previewTooltip) {
    previewTooltip = document.createElement('div');
    previewTooltip.classList.add('prompt-preview-tooltip');
    document.body.appendChild(previewTooltip);
  }

  previewTooltip.textContent =
    content.substring(0, 100) + (content.length > 100 ? '...' : '');

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
  if (el.isContentEditable) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    const range = sel.getRangeAt(0);


    const position = findTriggerKeyPosition(el, triggerKey, range);
    if (!position) return;


    const { container: startContainer, offset: startOffset } = position;
    const endContainer = range.endContainer;
    const endOffset = range.endOffset;

    const replaceRange = document.createRange();
    replaceRange.setStart(startContainer, startOffset);
    replaceRange.setEnd(endContainer, endOffset);


    replaceRange.deleteContents();


    const fragment = createOptionFragment(option);
    replaceRange.insertNode(fragment);


    sel.removeAllRanges();
    const newRange = document.createRange();
    if (fragment.lastChild) {
      newRange.setStartAfter(fragment.lastChild);
    } else {
      newRange.setStartAfter(replaceRange.endContainer);
    }
    newRange.collapse(true);
    sel.addRange(newRange);


    const event = new Event('input', { bubbles: true });
    el.dispatchEvent(event);
  } else if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
    const cursorPosition = el.selectionStart;
    const textBeforeCursor = el.value.substring(0, cursorPosition);
    const triggerKeyIndex = textBeforeCursor.lastIndexOf(triggerKey);
    if (triggerKeyIndex === -1) return;

    const beforeText = el.value.substring(0, triggerKeyIndex);
    const afterText = el.value.substring(el.selectionEnd);

    el.value = beforeText + option + afterText;


    const newCursorPosition = (beforeText + option).length;
    el.selectionStart = el.selectionEnd = newCursorPosition;


    const event = new Event('input', { bubbles: true });
    el.dispatchEvent(event);
  }
}

function findTriggerKeyPosition(el, triggerKey, caretRange) {

  const preCaretRange = document.createRange();
  preCaretRange.setStart(el, 0);
  preCaretRange.setEnd(caretRange.endContainer, caretRange.endOffset);

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
  let node;
  let offset = 0;

  let triggerNode = null;
  let triggerOffset = 0;
  while ((node = walker.nextNode())) {
    const nodeText = node.textContent;
    const triggerKeyIndex = nodeText.lastIndexOf(triggerKey);
    if (
      triggerKeyIndex !== -1 &&
      offset + triggerKeyIndex <= preCaretRange.toString().length
    ) {
      triggerNode = node;
      triggerOffset = triggerKeyIndex;
    }
    offset += nodeText.length;
  }

  if (triggerNode) {
    return { container: triggerNode, offset: triggerOffset };
  } else {
    return null;
  }
}

function createOptionFragment(option) {
  const fragment = document.createDocumentFragment();
  const lines = option.split('\n');

  lines.forEach((line, index) => {
    if (index > 0) {
      fragment.appendChild(document.createElement('br'));
    }
    const textNode = document.createTextNode(line);
    fragment.appendChild(textNode);
  });

  return fragment;
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


    promptTextarea.innerHTML = '';


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


    moveCaretToEnd(promptTextarea);


    const event = new Event('input', { bubbles: true });
    promptTextarea.dispatchEvent(event);
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
