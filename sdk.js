import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, get, update, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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
const db = getDatabase(app);

class AdseroSDK {
    constructor() {
        // HTML-dagi <script data-app-id="..."> tegidan ID ni olish
        const scriptTag = document.querySelector('script[data-app-id]');
        this.appId = scriptTag ? scriptTag.getAttribute('data-app-id') : null;
        this.rewardAmount = 0.0005; // Har bir ko'rish uchun publisherga beriladigan haq
        this.init();
    }

    async init() {
        if (!this.appId) {
            console.error("Adsero SDK: App ID topilmadi!");
            return;
        }

        // Loyiha (App) ma'lumotlarini bazadan olish
        const appSnap = await get(ref(db, `publisher_apps/${this.appId}`));
        const appData = appSnap.val();

        if (appData) {
            this.publisherId = appData.ownerId;
            this.showAd();
        } else {
            console.error("Adsero SDK: Noto'g'ri App ID!");
        }
    }

    async showAd() {
        // Tasodifiy aktiv reklamani olish
        const adsSnap = await get(ref(db, 'ads'));
        const ads = adsSnap.val();
        if (!ads) return;

        const activeAds = Object.keys(ads).filter(id => ads[id].status === "active" && ads[id].budget > 0);
        if (activeAds.length === 0) return;

        const randomId = activeAds[Math.floor(Math.random() * activeAds.length)];
        const ad = ads[randomId];

        this.renderAd(randomId, ad);
    }

    renderAd(adId, ad) {
        const container = document.getElementById('adsero-ad-container');
        if (!container) return;

        container.innerHTML = `
            <div style="border:1px solid #ddd; padding:15px; border-radius:10px; text-align:center; background:#fff; max-width:300px; font-family:sans-serif;">
                <img src="${ad.img}" style="width:100%; border-radius:5px; margin-bottom:10px;">
                <h4 style="margin:5px 0;">${ad.title}</h4>
                <button id="adsero-visit-btn" style="background:#0088cc; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer; width:100%;">Visit site</button>
                <small style="display:block; margin-top:5px; color:#999;">Ads by Adsero</small>
            </div>
        `;

        // 5 soniyadan keyin ko'rishni (Impression) hisoblash
        setTimeout(() => {
            this.trackImpression(adId);
        }, 5000);

        document.getElementById('adsero-visit-btn').onclick = () => {
            this.trackClick(adId);
            window.open(ad.url, '_blank');
        };
    }

    async trackImpression(adId) {
        if (!this.publisherId || !this.appId) return;

        const updates = {};
        const refBonus = this.rewardAmount * 0.02; // Publisher daromadidan 2% referalga

        // 1. Reklama byudjetini kamaytirish va ko'rishlarni oshirish
        updates[`ads/${adId}/budget`] = increment(-0.01); 
        updates[`ads/${adId}/views`] = increment(1);
        
        // 2. Publisher hisobiga pul tushirish
        updates[`publishers/${this.publisherId}/balance`] = increment(this.rewardAmount);
        updates[`publisher_apps/${this.appId}/earnings`] = increment(this.rewardAmount);

        // 3. REFERAL MANTIQI: Publisherni taklif qilgan odamga bonus
        try {
            const userSnap = await get(ref(db, `users/${this.publisherId}`));
            const userData = userSnap.val();

            if (userData && userData.referredBy) {
                // Referrer balansiga bonus qo'shish (Publisher balansiga)
                updates[`publishers/${userData.referredBy}/balance`] = increment(refBonus);
                // Referal statistikasini yangilash
                updates[`users/${userData.referredBy}/referralStats/pubEarned`] = increment(refBonus);
            }

            await update(ref(db), updates);
            console.log("Adsero SDK: Impression tracked & Referral bonus processed.");
        } catch (error) {
            console.error("Adsero SDK Impression Error:", error);
        }
    }

    async trackClick(adId) {
        try {
            await update(ref(db, `ads/${adId}`), { clicks: increment(1) });
        } catch (e) {
            console.error("Adsero SDK Click Error:", e);
        }
    }
}

// SDK-ni avtomatik ishga tushirish
new AdseroSDK();
