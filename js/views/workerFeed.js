/**
 * ============================================================================
 * WORKER TASK FEED VIEW
 * Task Discovery, Filter Pills, Real-Time Slots, Search & Reservation Entry
 * ============================================================================
 */

import { store } from '../store.js';
import { openTaskDetailModal } from './workerTaskDetail.js';

export function renderWorkerFeed(container, navigateTo) {
  const user = store.state.currentUser;
  const balance = store.ledger.getBalance(`USER_CASH:${user.id}`);
  const activeReservation = store.state.activeReservation;

  let selectedCategory = 'All';
  let searchQuery = '';
  let sortBy = 'highest_payout';

  function render() {
    // Filter tasks
    let filteredTasks = store.state.tasks.filter(t => {
      const matchCat = selectedCategory === 'All' || t.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.businessName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch && t.status === 'active';
    });

    // Sort tasks
    if (sortBy === 'highest_payout') {
      filteredTasks.sort((a, b) => b.reward - a.reward);
    } else if (sortBy === 'shortest_time') {
      filteredTasks.sort((a, b) => (a.estimatedMinutes || 10) - (b.estimatedMinutes || 10));
    } else if (sortBy === 'slots_left') {
      filteredTasks.sort((a, b) => (b.totalSlots - b.reservedSlots) - (a.totalSlots - a.reservedSlots));
    }

    const categories = ['All', 'App Testing', 'Surveys', 'Content Moderation', 'AI Training', 'Social Media'];

    let activeBannerHtml = '';
    if (activeReservation) {
      const reservedTask = store.state.tasks.find(t => t.id === activeReservation.taskId);
      activeBannerHtml = `
        <div class="active-task-banner">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 4px;">
              <span class="badge badge-amber">Active Task Claimed</span>
              <span style="font-size: 0.85rem; font-weight: 700; color: #fff;">${reservedTask?.title || 'Microtask'}</span>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-secondary);">Your slot is locked in escrow. Complete instructions and submit proof before expiration.</p>
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <button id="resume-task-btn" class="btn btn-primary btn-sm" style="box-shadow: var(--shadow-glow-indigo);">
              <span>Open Execution Workspace</span> →
            </button>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="worker-header">
        <div class="worker-greeting-bar">
          <div>
            <h1 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.02em;">Task Marketplace</h1>
            <p class="worker-title-sub">Discover verified microtasks, reserve slots, and earn guaranteed instant rewards.</p>
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <button id="nav-submissions-btn" class="btn btn-secondary btn-sm">
              <span>My Submissions (${store.state.submissions.length})</span>
            </button>
            <button id="nav-wallet-btn" class="btn btn-success btn-sm" style="box-shadow: var(--shadow-glow-emerald);">
              <span>Wallet: ₦${balance.toLocaleString()}</span>
            </button>
          </div>
        </div>

        <!-- Metric Stat Strip -->
        <div class="worker-stats-strip">
          <div class="stat-card">
            <div class="stat-icon-wrapper stat-icon-emerald">₦</div>
            <div>
              <div class="stat-info-label">Available Earnings</div>
              <div class="stat-info-value num">₦${balance.toLocaleString()}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrapper stat-icon-indigo">✓</div>
            <div>
              <div class="stat-info-label">Approval Rate</div>
              <div class="stat-info-value">${user.approvalRate}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrapper stat-icon-amber">★</div>
            <div>
              <div class="stat-info-label">Trust Reputation</div>
              <div class="stat-info-value">${user.trustScore}/100</div>
            </div>
          </div>
        </div>

        ${activeBannerHtml}

        <!-- Filter & Search Controls -->
        <div class="filter-bar">
          <div class="category-pills">
            ${categories.map(cat => `
              <button class="category-pill ${selectedCategory === cat ? 'active' : ''}" data-cat="${cat}">
                ${cat}
              </button>
            `).join('')}
          </div>

          <div style="display: flex; gap: 0.75rem; flex: 1; justify-content: flex-end; align-items: center;">
            <div class="search-input-wrapper">
              <span class="search-icon">🔍</span>
              <input type="text" id="task-search-input" class="form-control" placeholder="Search tasks, posters, or keywords..." value="${searchQuery}">
            </div>
            
            <select id="task-sort-select" class="form-select" style="width: auto; min-width: 170px;">
              <option value="highest_payout" ${sortBy === 'highest_payout' ? 'selected' : ''}>Highest Payout</option>
              <option value="shortest_time" ${sortBy === 'shortest_time' ? 'selected' : ''}>Shortest Time</option>
              <option value="slots_left" ${sortBy === 'slots_left' ? 'selected' : ''}>Most Slots Remaining</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Task Grid -->
      ${filteredTasks.length === 0 ? `
        <div class="empty-state card">
          <div class="empty-icon">🔍</div>
          <div class="empty-title">No microtasks found</div>
          <div class="empty-desc">We couldn't find any tasks matching your selected filters. Try searching for a different keyword or resetting categories.</div>
          <button id="reset-filters-btn" class="btn btn-secondary btn-sm">Reset All Filters</button>
        </div>
      ` : `
        <div class="task-grid">
          ${filteredTasks.map(task => {
            const slotsRemaining = Math.max(0, task.totalSlots - task.reservedSlots);
            const fillPercent = Math.min(100, Math.round((task.reservedSlots / task.totalSlots) * 100));
            const isFull = slotsRemaining === 0;

            return `
              <div class="task-card" data-task-id="${task.id}">
                <div class="task-card-header">
                  <span class="badge badge-indigo">${task.category}</span>
                  <div class="poster-meta">
                    <span class="poster-avatar-sm">${task.businessName.charAt(0)}</span>
                    <span class="poster-name">${task.businessName}</span>
                    <span class="verified-icon" title="Verified Business">✓</span>
                  </div>
                </div>

                <h3 class="task-card-title">${task.title}</h3>
                <p class="task-card-desc">${task.description}</p>

                <div>
                  <div class="slots-meta">
                    <span>${slotsRemaining} slots remaining</span>
                    <span class="num">${fillPercent}% filled</span>
                  </div>
                  <div class="progress-bar-track" style="margin-bottom: 1rem;">
                    <div class="progress-bar-fill ${fillPercent > 80 ? 'progress-indigo' : 'progress-emerald'}" style="width: ${fillPercent}%;"></div>
                  </div>

                  <div class="task-card-footer">
                    <div class="reward-badge">
                      <span class="reward-label">Reward</span>
                      <span class="reward-amount currency num">₦${task.reward.toLocaleString()}</span>
                    </div>

                    <div style="text-align: right;">
                      <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 4px;">Est. ~${task.estimatedMinutes || 10} mins</div>
                      <button class="btn btn-primary btn-sm view-task-btn" data-task-id="${task.id}" ${isFull ? 'disabled' : ''}>
                        ${isFull ? 'Slots Full' : 'Start Task →'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    `;

    // Bind Event Listeners
    container.querySelectorAll('.category-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        selectedCategory = e.target.getAttribute('data-cat');
        render();
      });
    });

    const searchInput = container.querySelector('#task-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        render();
      });
    }

    const sortSelect = container.querySelector('#task-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        sortBy = e.target.value;
        render();
      });
    }

    const resetBtn = container.querySelector('#reset-filters-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        selectedCategory = 'All';
        searchQuery = '';
        sortBy = 'highest_payout';
        render();
      });
    }

    container.querySelectorAll('.task-card, .view-task-btn').forEach(elem => {
      elem.addEventListener('click', (e) => {
        const taskId = elem.getAttribute('data-task-id');
        if (taskId) {
          openTaskDetailModal(taskId, render);
        }
      });
    });

    const resumeBtn = container.querySelector('#resume-task-btn');
    if (resumeBtn && activeReservation) {
      resumeBtn.addEventListener('click', () => {
        openTaskDetailModal(activeReservation.taskId, render);
      });
    }

    const navSubBtn = container.querySelector('#nav-submissions-btn');
    if (navSubBtn) {
      navSubBtn.addEventListener('click', () => navigateTo('worker-submissions'));
    }

    const navWalletBtn = container.querySelector('#nav-wallet-btn');
    if (navWalletBtn) {
      navWalletBtn.addEventListener('click', () => navigateTo('worker-wallet'));
    }
  }

  render();
}
