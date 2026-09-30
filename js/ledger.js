/**
 * ============================================================================
 * DOUBLE-ENTRY LEDGER ENGINE
 * Guarantees strict mathematical traceability for all monetary events:
 * Deposits, Escrow Holds, Task Payouts, Commissions, and Bank Withdrawals.
 * ============================================================================
 */

export class LedgerEngine {
  constructor(initialState = null) {
    if (initialState) {
      this.accounts = initialState.accounts || {};
      this.journalEntries = initialState.journalEntries || [];
      this.transactions = initialState.transactions || [];
    } else {
      this.accounts = {
        'SYSTEM:GATEWAY_CUSTODY': { id: 'SYSTEM:GATEWAY_CUSTODY', name: 'Paystack/Bank Custody', type: 'ASSET' },
        'SYSTEM:PLATFORM_REVENUE': { id: 'SYSTEM:PLATFORM_REVENUE', name: 'Platform Commission Yield', type: 'REVENUE' },
        'SYSTEM:CAMPAIGN_ESCROW_POOL': { id: 'SYSTEM:CAMPAIGN_ESCROW_POOL', name: 'Master Campaign Escrow Pool', type: 'LIABILITY' },
      };
      this.journalEntries = [];
      this.transactions = [];
    }
  }

  ensureAccount(accountId, name, type) {
    if (!this.accounts[accountId]) {
      this.accounts[accountId] = { id: accountId, name, type };
    }
    return this.accounts[accountId];
  }

  getBalance(accountId) {
    const account = this.accounts[accountId];
    if (!account) return 0;

    let balance = 0;
    for (const entry of this.journalEntries) {
      if (entry.accountId === accountId) {
        if (account.type === 'ASSET' || account.type === 'EXPENSE') {
          balance += (entry.type === 'DEBIT' ? entry.amount : -entry.amount);
        } else {
          // LIABILITY, EQUITY, REVENUE
          balance += (entry.type === 'CREDIT' ? entry.amount : -entry.amount);
        }
      }
    }
    return Math.max(0, balance);
  }

  recordTransaction(eventType, description, entries) {
    // 1. Strict Invariant Check: Sum(Debits) === Sum(Credits)
    let totalDebit = 0;
    let totalCredit = 0;

    for (const e of entries) {
      if (e.type === 'DEBIT') totalDebit += e.amount;
      else if (e.type === 'CREDIT') totalCredit += e.amount;
      else throw new Error(`Invalid entry type: ${e.type}`);
    }

    if (Math.round(totalDebit * 100) !== Math.round(totalCredit * 100)) {
      throw new Error(`Ledger Invariant Violation: Total Debits (${totalDebit}) != Total Credits (${totalCredit})`);
    }

    const txId = 'tx_' + Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toISOString();

    const tx = {
      id: txId,
      eventType,
      description,
      amount: totalDebit,
      timestamp,
      entriesCount: entries.length
    };
    this.transactions.unshift(tx);

    for (const e of entries) {
      this.journalEntries.push({
        id: 'entry_' + Math.random().toString(36).substr(2, 9),
        transactionId: txId,
        accountId: e.accountId,
        type: e.type,
        amount: e.amount,
        timestamp
      });
    }

    return tx;
  }

  /**
   * Deposit NGN into User Cash Wallet
   */
  recordDeposit(userId, amount, reference = 'dep_' + Date.now()) {
    const userAcc = `USER_CASH:${userId}`;
    this.ensureAccount(userAcc, `User ${userId} Available Cash`, 'LIABILITY');
    this.ensureAccount('SYSTEM:GATEWAY_CUSTODY', 'Paystack Custody', 'ASSET');

    return this.recordTransaction('DEPOSIT', `Wallet Deposit via Paystack (${reference})`, [
      { accountId: 'SYSTEM:GATEWAY_CUSTODY', type: 'DEBIT', amount },
      { accountId: userAcc, type: 'CREDIT', amount }
    ]);
  }

  /**
   * Lock funds in escrow when a campaign is launched
   */
  lockEscrow(businessId, taskId, totalAmount, taskTitle) {
    const bizAcc = `USER_CASH:${businessId}`;
    const escrowAcc = `ESCROW:${taskId}`;
    this.ensureAccount(bizAcc, `Business ${businessId} Cash`, 'LIABILITY');
    this.ensureAccount(escrowAcc, `Escrow for Task ${taskTitle}`, 'LIABILITY');

    if (this.getBalance(bizAcc) < totalAmount) {
      throw new Error('Insufficient wallet balance to fund this task campaign.');
    }

    return this.recordTransaction('ESCROW_LOCK', `Escrow Hold for Campaign: ${taskTitle}`, [
      { accountId: bizAcc, type: 'DEBIT', amount: totalAmount },
      { accountId: escrowAcc, type: 'CREDIT', amount: totalAmount }
    ]);
  }

