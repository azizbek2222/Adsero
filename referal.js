import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Firebase konfiguratsiyasi
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

onAuthStateChanged(auth, (user) => {
    if (user) {
        // Referal linkini yaratish
        const refLink = `https://adsero.vercel.app/index.html?ref=${user.uid}`;
        document.getElementById('ref-link').innerText = refLink;
        
        // Statistikani yuklash
        loadReferralData(user.uid);
    } else {
        window.location.href = 'index.html';
    }
});

function loadReferralData(uid) {
    // 1. Foydalanuvchining referal statistikasi (Balans va jami daromad)
    const statsRef = ref(db, `users/${uid}/referralStats`);
    onValue(statsRef, (snapshot) => {
        const stats = snapshot.val() || { count: 0, advEarned: 0, pubEarned: 0 };
        
        document.getElementById('ref-count').innerText = stats.count || 0;
        document.getElementById('ref-adv-earned').innerText = `$${(stats.advEarned || 0).toFixed(4)}`;
        document.getElementById('ref-pub-earned').innerText = `$${(stats.pubEarned || 0).toFixed(4)}`;
        
        const total = (stats.advEarned || 0) + (stats.pubEarned || 0);
        document.getElementById('ref-total-earned').innerText = `$${total.toFixed(4)}`;
    });
}

// Nusxa olish funksiyasi (Global qilish uchun window'ga biriktiramiz)
window.copyRef = () => {
    const link = document.getElementById('ref-link').innerText;
    navigator.clipboard.writeText(link).then(() => {
        const btn = document.querySelector('.copy-btn');
        btn.innerText = "Copied!";
        btn.style.background = "#28a745";
        setTimeout(() => {
            btn.innerText = "Copy";
            btn.style.background = "";
        }, 2000);
    });
};
