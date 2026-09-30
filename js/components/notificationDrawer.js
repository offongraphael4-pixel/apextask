/**
 * ============================================================================
 * SLIDE-OUT NOTIFICATION DRAWER COMPONENT
 * Real-Time Event Feed with Unread Counters & Status Notifications
 * ============================================================================
 */

import { store } from '../store.js';

export class NotificationDrawer {
  static init() {
    if (document.getElementById('notification-drawer-backdrop')) return;

    const backdrop = document.createElement('div');
    backdrop.id = 'notification-drawer-backdrop';
    backdrop.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
      z-index: var(--z-drawer); opacity: 0; pointer-events: none; transition: opacity var(--transition-normal);
    `;

    const drawer = document.createElement('div');
    drawer.id = 'notification-drawer';
    drawer.style.cssText = `
      position: fixed; top: 0; right: 0; width: min(420px, 100vw); height: 100vh;
      background: var(--bg-surface); border-left: 1px solid var(--border-strong);
      z-index: calc(var(--z-drawer) + 1); transform: translateX(100%); transition: transform var(--transition-normal);
      display: flex; flex-direction: column; box-shadow: var(--shadow-lg);
    `;

    drawer.innerHTML = `
      <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <h3 style="font-size: 1.15rem; font-weight: 800;">Notifications</h3>
          <span id="drawer-unread-badge" class="badge badge-indigo">0 New</span>
        </div>
        <button id="close-drawer-btn" style="background: transparent; border: none; color: var(--text-tertiary); font-size: 1.5rem; cursor: pointer;">&times;</button>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1.5rem; background: var(--bg-surface-elevated); border-bottom: 1px solid var(--border-subtle); font-size: 0.8rem;">
        <span style="color: var(--text-secondary);">Real-Time Event Stream</span>
        <button id="mark-all-read-btn" class="btn btn-ghost btn-sm" style="font-size: 0.75rem; color: var(--primary-400); padding: 0;">Mark all as read</button>
      </div>

      <div id="drawer-notif-list" style="flex: 1; overflow-y: auto; padding: 1rem 1.5rem; display: flex; flex-direction: column; gap: 0.75rem;">
        <!-- Notification Items -->
      </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    backdrop.addEventListener('click', () => this.close());
    drawer.querySelector('#close-drawer-btn').addEventListener('click', () => this.close());

    drawer.querySelector('#mark-all-read-btn').addEventListener('click', () => {
      store.state.notifications.forEach(n => n.read = true);
      store.saveState();
      this.renderList();
    });
  }

  static toggle() {
    this.init();
    const drawer = document.getElementById('notification-drawer');
    const backdrop = document.getElementById('notification-drawer-backdrop');

    if (drawer.classList.contains('open')) {
      this.close();
    } else {
      this.open();
    }
  }

  static open() {
    this.init();
    const drawer = document.getElementById('notification-drawer');
    const backdrop = document.getElementById('notification-drawer-backdrop');

    this.renderList();

    backdrop.style.opacity = '1';
    backdrop.style.pointerEvents = 'auto';
    drawer.style.transform = 'translateX(0)';
    drawer.classList.add('open');
  }

  static close() {
    const drawer = document.getElementById('notification-drawer');
    const backdrop = document.getElementById('notification-drawer-backdrop');
    if (drawer && backdrop) {
      backdrop.style.opacity = '0';
      backdrop.style.pointerEvents = 'none';
      drawer.style.transform = 'translateX(100%)';
      drawer.classList.remove('open');
    }
  }

  static renderList() {
    const listContainer = document.getElementById('drawer-notif-list');
    const unreadBadge = document.getElementById('drawer-unread-badge');
    if (!listContainer) return;

    const notifs = store.state.notifications || [];
    const unreadCount = notifs.filter(n => !n.read).length;

    if (unreadBadge) {
      unreadBadge.textContent = `${unreadCount} New`;
      unreadBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }

    if (notifs.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-tertiary);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔔</div>
          <div style="font-weight: 700; color: var(--text-secondary);">No notifications yet</div>
          <div style="font-size: 0.8rem; margin-top: 4px;">Task approvals, escrow updates, and payout alerts will appear here.</div>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = notifs.map(n => `
      <div style="background: ${n.read ? 'var(--bg-surface-elevated)' : 'rgba(99, 102, 241, 0.08)'}; border: 1px solid ${n.read ? 'var(--border-subtle)' : 'rgba(99, 102, 241, 0.3)'}; border-radius: var(--radius-sm); padding: 0.85rem 1rem; transition: background var(--transition-fast);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
          <strong style="font-size: 0.875rem; color: #fff;">${n.title}</strong>
          <span style="font-size: 0.7rem; color: var(--text-tertiary);">${n.time}</span>
        </div>
        <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">${n.desc}</div>
      </div>
    `).join('');
  }
}
