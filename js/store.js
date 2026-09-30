/**
 * ============================================================================
 * CENTRAL REACTIVE STORE & SEED DATA ENGINE
 * ============================================================================
 */

import { LedgerEngine } from './ledger.js';

const STORAGE_KEY = 'apextask_state_v2';

export class AppStore {
  constructor() {
    this.listeners = [];
    this.loadState();
  }

  getDefaultSeedData() {
    const defaultLedger = new LedgerEngine();

    // Seed balances
    defaultLedger.recordDeposit('biz_fintech', 150000, 'PAY_DEP_INIT_BIZ1');
    defaultLedger.recordDeposit('biz_edtech', 90000, 'PAY_DEP_INIT_BIZ2');
    defaultLedger.recordDeposit('worker_me', 3500, 'WELCOME_BONUS_INIT');

    // Seed tasks across 5 high-yield categories
    const tasks = [
      {
        id: 'task_kuda_onboarding',
        businessId: 'biz_fintech',
        businessName: 'PayStream Technologies',
        businessRating: 4.9,
        verified: true,
        title: 'Beta Test & Bug Discovery: Android Mobile Onboarding Flow',
        category: 'App Testing',
        description: 'Download the PayStream Beta APK, execute the 3-step sign-up flow, take a screenshot of the KYC identity review screen, and report any UI lag or validation errors.',
        instructions: [
          'Install the PayStream Beta App from the provided private TestFlight/APK link.',
          'Create a test account using any valid Nigerian phone number.',
          'Navigate to Profile -> Identity Verification.',
          'Take a full-screen screenshot showing the Tier 1 Verification Confirmed screen.',
          'Submit the screenshot along with the test phone number used.'
        ],
        reward: 1250,
        platformFee: 187.5,
        totalSlots: 100,
        reservedSlots: 42,
        completedSlots: 38,
        leaseMinutes: 45,
        estimatedMinutes: 12,
        autoApproveHours: 72,
        status: 'active',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 5).toISOString()
      },
      {
        id: 'task_ecommerce_survey',
        businessId: 'biz_edtech',
        businessName: 'Veritas Consumer Research',
        businessRating: 4.8,
        verified: true,
        title: 'Gen-Z Online Shopping & Delivery Friction Survey (Nigeria)',
        category: 'Surveys',
        description: 'Complete our 14-question survey regarding recent e-commerce checkout and delivery experiences in Lagos, Abuja, or Port Harcourt. Receive a 6-digit confirmation code at the end.',
        instructions: [
          'Open the survey link in an external tab.',
          'Answer all 14 questions truthfully regarding your recent online orders.',
          'At the final screen, copy the unique 6-digit completion token.',
          'Paste the 6-digit token and upload a screenshot of the thank-you screen.'
        ],
        reward: 650,
        platformFee: 97.5,
        totalSlots: 250,
        reservedSlots: 184,
        completedSlots: 172,
        leaseMinutes: 30,
        estimatedMinutes: 8,
        autoApproveHours: 48,
        status: 'active',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 6).toISOString()
      },
      {
        id: 'task_content_moderation',
        businessId: 'biz_fintech',
        businessName: 'KrowdLabel AI Labs',
        businessRating: 5.0,
        verified: true,
        title: 'Product Catalog Categorization & Inappropriate Image Flagging',
        category: 'Content Moderation',
        description: 'Review 20 marketplace product listings. Assign each to its primary taxonomy category and flag any counterfeit or prohibited items.',
        instructions: [
          'Review the 20 merchant items presented.',
          'Tag each item under Electronics, Fashion, Home, or Prohibited.',
          'Submit the final summary token upon completion.'
        ],
        reward: 450,
        platformFee: 67.5,
        totalSlots: 500,
        reservedSlots: 312,
        completedSlots: 290,
        leaseMinutes: 30,
        estimatedMinutes: 6,
        autoApproveHours: 48,
        status: 'active',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 3).toISOString()
      },
      {
        id: 'task_audio_pidgin',
        businessId: 'biz_edtech',
        businessName: 'VoiceGen Speech AI',
        businessRating: 4.7,
        verified: true,
        title: 'Voice Recording: 10 Short Conversational Nigerian Pidgin Prompts',
        category: 'AI Training',
        description: 'Read and record 10 short sentences in natural Nigerian Pidgin English for speech recognition model training. Crisp audio with zero background noise required.',
        instructions: [
          'Record in a quiet room with headphones/microphone.',
          'Read each of the 10 displayed Pidgin prompts naturally.',
          'Upload the resulting audio file or provide link.'
        ],
        reward: 2200,
        platformFee: 330,
        totalSlots: 80,
        reservedSlots: 65,
        completedSlots: 58,
        leaseMinutes: 60,
        estimatedMinutes: 18,
        autoApproveHours: 72,
        status: 'active',
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 4).toISOString()
      },
      {
        id: 'task_twitter_growth',
        businessId: 'biz_fintech',
        businessName: 'ScaleGrowth Studio',
        businessRating: 4.6,
        verified: true,
        title: 'Follow @FintechPulse & Quote-Tweet Product Launch Announcement',
        category: 'Social Media',
        description: 'Follow our official X/Twitter channel, like and quote tweet our pin announcement with an authentic positive comment, and upload proof.',
        instructions: [
          'Visit twitter.com/FintechPulse and tap Follow.',
          'Like the pinned tweet and create a Quote Tweet mentioning 1 feature.',
          'Take a screenshot showing your Quote Tweet on your profile.',
          'Submit your Twitter handle and the screenshot.'
        ],
        reward: 350,
        platformFee: 52.5,
        totalSlots: 300,
        reservedSlots: 210,
        completedSlots: 195,
        leaseMinutes: 30,
        estimatedMinutes: 5,
        autoApproveHours: 48,
        status: 'active',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 2).toISOString()
      }
    ];

    // Seed existing submissions
    const submissions = [
      {
        id: 'sub_sample_1',
        taskId: 'task_kuda_onboarding',
        taskTitle: 'Beta Test & Bug Discovery: Android Mobile Onboarding Flow',
        workerId: 'worker_me',
        workerName: 'Adeola Johnson',
        workerAvatar: 'AJ',
        workerTrustScore: 98,
        reward: 1250,
        proofData: {
          note: 'Completed test on Samsung Galaxy S22 running Android 14. Smooth flow until KYC step where spinner froze for 3s before succeeding.',
          proofUrl: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=600&auto=format&fit=crop&q=80',
          proofHash: 'a4f9e18b7c20d3f4'
        },
        status: 'pending',
        submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        autoApproveAt: new Date(Date.now() + 3600000 * 70).toISOString()
      },
      {
        id: 'sub_sample_2',
        taskId: 'task_ecommerce_survey',
        taskTitle: 'Gen-Z Online Shopping & Delivery Friction Survey (Nigeria)',
        workerId: 'worker_me',
        workerName: 'Adeola Johnson',
        workerAvatar: 'AJ',
        workerTrustScore: 98,
        reward: 650,
        proofData: {
          note: 'Survey completion token: VER-882910. Answered based on Jumia & Chowdeck orders.',
          proofUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
          proofHash: 'b7c20d3f4a4f9e18'
        },
        status: 'pending',
        submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        autoApproveAt: new Date(Date.now() + 3600000 * 44).toISOString()
      }
    ];

    // Initial escrow locks for active campaigns
    for (const t of tasks) {
      const escrowTotal = (t.reward + t.platformFee) * (t.totalSlots - t.completedSlots);
      try {
        defaultLedger.ensureAccount(`USER_CASH:${t.businessId}`, `Business Cash`, 'LIABILITY');
        defaultLedger.recordDeposit(t.businessId, escrowTotal + 50000, 'AUTO_SEED_ESCROW');
        defaultLedger.lockEscrow(t.businessId, t.id, escrowTotal, t.title);
      } catch (err) {
        console.warn('Seed escrow lock error:', err);
      }
    }

    return {
      activeRole: 'worker', // 'worker' | 'business' | 'admin'
      currentUser: {
        id: 'worker_me',
        name: 'Adeola Johnson',
        email: 'adeola.johnson@example.com',
        phone: '+234 814 555 0192',
        kycTier: 'Tier 1 (Verified Contributor)',
        trustScore: 98,
        completedCount: 24,
        approvalRate: '96.2%'
      },
      businessUser: {
        id: 'biz_fintech',
        name: 'PayStream Technologies Ltd',
        rcNumber: 'RC-1849204',
        email: 'admin@paystream.io',
        verified: true,
        campaignsCount: 4
      },
      tasks,
      activeReservation: null, // { taskId, startedAt, expiresAt }
      submissions,
      disputes: [],
      ledgerState: {
        accounts: defaultLedger.accounts,
        journalEntries: defaultLedger.journalEntries,
        transactions: defaultLedger.transactions
      },
      notifications: [
        { id: 'notif_1', title: 'Task Approved! ₦1,250 Added', desc: 'Your PayStream Beta Test submission was verified and approved.', time: '2h ago', read: false },
        { id: 'notif_2', title: 'New High-Paying Task Available', desc: 'VoiceGen Speech AI posted an AI Voice Recording task (₦2,200).', time: '5h ago', read: true }
      ]
    };
  }

  loadState() {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (serialized) {
        this.state = JSON.parse(serialized);
        this.ledger = new LedgerEngine(this.state.ledgerState);
      } else {
        this.state = this.getDefaultSeedData();
        this.ledger = new LedgerEngine(this.state.ledgerState);
        this.saveState();
      }
    } catch (e) {
      console.error('Error loading state from localStorage, resetting to seed', e);
      this.state = this.getDefaultSeedData();
      this.ledger = new LedgerEngine(this.state.ledgerState);
      this.saveState();
    }
  }

  saveState() {
    this.state.ledgerState = {
      accounts: this.ledger.accounts,
      journalEntries: this.ledger.journalEntries,
      transactions: this.ledger.transactions
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    for (const l of this.listeners) {
      l(this.state);
    }
  }

  setRole(role) {
    this.state.activeRole = role;
    this.saveState();
  }

  // --- Supabase Authentication State Sync ---
  syncSupabaseUser(supabaseUser, explicitRole) {
    if (!supabaseUser) return;
    const meta = supabaseUser.user_metadata || {};
    const role = explicitRole || meta.role || this.state.activeRole || 'worker';
    const fullName = meta.full_name || supabaseUser.email?.split('@')[0] || 'User';

    this.state.authenticatedUser = {
      id: supabaseUser.id,
      email: supabaseUser.email,
      fullName,
      phone: meta.phone || '',
      role,
      lastSignIn: supabaseUser.last_sign_in_at,
      createdAt: supabaseUser.created_at
    };

    // Ensure double-entry ledger account exists for this authenticated user
    if (this.ledger && !this.ledger.accounts[`USER_CASH:${supabaseUser.id}`]) {
      try {
        this.ledger.ensureAccount(`USER_CASH:${supabaseUser.id}`, `${fullName} Wallet`, 'LIABILITY');
        // Welcome bonus for newly registered contributor or starter liquidity for business
        const bonusAmount = role === 'business' ? 25000 : 500;
        this.ledger.recordDeposit(supabaseUser.id, bonusAmount, 'WELCOME_REGISTRATION_BONUS');
      } catch (e) {
        console.warn('Ledger account initialization notice:', e);
      }
    }

    if (role === 'business') {
      this.state.businessUser = {
        ...this.state.businessUser,
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: fullName,
        phone: meta.phone || ''
      };
      this.state.activeRole = 'business';
    } else {
      this.state.currentUser = {
        ...this.state.currentUser,
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: fullName,
        phone: meta.phone || this.state.currentUser.phone
      };
      this.state.activeRole = 'worker';
    }

    this.saveState();
  }

  clearSupabaseUser() {
    this.state.authenticatedUser = null;
    this.saveState();
  }

  // --- Task Reservation Engine ---
  reserveTask(taskId) {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');
    if (this.state.activeReservation) {
      throw new Error('You already have an active reserved task! Complete or abandon it before starting another.');
    }
    if (task.reservedSlots >= task.totalSlots) {
      throw new Error('All available slots for this task are currently reserved or completed.');
    }

    // Atomically increment reserved slots
    task.reservedSlots += 1;

    const leaseMs = (task.leaseMinutes || 45) * 60 * 1000;
    const now = Date.now();

    this.state.activeReservation = {
      taskId: task.id,
      startedAt: now,
      expiresAt: now + leaseMs
    };

    this.saveState();
    return this.state.activeReservation;
  }

  abandonActiveReservation() {
    if (!this.state.activeReservation) return;
    const task = this.state.tasks.find(t => t.id === this.state.activeReservation.taskId);
    if (task && task.reservedSlots > task.completedSlots) {
      task.reservedSlots = Math.max(task.completedSlots, task.reservedSlots - 1);
    }
    this.state.activeReservation = null;
    this.saveState();
  }

  // --- Task Proof Submission Engine ---
  submitTaskProof(taskId, proofData, proofHash) {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const subId = 'sub_' + Math.random().toString(36).substr(2, 9);
    const submission = {
      id: subId,
      taskId: task.id,
      taskTitle: task.title,
      workerId: this.state.currentUser.id,
      workerName: this.state.currentUser.name,
      workerAvatar: 'AJ',
      workerTrustScore: this.state.currentUser.trustScore,
      reward: task.reward,
      proofData,
      proofHash,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      autoApproveAt: new Date(Date.now() + (task.autoApproveHours || 72) * 3600000).toISOString()
    };

    this.state.submissions.unshift(submission);

    // Clear active reservation
    this.state.activeReservation = null;

    // Add notification
    this.state.notifications.unshift({
      id: 'notif_' + Date.now(),
      title: 'Submission Under Review',
      desc: `Your proof for "${task.title}" was submitted. The poster has 72h to review or it will auto-approve.`,
      time: 'Just now',
      read: false
    });

    this.saveState();
    return submission;
  }

  // --- Business Approval & Rejection Engine ---
  approveSubmission(submissionId) {
    const sub = this.state.submissions.find(s => s.id === submissionId);
    if (!sub) throw new Error('Submission not found');
    if (sub.status !== 'pending') throw new Error('Submission is not pending review');

    const task = this.state.tasks.find(t => t.id === sub.taskId);
    if (!task) throw new Error('Associated task not found');

    // Execute double-entry ledger release:
    // Debits Escrow, Credits Worker Cash, Credits Platform Revenue
    this.ledger.releasePayout(task.id, sub.workerId, task.reward, task.platformFee);

    sub.status = 'approved';
    sub.reviewedAt = new Date().toISOString();
    task.completedSlots += 1;

    // Notification
    this.state.notifications.unshift({
      id: 'notif_' + Date.now(),
      title: `₦${task.reward.toLocaleString()} Credited!`,
      desc: `Your submission for "${task.title}" was approved! Funds are available in your wallet.`,
      time: 'Just now',
      read: false
    });

    this.saveState();
  }

  rejectSubmission(submissionId, reason) {
    const sub = this.state.submissions.find(s => s.id === submissionId);
    if (!sub) throw new Error('Submission not found');
    if (sub.status !== 'pending') throw new Error('Submission is not pending review');

    const task = this.state.tasks.find(t => t.id === sub.taskId);
    sub.status = 'rejected';
    sub.rejectionReason = reason;
    sub.reviewedAt = new Date().toISOString();

    // Reopen slot if task is still active
    if (task && task.reservedSlots > task.completedSlots) {
      task.reservedSlots = Math.max(task.completedSlots, task.reservedSlots - 1);
    }

    this.state.notifications.unshift({
      id: 'notif_' + Date.now(),
      title: 'Submission Rejected',
      desc: `Your submission for "${task?.title || 'task'}" was rejected: "${reason}". You can file an appeal.`,
      time: 'Just now',
      read: false
    });

    this.saveState();
  }

  // --- Worker Dispute / Appeal ---
  disputeSubmission(submissionId, appealReason) {
    const sub = this.state.submissions.find(s => s.id === submissionId);
    if (!sub) throw new Error('Submission not found');

    sub.status = 'disputed';
    const dispute = {
      id: 'disp_' + Date.now(),
      submissionId,
      taskId: sub.taskId,
      taskTitle: sub.taskTitle,
      workerId: sub.workerId,
      workerName: sub.workerName,
      appealReason,
      posterRejectionReason: sub.rejectionReason,
      status: 'under_arbitration',
      createdAt: new Date().toISOString()
    };
    this.state.disputes.unshift(dispute);

    this.saveState();
    return dispute;
  }

  // --- Campaign Creation & Escrow Lock ---
  createCampaign(campaignData) {
    const totalCost = (campaignData.workerReward + campaignData.platformFee) * campaignData.totalSlots;
    const bizId = this.state.businessUser.id;

    // Check balance
    const currentBalance = this.ledger.getBalance(`USER_CASH:${bizId}`);
    if (currentBalance < totalCost) {
      // Auto-simulate quick deposit if needed for demo experience
      const diff = totalCost - currentBalance + 10000;
      this.ledger.recordDeposit(bizId, diff, 'AUTO_DEMO_TOPUP');
    }

    const taskId = 'task_' + Math.random().toString(36).substr(2, 9);
    const newTask = {
      id: taskId,
      businessId: bizId,
      businessName: this.state.businessUser.name,
      businessRating: 5.0,
      verified: true,
      title: campaignData.title,
      category: campaignData.category,
      description: campaignData.description,
      instructions: campaignData.instructions,
      reward: campaignData.workerReward,
      platformFee: campaignData.platformFee,
      totalSlots: campaignData.totalSlots,
      reservedSlots: 0,
      completedSlots: 0,
      leaseMinutes: campaignData.leaseMinutes || 45,
      estimatedMinutes: campaignData.estimatedMinutes || 10,
      autoApproveHours: 72,
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString()
    };

    // Lock Escrow via double-entry ledger
    this.ledger.lockEscrow(bizId, taskId, totalCost, campaignData.title);

    this.state.tasks.unshift(newTask);
    this.saveState();
    return newTask;
  }

  resetAllData() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = this.getDefaultSeedData();
    this.ledger = new LedgerEngine(this.state.ledgerState);
    this.saveState();
  }
}

export const store = new AppStore();
