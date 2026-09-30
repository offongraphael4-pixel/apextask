/**
 * ============================================================================
 * BUSINESS SUBMISSION REVIEW DESK
 * Side-by-Side Lightbox, Escrow Release Trigger & Fraud Audit Tools
 * ============================================================================
 */

import { store } from '../store.js';
import { Toast } from '../components/toast.js';

export function renderBusinessReview(container, navigateTo) {
  const biz = store.state.businessUser;

  // Find all pending submissions for this business's campaigns
  const pendingSubmissions = store.state.submissions.filter(s => {
    const task = store.state.tasks.find(t => t.id === s.taskId);
    return task && task.businessId === biz.id && s.status === 'pending';
  });

  let selectedIndex = 0;

  function render() {
    if (pendingSubmissions.length === 0) {
      container.innerHTML = `
        <div style="max-width: 800px; margin: 2rem auto;">
          <button id="review-back-btn" class="btn btn-ghost btn-sm" style="padding-left: 0; margin-bottom: 1rem;">
            ← Back to Business Dashboard
          </button>
          <div class="empty-state card" style="padding: 4rem 2rem;">
            <div class="empty-icon" style="color: var(--success-400);">🎉</div>
            <h2 class="empty-title">Inbox Zero: All Submissions Reviewed!</h2>
            <p class="empty-desc">You have reviewed all pending worker proofs. New submissions will appear here with a 72-hour countdown window.</p>
            <button id="view-dashboard-btn" class="btn btn-primary btn-sm">Return to Dashboard</button>
          </div>
        </div>
      `;

      container.querySelector('#review-back-btn').addEventListener('click', () => navigateTo('business'));
      container.querySelector('#view-dashboard-btn').addEventListener('click', () => navigateTo('business'));
      return;
    }

    if (selectedIndex >= pendingSubmissions.length) {
      selectedIndex = pendingSubmissions.length - 1;
    }

    const currentSub = pendingSubmissions[selectedIndex];
    const task = store.state.tasks.find(t => t.id === currentSub.taskId);

    container.innerHTML = `
      <div style="margin-bottom: 2rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 4px;">
              <button id="review-back-btn" class="btn btn-ghost btn-sm" style="padding-left: 0;">← Back to Dashboard</button>
            </div>
            <h1 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.02em;">Submission Review Workbench</h1>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">
              Reviewing item <strong class="num" style="color: var(--text-primary);">${selectedIndex + 1}</strong> of <strong class="num" style="color: var(--text-primary);">${pendingSubmissions.length}</strong> pending submissions
            </p>
          </div>

          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <button id="prev-sub-btn" class="btn btn-secondary btn-sm" ${selectedIndex === 0 ? 'disabled' : ''}>← Previous</button>
            <button id="next-sub-btn" class="btn btn-secondary btn-sm" ${selectedIndex === pendingSubmissions.length - 1 ? 'disabled' : ''}>Next →</button>
          </div>
        </div>

        <!-- Split-Screen Review Workbench -->
        <div class="review-workbench">
          <!-- Left: Screenshot & Proof Image Inspector -->
          <div class="review-proof-pane">
            <img class="review-proof-img" src="${currentSub.proofData?.proofUrl || 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=600&auto=format&fit=crop&q=80'}" alt="Worker Proof Screenshot">
            <div style="position: absolute; bottom: 12px; left: 12px; background: rgba(0, 0, 0, 0.7); padding: 4px 10px; border-radius: var(--radius-xs); font-size: 0.75rem; color: var(--text-secondary); font-family: var(--font-mono);">
              pHash: ${currentSub.proofHash || 'Verified Original'}
            </div>
          </div>

          <!-- Right: Audit Metadata & Approval Actions -->
          <div class="review-action-pane">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <span class="badge badge-indigo">${task?.category || 'Task'}</span>
                <span class="currency num" style="font-size: 1.25rem; font-weight: 800; color: var(--success-400);">
                  ₦${currentSub.reward.toLocaleString()}
                </span>
              </div>

              <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;">${task?.title || 'Microtask'}</h3>

              <!-- Worker Audit Card -->
              <div class="worker-audit-meta">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <strong style="color: var(--text-primary);">${currentSub.workerName}</strong>
                  <span class="badge badge-emerald">★ Trust: ${currentSub.workerTrustScore}/100</span>
                </div>
                <div style="color: var(--text-tertiary); font-size: 0.75rem;">
                  Submitted on ${new Date(currentSub.submittedAt).toLocaleString()}
                </div>
              </div>

              <!-- Worker Note / Token -->
              <div style="margin-bottom: 1.25rem;">
                <label class="form-label" style="font-size: 0.8rem;">Worker Note / Confirmation Code:</label>
                <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-xs); padding: 0.75rem; font-size: 0.85rem; color: var(--text-primary);">
                  ${currentSub.proofData?.note || 'No notes attached.'}
                </div>
              </div>

              <!-- SLA Countdown -->
              <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: var(--radius-xs); padding: 0.75rem; font-size: 0.8rem; color: var(--warning-400); margin-bottom: 1.5rem;">
                ⏱️ <strong>72h SLA:</strong> Auto-approves on ${new Date(currentSub.autoApproveAt).toLocaleDateString()} if unreviewed.
              </div>
            </div>

            <!-- Decision Controls -->
            <div style="display: flex; flex-direction: column; gap: 0.75rem; border-top: 1px solid var(--border-subtle); padding-top: 1.25rem;">
              <button id="approve-sub-btn" class="btn btn-success btn-lg" style="width: 100%; box-shadow: var(--shadow-glow-emerald);">
                ✓ Approve & Release ₦${currentSub.reward.toLocaleString()} Escrow
              </button>

              <div class="form-group" style="margin-bottom: 0;">
                <select id="reject-reason-select" class="form-select" style="font-size: 0.8rem; padding: 0.5rem 0.75rem;">
                  <option value="Blurry or unreadable screenshot">Reject: Blurry or unreadable screenshot</option>
                  <option value="Wrong confirmation code / token">Reject: Wrong confirmation code / token</option>
                  <option value="Required instruction steps incomplete">Reject: Required instruction steps incomplete</option>
                  <option value="Suspected duplicate proof">Reject: Suspected duplicate proof</option>
                </select>
              </div>

              <button id="reject-sub-btn" class="btn btn-danger btn-sm" style="width: 100%;">
                ✕ Reject Submission with Reason
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    container.querySelector('#review-back-btn').addEventListener('click', () => navigateTo('business'));

    const prevBtn = container.querySelector('#prev-sub-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (selectedIndex > 0) {
          selectedIndex -= 1;
          render();
        }
      });
    }

    const nextBtn = container.querySelector('#next-sub-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (selectedIndex < pendingSubmissions.length - 1) {
          selectedIndex += 1;
          render();
        }
      });
    }

    // Approve Action
    const approveBtn = container.querySelector('#approve-sub-btn');
    if (approveBtn) {
      approveBtn.addEventListener('click', () => {
        try {
          store.approveSubmission(currentSub.id);
          Toast.success('Submission Approved!', `₦${currentSub.reward.toLocaleString()} released from escrow to ${currentSub.workerName}.`);
          // Re-render
          render();
        } catch (err) {
          Toast.error('Approval Failed', err.message);
        }
      });
    }

    // Reject Action
    const rejectBtn = container.querySelector('#reject-sub-btn');
    if (rejectBtn) {
      rejectBtn.addEventListener('click', () => {
        const reason = container.querySelector('#reject-reason-select').value;
        if (confirm(`Reject this submission for reason: "${reason}"?`)) {
          store.rejectSubmission(currentSub.id, reason);
          Toast.info('Submission Rejected', 'Worker has been notified with your reason and can file an appeal.');
          render();
        }
      });
    }
  }

  render();
}
