/**
 * ============================================================================
 * ADMIN COMMAND CENTER & FINANCIAL AUDIT VIEW
 * Solvency Invariant Checker, Ledger Health, Moderation & Dispute Arbitration
 * ============================================================================
 */

import { store } from '../store.js';
import { Toast } from '../components/toast.js';

export function renderAdminDashboard(container, navigateTo) {
  const urlParams = new URLSearchParams(window.location.search);
  let activeTab = urlParams.get('adminTab') || 'solvency';

  function render() {
    const audit = store.ledger.auditSolvency();
    const disputes = store.state.disputes;

    container.innerHTML = `
      <div style="margin-bottom: 2rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 4px;">
              <span class="admin-header-badge">Superadmin Terminal</span>
              <span style="font-size: 0.8rem; color: var(--text-tertiary);">Real-Time Audit Node #01</span>
            </div>
            <h1 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.02em;">Platform Operations & Ledger Solvency</h1>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">Institutional-grade double-entry verification and dispute arbitration.</p>
          </div>

          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <button id="admin-export-ledger-btn" class="btn btn-secondary btn-sm">
              <span>📥 Export Ledger CSV</span>
            </button>
            <button id="admin-reset-data-btn" class="btn btn-secondary btn-sm" style="color: var(--danger-400);">
              ↻ Reset Demo Seed Data
            </button>
          </div>
        </div>

        <!-- Solvency Status Banner -->
        <div class="solvency-box">
          <div class="solvency-status">
            <div class="solvency-indicator-dot"></div>
            <div>
              <div style="font-size: 1.05rem; font-weight: 800; color: #fff;">
                Double-Entry Ledger Verified: ${audit.isSolvent ? '100% SOLVENT & BALANCED' : 'SOLVENCY WARNING'}
              </div>
              <div style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 400; margin-top: 2px;">
                Total Debits (₦${audit.totalDebits.toLocaleString()}) === Total Credits (₦${audit.totalCredits.toLocaleString()}) across ${audit.transactionsCount} recorded events.
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 1.5rem; text-align: right;">
            <div>
              <div style="font-size: 0.7rem; color: var(--text-tertiary); text-transform: uppercase;">Bank / Custody Asset</div>
              <div class="currency num" style="font-size: 1.25rem; font-weight: 800; color: var(--success-400);">₦${audit.custody.toLocaleString()}</div>
            </div>
            <div>
              <div style="font-size: 0.7rem; color: var(--text-tertiary); text-transform: uppercase;">Active Escrow Held</div>
              <div class="currency num" style="font-size: 1.25rem; font-weight: 800; color: var(--warning-400);">₦${audit.breakdown.activeEscrow.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="admin-tabs">
          <button class="admin-tab ${activeTab === 'solvency' ? 'active' : ''}" data-tab="solvency">
            📊 Solvency & Treasury
          </button>
          <button class="admin-tab ${activeTab === 'users' ? 'active' : ''}" data-tab="users">
            👥 Users & KYC
          </button>
          <button class="admin-tab ${activeTab === 'tasks' ? 'active' : ''}" data-tab="tasks">
            📋 Tasks & Campaigns (${store.state.tasks.length})
          </button>
          <button class="admin-tab ${activeTab === 'submissions' ? 'active' : ''}" data-tab="submissions">
            📥 Submissions Audit (${store.state.submissions.length})
          </button>
          <button class="admin-tab ${activeTab === 'payments' ? 'active' : ''}" data-tab="payments">
            💳 Payments & Ledger (${store.ledger.journalEntries.length})
          </button>
          <button class="admin-tab ${activeTab === 'disputes' ? 'active' : ''}" data-tab="disputes">
            ⚖️ Disputes (${disputes.length})
          </button>
        </div>

        <!-- Tab Content -->
        ${renderTabContent(activeTab, audit, disputes)}
      </div>
    `;

    // Event listeners
    container.querySelectorAll('.admin-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeTab = e.currentTarget.getAttribute('data-tab');
        render();
      });
    });

    const exportLedgerBtn = container.querySelector('#admin-export-ledger-btn');
    if (exportLedgerBtn) {
      exportLedgerBtn.addEventListener('click', () => {
        const headers = ['Entry_ID', 'Transaction_ID', 'Timestamp', 'Account_ID', 'Account_Type', 'Entry_Type', 'Amount_NGN'];
        const rows = store.ledger.journalEntries.map(e => {
          const acc = store.ledger.accounts[e.accountId];
          return [
            e.id,
            e.transactionId,
            e.timestamp,
            e.accountId,
            acc ? acc.type : 'UNKNOWN',
            e.type,
            e.amount
          ];
        });
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `apextask_general_ledger_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        Toast.success('Ledger Exported!', 'Double-entry journal statement downloaded.');
      });
    }

    const resetBtn = container.querySelector('#admin-reset-data-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset all demo tasks, balances, and submissions back to original seed state?')) {
          store.resetAllData();
          Toast.success('Data Reset', 'All records restored to clean default seed.');
          render();
        }
      });
    }

    container.querySelectorAll('.resolve-dispute-worker-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const dispId = e.currentTarget.getAttribute('data-disp-id');
        const disp = store.state.disputes.find(d => d.id === dispId);
        if (disp) {
          const sub = store.state.submissions.find(s => s.id === disp.submissionId);
          if (sub) {
            store.approveSubmission(sub.id);
            disp.status = 'resolved_worker_paid';
            store.saveState();
            Toast.success('Dispute Resolved!', `Overruled rejection. ₦${sub.reward.toLocaleString()} paid to ${sub.workerName}.`);
            render();
          }
        }
      });
    });

    container.querySelectorAll('.resolve-dispute-poster-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const dispId = e.currentTarget.getAttribute('data-disp-id');
        const disp = store.state.disputes.find(d => d.id === dispId);
        if (disp) {
          disp.status = 'resolved_rejection_upheld';
          store.saveState();
          Toast.info('Dispute Resolved', 'Rejection was upheld. Slot reopened.');
          render();
        }
      });
    });

    container.querySelectorAll('.task-toggle-status-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tId = e.currentTarget.getAttribute('data-task-id');
        const task = store.state.tasks.find(t => t.id === tId);
        if (task) {
          task.status = task.status === 'active' ? 'paused' : 'active';
          store.saveState();
          Toast.info('Task Status Updated', `Campaign "${task.title.substring(0, 30)}..." is now ${task.status}.`);
          render();
        }
      });
    });
  }

  function renderTabContent(tab, audit, disputes) {
    if (tab === 'solvency') {
      return `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
          <div class="card">
            <div style="font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase;">Total Cumulative Revenue Yield</div>
            <div class="currency num" style="font-size: 2rem; font-weight: 800; color: var(--primary-400); margin: 0.5rem 0;">
              ₦${audit.revenue.toLocaleString()}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">Accrued from 15% task poster commissions</div>
          </div>

          <div class="card">
            <div style="font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase;">Worker Withdrawable Cash</div>
            <div class="currency num" style="font-size: 2rem; font-weight: 800; color: var(--success-400); margin: 0.5rem 0;">
              ₦${audit.breakdown.userCash.toLocaleString()}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">Held in liability accounts ready for cashout</div>
          </div>

          <div class="card">
            <div style="font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase;">Active Campaign Escrow</div>
            <div class="currency num" style="font-size: 2rem; font-weight: 800; color: var(--warning-400); margin: 0.5rem 0;">
              ₦${audit.breakdown.activeEscrow.toLocaleString()}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">Locked in pre-funded task campaigns</div>
          </div>
        </div>

        <!-- Master Accounts List -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Live General Ledger Accounts</h2>
            <span class="badge badge-emerald">Real-Time Invariants</span>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Account Identifier</th>
                  <th>Classification</th>
                  <th>Account Name</th>
                  <th style="text-align: right;">Current Balance</th>
                </tr>
              </thead>
              <tbody>
                ${Object.values(store.ledger.accounts).map(acc => {
                  const b = store.ledger.getBalance(acc.id);
                  return `
                    <tr>
                      <td style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--primary-400);">${acc.id}</td>
                      <td><span class="badge ${acc.type === 'ASSET' ? 'badge-emerald' : (acc.type === 'REVENUE' ? 'badge-indigo' : 'badge-amber')}">${acc.type}</span></td>
                      <td>${acc.name}</td>
                      <td class="currency num" style="text-align: right; font-weight: 800; color: #fff;">₦${b.toLocaleString()}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (tab === 'users') {
      const mockUsers = [
        {
          id: 'worker_me',
          name: 'Adeola Johnson',
          email: 'adeola.johnson@example.com',
          role: 'Contributor / Worker',
          kycTier: 'Tier 1 (NIN Slip Verified)',
          trustScore: 98,
          tasksCount: 24,
          balance: store.ledger.getBalance('USER_CASH:worker_me'),
          status: 'Active'
        },
        {
          id: 'worker_chinedu',
          name: 'Chinedu Okafor',
          email: 'chinedu.o@example.com',
          role: 'Contributor / Worker',
          kycTier: 'Tier 2 (BVN + Biometrics)',
          trustScore: 99,
          tasksCount: 52,
          balance: 18200,
          status: 'Active'
        },
        {
          id: 'worker_fatima',
          name: 'Fatima Bello',
          email: 'fatima.b@example.com',
          role: 'Contributor / Worker',
          kycTier: 'Tier 1 (Voters Card)',
          trustScore: 94,
          tasksCount: 15,
          balance: 2100,
          status: 'Active'
        },
        {
          id: 'biz_fintech',
          name: 'PayStream Technologies Ltd',
          email: 'admin@paystream.io',
          role: 'Business / Poster',
          kycTier: 'Enterprise Verified (RC-1849204)',
          trustScore: 99,
          tasksCount: 4,
          balance: store.ledger.getBalance('USER_CASH:biz_fintech'),
          status: 'Active'
        },
        {
          id: 'biz_edtech',
          name: 'Veritas Consumer Research',
          email: 'surveys@veritas.ng',
          role: 'Business / Poster',
          kycTier: 'Enterprise Verified (RC-902184)',
          trustScore: 97,
          tasksCount: 2,
          balance: store.ledger.getBalance('USER_CASH:biz_edtech'),
          status: 'Active'
        },
        {
          id: 'admin_root',
          name: 'Apex Operations Root',
          email: 'security@apextask.internal',
          role: 'Platform Superadmin',
          kycTier: 'Internal Node Key',
          trustScore: 100,
          tasksCount: 0,
          balance: 0,
          status: 'System Operator'
        }
      ];

      return `
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Platform Users & Verification Directory</h2>
              <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">Manage workers, business campaign posters, trust reputation, and KYC statuses.</p>
            </div>
            <span class="badge badge-indigo">${mockUsers.length} Registered Entities</span>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>User / Organization</th>
                  <th>Role</th>
                  <th>KYC Verification</th>
                  <th>Trust Score</th>
                  <th>Activity</th>
                  <th style="text-align: right;">Wallet Cash</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${mockUsers.map(u => `
                  <tr>
                    <td>
                      <strong style="color: #fff;">${u.name}</strong>
                      <div style="font-size: 0.75rem; color: var(--text-tertiary);">${u.email}</div>
                    </td>
                    <td><span class="badge ${u.role.includes('Business') ? 'badge-indigo' : (u.role.includes('Worker') ? 'badge-emerald' : 'badge-amber')}">${u.role}</span></td>
                    <td style="font-size: 0.825rem; color: var(--text-secondary);">${u.kycTier}</td>
                    <td>
                      <span class="badge badge-emerald">★ ${u.trustScore}/100</span>
                    </td>
                    <td style="font-size: 0.825rem;">
                      ${u.role.includes('Worker') ? `${u.tasksCount} tasks completed` : `${u.tasksCount} campaigns`}
                    </td>
                    <td class="currency num" style="text-align: right; font-weight: 700; color: var(--success-400);">
                      ₦${u.balance.toLocaleString()}
                    </td>
                    <td><span class="badge badge-emerald">${u.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (tab === 'tasks') {
      return `
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Global Task Campaigns & Content Moderation</h2>
              <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">Audit live task requirements, rewards, escrow coverage, and policy compliance.</p>
            </div>
            <span class="badge badge-indigo">${store.state.tasks.length} Campaigns</span>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Campaign Title & Poster</th>
                  <th>Category</th>
                  <th>Reward / Slot</th>
                  <th>Slots Completed / Total</th>
                  <th>Escrow Balance</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${store.state.tasks.map(task => {
                  const escrowBal = store.ledger.getBalance(`ESCROW:${task.id}`);
                  return `
                    <tr>
                      <td style="max-width: 280px;">
                        <strong style="color: #fff;">${task.title}</strong>
                        <div style="font-size: 0.75rem; color: var(--text-tertiary);">Poster: ${task.businessName}</div>
                      </td>
                      <td><span class="badge badge-indigo">${task.category}</span></td>
                      <td class="currency num" style="font-weight: 700; color: var(--success-400);">₦${task.reward.toLocaleString()}</td>
                      <td class="num">${task.completedSlots || 0} / ${task.totalSlots} (${task.reservedSlots || 0} locked)</td>
                      <td class="currency num" style="color: var(--warning-400);">₦${escrowBal.toLocaleString()}</td>
                      <td>
                        <span class="badge ${task.status === 'active' ? 'badge-emerald' : 'badge-amber'}">
                          ${task.status === 'active' ? '● Active' : '⏸ Paused'}
                        </span>
                      </td>
                      <td>
                        <button type="button" class="btn btn-secondary btn-sm task-toggle-status-btn" data-task-id="${task.id}" style="font-size: 0.75rem;">
                          ${task.status === 'active' ? 'Pause' : 'Resume'}
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (tab === 'submissions') {
      return `
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">Worker Submissions & Proof Audit Log</h2>
              <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">Comprehensive trail of all submitted proofs, pHash perceptual hashes, and review states.</p>
            </div>
            <span class="badge badge-indigo">${store.state.submissions.length} Submissions</span>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Submission ID</th>
                  <th>Task Title</th>
                  <th>Contributor</th>
                  <th>Reward</th>
                  <th>Proof pHash</th>
                  <th>Submitted At</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${store.state.submissions.map(sub => `
                  <tr>
                    <td style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--primary-400);">${sub.id}</td>
                    <td style="max-width: 240px;">
                      <div style="font-weight: 600; color: #fff; font-size: 0.85rem;">${sub.taskTitle}</div>
                    </td>
                    <td>
                      <strong style="color: #fff;">${sub.workerName}</strong>
                      <div style="font-size: 0.75rem; color: var(--success-400);">★ ${sub.workerTrustScore}/100 Trust</div>
                    </td>
                    <td class="currency num" style="font-weight: 700; color: var(--success-400);">₦${sub.reward.toLocaleString()}</td>
                    <td>
                      <code style="font-size: 0.75rem; background: var(--bg-surface-elevated); padding: 2px 6px; border-radius: var(--radius-xs); color: var(--primary-300);">
                        ${sub.proofData?.proofHash || 'Verified Original'}
                      </code>
                    </td>
                    <td style="font-size: 0.8rem; color: var(--text-secondary);">
                      ${new Date(sub.submittedAt).toLocaleString()}
                    </td>
                    <td>
                      <span class="badge ${sub.status === 'approved' ? 'badge-emerald' : (sub.status === 'pending' ? 'badge-amber' : 'badge-danger')}">
                        ${sub.status === 'approved' ? '✓ Approved' : (sub.status === 'pending' ? '⏳ 72h SLA' : '✕ Rejected')}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (tab === 'payments') {
      return `
        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">General Ledger Journal Entries (Double-Entry Log)</h2>
              <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">Immutable double-entry transaction record: every debit matches a credit with zero rounding discrepancy.</p>
            </div>
            <button id="admin-export-payments-btn" class="btn btn-secondary btn-sm" onclick="document.getElementById('admin-export-ledger-btn')?.click()">
              📥 Export CSV
            </button>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Entry ID</th>
                  <th>Tx Ref</th>
                  <th>Timestamp</th>
                  <th>Account ID</th>
                  <th>Type</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${store.ledger.journalEntries.slice(-15).reverse().map(e => `
                  <tr>
                    <td style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-secondary);">${e.id}</td>
                    <td style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--primary-400);">${e.transactionId}</td>
                    <td style="font-size: 0.75rem; color: var(--text-tertiary);">${new Date(e.timestamp).toLocaleTimeString()}</td>
                    <td style="font-family: var(--font-mono); font-size: 0.75rem; color: #fff;">${e.accountId}</td>
                    <td>
                      <span class="badge ${e.type === 'DEBIT' ? 'badge-indigo' : 'badge-emerald'}" style="font-size: 0.7rem;">
                        ${e.type}
                      </span>
                    </td>
                    <td class="currency num" style="text-align: right; font-weight: 700; color: ${e.type === 'CREDIT' ? 'var(--success-400)' : 'var(--text-primary)'};">
                      ₦${e.amount.toLocaleString()}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (tab === 'disputes') {
      if (disputes.length === 0) {
        return `
          <div class="empty-state card">
            <div class="empty-icon" style="color: var(--success-400);">⚖️</div>
            <div class="empty-title">Zero Active Disputes</div>
            <div class="empty-desc">Workers have not filed any contested rejections. High-trust alignment maintained!</div>
          </div>
        `;
      }

      return `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${disputes.map(disp => `
            <div class="card">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                <div>
                  <span class="badge badge-indigo">Dispute #${disp.id}</span>
                  <h3 style="font-size: 1.1rem; font-weight: 700; margin-top: 4px;">${disp.taskTitle}</h3>
                </div>
                <span class="badge badge-amber">${disp.status}</span>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div style="background: rgba(239, 68, 68, 0.08); padding: 0.85rem; border-radius: var(--radius-sm);">
                  <div style="font-size: 0.75rem; color: var(--danger-400); font-weight: 700; text-transform: uppercase;">Poster Rejection Reason:</div>
                  <div style="font-size: 0.85rem; margin-top: 4px;">${disp.posterRejectionReason}</div>
                </div>

                <div style="background: rgba(99, 102, 241, 0.08); padding: 0.85rem; border-radius: var(--radius-sm);">
                  <div style="font-size: 0.75rem; color: var(--primary-400); font-weight: 700; text-transform: uppercase;">Worker (${disp.workerName}) Counter-Argument:</div>
                  <div style="font-size: 0.85rem; margin-top: 4px;">${disp.appealReason}</div>
                </div>
              </div>

              ${disp.status === 'under_arbitration' ? `
                <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
                  <button class="btn btn-secondary btn-sm resolve-dispute-poster-btn" data-disp-id="${disp.id}">
                    Uphold Rejection
                  </button>
                  <button class="btn btn-success btn-sm resolve-dispute-worker-btn" data-disp-id="${disp.id}">
                    Overrule & Pay Worker (Escrow Release) →
                  </button>
                </div>
              ` : `
                <div style="font-size: 0.8rem; color: var(--success-400); font-weight: 700;">
                  ✓ Ruling Completed: ${disp.status}
                </div>
              `}
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  render();
}