  /**
   * Release payout upon submission approval:
   * Releases worker reward + transfers platform fee to revenue
   */
  releasePayout(taskId, workerId, reward, platformFee) {
    const escrowAcc = `ESCROW:${taskId}`;
    const workerAcc = `USER_CASH:${workerId}`;
    const revenueAcc = 'SYSTEM:PLATFORM_REVENUE';
    const totalDeduction = reward + platformFee;

    this.ensureAccount(escrowAcc, `Escrow for Task ${taskId}`, 'LIABILITY');
    this.ensureAccount(workerAcc, `Worker ${workerId} Available Cash`, 'LIABILITY');
    this.ensureAccount(revenueAcc, 'Platform Commission Yield', 'REVENUE');

    return this.recordTransaction('PAYOUT_RELEASE', `Approved Task Payout & Commission (${taskId})`, [
      { accountId: escrowAcc, type: 'DEBIT', amount: totalDeduction },
      { accountId: workerAcc, type: 'CREDIT', amount: reward },
      { accountId: revenueAcc, type: 'CREDIT', amount: platformFee }
    ]);
  }

  /**
   * Request bank withdrawal
   */
  requestWithdrawal(workerId, amount, bankDetails) {
    const workerAcc = `USER_CASH:${workerId}`;
    const pendingAcc = `WITHDRAWAL_PENDING:${workerId}`;
    this.ensureAccount(workerAcc, `Worker ${workerId} Cash`, 'LIABILITY');
    this.ensureAccount(pendingAcc, `Pending Payout to ${bankDetails.bankName}`, 'LIABILITY');

    if (this.getBalance(workerAcc) < amount) {
      throw new Error('Insufficient available balance to withdraw.');
    }

    return this.recordTransaction('WITHDRAWAL_REQUEST', `Payout Request to ${bankDetails.bankName} - ${bankDetails.accountNumber}`, [
      { accountId: workerAcc, type: 'DEBIT', amount },
      { accountId: pendingAcc, type: 'CREDIT', amount }
    ]);
  }

  /**
   * Finalize bank withdrawal
   */
  confirmWithdrawal(workerId, amount) {
    const pendingAcc = `WITHDRAWAL_PENDING:${workerId}`;
    const custodyAcc = 'SYSTEM:GATEWAY_CUSTODY';

    return this.recordTransaction('WITHDRAWAL_SETTLED', `Bank Transfer Completed via Paystack Rail`, [
      { accountId: pendingAcc, type: 'DEBIT', amount },
      { accountId: custodyAcc, type: 'CREDIT', amount }
    ]);
  }

  /**
   * Solvency audit
   */
  auditSolvency() {
    let totalDebits = 0;
    let totalCredits = 0;

    for (const e of this.journalEntries) {
      if (e.type === 'DEBIT') totalDebits += e.amount;
      else totalCredits += e.amount;
    }

    const custody = this.getBalance('SYSTEM:GATEWAY_CUSTODY');
    const revenue = this.getBalance('SYSTEM:PLATFORM_REVENUE');

    let totalUserCash = 0;
    let totalEscrow = 0;
    let totalPendingWithdrawals = 0;

    for (const accId in this.accounts) {
      const b = this.getBalance(accId);
      if (accId.startsWith('USER_CASH:')) totalUserCash += b;
      else if (accId.startsWith('ESCROW:')) totalEscrow += b;
      else if (accId.startsWith('WITHDRAWAL_PENDING:')) totalPendingWithdrawals += b;
    }

    const isBalanced = Math.round(totalDebits * 100) === Math.round(totalCredits * 100);
    const totalLiabilities = totalUserCash + totalEscrow + totalPendingWithdrawals;
    const isSolvent = custody >= (totalLiabilities - 1); // Allow minor rounding tolerance

    return {
      isSolvent,
      isBalanced,
      custody,
      totalLiabilities,
      revenue,
      breakdown: {
        userCash: totalUserCash,
        activeEscrow: totalEscrow,
        pendingWithdrawals: totalPendingWithdrawals
      },
      totalDebits,
      totalCredits,
      transactionsCount: this.transactions.length
    };
  }
}
