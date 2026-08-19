// ==================== FIREBASE CONFIG ====================
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const loginError = document.getElementById('loginError');
const claimsTableBody = document.getElementById('claimsTableBody');
const clientsTableBody = document.getElementById('clientsTableBody');
const licenseSearch = document.getElementById('licenseSearch');

// Stats Elements
const statTotalUsers = document.getElementById('statTotalUsers');
const statPendingClaims = document.getElementById('statPendingClaims');
const statActivePro = document.getElementById('statActivePro');

// Auth State Listener
auth.onAuthStateChanged(user => {
  if (user) {
    loginScreen.hidden = true;
    adminDashboard.hidden = false;
    loadAdminData();
  } else {
    loginScreen.hidden = false;
    adminDashboard.hidden = true;
  }
});

// Admin Login Handler
adminLoginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('adminEmail').value;
  const password = document.getElementById('adminPassword').value;
  loginError.textContent = '';

  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    console.error("Login failed:", err);
    loginError.textContent = "Invalid email or password. Please verify your credentials.";
  }
});

// Admin Logout Handler
adminLogoutBtn.addEventListener('click', () => {
  auth.signOut();
});

// Load Live Admin Data from Firestore
function loadAdminData() {
  // 1. Fetch Payment Claims Real-time
  db.collection('payment_claims').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
    let claimsHtml = '';
    let pendingCount = 0;

    snapshot.forEach(doc => {
      const claim = doc.data();
      const id = doc.id;
      const date = claim.createdAt ? new Date(claim.createdAt.toDate()).toLocaleDateString() : 'N/A';
      
      if (claim.status === 'pending') pendingCount++;

      const badgeClass = claim.status === 'approved' ? 'badge-approved' : claim.status === 'rejected' ? 'badge-rejected' : 'badge-pending';

      claimsHtml += `
        <tr>
          <td>${date}</td>
          <td><code>${claim.clientId || 'N/A'}</code></td>
          <td>${claim.method || 'N/A'}</td>
          <td>Rs. ${claim.amount || 0}</td>
          <td><code>${claim.txId || 'N/A'}</code></td>
          <td>${claim.contact || claim.name || 'N/A'}</td>
          <td><span class="badge ${badgeClass}">${claim.status}</span></td>
          <td>
            <div class="row-actions">
              ${claim.status === 'pending' ? `
                <button class="btn btn-primary" onclick="updateClaimStatus('${id}', '${claim.clientId}', 'approved')">Approve</button>
                <button class="btn btn-ghost" onclick="updateClaimStatus('${id}', '${claim.clientId}', 'rejected')">Reject</button>
              ` : `<span>Processed</span>`}
            </div>
          </td>
        </tr>
      `;
    });

    claimsTableBody.innerHTML = claimsHtml || `<tr><td colspan="8" style="text-align:center; color: var(--ink-soft);">No payment claims submitted yet.</td></tr>`;
    statPendingClaims.textContent = pendingCount;
  });

  // 2. Fetch Client Directory Real-time
  db.collection('clients').onSnapshot(snapshot => {
    let clientsHtml = '';
    let totalUsers = 0;
    let activePro = 0;

    snapshot.forEach(doc => {
      const client = doc.data();
      totalUsers++;
      if (client.status === 'active') activePro++;

      const badgeClass = client.status === 'active' ? 'badge-active' : client.status === 'pending' ? 'badge-pending' : 'badge-trial';
      const lastActive = client.lastActive ? new Date(client.lastActive.toDate()).toLocaleString() : 'N/A';

      clientsHtml += `
        <tr class="client-row" data-clientid="${client.clientId}">
          <td><code>${client.clientId}</code></td>
          <td><span class="badge ${badgeClass}">${client.status || 'trial'}</span></td>
          <td>${client.plan || 'Free Trial'}</td>
          <td>${client.attemptsUsed || 0}</td>
          <td>${lastActive}</td>
          <td>
            <div class="row-actions">
              <button class="btn btn-ghost" onclick="resetAttempts('${client.clientId}')">Reset Quota</button>
            </div>
          </td>
        </tr>
      `;
    });

    clientsTableBody.innerHTML = clientsHtml || `<tr><td colspan="6" style="text-align:center; color: var(--ink-soft);">No client records found.</td></tr>`;
    statTotalUsers.textContent = totalUsers;
    statActivePro.textContent = activePro;
  });
}

// Global Action: Approve or Reject Claims
window.updateClaimStatus = async function(claimId, clientId, status) {
  try {
    await db.collection('payment_claims').doc(claimId).update({ status: status });

    if (status === 'approved') {
      await db.collection('clients').doc(clientId).update({
        status: 'active',
        plan: 'Pro Activated'
      });
      alert("Payment claim approved! Client account upgraded.");
    } else {
      alert("Payment claim marked as rejected.");
    }
  } catch (err) {
    console.error("Error updating claim status:", err);
    alert("Failed to update status. Check console for details.");
  }
};

// Global Action: Reset Client Attempt Quota
window.resetAttempts = async function(clientId) {
  if (!confirm(`Are you sure you want to reset processing attempts for ${clientId}?`)) return;
  try {
    await db.collection('clients').doc(clientId).update({ attemptsUsed: 0 });
    alert("Client quota successfully reset to 0.");
  } catch (err) {
    console.error("Error resetting quota:", err);
  }
};

// Client Search Filter Utility
if (licenseSearch) {
  licenseSearch.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('.client-row');
    rows.forEach(row => {
      const clientId = row.getAttribute('data-clientid').toLowerCase();
      row.style.display = clientId.includes(query) ? '' : 'none';
    });
  });
}
