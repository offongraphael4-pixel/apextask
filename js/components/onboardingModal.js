/**
 * ============================================================================
 * WORKER ONBOARDING TOUR MODAL
 * 4-Step Interactive Guide demonstrating platform mechanics to first-time earners
 * ============================================================================
 */

import { store } from '../store.js';
import { Toast } from './toast.js';

export class OnboardingModal {
  static open() {
    this.close();

    const backdrop = document.createElement('div');
    backdrop.id = 'onboarding-modal-backdrop';
    backdrop.className = 'modal-backdrop';

    let currentStep = 1;
    const totalSteps = 4;

    const steps = [
      {
        icon: '🔍',
        title: 'Discover Microtasks That Fit Your Schedule',
        desc: 'Browse hundreds of verified digital tasks—from testing Android apps and answering quick consumer surveys to categorizing images and recording short voice prompts.'
      },
      {
        icon: '⏱️',
        title: 'Reserve Your Slot with Guaranteed Escrow',
        desc: 'When you tap "Start Task", we lock a 45-minute countdown lease just for you. Businesses must pre-fund 100% of the reward into escrow before you start, so your earnings are 100% guaranteed.'
      },
      {
        icon: '📸',
        title: 'Follow Step-by-Step Checks & Upload Proof',
        desc: 'Follow the clear checklist, snap your screenshot, and upload it directly. Our built-in verification engine ensures your proof is verified cleanly and protected against duplicates.'
      },
      {
        icon: '💳',
        title: '72-Hour Auto-Approval & Instant Bank Cashout',
        desc: 'Posters review your proof quickly. If unreviewed within 72 hours, our system auto-approves and credits your wallet automatically! Cash out directly to GTBank, Access, Kuda, or Moniepoint anytime.'
      }
    ];

    function renderContent() {
      const step = steps[currentStep - 1];

      return `
        <div class="modal-dialog" style="max-width: 480px; text-align: center;">
          <div class="modal-header" style="justify-content: flex-end; border: none; padding-bottom: 0;">
            <button class="modal-close" id="onboarding-close">&times;</button>
          </div>

          <div class="modal-body" style="padding: 1rem 2rem 2rem;">
            <!-- Step Indicator -->
            <div style="display: flex; justify-content: center; gap: 6px; margin-bottom: 1.5rem;">
              ${[1, 2, 3, 4].map(s => `
                <div style="width: ${s === currentStep ? '28px' : '8px'}; height: 8px; border-radius: var(--radius-full); background: ${s === currentStep ? 'var(--primary-500)' : 'var(--border-strong)'}; transition: all var(--transition-normal);"></div>
              `).join('')}
            </div>

            <!-- Visual Icon -->
            <div style="width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(16, 185, 129, 0.15)); border: 1px solid var(--primary-500); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 1.25rem; box-shadow: var(--shadow-glow-indigo);">
              ${step.icon}
            </div>

            <span class="badge badge-indigo" style="margin-bottom: 0.75rem;">Step ${currentStep} of ${totalSteps}</span>
            <h3 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 0.75rem; line-height: 1.3;">${step.title}</h3>
            <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.75rem;">
              ${step.desc}
            </p>

            <!-- Navigation Controls -->
            <div style="display: flex; gap: 0.75rem;">
              ${currentStep > 1 ? `
                <button type="button" id="onboarding-prev-btn" class="btn btn-secondary" style="flex: 1;">← Previous</button>
              ` : `
                <button type="button" id="onboarding-skip-btn" class="btn btn-ghost" style="flex: 1; color: var(--text-tertiary);">Skip Tour</button>
              `}

              ${currentStep < totalSteps ? `
                <button type="button" id="onboarding-next-btn" class="btn btn-primary" style="flex: 2; box-shadow: var(--shadow-glow-indigo);">
                  Continue →
                </button>
              ` : `
                <button type="button" id="onboarding-finish-btn" class="btn btn-success" style="flex: 2; box-shadow: var(--shadow-glow-emerald);">
                  Claim ₦100 Welcome Bonus & Start →
                </button>
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
      backdrop.querySelector('#onboarding-close')?.addEventListener('click', () => OnboardingModal.close());
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) OnboardingModal.close();
      });

      backdrop.querySelector('#onboarding-skip-btn')?.addEventListener('click', () => OnboardingModal.close());

      backdrop.querySelector('#onboarding-prev-btn')?.addEventListener('click', () => {
        if (currentStep > 1) {
          currentStep -= 1;
          backdrop.innerHTML = renderContent();
          bindEvents();
        }
      });

      backdrop.querySelector('#onboarding-next-btn')?.addEventListener('click', () => {
        if (currentStep < totalSteps) {
          currentStep += 1;
          backdrop.innerHTML = renderContent();
          bindEvents();
        }
      });

      backdrop.querySelector('#onboarding-finish-btn')?.addEventListener('click', () => {
        OnboardingModal.close();
        Toast.success('Welcome Bonus Added!', '₦100 credited to your wallet. You are ready to start completing microtasks!');
      });
    }

    bindEvents();
  }

  static close() {
    const backdrop = document.getElementById('onboarding-modal-backdrop');
    if (backdrop) {
      backdrop.classList.remove('active');
      setTimeout(() => {
        if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
      }, 250);
    }
  }
}
