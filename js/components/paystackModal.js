/**
 * ============================================================================
 * PAYSTACK CHECKOUT GATEWAY SIMULATOR
 * Realistic multi-rail deposit modal: Card, Virtual Bank Transfer & USSD
 * ============================================================================
 */

import { store } from '../store.js';
import { Toast } from './toast.js';

export class PaystackModal {
  static open({ title = 'Fund Wallet via Paystack', amount = 50000, email = 'admin@paystream.io', userId = 'biz_fintech', onSuccess }) {
    this.close();

    const backdrop = document.createElement('div');
    backdrop.id = 'paystack-modal-backdrop';
    backdrop.className = 'modal-backdrop';

    let activeTab = 'card'; // 'card' | 'bank' | 'ussd'
    const fee = Math.min(2000, Math.round(amount * 0.015)); // 1.5% capped at 2000
    const totalPayable = amount + fee;

    backdrop.innerHTML = `
      <div class="modal-dialog" style="max-width: 480px; background: #0F172A; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: var(--radius-lg); overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);">
        <!-- Paystack Header -->
        <div style="background: #0284C7; padding: 1.25rem 1.5rem; color: #fff; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-weight: 800; font-size: 1.25rem; letter-spacing: -0.02em;">paystack</span>
              <span style="font-size: 0.65rem; background: rgba(255, 255, 255, 0.2); padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">Secured</span>
            </div>
            <div style="font-size: 0.75rem; opacity: 0.9; margin-top: 2px;">Paying to ApexTask Escrow Network</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.7rem; opacity: 0.8; text-transform: uppercase;">Total Payable</div>
            <div class="currency num" style="font-size: 1.35rem; font-weight: 800;">₦${totalPayable.toLocaleString()}</div>
          </div>
        </div>

        <!-- Payment Rails Selector -->
        <div style="display: flex; background: #1E293B; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
          <button class="paystack-tab active" data-rail="card" style="flex: 1; padding: 0.75rem; background: transparent; border: none; border-bottom: 2px solid #38BDF8; color: #fff; font-weight: 600; font-size: 0.85rem; cursor: pointer;">
            💳 Pay with Card
          </button>
          <button class="paystack-tab" data-rail="bank" style="flex: 1; padding: 0.75rem; background: transparent; border: none; border-bottom: 2px solid transparent; color: #94A3B8; font-weight: 600; font-size: 0.85rem; cursor: pointer;">
            🏦 Bank Transfer
          </button>
          <button class="paystack-tab" data-rail="ussd" style="flex: 1; padding: 0.75rem; background: transparent; border: none; border-bottom: 2px solid transparent; color: #94A3B8; font-weight: 600; font-size: 0.85rem; cursor: pointer;">
            📱 USSD
          </button>
        </div>

        <!-- Body Container -->
        <div id="paystack-tab-content" style="padding: 1.5rem;">
          ${this.getCardContent(amount, email)}
        </div>

        <!-- Footer -->
        <div style="padding: 0.85rem 1.5rem; background: #0B0F19; border-top: 1px solid rgba(255, 255, 255, 0.05); display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: #64748B;">
          <span>🔒 256-Bit SSL Encrypted</span>
          <button id="paystack-cancel-btn" style="background: transparent; border: none; color: #94A3B8; cursor: pointer; text-decoration: underline;">Cancel Payment</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    requestAnimationFrame(() => backdrop.classList.add('active'));

    // Bind rail tabs
    backdrop.querySelectorAll('.paystack-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        backdrop.querySelectorAll('.paystack-tab').forEach(t => {
          t.style.borderBottomColor = 'transparent';
          t.style.color = '#94A3B8';
        });
        e.currentTarget.style.borderBottomColor = '#38BDF8';
        e.currentTarget.style.color = '#fff';

        const rail = e.currentTarget.getAttribute('data-rail');
        const container = backdrop.querySelector('#paystack-tab-content');
        if (rail === 'card') container.innerHTML = this.getCardContent(amount, email);
        else if (rail === 'bank') container.innerHTML = this.getBankContent(totalPayable);
        else if (rail === 'ussd') container.innerHTML = this.getUssdContent(totalPayable);

        this.bindPaymentTriggers(backdrop, amount, userId, onSuccess);
      });
    });

    this.bindPaymentTriggers(backdrop, amount, userId, onSuccess);

    backdrop.querySelector('#paystack-cancel-btn').addEventListener('click', () => this.close());
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) this.close();
    });
  }

  static getCardContent(amount, email) {
    return `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" style="font-size: 0.8rem; color: #94A3B8;">Card Number</label>
          <input type="text" class="form-control" value="4084 0840 8408 4084" style="background: #1E293B; border-color: #334155; color: #fff; font-family: var(--font-mono); letter-spacing: 0.1em;">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.8rem; color: #94A3B8;">Expiry Date</label>
            <input type="text" class="form-control" value="12 / 28" style="background: #1E293B; border-color: #334155; color: #fff; font-family: var(--font-mono); text-align: center;">
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.8rem; color: #94A3B8;">CVV</label>
            <input type="password" class="form-control" value="408" style="background: #1E293B; border-color: #334155; color: #fff; font-family: var(--font-mono); text-align: center;">
          </div>
        </div>

        <button id="paystack-submit-pay-btn" class="btn btn-primary btn-lg" style="width: 100%; background: #0284C7; border-color: #0284C7; margin-top: 0.5rem; font-weight: 700;">
          Pay ₦${amount.toLocaleString()} →
        </button>
      </div>
    `;
  }

  static getBankContent(totalPayable) {
    return `
      <div style="text-align: center; padding: 0.5rem 0;">
        <div style="font-size: 0.85rem; color: #94A3B8; margin-bottom: 0.75rem;">
          Transfer exactly <strong>₦${totalPayable.toLocaleString()}</strong> to the dynamic virtual account below:
        </div>

        <div style="background: #1E293B; border: 1px dashed #38BDF8; border-radius: var(--radius-sm); padding: 1rem; margin-bottom: 1rem;">
          <div style="font-size: 0.75rem; color: #94A3B8; text-transform: uppercase;">Bank Name</div>
          <div style="font-size: 1.1rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem;">Wema Bank / Paystack</div>
          
          <div style="font-size: 0.75rem; color: #94A3B8; text-transform: uppercase;">Virtual Account Number</div>
          <div style="font-size: 1.75rem; font-weight: 800; color: #38BDF8; font-family: var(--font-mono); letter-spacing: 0.05em; margin: 4px 0;">
            9928371029
          </div>
          <button type="button" id="copy-acc-btn" class="btn btn-ghost btn-sm" style="font-size: 0.75rem; color: #38BDF8;">
            📋 Click to Copy Account Number
          </button>
        </div>

        <button id="paystack-submit-pay-btn" class="btn btn-success btn-lg" style="width: 100%; font-weight: 700;">
          I Have Sent The Transfer (Confirm) →
        </button>
      </div>
    `;
  }

  static getUssdContent(totalPayable) {
    return `
      <div style="text-align: center; padding: 0.5rem 0;">
        <div style="font-size: 0.85rem; color: #94A3B8; margin-bottom: 1rem;">
          Dial the USSD string from your registered bank phone number:
        </div>

        <div style="background: #1E293B; border-radius: var(--radius-sm); padding: 1.25rem; font-size: 1.5rem; font-weight: 800; color: #38BDF8; font-family: var(--font-mono); letter-spacing: 0.05em; margin-bottom: 1.25rem;">
          *737*50*${totalPayable}*1029#
        </div>

        <button id="paystack-submit-pay-btn" class="btn btn-primary btn-lg" style="width: 100%; background: #0284C7;">
          Authorize USSD Transaction →
        </button>
      </div>
    `;
  }

  static bindPaymentTriggers(backdrop, amount, userId, onSuccess) {
    const payBtn = backdrop.querySelector('#paystack-submit-pay-btn');
    if (payBtn) {
      payBtn.addEventListener('click', () => {
        payBtn.disabled = true;
        payBtn.textContent = 'Verifying with Bank Network...';

        setTimeout(() => {
          // Record deposit in double-entry ledger:
          // Debit GATEWAY_CUSTODY, Credit USER_CASH
          const ref = 'PAY_' + Math.random().toString(36).substr(2, 9).toUpperCase();
          store.ledger.recordDeposit(userId, amount, ref);
          store.saveState();

          PaystackModal.close();
          Toast.success('Deposit Successful!', `₦${amount.toLocaleString()} added to your wallet (Ref: ${ref}).`);
          if (onSuccess) onSuccess();
        }, 800);
      });
    }

    const copyBtn = backdrop.querySelector('#copy-acc-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard?.writeText('9928371029');
        copyBtn.textContent = '✓ Copied: 9928371029';
      });
    }
  }

  static close() {
    const backdrop = document.getElementById('paystack-modal-backdrop');
    if (backdrop) {
      backdrop.classList.remove('active');
      setTimeout(() => {
        if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
      }, 250);
    }
  }
}
