/**
 * ============================================================================
 * WORKER SUBMISSIONS & DISPUTES VIEW
 * Proof Status Tracking, Auto-Approval Countdowns & Dispute Arbitration Filing
 * ============================================================================
 */

import { store } from '../store.js';
import { Modal } from '../components/modal.js';
import { Toast } from '../components/toast.js';

export function renderWorkerSubmissions(container, navigateTo) {
  let activeTab = 'all'; // 'all' | 'pending' | 'approved' | 'rejected'

  function render() {
    const submissions = store.state.submissions.filter(s => {
      if (activeTab === 'all') return true;
      return s.status === activeTab;
    });

    container.innerHTML = `
      <div style="margin-bottom: 2rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 4px;">
              <button id="back-to-feed-btn" class="btn btn-ghost btn-sm" style="padding-left: 0;">← Back to Task Feed</button>
            </div>
            <h1 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.02em;">My Task Submissions</h1>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">Track proof reviews, auto-approval countdowns, and claim rewards.</p>
          </div>
          <button id="nav-wallet-btn" class="btn btn-success btn-sm">
            <span>View Earnings Wallet</span> →
          </button>
        </div>

        <!-- Filter Tabs -->
        <div style="display: flex; gap: 0.5rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem; margin-bottom: 1.5rem; overflow-x: auto;">
          <button class="role-tab ${activeTab === 'all' ? 'active' : ''}" data-tab="all">
            All Submissions (${store.state.submissions.length})
          </button>
          <button class="role-tab ${activeTab === 'pending' ? 'active' : ''}" data-tab="pending">
            Under Review (${store.state.submissions.filter(s => s.status === 'pending').length})
          </button>
          <button class="role-tab ${activeTab === 'approved' ? 'active' : ''}" data-tab="approved">
            Approved (${store.state.submissions.filter(s => s.status === 'approved').length})
          </button>
          <button class="role-tab ${activeTab === 'rejected' ? 'active' : ''}" data-tab="rejected">
            Rejected (${store.state.submissions.filter(s => s.status === 'rejected' || s.status === 'disputed').length})
          </button>
        </div>

        <!-- Submissions List -->
        ${submissions.length === 0 ? `
          <div class="empty-state card">
            <div class="empty-icon">📋</div>
            <div class="empty-title">No submissions in this category</div>
            <div class="empty-desc">You haven't submitted any tasks matching this status. Explore active tasks to start earning!</div>
            <button id="empty-feed-btn" class="btn btn-primary btn-sm">Explore Available Tasks →</button>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${submissions.map(sub => {
              let statusBadge = '';
              if (sub.status === 'pending') {
                statusBadge = '<span class="badge badge-amber">Under Review (72h SLA)</span>';
              } else if (sub.status === 'approved') {
                statusBadge = '<span class="badge badge-emerald">Approved & Paid</span>';
              } else if (sub.status === 'disputed') {
                statusBadge = '<span class="badge badge-indigo">Dispute Under Arbitration</span>';
              } else {
                statusBadge = '<span class="badge badge-rose">Rejected</span>';
              }

              return `
                <div class="card" style="padding: 1.25rem;">
                  <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 0.75rem;">
                    <div>
                      <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 4px;">
                        ${statusBadge}
                        <span style="font-size: 0.75rem; color: var(--text-tertiary);">Submitted ${new Date(sub.submittedAt).toLocaleDateString()}</span>
                      </div>
                      <h3 style="font-size: 1.1rem; font-weight: 700;">${sub.taskTitle}</h3>
                    </div>

                    <div style="text-align: right;">
                      <div style="font-size: 0.7rem; color: var(--text-tertiary); text-transform: uppercase;">Reward</div>
                      <div class="currency num" style="font-size: 1.25rem; font-weight: 800; color: var(--success-400);">₦${sub.reward.toLocaleString()}</div>
                    </div>
                  </div>

                  <div style="background: var(--bg-surface-elevated); border-radius: var(--radius-sm); padding: 0.85rem; margin-bottom: 0.75rem; font-size: 0.85rem;">
                    <div style="color: var(--text-secondary); margin-bottom: 4px;"><strong>Your Note / Token:</strong> ${sub.proofData?.note || 'No notes provided'}</div>
                    ${sub.proofData?.proofUrl ? `
                      <a href="${sub.proofData.proofUrl}" target="_blank" style="font-size: 0.75rem; display: inline-flex; align-items: center; gap: 4px;">
                        🔍 View Submitted Screenshot
                      </a>
                    ` : ''}
                  </div>

                  ${sub.status === 'rejected' ? `
                    <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: var(--radius-sm); padding: 0.85rem; margin-bottom: 0.75rem;">
                      <div style="font-size: 0.8rem; color: var(--danger-400); font-weight: 700; margin-bottom: 2px;">Poster Rejection Reason:</div>
                      <div style="font-size: 0.85rem; color: var(--text-primary);">${sub.rejectionReason || 'Proof requirements not satisfied.'}</div>
                    </div>
                    <div style="display: flex; justify-content: flex-end;">
                      <button class="btn btn-danger btn-sm dispute-btn" data-sub-id="${sub.id}">
                        File Dispute / Appeal →
                      </button>
                    </div>
                  ` : ''}

                  ${sub.status === 'pending' ? `
                    <div style="font-size: 0.75rem; color: var(--text-tertiary); display: flex; align-items: center; gap: 6px;">
                      <span>⏳</span>
                      <span>Poster must review by <strong>${new Date(sub.autoApproveAt).toLocaleString()}</strong> or payment will automatically release to your wallet.</span>
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;

    // Event listeners
    container.querySelectorAll('.role-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeTab = e.currentTarget.getAttribute('data-tab');
        render();
      });
    });

    container.querySelectorAll('.dispute-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const subId = e.currentTarget.getAttribute('data-sub-id');
        openDisputeModal(subId, render);
      });
    });

    const backBtn = container.querySelector('#back-to-feed-btn');
    if (backBtn) backBtn.addEventListener('click', () => navigateTo('worker'));

    const walletBtn = container.querySelector('#nav-wallet-btn');
    if (walletBtn) walletBtn.addEventListener('click', () => navigateTo('worker-wallet'));

    const emptyBtn = container.querySelector('#empty-feed-btn');
    if (emptyBtn) emptyBtn.addEventListener('click', () => navigateTo('worker'));
  }

  function openDisputeModal(subId, onResolve) {
    const sub = store.state.submissions.find(s => s.id === subId);
    if (!sub) return;

    const modalBody = `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <p style="font-size: 0.85rem; color: var(--text-secondary);">
          If you believe your submission was unfairly rejected, our admin arbitration team will review your proof against the task instructions.
        </p>
        <div style="background: var(--bg-surface-elevated); padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.85rem;">
          <div style="color: var(--danger-400); font-weight: 700; margin-bottom: 2px;">Rejection Reason:</div>
          <div>${sub.rejectionReason || 'Instructions not followed'}</div>
        </div>
        <div class="form-group">
          <label class="form-label">Explain why this rejection was incorrect:</label>
          <textarea id="dispute-explanation-input" class="form-control" rows="3" placeholder="Provide details, clarify instructions, or reference your screenshot..."></textarea>
        </div>
      </div>
    `;

    const modalFooter = `
      <button class="btn btn-secondary modal-close-btn">Cancel</button>
      <button id="submit-dispute-btn" class="btn btn-primary">Submit Dispute to Admin</button>
    `;

    const modalEl = Modal.open('File Submission Dispute', modalBody, modalFooter);

    modalEl.querySelector('.modal-close-btn').addEventListener('click', () => Modal.close());
    modalEl.querySelector('#submit-dispute-btn').addEventListener('click', () => {
      const explanation = modalEl.querySelector('#dispute-explanation-input').value.trim();
      if (!explanation) {
        Toast.error('Missing Explanation', 'Please explain why your proof should be approved.');
        return;
      }
      store.disputeSubmission(sub.id, explanation);
      Modal.close();
      Toast.info('Dispute Submitted', 'An admin will arbitrate this submission within 24 hours.');
      onResolve();
    });
  }

  render();
}
