/**
 * ============================================================================
 * BUSINESS CAMPAIGN CREATION WIZARD
 * 4-Step Builder: Basics -> Checklist -> Proof Spec -> Escrow Budget Calculator
 * ============================================================================
 */

import { store } from '../store.js';
import { Toast } from '../components/toast.js';

export function renderBusinessWizard(container, navigateTo) {
  let currentStep = 1;

  // Form State
  const formData = {
    category: 'App Testing',
    title: '',
    description: '',
    instructions: [
      'Download and install the mobile app from the link.',
      'Sign up using your verified email address.',
      'Navigate to the settings profile page.',
      'Take a full screenshot showing your verified account ID.'
    ],
    proofType: 'screenshot_and_text',
    workerReward: 850,
    totalSlots: 50,
    leaseMinutes: 45,
    estimatedMinutes: 10
  };

  function render() {
    const platformFeePerSlot = formData.workerReward * 0.15;
    const totalCostPerSlot = formData.workerReward + platformFeePerSlot;
    const totalEscrowRequired = totalCostPerSlot * formData.totalSlots;

    container.innerHTML = `
      <div style="max-width: 820px; margin: 0 auto 3rem;">
        <div style="margin-bottom: 2rem;">
          <button id="wizard-cancel-btn" class="btn btn-ghost btn-sm" style="padding-left: 0; margin-bottom: 0.5rem;">
            ← Cancel & Back to Dashboard
          </button>
          <h1 style="font-size: 1.85rem; font-weight: 800; letter-spacing: -0.02em;">Create Microtask Campaign</h1>
          <p style="font-size: 0.9rem; color: var(--text-secondary);">Define task instructions, proof criteria, and pre-fund escrow for verified workers.</p>
        </div>

        <!-- Wizard Step Nodes -->
        <div class="wizard-progress">
          <div class="wizard-step-node ${currentStep >= 1 ? (currentStep === 1 ? 'active' : 'completed') : ''}">1</div>
          <div class="wizard-step-node ${currentStep >= 2 ? (currentStep === 2 ? 'active' : 'completed') : ''}">2</div>
          <div class="wizard-step-node ${currentStep >= 3 ? (currentStep === 3 ? 'active' : 'completed') : ''}">3</div>
          <div class="wizard-step-node ${currentStep >= 4 ? (currentStep === 4 ? 'active' : 'completed') : ''}">4</div>
        </div>

        <!-- Step Content -->
        <div class="card" style="padding: 2rem;">
          ${renderStepContent(currentStep, totalEscrowRequired, platformFeePerSlot)}

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); margin-top: 2rem; padding-top: 1.5rem;">
            ${currentStep > 1 ? `
              <button id="wizard-prev-btn" class="btn btn-secondary">← Back</button>
            ` : `<div></div>`}

            ${currentStep < 4 ? `
              <button id="wizard-next-btn" class="btn btn-primary btn-lg" style="box-shadow: var(--shadow-glow-indigo);">
                Continue to Step ${currentStep + 1} →
              </button>
            ` : `
              <div style="display: flex; gap: 0.75rem; align-items: center;">
                <button type="button" id="wizard-preview-btn" class="btn btn-secondary btn-lg" style="border-color: var(--primary-500); color: var(--primary-400);">
                  👁️ Preview Task (Worker View)
                </button>
                <button id="wizard-launch-btn" class="btn btn-success btn-lg" style="box-shadow: var(--shadow-glow-emerald);">
                  Lock Escrow & Launch Campaign (₦${totalEscrowRequired.toLocaleString()}) →
                </button>
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    bindStepListeners(totalEscrowRequired);
  }

  function renderStepContent(step, totalEscrowRequired, platformFeePerSlot) {
    if (step === 1) {
      return `
        <div>
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">Step 1: Campaign Overview</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">Start from scratch or click a pre-built campaign template below to launch in seconds.</p>

          <!-- 1-Click Template Selector -->
          <div style="margin-bottom: 1.5rem;">
            <label class="form-label" style="font-size: 0.8rem; margin-bottom: 0.5rem;">Quick-Start Campaign Templates</label>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 0.75rem;">
              <button type="button" class="template-btn" data-tmpl="app_test" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 0.85rem; text-align: left; cursor: pointer; transition: all var(--transition-fast);">
                <div style="font-size: 1.25rem; margin-bottom: 4px;">📱</div>
                <div style="font-weight: 700; font-size: 0.825rem; color: #fff;">Mobile App Test</div>
                <div style="font-size: 0.7rem; color: var(--success-400); margin-top: 2px;">₦1,250 • 50 slots</div>
              </button>

              <button type="button" class="template-btn" data-tmpl="survey" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 0.85rem; text-align: left; cursor: pointer; transition: all var(--transition-fast);">
                <div style="font-size: 1.25rem; margin-bottom: 4px;">📋</div>
                <div style="font-weight: 700; font-size: 0.825rem; color: #fff;">Consumer Survey</div>
                <div style="font-size: 0.7rem; color: var(--success-400); margin-top: 2px;">₦650 • 100 slots</div>
              </button>

              <button type="button" class="template-btn" data-tmpl="content_mod" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 0.85rem; text-align: left; cursor: pointer; transition: all var(--transition-fast);">
                <div style="font-size: 1.25rem; margin-bottom: 4px;">🏷️</div>
                <div style="font-weight: 700; font-size: 0.825rem; color: #fff;">Catalog Tagging</div>
                <div style="font-size: 0.7rem; color: var(--success-400); margin-top: 2px;">₦400 • 200 slots</div>
              </button>

              <button type="button" class="template-btn" data-tmpl="voice_ai" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 0.85rem; text-align: left; cursor: pointer; transition: all var(--transition-fast);">
                <div style="font-size: 1.25rem; margin-bottom: 4px;">🎙️</div>
                <div style="font-weight: 700; font-size: 0.825rem; color: #fff;">Voice Speech AI</div>
                <div style="font-size: 0.7rem; color: var(--success-400); margin-top: 2px;">₦2,200 • 40 slots</div>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Task Category</label>
            <select id="input-category" class="form-select">
              <option value="App Testing" ${formData.category === 'App Testing' ? 'selected' : ''}>App Testing & Bug Discovery</option>
              <option value="Surveys" ${formData.category === 'Surveys' ? 'selected' : ''}>Surveys & Market Research</option>
              <option value="Content Moderation" ${formData.category === 'Content Moderation' ? 'selected' : ''}>Content Moderation & Data Categorization</option>
              <option value="AI Training" ${formData.category === 'AI Training' ? 'selected' : ''}>AI Training & Speech Recording</option>
              <option value="Social Media" ${formData.category === 'Social Media' ? 'selected' : ''}>Social Media Growth & Feedback</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Campaign Title</label>
            <input type="text" id="input-title" class="form-control" placeholder="e.g. Test Checkout Flow on Mobile App (Android)" value="${formData.title}">
            <span class="form-hint">Make it clear and action-oriented so workers understand the goal immediately.</span>
          </div>

          <div class="form-group">
            <label class="form-label">Detailed Description</label>
            <textarea id="input-desc" class="form-control" rows="3" placeholder="Provide background context on what you are testing or collecting...">${formData.description}</textarea>
          </div>
        </div>
      `;
    }

    if (step === 2) {
      return `
        <div>
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">Step 2: Step-by-Step Instructions</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Break your task down into simple, verifiable sequential steps for the worker.</p>

          <div id="instructions-container" style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.25rem;">
            ${formData.instructions.map((inst, idx) => `
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <span class="step-num">${idx + 1}</span>
                <input type="text" class="form-control instruction-input" data-idx="${idx}" value="${inst}" placeholder="Step ${idx + 1} instructions...">
                <button type="button" class="btn btn-ghost btn-sm remove-step-btn" data-idx="${idx}" style="color: var(--danger-400);">&times;</button>
              </div>
            `).join('')}
          </div>

          <button type="button" id="add-step-btn" class="btn btn-secondary btn-sm">+ Add Another Step</button>
        </div>
      `;
    }

    if (step === 3) {
      return `
        <div>
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">Step 3: Verification & Proof Requirements</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Define the exact proof required to review and approve each worker's submission.</p>

          <div class="form-group">
            <label class="form-label">Proof Mode</label>
            <select id="input-proof-type" class="form-select">
              <option value="screenshot_and_text">Full Screenshot + Confirmation Code/Note</option>
              <option value="screenshot_only">Screenshot Only</option>
              <option value="text_code_only">Confirmation Code / External URL Only</option>
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
            <div class="form-group">
              <label class="form-label">Estimated Completion Time (Mins)</label>
              <input type="number" id="input-est-time" class="form-control num" value="${formData.estimatedMinutes}" min="2" max="60">
            </div>

            <div class="form-group">
              <label class="form-label">Worker Lease Timeout (Mins)</label>
              <input type="number" id="input-lease-time" class="form-control num" value="${formData.leaseMinutes}" min="15" max="120">
              <span class="form-hint">Time allowed to submit proof before slot unlocks.</span>
            </div>
          </div>
        </div>
      `;
    }

    if (step === 4) {
      return `
        <div>
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">Step 4: Budget & Escrow Lock</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Configure worker rewards and slots. 100% of the total budget is locked safely in escrow.</p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
            <div class="form-group">
              <label class="form-label">Worker Reward per Task (₦)</label>
              <input type="number" id="input-reward" class="form-control num" value="${formData.workerReward}" min="200" step="50">
              <span class="form-hint">Minimum ₦200 to attract high-quality workers.</span>
            </div>

            <div class="form-group">
              <label class="form-label">Target Number of Completions (Slots)</label>
              <input type="number" id="input-slots" class="form-control num" value="${formData.totalSlots}" min="10" step="10">
              <span class="form-hint">Total slots available for this campaign.</span>
            </div>
          </div>

          <!-- Escrow Calculator Card -->
          <div class="escrow-calculator-card">
            <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.75rem; color: var(--text-primary);">
              Automated Escrow Allocation Breakdown
            </div>

            <div class="calc-row">
              <span>Worker Payouts (${formData.totalSlots} × ₦${formData.workerReward.toLocaleString()}):</span>
              <span class="currency num">₦${(formData.workerReward * formData.totalSlots).toLocaleString()}</span>
            </div>

            <div class="calc-row">
              <span>Platform Commission Fee (15%):</span>
              <span class="currency num">₦${(platformFeePerSlot * formData.totalSlots).toLocaleString()}</span>
            </div>

            <div class="calc-row total">
              <span>Total Escrow Lock Required:</span>
              <span class="currency num" style="color: var(--success-400);">₦${totalEscrowRequired.toLocaleString()}</span>
            </div>

            <div class="escrow-lock-notice">
              <span>🔒</span>
              <span>Funds are transferred from your business wallet into this campaign's escrow ledger. Unused slots refund automatically upon campaign closure.</span>
            </div>
          </div>
        </div>
      `;
    }
  }

  function bindStepListeners(totalEscrowRequired) {
    const cancelBtn = container.querySelector('#wizard-cancel-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', () => navigateTo('business'));

    // Step 1 Template Pickers
    if (currentStep === 1) {
      container.querySelectorAll('.template-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const tmpl = e.currentTarget.getAttribute('data-tmpl');
          if (tmpl === 'app_test') {
            formData.category = 'App Testing';
            formData.title = 'Beta Test & UX Friction Report: Mobile Onboarding Flow';
            formData.description = 'Install the latest Android APK, complete the registration and identity verification flow, and report any UI lag or validation errors.';
            formData.instructions = [
              'Install the app from the provided TestFlight / APK link.',
              'Create a test account with your phone number.',
              'Take a screenshot of the confirmed dashboard.',
              'Submit the screenshot with your phone number.'
            ];
            formData.workerReward = 1250;
            formData.totalSlots = 50;
          } else if (tmpl === 'survey') {
            formData.category = 'Surveys';
            formData.title = 'Gen-Z Fintech & Spending Habits Survey (Nigeria)';
            formData.description = 'Answer 12 honest questions regarding everyday debit card usage, savings, and peer-to-peer transfers.';
            formData.instructions = [
              'Click the external survey link.',
              'Complete all 12 questions.',
              'Copy the 6-digit confirmation token at the end.',
              'Paste the token and screenshot of completion.'
            ];
            formData.workerReward = 650;
            formData.totalSlots = 100;
          } else if (tmpl === 'content_mod') {
            formData.category = 'Content Moderation';
            formData.title = 'Product Taxonomy Categorization & Prohibited Content Flagging';
            formData.description = 'Review 20 marketplace listings. Tag each into the correct category and flag any suspicious or counterfeit items.';
            formData.instructions = [
              'Open the product review tool.',
              'Assign correct categories to 20 listings.',
              'Submit completion code.'
            ];
            formData.workerReward = 400;
            formData.totalSlots = 200;
          } else if (tmpl === 'voice_ai') {
            formData.category = 'AI Training';
            formData.title = 'Speech AI: Record 10 Conversational Sentences in Nigerian Pidgin';
            formData.description = 'Record clear, crisp audio reading 10 everyday conversational Pidgin prompts in a quiet room.';
            formData.instructions = [
              'Ensure your microphone is clear with zero background noise.',
              'Read and record each of the 10 displayed prompts.',
              'Upload audio file.'
            ];
            formData.workerReward = 2200;
            formData.totalSlots = 40;
          }
          Toast.info('Template Applied!', `Pre-filled "${formData.title}".`);
          render();
        });
      });
    }

    const prevBtn = container.querySelector('#wizard-prev-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentStep = Math.max(1, currentStep - 1);
        render();
      });
    }

    const nextBtn = container.querySelector('#wizard-next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        // Validation
        if (currentStep === 1) {
          const titleInput = container.querySelector('#input-title').value.trim();
          const descInput = container.querySelector('#input-desc').value.trim();
          if (!titleInput) {
            Toast.error('Missing Title', 'Please provide a clear campaign title.');
            return;
          }
          formData.title = titleInput;
          formData.description = descInput || 'Follow instructions and upload verified screenshot proof.';
          formData.category = container.querySelector('#input-category').value;
        } else if (currentStep === 2) {
          const inputs = Array.from(container.querySelectorAll('.instruction-input')).map(i => i.value.trim()).filter(Boolean);
          if (inputs.length === 0) {
            Toast.error('Missing Steps', 'Please provide at least 1 step for workers.');
            return;
          }
          formData.instructions = inputs;
        } else if (currentStep === 3) {
          formData.proofType = container.querySelector('#input-proof-type').value;
          formData.estimatedMinutes = parseInt(container.querySelector('#input-est-time').value, 10) || 10;
          formData.leaseMinutes = parseInt(container.querySelector('#input-lease-time').value, 10) || 45;
        }

        currentStep += 1;
        render();
      });
    }

    // Step 2 Add/Remove steps
    if (currentStep === 2) {
      const addStepBtn = container.querySelector('#add-step-btn');
      if (addStepBtn) {
        addStepBtn.addEventListener('click', () => {
          formData.instructions.push('');
          render();
        });
      }

      container.querySelectorAll('.remove-step-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
          formData.instructions.splice(idx, 1);
          render();
        });
      });
    }

    // Step 4 Budget inputs & Launch
    if (currentStep === 4) {
      const rewardInput = container.querySelector('#input-reward');
      const slotsInput = container.querySelector('#input-slots');

      const onBudgetChange = () => {
        formData.workerReward = Math.max(100, parseInt(rewardInput.value, 10) || 100);
        formData.totalSlots = Math.max(1, parseInt(slotsInput.value, 10) || 1);
        render();
      };

      rewardInput.addEventListener('change', onBudgetChange);
      slotsInput.addEventListener('change', onBudgetChange);

      const previewBtn = container.querySelector('#wizard-preview-btn');
      if (previewBtn) {
        previewBtn.addEventListener('click', () => {
          openTaskPreviewModal(formData);
        });
      }

      const launchBtn = container.querySelector('#wizard-launch-btn');
      launchBtn.addEventListener('click', () => {
        try {
          const platformFeePerSlot = formData.workerReward * 0.15;
          store.createCampaign({
            title: formData.title,
            category: formData.category,
            description: formData.description,
            instructions: formData.instructions,
            workerReward: formData.workerReward,
            platformFee: platformFeePerSlot,
            totalSlots: formData.totalSlots,
            leaseMinutes: formData.leaseMinutes,
            estimatedMinutes: formData.estimatedMinutes
          });

          Toast.success('Campaign Launched!', `₦${totalEscrowRequired.toLocaleString()} locked in escrow. Workers can now discover your task!`);
          navigateTo('business');
        } catch (err) {
          Toast.error('Launch Error', err.message);
        }
      });
    }
  }

  function openTaskPreviewModal(data) {
    const existing = document.getElementById('task-preview-modal-backdrop');
    if (existing) existing.remove();

    const backdrop = document.createElement('div');
    backdrop.id = 'task-preview-modal-backdrop';
    backdrop.className = 'modal-backdrop';

    backdrop.innerHTML = `
      <div class="modal-dialog" style="max-width: 680px;">
        <div class="modal-header">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 2px;">
              <span class="badge badge-indigo">Worker View Preview</span>
              <span style="font-size: 0.75rem; color: var(--text-tertiary);">Simulated Contributor Interface</span>
            </div>
            <h3 class="modal-title" style="font-size: 1.25rem; font-weight: 800;">Task Appearance Preview</h3>
          </div>
          <button class="modal-close" id="preview-modal-close">&times;</button>
        </div>

        <div class="modal-body" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem;">
          <!-- Marketplace Card Preview -->
          <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; margin-bottom: 0.75rem; letter-spacing: 0.05em;">
              1. Marketplace Feed Card View
            </div>

            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
              <span class="badge badge-indigo">${data.category}</span>
              <span class="currency num" style="font-size: 1.25rem; font-weight: 800; color: var(--success-400);">
                ₦${data.workerReward.toLocaleString()}
              </span>
            </div>

            <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary);">${data.title}</h4>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.5;">${data.description}</p>

            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary); border-top: 1px solid var(--border-subtle); padding-top: 0.75rem;">
              <div>🏢 PayStream Technologies Ltd <span class="badge badge-emerald" style="margin-left: 4px; font-size: 0.65rem;">★ 99% Verified</span></div>
              <div>⚡ ~${data.estimatedMinutes} mins • <strong>${data.totalSlots}</strong> slots left</div>
            </div>
          </div>

          <!-- Execution Workspace Preview -->
          <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-strong); border-radius: var(--radius-md); padding: 1.25rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; margin-bottom: 0.75rem; letter-spacing: 0.05em;">
              2. Worker Execution Workspace View
            </div>

            <!-- Lease Lock Banner -->
            <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-xs); padding: 0.75rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.8rem; color: var(--warning-400); font-weight: 600;">🔒 ₦${data.workerReward.toLocaleString()} Locked in Escrow</span>
              <span class="num" style="font-size: 0.85rem; font-weight: 700; color: #fff;">⏱️ ${data.leaseMinutes}:00 Lease Lock</span>
            </div>

            <div style="margin-bottom: 1rem;">
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.5rem; text-transform: uppercase;">
                Worker Instructions Checklist (${data.instructions.length} steps):
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                ${data.instructions.map((inst, idx) => `
                  <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; background: var(--bg-surface); padding: 0.5rem 0.75rem; border-radius: var(--radius-xs); border: 1px solid var(--border-subtle);">
                    <span class="step-num" style="width: 20px; height: 20px; font-size: 0.75rem;">${idx + 1}</span>
                    <span style="flex: 1; color: var(--text-primary);">${inst}</span>
                    <input type="checkbox" disabled style="accent-color: var(--success-500);">
                  </div>
                `).join('')}
              </div>
            </div>

            <div style="font-size: 0.8rem; color: var(--text-secondary);">
              <strong>Verification Proof Required:</strong> Screenshot upload with automated duplicate pHash protection + 72-hour review SLA.
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="preview-modal-done">Close Preview</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    requestAnimationFrame(() => backdrop.classList.add('active'));

    const close = () => {
      backdrop.classList.remove('active');
      setTimeout(() => backdrop.remove(), 200);
    };

    backdrop.querySelector('#preview-modal-close')?.addEventListener('click', close);
    backdrop.querySelector('#preview-modal-done')?.addEventListener('click', close);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close();
    });
  }

  // Pre-fill default title if empty
  if (!formData.title) {
    formData.title = 'Test PayStream Mobile Android Sign-up Flow & Submit Confirmation Screenshot';
    formData.description = 'We need 50 real Android users to test our newly released sign-up flow and verify that SMS OTP and KYC validation succeed with zero errors.';
  }

  render();
}
