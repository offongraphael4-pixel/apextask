/**
 * ============================================================================
 * AUTHENTICATION MODAL (SIGN IN / REGISTER)
 * Allows reviewing the Worker and Business onboarding entry flows
 * ============================================================================
 */

import { store } from '../store.js';
import { Toast } from './toast.js';

export class AuthModal {
  static open(defaultMode = 'login', defaultRole = 'worker') {
    this.close();

    const backdrop = document.createElement('div');
    backdrop.id = 'auth-modal-backdrop';
    backdrop.className = 'modal-backdrop';

    let currentMode = defaultMode; // 'login' | 'register'
    let currentRole = defaultRole; // 'worker' | 'business'

    function renderContent() {
      return `
        <div class="modal-dialog" style="max-width: 440px;">
          <div class="modal-header">
            <div>
              <h3 class="modal-title" style="font-weight: 800; font-size: 1.25rem;">
                ${currentMode === 'login' ? 'Sign In to ApexTask' : 'Create an Account'}
              </h3>
              <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">
                ${currentMode === 'login' ? 'Welcome back! Access your earnings and tasks.' : 'Start earning or launching campaigns in minutes.'}
              </p>
            </div>
            <button class="modal-close" id="auth-modal-close">&times;</button>
          </div>

          <div class="modal-body" style="padding: 1.5rem;">
            <!-- Role Toggle if Registering -->
            ${currentMode === 'register' ? `
              <div style="display: flex; background: var(--bg-surface-elevated); padding: 4px; border-radius: var(--radius-sm); margin-bottom: 1.25rem; border: 1px solid var(--border-subtle);">
                <button type="button" class="auth-role-btn ${currentRole === 'worker' ? 'active' : ''}" data-role="worker" style="flex: 1; padding: 0.5rem; border: none; border-radius: var(--radius-xs); background: ${currentRole === 'worker' ? 'var(--primary-600)' : 'transparent'}; color: #fff; font-weight: 600; font-size: 0.8rem; cursor: pointer;">
                  💼 Contributor / Worker
                </button>
                <button type="button" class="auth-role-btn ${currentRole === 'business' ? 'active' : ''}" data-role="business" style="flex: 1; padding: 0.5rem; border: none; border-radius: var(--radius-xs); background: ${currentRole === 'business' ? 'var(--primary-600)' : 'transparent'}; color: #fff; font-weight: 600; font-size: 0.8rem; cursor: pointer;">
                  🏢 Business / Poster
                </button>
              </div>
            ` : ''}

            <!-- Social OAuth Buttons -->
            <button type="button" id="auth-google-btn" class="btn btn-secondary" style="width: 100%; margin-bottom: 1rem; font-size: 0.85rem;">
              <span>G</span> Continue with Google
            </button>

            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; color: var(--text-tertiary); font-size: 0.75rem;">
              <span style="flex: 1; height: 1px; background: var(--border-subtle);"></span>
              <span>OR EMAIL</span>
              <span style="flex: 1; height: 1px; background: var(--border-subtle);"></span>
            </div>

            <!-- Form Fields -->
            ${currentMode === 'register' ? `
              <div class="form-group">
                <label class="form-label">${currentRole === 'worker' ? 'Full Legal Name' : 'Company / Business Name'}</label>
                <input type="text" id="auth-name-input" class="form-control" placeholder="${currentRole === 'worker' ? 'e.g. Adeola Johnson' : 'e.g. PayStream Tech Ltd'}" value="${currentRole === 'worker' ? 'Adeola Johnson' : 'PayStream Technologies Ltd'}">
              </div>

              <div class="form-group">
                <label class="form-label">Phone Number (For OTP Verification)</label>
                <input type="tel" id="auth-phone-input" class="form-control" placeholder="+234 814 555 0192" value="+234 814 555 0192">
              </div>
            ` : ''}

            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" id="auth-email-input" class="form-control" placeholder="name@example.com" value="${currentRole === 'worker' ? 'adeola.johnson@example.com' : 'admin@paystream.io'}">
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" id="auth-password-input" class="form-control" value="••••••••••••">
            </div>

            <button type="button" id="auth-submit-btn" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 0.5rem; box-shadow: var(--shadow-glow-indigo);">
              ${currentMode === 'login' ? 'Sign In →' : `Create ${currentRole === 'worker' ? 'Worker' : 'Business'} Account →`}
            </button>

            <div style="text-align: center; margin-top: 1.25rem; font-size: 0.825rem; color: var(--text-secondary);">
              ${currentMode === 'login' ? `
                Don't have an account? <button type="button" id="toggle-auth-mode" style="background: transparent; border: none; color: var(--primary-400); font-weight: 700; cursor: pointer;">Sign Up</button>
              ` : `
                Already have an account? <button type="button" id="toggle-auth-mode" style="background: transparent; border: none; color: var(--primary-400); font-weight: 700; cursor: pointer;">Sign In</button>
              `}
            </div>
          </div>
        </div>
      `;
    }

    backdrop.innerHTML = renderContent();
    document.body.appendChild(backdrop);
    requestAnimationFrame(() => backdrop.classList.add('active'));

    function bindEvents() {
      backdrop.querySelector('#auth-modal-close')?.addEventListener('click', () => AuthModal.close());
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) AuthModal.close();
      });

      backdrop.querySelectorAll('.auth-role-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          currentRole = e.currentTarget.getAttribute('data-role');
          backdrop.innerHTML = renderContent();
          bindEvents();
        });
      });

      backdrop.querySelector('#toggle-auth-mode')?.addEventListener('click', () => {
        currentMode = currentMode === 'login' ? 'register' : 'login';
        backdrop.innerHTML = renderContent();
        bindEvents();
      });

      backdrop.querySelector('#auth-google-btn')?.addEventListener('click', () => {
        Toast.success('Google OAuth Verified', `Signed in as ${currentRole === 'worker' ? 'Adeola Johnson' : 'PayStream Admin'}.`);
        AuthModal.close();
      });

      backdrop.querySelector('#auth-submit-btn')?.addEventListener('click', () => {
        Toast.success(currentMode === 'login' ? 'Welcome Back!' : 'Account Created!', `Logged in successfully as ${currentRole === 'worker' ? 'Worker' : 'Business'}.`);
        store.setRole(currentRole);
        AuthModal.close();
        if (window.app) window.app.navigate(currentRole);
      });
    }

    bindEvents();
  }

  static close() {
    const backdrop = document.getElementById('auth-modal-backdrop');
    if (backdrop) {
      backdrop.classList.remove('active');
      setTimeout(() => {
        if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
      }, 250);
    }
  }
}
