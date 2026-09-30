/**
 * ============================================================================
 * WORKER TASK DETAIL & EXECUTION WORKSPACE
 * Slot Reservation, Lease Countdown Timer, Checklist & Proof Ingestion
 * ============================================================================
 */

import { store } from '../store.js';
import { Modal } from '../components/modal.js';
import { Toast } from '../components/toast.js';
import { CountdownTimer } from '../components/countdown.js';
import { FraudShield } from '../fraud.js';

let activeTimerInstance = null;

export function openTaskDetailModal(taskId, onStateChange) {
  const task = store.state.tasks.find(t => t.id === taskId);
  if (!task) return;

  const isReservedByMe = store.state.activeReservation?.taskId === task.id;
  const reservation = store.state.activeReservation;

  function renderModalContent() {
    if (isReservedByMe && reservation) {
      // Render Active Task Execution Workspace
      return `
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <!-- Sticky Timer Banner -->
          <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-strong); border-radius: var(--radius-sm); padding: 0.85rem 1rem; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <span class="badge badge-amber" style="margin-bottom: 4px;">Slot Reserved in Escrow</span>
              <div style="font-size: 0.85rem; color: var(--text-secondary);">Submit verified proof before lease expires</div>
            </div>
            <div id="modal-countdown-badge" class="lease-countdown-clock num">
              ⏱️ <span id="countdown-text">--:--</span>
            </div>
          </div>

          <div>
            <h2 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.5rem;">${task.title}</h2>
            <p style="font-size: 0.85rem; color: var(--text-secondary);">${task.description}</p>
          </div>

          <!-- Step-by-Step Interactive Checklist -->
          <div>
            <h4 style="font-size: 0.9rem; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary); letter-spacing: 0.05em; margin-bottom: 0.5rem;">
              Step-by-Step Instructions
            </h4>
            <div class="task-steps-list">
              ${task.instructions.map((inst, idx) => `
                <div class="task-step-item" id="step-item-${idx}">
                  <div class="step-num">${idx + 1}</div>
                  <div style="flex: 1; font-size: 0.875rem;">${inst}</div>
                  <input type="checkbox" class="step-checkbox" data-idx="${idx}" style="width: 18px; height: 18px; accent-color: var(--success-500); cursor: pointer;">
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Proof Upload Zone -->
          <div style="border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
            <h4 style="font-size: 0.9rem; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary); letter-spacing: 0.05em; margin-bottom: 0.5rem;">
              Upload Verification Proof
            </h4>

            <div id="proof-upload-dropzone" class="proof-dropzone">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">📷</div>
              <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 0.25rem;">Drop screenshot here or click to browse</div>
              <div style="font-size: 0.75rem; color: var(--text-tertiary);">PNG, JPG, or WEBP (Max 10MB). Client-compressed before upload.</div>
              <div style="margin-top: 0.75rem;">
                <button type="button" id="use-demo-screenshot-btn" class="btn btn-secondary btn-sm" style="font-size: 0.75rem; border-color: var(--primary-500); color: var(--primary-400);">
                  ✨ Use Sample Screenshot (Instant Test)
                </button>
              </div>
              <input type="file" id="proof-file-input" accept="image/*" style="display: none;">
            </div>

            <div id="preview-container" style="display: none; text-align: center; margin-top: 1rem;">
              <div class="proof-preview-wrapper">
                <img id="proof-preview-img" class="proof-preview-img" src="" alt="Proof Preview">
                <button type="button" id="remove-proof-btn" class="remove-preview-btn">&times;</button>
              </div>
              <div id="phash-indicator" style="font-size: 0.75rem; color: var(--success-400); margin-top: 6px; font-family: var(--font-mono);">
                ✓ pHash Signature Generated: <span id="phash-value">--</span>
              </div>
            </div>

            <div class="form-group" style="margin-top: 1rem;">
              <label class="form-label">Confirmation Code, Username or Extra Note (Optional)</label>
              <textarea id="proof-note-input" class="form-control" rows="2" placeholder="e.g. My survey completion code is XYZ-1234 or Twitter handle @adeola"></textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Default: Task Details Pre-Claim View
    const slotsRemaining = Math.max(0, task.totalSlots - task.reservedSlots);
    return `
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
          <span class="badge badge-indigo">${task.category}</span>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="poster-avatar-sm">${task.businessName.charAt(0)}</span>
            <span style="font-size: 0.85rem; font-weight: 600;">${task.businessName}</span>
            <span class="badge badge-emerald">★ ${task.businessRating}</span>
          </div>
        </div>

        <div>
          <h2 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 0.5rem; line-height: 1.3;">${task.title}</h2>
          <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6;">${task.description}</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 1rem; text-align: center;">
          <div>
            <div style="font-size: 0.7rem; color: var(--text-tertiary); text-transform: uppercase;">Worker Reward</div>
            <div class="currency num" style="font-size: 1.25rem; font-weight: 800; color: var(--success-400); margin-top: 2px;">₦${task.reward.toLocaleString()}</div>
          </div>
          <div>
            <div style="font-size: 0.7rem; color: var(--text-tertiary); text-transform: uppercase;">Slots Open</div>
            <div class="num" style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin-top: 2px;">${slotsRemaining} / ${task.totalSlots}</div>
          </div>
          <div>
            <div style="font-size: 0.7rem; color: var(--text-tertiary); text-transform: uppercase;">Lease Window</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--warning-400); margin-top: 2px;">${task.leaseMinutes} mins</div>
          </div>
        </div>

        <div>
          <h4 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: var(--text-tertiary); letter-spacing: 0.05em; margin-bottom: 0.75rem;">
            What you will do:
          </h4>
          <div class="task-steps-list">
            ${task.instructions.map((inst, idx) => `
              <div class="task-step-item">
                <div class="step-num">${idx + 1}</div>
                <div style="font-size: 0.875rem;">${inst}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: var(--radius-sm); padding: 0.85rem 1rem; font-size: 0.8rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.5rem;">
          <span>🛡️</span>
          <span><strong>Escrow Guarantee:</strong> ₦${task.reward.toLocaleString()} is already locked in escrow for this slot. It will be released directly to your wallet upon poster review or after 72 hours automatically.</span>
        </div>
      </div>
    `;
  }

  function renderModalFooter() {
    if (isReservedByMe && reservation) {
      return `
        <button id="abandon-task-btn" class="btn btn-danger btn-sm">Abandon Task</button>
        <button id="submit-proof-btn" class="btn btn-success btn-lg" style="box-shadow: var(--shadow-glow-emerald);">
          Submit Proof for Review (₦${task.reward.toLocaleString()}) →
        </button>
      `;
    }

    const slotsRemaining = Math.max(0, task.totalSlots - task.reservedSlots);
    const isFull = slotsRemaining === 0;

    return `
      <button class="btn btn-secondary modal-close-btn">Close</button>
      <button id="claim-task-btn" class="btn btn-primary btn-lg" style="box-shadow: var(--shadow-glow-indigo);" ${isFull ? 'disabled' : ''}>
        ${isFull ? 'All Slots Claimed' : `Claim Slot & Start (${task.leaseMinutes}m Lease) →`}
      </button>
    `;
  }

  const modalEl = Modal.open(
    isReservedByMe ? `Execution Workspace: ${task.category}` : 'Task Details & Eligibility',
    renderModalContent(),
    renderModalFooter()
  );

  // Setup Countdown Timer if in Active Workspace
  if (isReservedByMe && reservation) {
    if (activeTimerInstance) activeTimerInstance.stop();

    const countdownText = modalEl.querySelector('#countdown-text');
    activeTimerInstance = new CountdownTimer(
      reservation.expiresAt,
      ({ formatted, totalSeconds }) => {
        if (countdownText) {
          countdownText.textContent = formatted;
          if (totalSeconds < 300) {
            countdownText.parentElement.style.borderColor = 'var(--danger-500)';
            countdownText.parentElement.style.color = 'var(--danger-400)';
          }
        }
      },
      () => {
        Toast.error('Lease Expired', 'Your task reservation lease has expired and the slot was released.');
        store.abandonActiveReservation();
        Modal.close();
        if (onStateChange) onStateChange();
      }
    );

    // Interactive step checkboxes
    modalEl.querySelectorAll('.step-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const item = e.target.closest('.task-step-item');
        if (e.target.checked) item.classList.add('checked');
        else item.classList.remove('checked');
      });
    });

    // File upload & pHash generation
    const dropzone = modalEl.querySelector('#proof-upload-dropzone');
    const fileInput = modalEl.querySelector('#proof-file-input');
    const previewContainer = modalEl.querySelector('#preview-container');
    const previewImg = modalEl.querySelector('#proof-preview-img');
    const removeBtn = modalEl.querySelector('#remove-proof-btn');
    const phashVal = modalEl.querySelector('#phash-value');

    let currentProofDataUrl = 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=600&auto=format&fit=crop&q=80'; // fallback mock
    let currentHash = 'c7e914a2f8b05d31';

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', async (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        handleImageFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleImageFile(e.target.files[0]);
      }
    });

    async function handleImageFile(file) {
      dropzone.style.display = 'none';
      previewContainer.style.display = 'block';

      const reader = new FileReader();
      reader.onload = async (evt) => {
        currentProofDataUrl = evt.target.result;
        previewImg.src = currentProofDataUrl;

        // Compute simulated pHash
        currentHash = await FraudShield.computeImagePHash(file);
        phashVal.textContent = currentHash;
      };
      reader.readAsDataURL(file);
    }

    removeBtn.addEventListener('click', () => {
      dropzone.style.display = 'block';
      previewContainer.style.display = 'none';
      previewImg.src = '';
      currentProofDataUrl = '';
      fileInput.value = '';
    });

    const demoScreenshotBtn = modalEl.querySelector('#use-demo-screenshot-btn');
    if (demoScreenshotBtn) {
      demoScreenshotBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentProofDataUrl = 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=600&auto=format&fit=crop&q=80';
        currentHash = 'e8b419c720a4f3d1';
        previewImg.src = currentProofDataUrl;
        phashVal.textContent = currentHash;
        dropzone.style.display = 'none';
        previewContainer.style.display = 'block';

        const noteInput = modalEl.querySelector('#proof-note-input');
        if (noteInput && !noteInput.value) {
          noteInput.value = 'Demo test run on Android 14. All onboarding & KYC steps completed smoothly with zero friction.';
        }
        Toast.info('Sample Screenshot Applied', 'Proof image attached with pHash fingerprint.');
      });
    }

    // Submit Proof Button
    const submitBtn = modalEl.querySelector('#submit-proof-btn');
    submitBtn.addEventListener('click', () => {
      // Speedrun anti-fraud check
      const speedrunCheck = FraudShield.checkSpeedrun(reservation.startedAt, 10);
      if (speedrunCheck.isSpeedrun) {
        Toast.error('Submission Blocked (Speedrun)', `You submitted in ${speedrunCheck.elapsedSeconds}s. Please ensure you carefully execute all steps.`);
        return;
      }

      // Check duplicate pHash against existing submissions
      const duplicateCheck = FraudShield.checkDuplicateSubmission(currentHash, store.state.submissions);
      if (duplicateCheck.isDuplicate) {
        Toast.error('Fraud Flag: Duplicate Proof', `This screenshot appears identical to a prior submission. Please upload your own original screenshot.`);
        return;
      }

      const note = modalEl.querySelector('#proof-note-input')?.value || 'Proof completed as instructed.';

      store.submitTaskProof(task.id, {
        proofUrl: currentProofDataUrl || 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=600&auto=format&fit=crop&q=80',
        note,
        submittedAt: new Date().toISOString()
      }, currentHash);

      if (activeTimerInstance) activeTimerInstance.stop();
      Modal.close();
      Toast.success('Proof Submitted Successfully!', `₦${task.reward.toLocaleString()} will be approved by the poster within 72h.`);
      if (onStateChange) onStateChange();
    });

    // Abandon Task Button
    const abandonBtn = modalEl.querySelector('#abandon-task-btn');
    abandonBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to abandon this task? The slot will be returned to other workers.')) {
        if (activeTimerInstance) activeTimerInstance.stop();
        store.abandonActiveReservation();
        Modal.close();
        Toast.info('Task Abandoned', 'Slot released back to the public pool.');
        if (onStateChange) onStateChange();
      }
    });

    return;
  }

  // Pre-Claim Event Listeners
  const claimBtn = modalEl.querySelector('#claim-task-btn');
  if (claimBtn) {
    claimBtn.addEventListener('click', () => {
      try {
        store.reserveTask(task.id);
        Toast.success('Slot Reserved!', `You have ${task.leaseMinutes} minutes to complete the task.`);
        Modal.close();
        // Re-open in Active Execution mode
        setTimeout(() => {
          openTaskDetailModal(task.id, onStateChange);
          if (onStateChange) onStateChange();
        }, 150);
      } catch (err) {
        Toast.error('Reservation Error', err.message);
      }
    });
  }

  const closeBtn = modalEl.querySelector('.modal-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => Modal.close());
  }
}
