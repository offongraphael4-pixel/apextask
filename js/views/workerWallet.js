/**
 * ============================================================================
 * WORKER EARNINGS & WALLET VIEW
 * Double-Entry Statement, Bank Account Resolution & Instant Paystack Payout Flow
 * ============================================================================
 */

import { store } from '../store.js';
import { Modal } from '../components/modal.js';
import { Toast } from '../components/toast.js';

export function renderWorkerWallet(container, navigateTo) {
  const user = store.state.currentUser;

  function render() {
    const availableBalance = store.ledger.getBalance(`USER_CASH:${user.id}`);
    
    // Calculate pending escrow in review
    const pendingSubmissions = store.state.submissions.filter(s => s.status === 'pending');
    const pendingAmount = pendingSubmissions.reduce((sum, s) => sum + s.reward, 0);

    // Get all transactions involving this user's account
    const userAccId = `USER_CASH:${user.id}`;
    const userTxs = [];

    for (const tx of store.ledger.transactions) {
      const entries = store.ledger.journalEntries.filter(e => e.transactionId === tx.id && e.accountId === userAccId);
      if (entries.length > 0) {
        userTxs.push({
          ...tx,
          entryType: entries[0].type,
          userAmount: entries[0].amount
        });
      }
    }

    container.innerHTML = `
      <div style="margin-bottom: 2rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 4px;">
              <button id="back-to-feed-btn" class="btn btn-ghost btn-sm" style="padding-left: 0;">← Back to Task Feed</button>
            </div>
            <h1 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.02em;">Earnings & Wallet</h1>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">Direct bank settlements with full double-entry ledger auditability.</p>
          </div>
          
          <button id="withdraw-funds-btn" class="btn btn-success btn-lg" style="box-shadow: var(--shadow-glow-emerald);" ${availableBalance < 1000 ? 'disabled' : ''}>
            <span>Withdraw to Bank</span> →
          </button>
        </div>

        <!-- Balances Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
          <div class="card" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(17, 24, 39, 0.9)); border-color: rgba(16, 185, 129, 0.3);">
            <div style="font-size: 0.75rem; color: var(--success-400); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Available for Cashout</div>
            <div class="currency num" style="font-size: 2.25rem; font-weight: 800; color: #fff; margin: 0.5rem 0;">
              ₦${availableBalance.toLocaleString()}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">Min. withdrawal threshold: ₦1,000</div>
          </div>

          <div class="card">
            <div style="font-size: 0.75rem; color: var(--warning-400); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Pending in Review Escrow</div>
            <div class="currency num" style="font-size: 2.25rem; font-weight: 800; color: var(--warning-400); margin: 0.5rem 0;">
              ₦${pendingAmount.toLocaleString()}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">${pendingSubmissions.length} active submissions awaiting poster review</div>
          </div>

          <div class="card">
            <div style="font-size: 0.75rem; color: var(--primary-400); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">KYC Payout Status</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #fff; margin: 0.75rem 0 0.5rem;">
              Tier 1 Verified
            </div>
            <div style="font-size: 0.8rem; color: var(--success-400);">✓ Daily withdrawal limit: ₦100,000</div>
          </div>
        </div>

        <!-- Ledger Statement Table -->
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Traceable Transaction Statement</h2>
              <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">Immutable double-entry ledger activity</p>
            </div>
            <span class="badge badge-emerald">Audited & Balanced</span>
          </div>

          ${userTxs.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon">💳</div>
              <div class="empty-title">No transactions yet</div>
              <div class="empty-desc">Completed task rewards and withdrawals will appear here in your statement.</div>
            </div>
          ` : `
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Reference</th>
                    <th>Event Type</th>
                    <th>Description</th>
                    <th style="text-align: right;">Amount (NGN)</th>
                  </tr>
                </thead>
                <tbody>
                  ${userTxs.map(tx => `
                    <tr>
                      <td style="font-size: 0.8rem; color: var(--text-secondary);">
                        ${new Date(tx.timestamp).toLocaleString()}
                      </td>
                      <td style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--primary-400);">
                        ${tx.id}
                      </td>
                      <td>
                        <span class="badge ${tx.eventType === 'PAYOUT_RELEASE' || tx.eventType === 'DEPOSIT' ? 'badge-emerald' : 'badge-amber'}">
                          ${tx.eventType}
                        </span>
                      </td>
                      <td>${tx.description}</td>
                      <td class="num currency" style="text-align: right; font-weight: 800; color: ${tx.entryType === 'CREDIT' ? 'var(--success-400)' : 'var(--danger-400)'};">
                        ${tx.entryType === 'CREDIT' ? '+' : '-'}₦${tx.userAmount.toLocaleString()}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;

    // Event listeners
    const backBtn = container.querySelector('#back-to-feed-btn');
    if (backBtn) backBtn.addEventListener('click', () => navigateTo('worker'));

    const withdrawBtn = container.querySelector('#withdraw-funds-btn');
    if (withdrawBtn) {
      withdrawBtn.addEventListener('click', () => openWithdrawalModal(availableBalance, render));
      if (new URLSearchParams(window.location.search).get('modal') === 'cashout') {
        setTimeout(() => withdrawBtn.click(), 100);
      }
    }
  }

  function openWithdrawalModal(currentBalance, onComplete) {
    const modalBody = `
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: var(--radius-sm); padding: 0.85rem 1rem; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.85rem; color: var(--text-secondary);">Available Cash:</span>
          <span class="currency num" style="font-size: 1.25rem; font-weight: 800; color: var(--success-400);">₦${currentBalance.toLocaleString()}</span>
        </div>

        <div class="form-group">
          <label class="form-label">Destination Bank</label>
          <select id="withdraw-bank-select" class="form-select">
            <option value="058">Guaranty Trust Bank (GTBank)</option>
            <option value="044">Access Bank</option>
            <option value="057">Zenith Bank</option>
            <option value="50211">Kuda Microfinance Bank</option>
            <option value="50515">Moniepoint Microfinance Bank</option>
            <option value="999992">OPay Digital Services</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">10-Digit NUBAN Account Number</label>
          <input type="text" id="withdraw-account-num" class="form-control" maxlength="10" placeholder="0123456789" value="0219485721">
          <div id="account-name-resolved" style="font-size: 0.8rem; color: var(--success-400); margin-top: 4px; font-weight: 700; display: flex; align-items: center; gap: 4px;">
            <span>✓ Verified Account Name:</span>
            <span>ADEOLA OLUWASEUN JOHNSON</span>
          </div>
        </div>

        <div class="form-group">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label class="form-label">Withdrawal Amount (₦)</label>
            <button type="button" id="withdraw-max-btn" class="btn btn-ghost btn-sm" style="font-size: 0.75rem; color: var(--primary-400); padding: 0;">Withdraw All</button>
          </div>
          <input type="number" id="withdraw-amount-input" class="form-control num" min="1000" max="${currentBalance}" value="1000" step="500">
          <span class="form-hint">Minimum ₦1,000. No platform cashout fee.</span>
        </div>

        <div class="form-group">
          <label class="form-label">4-Digit Security PIN</label>
          <input type="password" id="withdraw-pin-input" class="form-control" maxlength="4" placeholder="••••" value="1234" style="letter-spacing: 0.3em; font-size: 1.25rem; text-align: center;">
        </div>
      </div>
    `;

    const modalFooter = `
      <button class="btn btn-secondary modal-close-btn">Cancel</button>
      <button id="execute-withdraw-btn" class="btn btn-success btn-lg" style="box-shadow: var(--shadow-glow-emerald);">
        Confirm Payout Request →
      </button>
    `;

    const modalEl = Modal.open('Direct Bank Withdrawal', modalBody, modalFooter);

    modalEl.querySelector('.modal-close-btn').addEventListener('click', () => Modal.close());

    modalEl.querySelector('#withdraw-max-btn').addEventListener('click', () => {
      modalEl.querySelector('#withdraw-amount-input').value = currentBalance;
    });

    modalEl.querySelector('#execute-withdraw-btn').addEventListener('click', () => {
      const amount = parseFloat(modalEl.querySelector('#withdraw-amount-input').value);
      const bankSelect = modalEl.querySelector('#withdraw-bank-select');
      const bankName = bankSelect.options[bankSelect.selectedIndex].text;
      const accountNum = modalEl.querySelector('#withdraw-account-num').value.trim();
      const pin = modalEl.querySelector('#withdraw-pin-input').value.trim();

      if (isNaN(amount) || amount < 1000) {
        Toast.error('Invalid Amount', 'Minimum withdrawal amount is ₦1,000.');
        return;
      }
      if (amount > currentBalance) {
        Toast.error('Insufficient Balance', 'You cannot withdraw more than your available balance.');
        return;
      }
      if (pin !== '1234') {
        Toast.error('Invalid Security PIN', 'Default demo PIN is 1234.');
        return;
      }

      try {
        // Double-entry ledger steps:
        // 1. Move User Cash -> Pending Withdrawal
        store.ledger.requestWithdrawal(user.id, amount, { bankName, accountNumber: accountNum });
        // 2. Simulate instantaneous Paystack gateway transfer execution
        store.ledger.confirmWithdrawal(user.id, amount);

        store.saveState();
        Modal.close();
        Toast.success('Withdrawal Dispatched!', `₦${amount.toLocaleString()} has been sent to ${bankName} (${accountNum}).`);
        onComplete();
      } catch (err) {
        Toast.error('Withdrawal Failed', err.message);
      }
    });
  }

  render();
}
