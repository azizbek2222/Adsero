import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, push, set, onValue, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDdDnuUlqaHyMYc0vKOmjLFxFSTmWh3gIw",
  authDomain: "sample-firebase-ai-app-955f2.firebaseapp.com",
  databaseURL: "https://sample-firebase-ai-app-955f2-default-rtdb.firebaseio.com",
  projectId: "sample-firebase-ai-app-955f2",
  storageBucket: "sample-firebase-ai-app-955f2.firebasestorage.app",
  messagingSenderId: "310796131581",
  appId: "1:310796131581:web:8cb51b40c06bb83e94f294"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const modal = document.getElementById("app-modal");
const openBtn = document.getElementById("open-app-modal");
const closeBtn = document.getElementById("close-modal");
const appForm = document.getElementById("add-app-form");
const exchangeBtn = document.getElementById('exchange-btn');

if (openBtn) openBtn.onclick = () => modal.style.display = "block";
if (closeBtn) closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };

onAuthStateChanged(auth, (user) => {
    if (user) {
        loadBalance(user.uid);
        loadUserApps(user.uid);
    } else {
        window.location.href = 'index.html';
    }
});

function loadBalance(uid) {
    onValue(ref(db, `publishers/${uid}/balance`), (snapshot) => {
        const balance = snapshot.val() || 0;
        document.getElementById('pub-balance').innerText = `$${balance.toFixed(4)}`;
    });
}

function loadUserApps(uid) {
    onValue(ref(db, 'publisher_apps'), (snapshot) => {
        const list = document.getElementById('apps-list');
        list.innerHTML = '';
        const data = snapshot.val();
        let count = 0;

        if (data) {
            for (let id in data) {
                if (data[id].ownerId === uid) {
                    count++;
                    const earnings = data[id].earnings || 0;
                    const code = `<script type="module" src="https://adsero.vercel.app/sdk.js" data-app-id="${id}"></script>`;
                    
                    list.innerHTML += `
                        <div class="app-card">
                            <div class="app-card-header">
                                <h4>${data[id].name}</h4>
                                <span class="id-badge">ID: ${id}</span>
                            </div>
                            <div class="app-stats">
                                <div class="stat-item">
                                    <small>Project Profit</small>
                                    <span class="earnings-text">$${earnings.toFixed(4)}</span>
                                </div>
                            </div>
                            <p class="sdk-label">Copy and paste this SDK into your HTML:</p>
                            <div class="sdk-box"><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></div>
                        </div>`;
                }
            }
        }
        if (count === 0) list.innerHTML = '<p>No projects found. Add your first app!</p>';
    });
}

appForm.onsubmit = (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    const name = document.getElementById('app-name').value;
    const newRef = push(ref(db, 'publisher_apps'));
    set(newRef, { 
        ownerId: user.uid, 
        name: name, 
        earnings: 0, // Dastlabki daromad 0
        createdAt: Date.now() 
    }).then(() => { 
        modal.style.display = "none"; 
        appForm.reset(); 
    });
};

if (exchangeBtn) exchangeBtn.onclick = () => window.location.href = 'exchange.html';
document.getElementById('logout-btn').onclick = () => signOut(auth);