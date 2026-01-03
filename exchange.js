import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, onValue, update, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

let pubBalance = 0;
let advBalance = 0;

onAuthStateChanged(auth, (user) => {
    if (user) {
        loadBalances(user.uid);
    } else {
        window.location.href = 'index.html';
    }
});

function loadBalances(uid) {
    // Publisher balansini olish
    onValue(ref(db, `publishers/${uid}/balance`), (snap) => {
        pubBalance = snap.val() || 0;
        document.getElementById('pub-bal-view').innerText = `$${pubBalance.toFixed(4)}`;
    });
    // Advertiser balansini olish
    onValue(ref(db, `advertisers/${uid}/balance`), (snap) => {
        advBalance = snap.val() || 0;
        document.getElementById('adv-bal-view').innerText = `$${advBalance.toFixed(2)}`;
    });
}

document.getElementById('exchange-form').onsubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    const amount = parseFloat(document.getElementById('exchange-amount').value);
    const direction = document.getElementById('exchange-direction').value;

    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    if (direction === 'pub-to-adv') {
        if (amount > pubBalance) {
            alert("Insufficient Income balance!");
            return;
        }
        // Transfer: Pub -> Adv
        try {
            await update(ref(db, `publishers/${user.uid}`), { balance: increment(-amount) });
            await update(ref(db, `advertisers/${user.uid}`), { balance: increment(amount) });
            alert("Success! Funds transferred to Advertiser account.");
        } catch (err) { alert(err.message); }
        
    } else {
        if (amount > advBalance) {
            alert("Insufficient Ads balance!");
            return;
        }
        // Transfer: Adv -> Pub
        try {
            await update(ref(db, `advertisers/${user.uid}`), { balance: increment(-amount) });
            await update(ref(db, `publishers/${user.uid}`), { balance: increment(amount) });
            alert("Success! Funds transferred to Publisher account.");
        } catch (err) { alert(err.message); }
    }
    
    document.getElementById('exchange-amount').value = '';
};

document.getElementById('logout-btn').onclick = () => signOut(auth);
