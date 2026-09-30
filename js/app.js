/**
 * ============================================================================
 * MAIN APPLICATION BOOTSTRAP & ROUTER
 * Orchestrates views, role switching, reactive updates & navigation
 * ============================================================================
 */

import { store } from './store.js';
import { Toast } from './components/toast.js';
import { NotificationDrawer } from './components/notificationDrawer.js';
import { AuthModal } from './components/authModal.js';
import { OnboardingModal } from './components/onboardingModal.js';
import { renderLandingView } from './views/landing.js';
import { renderWorkerFeed } from './views/workerFeed.js';
import { renderWorkerSubmissions } from './views/workerSubmissions.js';
import { renderWorkerWallet } from './views/workerWallet.js';
import { renderBusinessDashboard } from './views/businessDashboard.js';
import { renderBusinessWizard } from './views/businessWizard.js';
import { renderBusinessReview } from './views/businessReview.js';
import { renderAdminDashboard } from './views/adminDashboard.js';
import { renderProfile } from './views/profile.js';
import { getCurrentSession, signOutUser, onAuthStateChange } from './supabaseClient.js';

class AppRouter {
  constructor() {
    this.currentRoute = 'worker'; // default view
    this.mainContainer = document.getElementById('view-container');
    this.init();
  }

  async init() {
    // Initialize Notification Drawer
    NotificationDrawer.init();

    // 1. Intercept Supabase Auth Callback URLs (Hash fragments & PKCE query params)
    this.handleAuthCallbacks();

    // 2. Check existing Supabase session for immediate persistence on page load
    try {
      const session = await getCurrentSession();
      if (session?.user) {
        store.syncSupabaseUser(session.user);
      } else {
        // No active session in Supabase storage
        store.clearSupabaseUser();
      }
    } catch (e) {
      console.warn('Supabase initial session check:', e);
    }

    // 3. Subscribe to Supabase Auth state changes
    onAuthStateChange((event, session) => {
      if (session?.user) {
        store.syncSupabaseUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        store.clearSupabaseUser();
        // If current route is protected, redirect to worker feed
        if (this.isRouteProtected(this.currentRoute)) {
          this.navigate('worker');
        }
      }
      this.updateNavbar();
      this.renderCurrentView();
    });

    // Initial render of navbar
    this.updateNavbar();

    // Listen to hash changes with safety checks against auth tokens
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash;
      if (hash.includes('access_token=') || hash.includes('error=')) {
        this.handleAuthCallbacks();
        return;
      }
      const route = this.extractRouteFromHash(hash);
      this.navigate(route, false);
    });

    // Reactive store subscription
    store.subscribe(() => {
      this.updateNavbar();
    });

    // Initial navigation
    const initialRoute = this.extractRouteFromHash(window.location.hash);
    this.navigate(initialRoute, false);

    // URL parameter triggers for direct modal inspection & snapshots
    const urlParams = new URLSearchParams(window.location.search);
    const modalParam = urlParams.get('modal');
    if (modalParam === 'auth') {
      setTimeout(() => AuthModal.open('login', 'worker'), 100);
    } else if (modalParam === 'register') {
      setTimeout(() => AuthModal.open('register', 'worker'), 100);
    } else if (modalParam === 'tour') {
      setTimeout(() => OnboardingModal.open(), 100);
    } else if (modalParam === 'task') {
      import('./views/workerTaskDetail.js').then(m => {
        setTimeout(() => m.openTaskDetailModal('task_kuda_onboarding'), 100);
      });
    } else if (modalParam === 'workspace') {
      store.claimTask('task_kuda_onboarding');
      import('./views/workerTaskDetail.js').then(m => {
        setTimeout(() => m.openTaskDetailModal('task_kuda_onboarding'), 100);
      });
    }

    // Bind brand click
    document.querySelector('.brand-wrapper')?.addEventListener('click', () => {
      this.navigate('landing');
    });

    // Bind profile click
    document.querySelector('#nav-user-chip')?.addEventListener('click', () => {
      this.navigate('profile');
    });

    // Bind onboarding tour
    document.querySelector('#nav-tour-btn')?.addEventListener('click', () => {
      OnboardingModal.open();
    });

    // Bind auth modal & sign out
    document.querySelector('#nav-auth-btn')?.addEventListener('click', async () => {
      if (store.state.authenticatedUser) {
        try {
          await signOutUser();
          store.clearSupabaseUser();
          Toast.info('Signed Out', 'You have been signed out of ApexTask.');
          if (this.isRouteProtected(this.currentRoute)) {
            this.navigate('worker');
          } else {
            this.updateNavbar();
            this.renderCurrentView();
          }
        } catch (err) {
          Toast.error('Sign Out Error', err.message);
        }
      } else {
        AuthModal.open('login', store.state.activeRole === 'business' ? 'business' : 'worker');
      }
    });

    // Bind notification bell
    document.querySelector('#nav-notif-btn')?.addEventListener('click', () => {
      NotificationDrawer.toggle();
    });

    // Bind mobile bottom nav buttons
    document.querySelectorAll('.mobile-nav-item[data-nav]').forEach(item => {
      item.addEventListener('click', (e) => {
        const navTarget = e.currentTarget.getAttribute('data-nav');
        if (navTarget === 'worker') {
          store.setRole('worker');
          this.navigate('worker');
        } else if (navTarget === 'business') {
          store.setRole('business');
          this.navigate('business');
        } else {
          this.navigate(navTarget);
        }
      });
    });

    // Bind role switcher buttons
    document.querySelectorAll('.role-tab[data-role]').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const role = e.currentTarget.getAttribute('data-role');
        if (role === 'landing') {
          this.navigate('landing');
        } else if (role === 'worker') {
          store.setRole('worker');
          this.navigate('worker');
        } else if (role === 'business') {
          store.setRole('business');
          this.navigate('business');
        } else if (role === 'admin') {
          store.setRole('admin');
          this.navigate('admin');
        }
      });
    });
  }

  extractRouteFromHash(hash) {
    if (!hash || hash === '#' || hash === '#/') return 'worker';
    // Clean hash
    let clean = hash.replace(/^#\/?/, '').split('?')[0];
    if (clean.includes('access_token=') || clean.includes('error=')) {
      return 'worker';
    }
    return clean || 'worker';
  }

  handleAuthCallbacks() {
    const hash = window.location.hash;
    const search = window.location.search;

    // Check for auth error in hash fragment
    if (hash.includes('error=')) {
      const params = new URLSearchParams(hash.substring(1));
      const errorDesc = params.get('error_description') || 'Authentication link error';
      Toast.error('Auth Link Failed', decodeURIComponent(errorDesc.replace(/\+/g, ' ')));
      window.history.replaceState(null, '', window.location.pathname + '#/worker');
      return;
    }

    // Check for access_token confirmation in hash fragment
    if (hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.substring(1));
      const type = params.get('type');
      if (type === 'signup' || type === 'email_confirmation') {
        Toast.success('Email Verified!', 'Your account has been confirmed successfully. Welcome to ApexTask!');
      } else if (type === 'recovery') {
        Toast.info('Password Reset', 'You are signed in via reset link. Please update your password in Profile.');
      } else {
        Toast.success('Signed In', 'Authenticated successfully.');
      }
      // Clean hash after brief timeout to allow Supabase client to parse session
      setTimeout(() => {
        window.history.replaceState(null, '', window.location.pathname + '#/worker');
        this.navigate('worker', false);
      }, 300);
      return;
    }

    // Check for PKCE query code
    if (search.includes('code=')) {
      const params = new URLSearchParams(search);
      const code = params.get('code');
      if (code) {
        Toast.info('Authenticating', 'Verifying session token...');
        // Clean URL search query
        window.history.replaceState(null, '', window.location.pathname + window.location.hash);
      }
    }
  }

  isRouteProtected(route) {
    const PROTECTED_ROUTES = [
      'profile',
      'worker-submissions',
      'worker-wallet',
      'business',
      'business-wizard',
      'business-review',
      'admin'
    ];
    return PROTECTED_ROUTES.includes(route);
  }

  navigate(route, updateHash = true) {
    // Route Protection Check
    if (this.isRouteProtected(route) && !store.state.authenticatedUser) {
      const routeLabels = {
        'profile': 'Contributor Profile',
        'worker-submissions': 'Submitted Proofs',
        'worker-wallet': 'Earnings Wallet & Withdrawals',
        'business': 'Business Portal',
        'business-wizard': 'Campaign Builder',
        'business-review': 'Proof Submissions Review',
        'admin': 'Admin Terminal & Ledger Audit'
      };

      const requiredRole = (route.startsWith('business') || route === 'admin') ? 'business' : 'worker';
      Toast.info('Sign In Required', `Please sign in to access ${routeLabels[route] || 'this page'}.`);
      
      // Prompt user with Auth Modal and pass requested route for auto-redirect on sign-in
      AuthModal.open('login', requiredRole, route, () => {
        this.navigate(route);
      });

      // Keep them on current safe route or default to worker marketplace
      if (this.isRouteProtected(this.currentRoute)) {
        this.currentRoute = 'worker';
      }
      this.updateNavbar();
      this.renderCurrentView();
      return;
    }

    this.currentRoute = route;
    if (updateHash) {
      window.location.hash = `#/${route}`;
    }

    this.updateNavbar();
    this.renderCurrentView();
    window.scrollTo(0, 0);
  }

  updateNavbar() {
    // Highlight current role tab
    document.querySelectorAll('.role-tab[data-role]').forEach(tab => {
      const role = tab.getAttribute('data-role');
      let isActive = false;

      if (this.currentRoute === 'landing' && role === 'landing') isActive = true;
      else if (this.currentRoute.startsWith('worker') && role === 'worker') isActive = true;
      else if (this.currentRoute.startsWith('business') && role === 'business') isActive = true;
      else if (this.currentRoute.startsWith('admin') && role === 'admin') isActive = true;

      if (isActive) tab.classList.add('active');
      else tab.classList.remove('active');
    });

    // Update dynamic balance chip
    const balanceChip = document.getElementById('nav-balance-val');
    if (balanceChip) {
      if (this.currentRoute.startsWith('business')) {
        const bizCash = store.ledger.getBalance(`USER_CASH:${store.state.businessUser.id}`);
        balanceChip.textContent = `₦${bizCash.toLocaleString()}`;
      } else {
        const workerCash = store.ledger.getBalance(`USER_CASH:${store.state.currentUser.id}`);
        balanceChip.textContent = `₦${workerCash.toLocaleString()}`;
      }
    }

    // Update auth button label based on Supabase session
    const authBtn = document.getElementById('nav-auth-btn');
    if (authBtn) {
      if (store.state.authenticatedUser) {
        authBtn.innerHTML = `<span>Sign Out</span>`;
        authBtn.title = `Signed in as ${store.state.authenticatedUser.email}. Click to sign out.`;
      } else {
        authBtn.innerHTML = `<span>Sign In</span>`;
        authBtn.title = 'Sign In or Register';
      }
    }

    // Update avatar initials based on active user
    const avatarEl = document.querySelector('#nav-user-chip .user-avatar');
    if (avatarEl) {
      const activeName = store.state.authenticatedUser?.fullName ||
        (this.currentRoute.startsWith('business') ? store.state.businessUser.name : store.state.currentUser.name);
      const initials = activeName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U';
      avatarEl.textContent = initials;
    }

    // Update notification unread indicator
    const notifBadge = document.getElementById('nav-notif-badge');
    if (notifBadge) {
      const unreadCount = (store.state.notifications || []).filter(n => !n.read).length;
      notifBadge.style.display = unreadCount > 0 ? 'block' : 'none';
    }

    // Update mobile bottom nav active item
    document.querySelectorAll('.mobile-nav-item[data-nav]').forEach(item => {
      const navTarget = item.getAttribute('data-nav');
      if (this.currentRoute === navTarget) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  renderCurrentView() {
    this.mainContainer.innerHTML = '';

    const navHelper = (dest) => this.navigate(dest);

    switch (this.currentRoute) {
      case 'landing':
        renderLandingView(this.mainContainer, navHelper);
        break;
      case 'worker':
        renderWorkerFeed(this.mainContainer, navHelper);
        break;
      case 'worker-submissions':
        renderWorkerSubmissions(this.mainContainer, navHelper);
        break;
      case 'worker-wallet':
        renderWorkerWallet(this.mainContainer, navHelper);
        break;
      case 'business':
        renderBusinessDashboard(this.mainContainer, navHelper);
        break;
      case 'business-wizard':
        renderBusinessWizard(this.mainContainer, navHelper);
        break;
      case 'business-review':
        renderBusinessReview(this.mainContainer, navHelper);
        break;
      case 'admin':
        renderAdminDashboard(this.mainContainer, navHelper);
        break;
      case 'profile':
        renderProfile(this.mainContainer, navHelper);
        break;
      default:
        renderWorkerFeed(this.mainContainer, navHelper);
    }
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AppRouter();
});
