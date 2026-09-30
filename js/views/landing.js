/**
 * ============================================================================
 * PUBLIC LANDING VIEW
 * High-conversion hero, live metrics, interactive calculator, and feature matrix
 * ============================================================================
 */

import { store } from '../store.js';

export function renderLandingView(container, navigateTo) {
  const tasks = store.state.tasks;
  const totalSlots = tasks.reduce((sum, t) => sum + t.totalSlots, 0);

  container.innerHTML = `
    <!-- Hero Section -->
    <div style="text-align: center; padding: 3.5rem 1rem 3rem; max-width: 860px; margin: 0 auto;">
      <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: var(--radius-full); padding: 4px 14px; margin-bottom: 1.5rem;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--success-400);"></span>
        <span style="font-size: 0.8rem; font-weight: 700; color: var(--primary-400); text-transform: uppercase; letter-spacing: 0.05em;">Next-Gen Microtask Marketplace</span>
      </div>
      
      <h1 style="font-size: clamp(2.2rem, 5vw, 3.5rem); font-weight: 800; line-height: 1.15; letter-spacing: -0.03em; margin-bottom: 1.25rem;">
        Reliable Microtask Earnings.<br>
        <span style="background: linear-gradient(135deg, var(--primary-400), var(--success-400)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Verified Crowdsourced Work.</span>
      </h1>
      
      <p style="font-size: 1.15rem; color: var(--text-secondary); max-width: 680px; margin: 0 auto 2.5rem; line-height: 1.6;">
        The high-trust distributed workforce platform connecting ambitious businesses with verified human contributors. Guaranteed escrow, 72-hour review SLAs, and instant bank payouts.
      </p>

      <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; margin-bottom: 3rem;">
        <button id="hero-btn-worker" class="btn btn-primary btn-lg" style="box-shadow: var(--shadow-glow-indigo);">
          <span>Start Earning as a Worker</span>
          <span>→</span>
        </button>
        <button id="hero-btn-business" class="btn btn-secondary btn-lg">
          <span>Post Tasks for Your Business</span>
        </button>
      </div>

      <!-- Trust Metrics Bar -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.5rem;">
        <div>
          <div class="num" style="font-size: 1.75rem; font-weight: 800; color: var(--primary-400);">₦18.4M+</div>
          <div style="font-size: 0.8rem; color: var(--text-tertiary); text-transform: uppercase; margin-top: 4px;">Paid to Contributors</div>
        </div>
        <div>
          <div class="num" style="font-size: 1.75rem; font-weight: 800; color: var(--success-400);">${totalSlots.toLocaleString()}</div>
          <div style="font-size: 0.8rem; color: var(--text-tertiary); text-transform: uppercase; margin-top: 4px;">Available Task Slots</div>
        </div>
        <div>
          <div class="num" style="font-size: 1.75rem; font-weight: 800; color: var(--warning-400);">72h Max</div>
          <div style="font-size: 0.8rem; color: var(--text-tertiary); text-transform: uppercase; margin-top: 4px;">Guaranteed Auto-Approval</div>
        </div>
        <div>
          <div class="num" style="font-size: 1.75rem; font-weight: 800; color: #fff;">100%</div>
          <div style="font-size: 0.8rem; color: var(--text-tertiary); text-transform: uppercase; margin-top: 4px;">Escrow-Locked Funds</div>
        </div>
      </div>
    </div>

    <!-- Interactive Earnings Calculator -->
    <div class="card" style="max-width: 800px; margin: 3rem auto; background: linear-gradient(135deg, rgba(17, 24, 39, 0.9), rgba(31, 41, 55, 0.6)); border: 1px solid var(--border-strong);">
      <div class="card-header" style="border-bottom: 1px solid var(--border-subtle); padding-bottom: 1rem;">
        <div>
          <h2 class="card-title">Interactive Worker Earnings Calculator</h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">Estimate how much you can earn completing microtasks on your phone or laptop</p>
        </div>
        <span class="badge badge-emerald">Live Estimator</span>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; padding-top: 1rem; align-items: center;">
        <div>
          <div class="form-group">
            <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 0.875rem; margin-bottom: 0.5rem;">
              <span>Tasks completed per day:</span>
              <span id="calc-tasks-val" class="num" style="color: var(--primary-400); font-weight: 800; font-size: 1rem;">6 tasks</span>
            </div>
            <input type="range" id="calc-tasks-range" min="1" max="25" value="6" style="width: 100%; accent-color: var(--primary-500); cursor: pointer;">
          </div>

          <div class="form-group" style="margin-top: 1.5rem;">
            <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 0.875rem; margin-bottom: 0.5rem;">
              <span>Average reward per task:</span>
              <span id="calc-reward-val" class="num" style="color: var(--success-400); font-weight: 800; font-size: 1rem;">₦750</span>
            </div>
            <input type="range" id="calc-reward-range" min="200" max="2500" step="50" value="750" style="width: 100%; accent-color: var(--success-500); cursor: pointer;">
          </div>
        </div>

        <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.5rem; text-align: center;">
          <div style="font-size: 0.8rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em;">Estimated Monthly Earnings</div>
          <div id="calc-monthly-total" class="currency num" style="font-size: 2.5rem; font-weight: 800; color: var(--success-400); margin: 0.5rem 0;">
            ₦135,000
          </div>
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
            Equivalent to <strong id="calc-daily-total" class="currency num" style="color: var(--text-primary);">₦4,500</strong> / day
          </div>
          <button id="calc-cta-btn" class="btn btn-success btn-lg" style="width: 100%;">
            Start Earning Today →
          </button>
        </div>
      </div>
    </div>

    <!-- Platform Superiority Matrix -->
    <div style="margin: 4rem auto; max-width: 980px;">
      <div style="text-align: center; margin-bottom: 2.5rem;">
        <h2 style="font-size: 1.85rem; font-weight: 800;">Why ApexTask Crushes Legacy Microtask Sites</h2>
        <p style="margin-top: 0.5rem;">Engineered from the ground up for fairness, transparency, and speed.</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
        <div class="card">
          <div style="font-size: 2rem; margin-bottom: 1rem;">🔒</div>
          <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Guaranteed Escrow Protection</h3>
          <p style="font-size: 0.85rem;">Businesses must pre-fund 100% of their campaign budget into escrow before workers start. You never have to worry about unpaid work.</p>
        </div>

        <div class="card">
          <div style="font-size: 2rem; margin-bottom: 1rem;">⏱️</div>
          <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">72-Hour Auto-Approval SLA</h3>
          <p style="font-size: 0.85rem;">If a business fails to review your submitted proof within 72 hours, our automated engine releases payment to your wallet automatically.</p>
        </div>

        <div class="card">
          <div style="font-size: 2rem; margin-bottom: 1rem;">⚡</div>
          <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Instant Bank Withdrawals</h3>
          <p style="font-size: 0.85rem;">Withdraw directly to your Nigerian commercial or microfinance bank account (GTB, Access, Kuda, Moniepoint) with zero delays.</p>
        </div>
      </div>
    </div>
  `;

  // Calculator interaction logic
  const tasksRange = container.querySelector('#calc-tasks-range');
  const rewardRange = container.querySelector('#calc-reward-range');
  const tasksVal = container.querySelector('#calc-tasks-val');
  const rewardVal = container.querySelector('#calc-reward-val');
  const monthlyTotal = container.querySelector('#calc-monthly-total');
  const dailyTotal = container.querySelector('#calc-daily-total');

  function updateCalc() {
    const tasksCount = parseInt(tasksRange.value, 10);
    const reward = parseInt(rewardRange.value, 10);
    const daily = tasksCount * reward;
    const monthly = daily * 30;

    tasksVal.textContent = `${tasksCount} tasks`;
    rewardVal.textContent = `₦${reward.toLocaleString()}`;
    dailyTotal.textContent = `₦${daily.toLocaleString()}`;
    monthlyTotal.textContent = `₦${monthly.toLocaleString()}`;
  }

  tasksRange.addEventListener('input', updateCalc);
  rewardRange.addEventListener('input', updateCalc);

  // Navigation hooks
  container.querySelector('#hero-btn-worker').addEventListener('click', () => navigateTo('worker'));
  container.querySelector('#hero-btn-business').addEventListener('click', () => navigateTo('business'));
  container.querySelector('#calc-cta-btn').addEventListener('click', () => navigateTo('worker'));
}
