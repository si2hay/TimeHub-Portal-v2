/**
 * @file src/ui/modal.ui.js
 * @description Компонент модального окна.
 * @exports openModal, closeModal, renderModal
 * 
 * ФУНКЦИИ:
 * - openModal(container, content): открытие модалки с контентом.
 * - closeModal(): закрытие текущей модалки.
 * - renderModal(container, title, content): рендеринг модалки.
 * 
 * ПРИМЕР:
 * import { openModal } from './modal.ui.js';
 */
let currentModal = null;

export const openModal = (container, content) => {
  if (currentModal && container.contains(currentModal)) return;
  
  currentModal = document.createElement('div');
  currentModal.className = 'modal';
  currentModal.innerHTML = content || `
    <div class="modal-content">
      <h2>Title</h2>
      <p>Content</p>
      <button onclick="closeModal()">Close</button>
    </div>
  `;
  
  container.appendChild(currentModal);
};

export const closeModal = () => {
  if (currentModal && currentModal.parentNode) {
    currentModal.remove();
    currentModal = null;
  }
};

export const renderModal = (container, title, content) => {
  return openModal(container, `
    <div class="modal-content">
      <h2>${title}</h2>
      <p>${content || ''}</p>
      <button onclick="closeModal()">Close</button>
    </div>
  `);
};
