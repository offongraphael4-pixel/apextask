/**
 * ============================================================================
 * TOAST NOTIFICATIONS CONTROLLER
 * ============================================================================
 */

export class Toast {
  static init() {
    if (!document.getElementById('toast-container')) {
      const container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
  }

  static show(title, message, type = 'info', durationMs = 4000) {
    this.init();
    const container = document.getElementById('toast-container');

    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
      warning: '⚠'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || 'ℹ'}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, durationMs);
  }

  static success(title, message) {
    this.show(title, message, 'success');
  }

  static error(title, message) {
    this.show(title, message, 'error', 5000);
  }

  static info(title, message) {
    this.show(title, message, 'info');
  }
}
