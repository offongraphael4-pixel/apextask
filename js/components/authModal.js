/**
 * ============================================================================
 * AUTHENTICATION MODAL (SIGN IN / REGISTER)
 * Allows reviewing the Worker and Business onboarding entry flows
 * ============================================================================
 */

import { store } from '../store.js';
import { Toast } from './toast.js';
import { signUpUser, signInUser, resetPasswordForEmail, resendVerificationEmail } from '../supabaseClient.js';
import { isSupabaseConfigured } from '../supabaseConfig.js';

export class AuthModal {
  static open(defaultMode = 'login', defaultRole = 'worker', redirectRoute = null, onAuthenticated = null) {
    this.close();

    const backdrop = document.createElement('div');
    backdrop.id = 'auth-modal-backdrop';
    backdrop.className = 'modal-backdrop';

    let currentMode = defaultMode; // 'login' | 'register' | 'confirmation_sent' | 'forgot_password'
    let currentRole = defaultRole; // 'worker' | 'business'
    let lastRegisteredEmail = '';

    function renderContent() {
      const configured = isSupabaseConfigured();

      if (currentMode === 'confirmation_sent') {
        return `
          <div class="modal-dialog" style="max-width: 440px;">
            <div class="modal-header">
              <h3 class="modal-title" style="font-weight: 800; font-size: 1.25rem;">Verify Your Email</h3>
              <button class="modal-close" id="auth-modal-close">&times;</button>
            </div>
            <div class="modal-body" style="padding: 2rem 1.5rem; text-align: center;">
              <div style="width: 64px; height: 64px; margin: 0 auto 1.25rem; background: rgba(99, 102, 241, 0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: var(--primary-400);">
                ✉️
              </div>
              <h4 style="font-size: 1.15rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem;">Confirmation Link Sent!</h4>
              <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1.5rem;">
                A verification email was sent to <strong style="color: #fff; word-break: break-all;">${lastRegisteredEmail}</strong>.
                Please check your inbox (and spam folder) and click the confirmation link to activate your account.
              </p>
              <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 0.875rem; margin-bottom: 1.5rem; font-size: 0.775rem; color: var(--text-tertiary); text-align: left;">
                💡 <strong>Tip:</strong> Once confirmed, you can log in directly. If email confirmation was disabled by your admin in Supabase, you can sign in immediately.
              </div>
              <div style="display: flex; gap: 0.75rem; justify-content: center;">
                <button type="button" id="auth-resend-link-btn" class="btn btn-secondary" style="flex: 1; font-size: 0.825rem;">
                  Resend Email
                </button>
                <button type="button" id="auth-goto-login-btn" class="btn btn-primary" style="flex: 1; font-size: 0.825rem;">
                  Sign In →
                </button>
              </div>
            </div>
          </div>
        `;
      }

      if (currentMode === 'forgot_password') {
        return `
          <div class="modal-dialog" style="max-width: 440px;">
            <div class="modal-header">
              <div>
                <h3 class="modal-title" style="font-weight: 800; font-size: 1.25rem;">Reset Password</h3>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">
                  We'll send a secure password reset link to your email.
                </p>
              </div>
              <button class="modal-close" id="auth-modal-close">&times;</button>
            </div>
            <div class="modal-body" style="padding: 1.5rem;">
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" id="auth-reset-email-input" class="form-control" placeholder="name@example.com" value="${lastRegisteredEmail}" required autocomplete="email">
              </div>
              <button type="button" id="auth-send-reset-btn" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 0.5rem; box-shadow: var(--shadow-glow-indigo);">
                Send Reset Link →
              </button>
              <div style="text-align: center; margin-top: 1.25rem; font-size: 0.825rem; color: var(--text-secondary);">
                Remember your password? <button type="button" id="auth-back-to-login" style="background: transparent; border: none; color: var(--primary-400); font-weight: 700; cursor: pointer;">Back to Sign In</button>
              </div>
            </div>
          </div>
        `;
      }

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

            <!-- Form Fields -->
            ${currentMode === 'register' ? `
              <div class="form-group">
                <label class="form-label">${currentRole === 'worker' ? 'Full Legal Name' : 'Company / Business Name'}</label>
                <input type="text" id="auth-name-input" class="form-control" placeholder="${currentRole === 'worker' ? 'e.g. Adeola Johnson' : 'e.g. PayStream Tech Ltd'}" required>
              </div>

              <div class="form-group">
                <label class="form-label">Phone Number (Optional)</label>
                <input type="tel" id="auth-phone-input" class="form-control" placeholder="+234 814 555 0192">
              </div>
            ` : ''}

            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" id="auth-email-input" class="form-control" placeholder="name@example.com" value="${lastRegisteredEmail}" required autocomplete="email">
            </div>

            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <label class="form-label">Password</label>
                ${currentMode === 'login' ? `
                  <button type="button" id="auth-forgot-password-link" style="background: transparent; border: none; color: var(--primary-400); font-size: 0.75rem; cursor: pointer; padding: 0; margin-bottom: 4px;">
                    Forgot?
                  </button>
                ` : ''}
              </div>
              <input type="password" id="auth-password-input" class="form-control" placeholder="Minimum 6 characters" required autocomplete="${currentMode === 'login' ? 'current-password' : 'new-password'}">
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

      // Role switcher (register mode)
      backdrop.querySelectorAll('.auth-role-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          currentRole = e.currentTarget.getAttribute('data-role');
          backdrop.innerHTML = renderContent();
          bindEvents();
        });
      });

      // Toggle between login and register
      backdrop.querySelector('#toggle-auth-mode')?.addEventListener('click', () => {
        currentMode = currentMode === 'login' ? 'register' : 'login';
        backdrop.innerHTML = renderContent();
        bindEvents();
      });

      // Forgot password trigger
      backdrop.querySelector('#auth-forgot-password-link')?.addEventListener('click', () => {
        const emailInput = backdrop.querySelector('#auth-email-input');
        if (emailInput && emailInput.value) {
          lastRegisteredEmail = emailInput.value.trim();
        }
        currentMode = 'forgot_password';
        backdrop.innerHTML = renderContent();
        bindEvents();
      });

      // Back to login from forgot password
      backdrop.querySelector('#auth-back-to-login')?.addEventListener('click', () => {
        currentMode = 'login';
        backdrop.innerHTML = renderContent();
        bindEvents();
      });

      // Send password reset email
      backdrop.querySelector('#auth-send-reset-btn')?.addEventListener('click', async () => {
        const resetInput = backdrop.querySelector('#auth-reset-email-input');
        const email = resetInput ? resetInput.value.trim() : '';

        if (!email || !email.includes('@')) {
          Toast.error('Invalid Email', 'Please provide a valid email address.');
          resetInput?.focus();
          return;
        }

        const btn = backdrop.querySelector('#auth-send-reset-btn');
        const orig = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span>⏳ Sending Reset Link...</span>';

        try {
          await resetPasswordForEmail(email);
          Toast.success('Reset Email Sent', `Password reset instructions sent to ${email}`);
          currentMode = 'login';
          backdrop.innerHTML = renderContent();
          bindEvents();
        } catch (err) {
          Toast.error('Reset Failed', err.message || 'Unable to send password reset email.');
        } finally {
          btn.disabled = false;
          btn.innerHTML = orig;
        }
      });

      // Post-confirmation screen actions
      backdrop.querySelector('#auth-goto-login-btn')?.addEventListener('click', () => {
        currentMode = 'login';
        backdrop.innerHTML = renderContent();
        bindEvents();
      });

      backdrop.querySelector('#auth-resend-link-btn')?.addEventListener('click', async () => {
        if (!lastRegisteredEmail) return;
        try {
          await resendVerificationEmail(lastRegisteredEmail);
          Toast.success('Email Resent', `A fresh confirmation link was sent to ${lastRegisteredEmail}`);
        } catch (err) {
          Toast.error('Resend Error', err.message || 'Failed to resend confirmation email.');
        }
      });

      // Email & Password Submit
      const submitBtn = backdrop.querySelector('#auth-submit-btn');
      submitBtn?.addEventListener('click', async () => {
        const emailInput = backdrop.querySelector('#auth-email-input');
        const passwordInput = backdrop.querySelector('#auth-password-input');
        const nameInput = backdrop.querySelector('#auth-name-input');
        const phoneInput = backdrop.querySelector('#auth-phone-input');

        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';
        const fullName = nameInput ? nameInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';

        if (!email || !email.includes('@')) {
          Toast.error('Invalid Email', 'Please provide a valid email address.');
          emailInput?.focus();
          return;
        }

        if (!password || password.length < 6) {
          Toast.error('Invalid Password', 'Password must be at least 6 characters.');
          passwordInput?.focus();
          return;
        }

        lastRegisteredEmail = email;

        if (isSupabaseConfigured()) {
          const originalText = submitBtn.innerHTML;
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<span>⏳ Processing...</span>`;

          try {
            if (currentMode === 'register') {
              const data = await signUpUser({
                email,
                password,
                fullName: fullName || (currentRole === 'worker' ? 'ApexTask Contributor' : 'ApexTask Business'),
                phone,
                role: currentRole
              });

              // Check if Supabase requires email confirmation (user exists but session is null)
              if (data?.user && !data?.session) {
                Toast.info(
                  'Verification Email Sent',
                  `A confirmation link was sent to ${email}. Please check your inbox.`
                );
                currentMode = 'confirmation_sent';
                backdrop.innerHTML = renderContent();
                bindEvents();
                return;
              } else {
                Toast.success('Account Created', `Welcome to ApexTask, ${fullName || email}!`);
                if (data?.user) {
                  store.syncSupabaseUser(data.user, currentRole);
                }
              }

              AuthModal.close();
              if (onAuthenticated) onAuthenticated(data.user);
              if (redirectRoute && window.app) window.app.navigate(redirectRoute);
              else if (window.app) window.app.navigate(currentRole);
            } else {
              // Sign in
              const data = await signInUser({ email, password });
              Toast.success('Welcome Back!', `Signed in successfully.`);
              if (data?.user) {
                store.syncSupabaseUser(data.user, currentRole);
              }
              AuthModal.close();
              if (onAuthenticated) onAuthenticated(data.user);
              if (redirectRoute && window.app) window.app.navigate(redirectRoute);
              else if (window.app) window.app.navigate(currentRole);
            }
          } catch (err) {
            console.error('Supabase Auth error:', err);
            const rawMsg = err.message || '';
            let userFriendlyMsg = rawMsg;

            if (rawMsg.toLowerCase().includes('already registered')) {
              userFriendlyMsg = 'An account with this email already exists. Switching to Sign In.';
              Toast.info('Account Exists', userFriendlyMsg);
              currentMode = 'login';
              backdrop.innerHTML = renderContent();
              bindEvents();
              return;
            } else if (rawMsg.toLowerCase().includes('email not confirmed')) {
              userFriendlyMsg = 'Your email address has not been confirmed yet. Please verify your inbox.';
              Toast.error('Email Not Confirmed', userFriendlyMsg);
              currentMode = 'confirmation_sent';
              backdrop.innerHTML = renderContent();
              bindEvents();
              return;
            } else if (rawMsg.toLowerCase().includes('invalid login credentials')) {
              userFriendlyMsg = 'Incorrect email or password. Please check your credentials and try again.';
              Toast.error('Sign In Failed', userFriendlyMsg);
            } else {
              Toast.error('Authentication Error', userFriendlyMsg || 'Authentication failed. Please verify credentials.');
            }
          } finally {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalText;
            }
          }
        } else {
          Toast.error(
            'Supabase Key Required',
            'Please verify your Supabase configuration in js/supabaseConfig.js.'
          );
        }
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

