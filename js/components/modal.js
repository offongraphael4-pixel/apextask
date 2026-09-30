/**
 * ============================================================================
 * MODAL MANAGER COMPONENT
 * ============================================================================
 */

export class Modal {
  static open(title, bodyHtml, footerHtml = '') {
    this.close(); // Close any existing modal

    const backdrop = document.createElement('div');
    backdrop.id = 'active-modal-backdrop';
    backdrop.className = 'modal-backdrop';

    backdrop.innerHTML = `
      <div class="modal-dialog" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" aria-label="Close modal">&times;</button>
        </div>
        <div class="modal-body">
          ${bodyHtml}
        </div>
        ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
      </div>
    `;

    document.body.appendChild(backdrop);

    // Event listeners
    backdrop.querySelector('.modal-close').addEventListener('click', () => this.close());
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) this.close();
    });

    requestAnimationFrame(() => {
      backdrop.classList.add('active');
    });

    return backdrop;
  }

  static close() {
    const backdrop = document.getElementById('active-modal-backdrop');
    if (backdrop) {
      backdrop.classList.remove('active');
      setTimeout(() => {
        if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
      }, 250);
    }
  }
}
