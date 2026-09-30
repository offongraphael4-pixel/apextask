/**
 * ============================================================================
 * USER PROFILE & KYC REPUTATION VIEW
 * Trust Score Breakdown, Tiered Verification Status & Security Settings
 * ============================================================================
 */

import { store } from '../store.js';
import { Modal } from '../components/modal.js';
import { Toast } from '../components/toast.js';
import { signOutUser } from '../supabaseClient.js';

export function renderProfile(container, navigateTo) {
  const authUser = store.state.authenticatedUser;
  const user = store.state.currentUser;

  const displayName = authUser?.fullName || user.name;
  const displayEmail = authUser?.email || user.email;
  const displayPhone = authUser?.phone || user.phone || 'Not provided';
  const displayRole = authUser?.role ? (authUser.role.charAt(0).toUpperCase() + authUser.role.slice(1)) : 'Worker';

  const initials = displayName.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U';

  container.innerHTML = `
    <div style="max-width: 800px; margin: 0 auto 3rem;">
      <div style="margin-bottom: 2rem;">
        <button id="profile-back-btn" class="btn btn-ghost btn-sm" style="padding-left: 0; margin-bottom: 0.5rem;">
          ← Back to Marketplace
        </button>
        <h1 style="font-size: 1.85rem; font-weight: 800; letter-spacing: -0.02em;">Contributor Profile & Trust Status</h1>
        <p style="font-size: 0.9rem; color: var(--text-secondary);">Your verified identity unlocks higher-tier rewards and rapid bank withdrawals.</p>
      </div>

      <!-- Profile Header Card -->
      <div class="card" style="margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem;">
        <div style="display: flex; align-items: center; gap: 1.25rem;">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-600), var(--success-500)); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800; box-shadow: var(--shadow-glow-indigo);">
            ${initials}
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <h2 style="font-size: 1.35rem; font-weight: 800;">${displayName}</h2>
              <span class="badge badge-emerald">✓ ${displayRole} Active</span>
              ${authUser ? '<span class="badge badge-indigo" title="Authenticated with Supabase">⚡ Supabase Auth</span>' : ''}
            </div>
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">
              ${displayEmail} • ${displayPhone}
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 1.5rem;">
          <div style="text-align: right;">
            <div style="font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase;">Trust Reputation Score</div>
            <div class="num" style="font-size: 2.25rem; font-weight: 800; color: var(--success-400); margin: 2px 0;">
              ${user.trustScore}/100
            </div>
            <span class="badge badge-indigo">Top 5% Worker</span>
          </div>
          ${authUser ? `
            <button id="profile-signout-btn" class="btn btn-secondary btn-sm" style="font-size: 0.8rem; align-self: center;">
              Sign Out
            </button>
          ` : ''}
        </div>
      </div>

      <!-- KYC Verification Level -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-header">
          <div>
            <h3 class="card-title">KYC Tier Status</h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">Government ID & financial compliance gate</p>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <span class="badge badge-emerald">Tier 1 Active</span>
            <button id="verify-kyc-btn" class="btn btn-secondary btn-sm" style="font-size: 0.75rem;">
              🔍 Test ID Verification
            </button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-top: 0.5rem;">
          <div style="background: var(--bg-surface-elevated); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            <div style="font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase;">Verified Identity</div>
            <div style="font-weight: 700; color: var(--text-primary); margin-top: 4px;">National Identity Slip (NIN)</div>
            <div style="font-size: 0.75rem; color: var(--success-400); margin-top: 2px;">✓ Verified via NIMC Match</div>
          </div>

          <div style="background: var(--bg-surface-elevated); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            <div style="font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase;">Daily Payout Limit</div>
            <div class="num currency" style="font-weight: 800; font-size: 1.15rem; color: #fff; margin-top: 4px;">₦100,000 / day</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">Eligible for instant bank transfer</div>
          </div>

          <div style="background: var(--bg-surface-elevated); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            <div style="font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase;">Phone Number Status</div>
            <div style="font-weight: 700; color: var(--text-primary); margin-top: 4px;">${user.phone}</div>
            <div style="font-size: 0.75rem; color: var(--success-400); margin-top: 2px;">✓ OTP 2FA Enabled (Termii)</div>
          </div>
        </div>
      </div>

      <!-- Trust Factors Breakdown -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Reputation Signals</h3>
          <span class="badge badge-emerald">Excellent Standing</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
              <span>Submission Acceptance Rate:</span>
              <strong class="num" style="color: var(--success-400);">${user.approvalRate}</strong>
            </div>
            <div class="progress-bar-track">
              <div class="progress-bar-fill progress-emerald" style="width: 96.2%;"></div>
            </div>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
              <span>Speedrun / Bot Integrity Score:</span>
              <strong class="num" style="color: var(--primary-400);">100% Clean</strong>
            </div>
            <div class="progress-bar-track">
              <div class="progress-bar-fill progress-indigo" style="width: 100%;"></div>
            </div>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
              <span>Total Microtasks Completed:</span>
              <strong class="num" style="color: #fff;">${user.completedCount} tasks</strong>
            </div>
            <div class="progress-bar-track">
              <div class="progress-bar-fill progress-indigo" style="width: 80%;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#profile-back-btn').addEventListener('click', () => navigateTo('worker'));

  const signoutBtn = container.querySelector('#profile-signout-btn');
  if (signoutBtn) {
    signoutBtn.addEventListener('click', async () => {
      try {
        await signOutUser();
        store.clearSupabaseUser();
        Toast.info('Signed Out', 'You have been signed out.');
        navigateTo('worker');
      } catch (err) {
        Toast.error('Sign Out Error', err.message);
      }
    });
  }

  const kycBtn = container.querySelector('#verify-kyc-btn');
  if (kycBtn) {
    kycBtn.addEventListener('click', () => {
      const modalBody = `
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            Submit your Nigerian identity credential to unlock higher daily payout limits and instant bank transfers.
          </p>

          <div class="form-group">
            <label class="form-label">Identity Document Type</label>
            <select id="kyc-doc-type" class="form-select">
              <option value="nin">National Identity Slip (NIN)</option>
              <option value="bvn">Bank Verification Number (BVN)</option>
              <option value="dl">Driver's License</option>
              <option value="voters">INEC Voter's Card</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Credential Number</label>
            <input type="text" id="kyc-doc-num" class="form-control" value="84920491823" style="font-family: var(--font-mono); letter-spacing: 0.05em;">
          </div>

          <div style="background: var(--bg-surface-elevated); border: 1px dashed var(--border-strong); border-radius: var(--radius-sm); padding: 1.5rem; text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📸</div>
            <div style="font-weight: 700; font-size: 0.85rem; color: #fff; margin-bottom: 2px;">Facial Liveness Check</div>
            <div style="font-size: 0.75rem; color: var(--text-tertiary);">Camera selfie match with NIMC database record</div>
            <div style="display: inline-flex; align-items: center; gap: 6px; margin-top: 0.75rem; background: rgba(16, 185, 129, 0.1); padding: 4px 10px; border-radius: var(--radius-full); font-size: 0.75rem; color: var(--success-400);">
              <span>●</span> Live Camera Feed Connected
            </div>
          </div>
        </div>
      `;

      const modalFooter = `
        <button class="btn btn-secondary modal-close-btn">Cancel</button>
        <button id="submit-kyc-btn" class="btn btn-primary btn-lg" style="box-shadow: var(--shadow-glow-indigo);">
          Run Verification Match →
        </button>
      `;

      const modalEl = Modal.open('Government Identity Verification', modalBody, modalFooter);

      modalEl.querySelector('.modal-close-btn').addEventListener('click', () => Modal.close());
      modalEl.querySelector('#submit-kyc-btn').addEventListener('click', () => {
        const btn = modalEl.querySelector('#submit-kyc-btn');
        btn.disabled = true;
        btn.textContent = 'Verifying with NIMC Database...';

        setTimeout(() => {
          Modal.close();
          Toast.success('KYC Verified (Tier 1)', 'NIMC record matched successfully. Payout limit increased to ₦100,000/day.');
        }, 1000);
      });
    });
  }
}
