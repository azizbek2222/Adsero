import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, push, set, onValue, update, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

let currentBalance = 0;

const modal = document.getElementById("ad-modal");
const openBtn = document.getElementById("open-modal");
const closeBtn = document.querySelector(".close");
const adForm = document.getElementById("add-ad-form");
const exchangeBtn = document.getElementById('exchange-btn');

if (openBtn) openBtn.onclick = () => modal.style.display = "block";
if (closeBtn) closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };

onAuthStateChanged(auth, (user) => {
    if (user) {
        const userRef = ref(db, 'advertisers/' + user.uid);
        update(userRef, { email: user.email.toLowerCase(), uid: user.uid });
        loadBalance(user.uid);
        loadUserAds(user.uid);
    } else {
        window.location.href = 'index.html';
    }
});

function loadBalance(uid) {
    onValue(ref(db, `advertisers/${uid}/balance`), (snapshot) => {
        currentBalance = snapshot.val() || 0;
        document.getElementById('user-balance').innerText = `$${currentBalance.toFixed(2)}`;
    });
}

function loadUserAds(uid) {
    onValue(ref(db, 'ads'), (snapshot) => {
        const grid = document.getElementById('ads-grid');
        grid.innerHTML = '';
        const data = snapshot.val();
        let count = 0;
        if (data) {
            for (let id in data) {
                if (data[id].ownerId === uid) {
                    count++;
                    grid.innerHTML += `
                        <div class="ad-card">
                            <img src="${data[id].image}" alt="ad">
                            <div class="ad-card-body">
                                <h4>${data[id].title}</h4>
                                <p>Budget: <strong>$${data[id].budget.toFixed(2)}</strong></p>
                                <span class="ad-status" style="background:${data[id].status === 'active' ? '#e8f5e9' : '#ffebee'}; color:${data[id].status === 'active' ? '#2e7d32' : '#c62828'}">
                                    ${data[id].status}
                                </span>
                            </div>
                        </div>`;
                }
            }
        }
        if (count === 0) grid.innerHTML = '<p>No ads found. Create your first campaign!</p>';
    });
}

adForm.onsubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    const adBudget = parseFloat(document.getElementById('ad-budget').value);

    if (adBudget > currentBalance) {
        alert("Error: Insufficient balance!");
        return;
    }

    const newAd = {
        ownerId: user.uid,
        title: document.getElementById('ad-title').value,
        image: document.getElementById('ad-image').value,
        url: document.getElementById('ad-url').value,
        budget: adBudget,
        status: "active",
        createdAt: Date.now()
    };

    try {
        await set(push(ref(db, 'ads')), newAd);
        await update(ref(db, `advertisers/${user.uid}`), { balance: increment(-adBudget) });
        modal.style.display = "none";
        adForm.reset();
    } catch (err) { alert(err.message); }
};

if (exchangeBtn) exchangeBtn.onclick = () => window.location.href = 'exchange.html';
document.getElementById('logout-btn').onclick = () => signOut(auth);
