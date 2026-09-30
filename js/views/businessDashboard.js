/**
 * ============================================================================
 * BUSINESS PORTAL DASHBOARD VIEW
 * Campaign Overview, Pending Submission Slates & Review Desk Entry
 * ============================================================================
 */

import { store } from '../store.js';
import { PaystackModal } from '../components/paystackModal.js';
import { Toast } from '../components/toast.js';

export function renderBusinessDashboard(container, navigateTo) {
  const biz = store.state.businessUser;
  const myTasks = store.state.tasks.filter(t => t.businessId === biz.id);

  // Pending reviews count
  const pendingSubmissions = store.state.submissions.filter(s => {
    const task = store.state.tasks.find(t => t.id === s.taskId);
    return task && task.businessId === biz.id && s.status === 'pending';
  });

  // Calculate total escrow currently locked
  let totalEscrowHeld = 0;
  for (const t of myTasks) {
    const escrowAcc = `ESCROW:${t.id}`;
    totalEscrowHeld += store.ledger.getBalance(escrowAcc);
  }

  const walletCash = store.ledger.getBalance(`USER_CASH:${biz.id}`);

  container.innerHTML = `
    <div style="margin-bottom: 2rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 4px;">
            <span class="badge badge-indigo">Business Hub</span>
            <span style="font-size: 0.8rem; color: var(--text-tertiary);">${biz.rcNumber}</span>
          </div>
          <h1 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.02em;">${biz.name}</h1>
          <p style="font-size: 0.9rem; color: var(--text-secondary);">Manage microtask campaigns, audit crowdsourced proofs, and monitor escrow spend.</p>
        </div>

        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <button id="fund-biz-wallet-btn" class="btn btn-secondary" style="border-color: #0284C7; color: #38BDF8;">
            <span>💳 Fund Wallet (Paystack)</span>
          </button>
          <button id="open-review-center-btn" class="btn btn-secondary" style="position: relative;">
            <span>Review Inbox</span>
            ${pendingSubmissions.length > 0 ? `
              <span class="badge badge-amber" style="margin-left: 4px;">${pendingSubmissions.length} Pending</span>
            ` : ''}
          </button>
          <button id="create-campaign-btn" class="btn btn-primary btn-lg" style="box-shadow: var(--shadow-glow-indigo);">
            <span>+ Create New Campaign</span>
          </button>
        </div>
      </div>

      <!-- Metrics Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
        <div class="stat-card">
          <div class="stat-icon-wrapper stat-icon-indigo">📁</div>
          <div>
            <div class="stat-info-label">Active Campaigns</div>
            <div class="stat-info-value num">${myTasks.length}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrapper stat-icon-amber">⏳</div>
          <div>
            <div class="stat-info-label">Pending Reviews</div>
            <div class="stat-info-value num" style="color: ${pendingSubmissions.length > 0 ? 'var(--warning-400)' : 'var(--text-primary)'};">
              ${pendingSubmissions.length}
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrapper stat-icon-emerald">🔒</div>
          <div>
            <div class="stat-info-label">Active Escrow Locked</div>
            <div class="stat-info-value num currency">₦${totalEscrowHeld.toLocaleString()}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrapper stat-icon-indigo">💼</div>
          <div>
            <div class="stat-info-label">Business Wallet Cash</div>
            <div class="stat-info-value num currency">₦${walletCash.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <!-- Pending Reviews Action Banner -->
      ${pendingSubmissions.length > 0 ? `
        <div class="card" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(17, 24, 39, 0.9)); border-color: rgba(245, 158, 11, 0.3); margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 4px;">
              <span class="badge badge-amber">Action Required</span>
              <strong style="color: #fff;">${pendingSubmissions.length} Worker Submissions Awaiting Approval</strong>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-secondary);">Submissions are governed by a 72-hour SLA. Unreviewed proofs will auto-approve automatically.</p>
          </div>
          <button id="quick-review-btn" class="btn btn-primary btn-sm">
            Launch Review Desk (${pendingSubmissions.length}) →
          </button>
        </div>
      ` : ''}

      <!-- Campaigns Table -->
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Live Task Campaigns</h2>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">Real-time slot completions and escrow status</p>
          </div>
          <span class="badge badge-emerald">${myTasks.length} Active</span>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Campaign Title</th>
                <th>Category</th>
                <th>Worker Reward</th>
                <th>Slots Completed</th>
                <th>Escrow Allocated</th>
                <th>Status</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${myTasks.map(task => {
                const fillPercent = Math.min(100, Math.round((task.completedSlots / task.totalSlots) * 100));
                const totalEscrow = (task.reward + task.platformFee) * task.totalSlots;

                return `
                  <tr>
                    <td>
                      <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">${task.title}</div>
                      <div style="font-size: 0.75rem; color: var(--text-tertiary);">Created ${new Date(task.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td><span class="badge badge-indigo">${task.category}</span></td>
                    <td class="currency num" style="font-weight: 700; color: var(--success-400);">₦${task.reward.toLocaleString()}</td>
                    <td style="min-width: 140px;">
                      <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
                        <span>${task.completedSlots} / ${task.totalSlots}</span>
                        <span class="num">${fillPercent}%</span>
                      </div>
                      <div class="progress-bar-track">
                        <div class="progress-bar-fill progress-emerald" style="width: ${fillPercent}%;"></div>
                      </div>
                    </td>
                    <td class="currency num" style="color: var(--text-secondary);">₦${totalEscrow.toLocaleString()}</td>
                    <td><span class="badge badge-emerald">${task.status}</span></td>
                    <td style="text-align: right;">
                      <button class="btn btn-ghost btn-sm inspect-task-btn" data-task-id="${task.id}">Review Submissions</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        <div style="padding: 1rem 1.5rem; border-top: 1px solid var(--border-subtle); display: flex; justify-content: flex-end; background: rgba(0,0,0,0.1);">
          <button id="export-submissions-csv-btn" class="btn btn-secondary btn-sm">
            <span>📥 Export Submissions to CSV</span>
          </button>
        </div>
      </div>
    </div>
  `;

  // Bind Listeners
  container.querySelector('#create-campaign-btn').addEventListener('click', () => navigateTo('business-wizard'));
  container.querySelector('#open-review-center-btn').addEventListener('click', () => navigateTo('business-review'));

  const fundBtn = container.querySelector('#fund-biz-wallet-btn');
  if (fundBtn) {
    fundBtn.addEventListener('click', () => {
      PaystackModal.open({
        title: 'Fund Business Wallet',
        amount: 50000,
        email: biz.email,
        userId: biz.id,
        onSuccess: () => renderBusinessDashboard(container, navigateTo)
      });
    });
    if (new URLSearchParams(window.location.search).get('modal') === 'paystack') {
      setTimeout(() => fundBtn.click(), 100);
    }
  }

  const exportCsvBtn = container.querySelector('#export-submissions-csv-btn');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      const headers = ['Submission_ID', 'Task_ID', 'Task_Title', 'Worker_Name', 'Reward_NGN', 'Status', 'Submitted_At'];
      const rows = store.state.submissions.map(s => [
        s.id,
        s.taskId,
        `"${s.taskTitle.replace(/"/g, '""')}"`,
        `"${s.workerName}"`,
        s.reward,
        s.status,
        s.submittedAt
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `apextask_submissions_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      Toast.success('CSV Exported!', 'Submissions downloaded successfully.');
    });
  }

  const quickReviewBtn = container.querySelector('#quick-review-btn');
  if (quickReviewBtn) {
    quickReviewBtn.addEventListener('click', () => navigateTo('business-review'));
  }

  container.querySelectorAll('.inspect-task-btn').forEach(btn => {
    btn.addEventListener('click', () => navigateTo('business-review'));
  });
}
