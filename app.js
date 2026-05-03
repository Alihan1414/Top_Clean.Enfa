// ---------- TOPCLEAN v5.1 (PREMIUM CORE) ----------
const firebaseConfig = {
    apiKey: "AIzaSyCO88ONQpL3vFRMSY-jyhRImbsNC1ngcmQ",
    authDomain: "topclean-ce4e6.firebaseapp.com",
    databaseURL: "https://topclean-ce4e6-default-rtdb.firebaseio.com",
    projectId: "topclean-ce4e6",
    storageBucket: "topclean-ce4e6.firebasestorage.app",
    messagingSenderId: "413118182506",
    appId: "1:413118182506:web:4e1897da948b8348030613"
};

let db = null;
let auth = null;
try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        auth = firebase.auth();
    }
} catch (e) { console.error("Firebase Init Error:", e); }

const katlar = {
    "Bodrum Kat": {
        "-1 Merdiven": ["Zemin süpürülmüş ve temiz", "Korkuluklar silinmiş ve tozsuz", "Çöp kutuları boşaltılmış", "Etraf düzenli", "Lekeler silinmiş"],
        "Koridor": ["Zemin temiz", "Camlar silinmiş", "Çöp yok", "Koku yok", "Etraf Düzenli"],
        "Mescit": ["Etraf Süpürülmüş", "Kürsü Düzenli", "Koku yok", "Halılar temizlenmiş", "Camlar temiz"],
        "Kütüphane": ["Zemin temiz", "Kitaplar düzenli", "Masalar temiz", "Çöp yok", "Rafların tozu alınmış"],
        "Wc": ["Zemin temiz", "Lavabolar temiz", "Koku yok", "Kağıt var", "Sabun var"],
        "Muhasebe Odası": ["Masa düzenli", "Zemin temiz", "Koku yok", "Toz alınmış", "Çöp kutusu boş"],
        "Çalışma Odası": ["Zemin temiz", "Masalar düzenli", "Toz alınmış", "Çöp yok", "Koku yok"],
        "Donanım": ["Zemin temiz", "Cihazlar düzenli", "Kablo karmaşası yok", "Toz alınmış", "Çöp kutusu boş"]
    },
    "Zemin Kat": {
        "0 Merdiven": ["Zemin süpürülmüş ve temiz", "Korkuluklar silinmiş ve tozsuz", "Çöp kutuları boşaltılmış", "Etraf düzenli", "Lekeler silinmiş"],
        "Koridor": ["Zemin temiz", "Camlar silinmiş", "Çöp yok", "Koku yok", "Ayna Silinmiş"],
        "Çalışma Odası": ["Masa düzenli", "Zemin temiz", "Toz alınmış", "Çöp yok", "Koku yok"],
        "Toplantı Odası": ["Masalar düzenli", "Zemin temiz", "Sandalyeler dizili", "Toz alınmış", "Çöp yok"],
        "Çayhane": ["Zemin temiz", "Masalar silinmiş", "Çöp yok", "Koku yok", "Çay Demlikleri Temiz"],
        "Wc 1": ["Lavabolar temiz", "Zemin temiz", "Sabun var", "Kağıt var", "Koku yok"],
        "Wc 2": ["Lavabolar temiz", "Zemin temiz", "Sabun var", "Kağıt var", "Koku yok"],
        "İdareci Odası": ["Masa düzenli", "Zemin temiz", "Koku yok", "Koltuklar Temiz", "Çöp kutusu boş"]
    },
    "Akademik Kat": {
        "1 Merdiven": ["Zemin süpürülmüş ve temiz", "Korkuluklar silinmiş ve tozsuz", "Çöp kutuları boşaltılmış", "Etraf düzenli", "Lekeler silinmiş"],
        "Koridor": ["Zemin temiz", "Camlar silinmiş", "Çöp yok", "Koku yok", "Paspas atılmış"],
        "Hocaların Odası": ["Masa düzenli", "Zemin temiz", "Koku yok", "Eşyalar düzenlenmiş", "Çöp kutusu boş"],
        "Lab": ["Zemin temiz", "Cihazlar düzenli", "Masalar silinmiş", "Toz alınmış", "Çöp yok"],
        "Etüt 1": ["Masa temiz", "Zemin temiz", "Toz alınmış", "Çöp yok", "Koku yok"],
        "Etüt 2": ["Masa temiz", "Zemin temiz", "Toz alınmış", "Çöp yok", "Koku yok"],
        "Etüt 3": ["Masa temiz", "Zemin temiz", "Toz alınmış", "Çöp yok", "Koku yok"],
        "Etüt 4": ["Masa temiz", "Zemin temiz", "Toz alınmış", "Çöp yok", "Koku yok"],
        "Talebe Çayhanesi": ["Zemin temiz", "Masalar silinmiş", "Çöp yok", "Koku yok", "Tezgah temiz"],
        "Wc": ["Zemin temiz", "Lavabolar temiz", "Sabun var", "Kağıt var", "Koku yok"]
    },
    "Ara Kat": {
        "2 Merdiven": ["Zemin süpürülmüş ve temiz", "Korkuluklar silinmiş ve tozsuz", "Çöp kutuları boşaltılmış", "Etraf düzenli", "Lekeler silinmiş"],
        "Koridor": ["Zemin temiz", "Camlar silinmiş", "Çöp yok", "Koku yok", "Paspas atılmış"],
        "Hoca Çalışma Odası": ["Masa düzenli", "Zemin temiz", "Toz alınmış", "Çöp yok", "Koku yok"],
        "Misafir Yatakhanesi": ["Yataklar düzenli", "Zemin temiz", "Toz alınmış", "Çöp yok", "Koku yok"],
        "Yatakhane 1": ["Yatak düzenli", "Zemin temiz", "Çöp yok", "Koku yok", "Süpürülmüş ve paspas atılmış"],
        "Yatakhane 2": ["Yatak düzenli", "Zemin temiz", "Çöp yok", "Koku yok", "Süpürülmüş ve paspas atılmış"],
        "Yatakhane 3": ["Yatak düzenli", "Zemin temiz", "Çöp yok", "Koku yok", "Süpürülmüş ve paspas atılmış"],
        "Tüzder": ["Zemin temiz", "Masalar düzenli", "Toz alınmış", "Eşyalar yerinde", "Çöp yok"],
        "Etüt": ["Masa temiz", "Zemin temiz", "Toz alınmış", "Çöp yok", "Koku yok"],
        "Robotik": ["Zemin temiz", "Eşyalar düzenli", "Cihazlar korunmuş", "Toz alınmış", "Çöp yok"],
        "Temizlik Deposu": ["Raflar düzenli", "Zemin temiz", "Kimyasallar kapalı", "Etraf derli toplu", "Çöp yok"],
        "Wc": ["Zemin temiz", "Lavabolar temiz", "Sabun var", "Kağıt var", "Koku yok"]
    },
    "Yatakhane Katı": {
        "3 Merdiven": ["Zemin süpürülmüş ve temiz", "Korkuluklar silinmiş ve tozsuz", "Çöp kutuları boşaltılmış", "Etraf düzenli", "Lekeler silinmiş"],
        "Koridor": ["Zemin temiz", "Camlar silinmiş", "Çöp yok", "Koku yok", "Paspas atılmış"],
        "Misafir Yatakhanesi": ["Yataklar düzenli", "Zemin temiz", "Toz alınmış", "Çöp yok", "Koku yok"],
        "Yatakhane 1": ["Yatak düzenli", "Zemin temiz", "Çöp yok", "Koku yok", "Süpürülmüş ve paspas atılmış"],
        "Yatakhane 2": ["Yatak düzenli", "Zemin temiz", "Çöp yok", "Koku yok", "Süpürülmüş ve paspas atılmış"],
        "Yatakhane 3": ["Yatak düzenli", "Zemin temiz", "Çöp yok", "Koku yok", "Süpürülmüş ve paspas atılmış"],
        "Yatakhane 4": ["Yatak düzenli", "Zemin temiz", "Çöp yok", "Koku yok", "Süpürülmüş ve paspas atılmış"],
        "Yatakhane 6": ["Yatak düzenli", "Zemin temiz", "Çöp yok", "Koku yok", "Süpürülmüş ve paspas atılmış"],
        "Wc": ["Zemin temiz", "Lavabolar temiz", "Sabun var", "Kağıt var", "Koku yok"]
    },
    "Sosyal Alan Katı": {
        "4 Merdiven": ["Zemin süpürülmüş ve temiz", "Korkuluklar silinmiş ve tozsuz", "Çöp kutuları boşaltılmış", "Etraf düzenli", "Lekeler silinmiş"],
        "Koridor": ["Zemin temiz", "Camlar silinmiş", "Çöp yok", "Koku yok", "Paspas atılmış"],
        "Sanat Odası": ["Zemin temiz", "Masalar silinmiş", "Malzemeler düzenli", "Toz alınmış", "Koku yok"],
        "Kantin": ["Zemin temiz", "Masalar temiz", "Çöp yok", "Eşyalar düzenli", "Hijyen kontrol"],
        "Teras": ["Zemin temiz", "Çöp yok", "Korkuluklar silinmiş", "Bitki düzenli", "Yer yıkandı"]
    }
};

const usersData = [
    { name: "Abdülkadir Uysal", pass: "1234", kat: "Bodrum Kat", rol: "gorevli" },
    { name: "Mehmet Ali Zabun", pass: "1234", kat: "Zemin Kat", rol: "gorevli" },
    { name: "Oğuz Erol", pass: "1234", kat: "Akademik Kat", rol: "gorevli" },
    { name: "Burakhan Karaoğlan", pass: "1234", kat: "Ara Kat", rol: "gorevli", depo: true },
    { name: "Görevli", pass: "1234", kat: "Yatakhane Katı", rol: "gorevli" },
    { name: "Emra Karabalak", pass: "1234", kat: "Sosyal Alan Katı", rol: "gorevli" },
    { name: "İç Mesul", pass: "1111", kat: "", rol: "mufettis" },
    { name: "İdareci", pass: "1111", kat: "", rol: "idareci" },
    { name: "Liste Sorumlusu", pass: "1111", kat: "", rol: "liste" }
];

let currentUser = null;
let allReports = [];
let talebeData = JSON.parse(localStorage.getItem('topclean_talebe')) || [
    { name: "Ahmet Y.", saglik: "Alerjik Astım" },
    { name: "Mehmet K.", saglik: "Sağlıklı" }
];

// --- CORE UTILS ---
function todayISO() { return new Date().toISOString().split('T')[0]; }
function toShortDate(ts) { return new Date(ts).toISOString().split('T')[0]; }
function getData() { return allReports; }

function saveData(item) {
    const bugun = todayISO();
    const idx = allReports.findIndex(r =>
        r.kat === item.kat &&
        r.bolum === item.bolum &&
        toShortDate(new Date(r.tarih).getTime()) === bugun
    );

    if (idx !== -1) {
        // Mevcut kaydı güncelle — orijinal ID'yi koru
        const originalId = allReports[idx].id;
        allReports[idx] = { ...allReports[idx], ...item, id: originalId };
        localStorage.setItem('topclean_reports', JSON.stringify(allReports));
        // Firebase'de aynı path'e üstine yaz (yeni kayıt oluşturma)
        if (db) db.ref('reports/' + originalId).set(allReports[idx]);
    } else {
        // Yeni kayıt
        item.id = new Date().getTime().toString();
        allReports.push(item);
        localStorage.setItem('topclean_reports', JSON.stringify(allReports));
        if (db) db.ref('reports/' + item.id).set(item);
    }
}

// --- VOICE MANAGER ---
const VoiceManager = {
    recognition: null, isListening: false,
    init: function() {
        if (!('webkitSpeechRecognition' in window)) return;
        this.recognition = new webkitSpeechRecognition();
        this.recognition.lang = 'tr-TR';
        this.recognition.onresult = (e) => {
            const text = e.results[0][0].transcript;
            const input = document.getElementById('gorevliNot');
            if (input) input.value += (input.value ? ' ' : '') + text;
            this.stop();
        };
    },
    start: function() { if(!this.recognition) this.init(); this.recognition.start(); this.isListening = true; },
    stop: function() { if(this.recognition) this.recognition.stop(); this.isListening = false; }
};

// --- QR & INVENTORY ---
const QRManager = {
    open: function() { showPanel('qrPanel'); Swal.fire({ title: 'QR Okuyucu', text: 'Kamera başlatılıyor...', icon: 'info', timer: 1500, showConfirmButton: false }); },
    close: function() { _routeUser(); }
};

const InventoryManager = {
    items: [
        { id: "SABUN", ad: "Sıvı Sabun", stok: 120, birim: "Litre", min: 20 },
        { id: "KAGIT", ad: "Tuvalet Kağıdı", stok: 450, birim: "Rulo", min: 100 },
        { id: "DETERJAN", ad: "Yüzey Temizleyici", stok: 85, birim: "Litre", min: 15 }
    ],
    ac: function() { showPanel('inventoryPanel'); this.render(); },
    render: function() {
        const container = document.getElementById('inventoryItems');
        if (!container) return;
        container.innerHTML = this.items.map(i => `
            <div class="col-6 col-md-4">
                <div class="glass-card p-3 text-center ${i.stok <= i.min ? 'border-danger' : ''}">
                    <div class="x-small text-muted mb-1">${i.ad}</div>
                    <div class="h4 fw-bold text-emerald mb-0">${i.stok}</div>
                    <div class="x-small opacity-50">${i.birim}</div>
                </div>
            </div>
        `).join('');
    }
};

// --- ARIZA SİSTEMİ ---
const ArizaManager = {
    loadList: function() { Swal.fire("Arıza Sistemi", "Tüm arızalar idareci panelinden takip edilebilir.", "info"); }
};

// --- CHAT SYSTEM ---
const ChatManager = {
    isOpen: false,
    toggle: function() {
        const overlay = document.getElementById('chatOverlay');
        if (!overlay) return;
        this.isOpen = !this.isOpen;
        overlay.style.left = this.isOpen ? '0' : '-100%';
        if (this.isOpen) this.load();
    },
    load: function() {
        if (!db) return;
        db.ref('messages').limitToLast(20).on('value', snap => {
            const container = document.getElementById('chatMessages');
            const emptyState = document.getElementById('chatEmptyState');
            if (!container) return;
            const data = snap.val() ? Object.values(snap.val()) : [];
            
            // Mesajları temizle ama empty state'i koru
            const msgs = container.querySelectorAll('.chat-bubble');
            msgs.forEach(m => m.remove());
            
            if (data.length === 0) {
                if (emptyState) emptyState.style.display = 'flex';
            } else {
                if (emptyState) emptyState.style.display = 'none';
                data.forEach(m => {
                    const isMine = m.sender === currentUser?.name;
                    const bubble = document.createElement('div');
                    bubble.className = 'chat-bubble d-flex flex-column ' + (isMine ? 'align-items-end' : 'align-items-start');
                    bubble.innerHTML = `
                        <div class="x-small text-muted mb-1">${m.sender}</div>
                        <div class="p-2 px-3 rounded-3 bg-slate-glass border border-emerald border-opacity-25 text-white small" style="max-width:80%;">${m.text}</div>
                    `;
                    container.appendChild(bubble);
                });
            }
            container.scrollTop = container.scrollHeight;
        });
    },
    send: function() {
        const input = document.getElementById('chatInput');
        if (!input || !input.value.trim() || !currentUser) return;
        db.ref('messages').push({ sender: currentUser.name, text: input.value, timestamp: new Date().toISOString() });
        input.value = "";
    }
};

// --- MUFETTIS / ODAK MODU ---
const MufettisFocus = {
    renderStream: function() {
        const container = document.getElementById('mufettisStream');
        if (!container) return;

        const pending = getData().filter(d => d.durum === 'bekliyor');
        
        // Badge güncelle
        const badge = document.getElementById('mufettisBekleyenBadge');
        if (badge) {
            badge.innerText = pending.length > 0 ? `⏳ ${pending.length} rapor onay bekliyor` : "✅ Tüm raporlar incelendi";
            badge.className = pending.length > 0 ? "badge bg-warning text-dark rounded-pill px-3 py-2" : "badge bg-success rounded-pill px-3 py-2";
        }

        if (pending.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <div style="font-size:3rem;">✨</div>
                    <div class="text-white fw-bold mt-2">Harika! Bekleyen iş yok.</div>
                    <p class="text-muted small">Yeni raporlar geldikçe burada görünecek.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = pending.map(r => `
            <div class="glass-card p-4 shadow-lg border-emerald border-opacity-10">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <div class="x-small text-emerald fw-bold text-uppercase" style="letter-spacing:1px;">${r.kat}</div>
                        <h3 class="h5 fw-bold text-white mb-0">${r.bolum}</h3>
                    </div>
                    <div class="text-end">
                        <div class="x-small text-white fw-bold">${r.gorevli}</div>
                        <div class="x-small text-muted">${new Date(r.tarih).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}</div>
                    </div>
                </div>

                ${r.foto ? `<img src="${r.foto}" class="w-100 rounded-4 mb-3 shadow-sm" style="max-height:250px; object-fit:cover; border:1px solid rgba(255,255,255,0.05);">` : ''}
                
                ${r.not ? `<div class="p-3 rounded-4 bg-dark bg-opacity-50 border border-warning border-opacity-25 mb-3">
                    <div class="x-small text-warning fw-bold mb-1">GÖREVLİ NOTU:</div>
                    <div class="text-white small italic">"${r.not}"</div>
                </div>` : ''}

                <div class="d-flex gap-2">
                    <button onclick="MufettisFocus.kararHizli('${r.id}', 'onaylandi')" class="btn btn-success flex-grow-1 py-3 rounded-pill fw-bold shadow-success">✅ ONAYLA</button>
                    <button onclick="MufettisFocus.kararHizli('${r.id}', 'reddedildi')" class="btn btn-outline-danger flex-grow-1 py-3 rounded-pill fw-bold">❌ REDDET</button>
                </div>
            </div>
        `).join('');
    },
    kararHizli: function(id, durum) {
        const data = getData();
        const r = data.find(item => item.id === id);
        if (!r) return;

        if (durum === 'reddedildi') {
            Swal.fire({ title: 'Red Nedeni?', input: 'textarea', confirmButtonText: 'REDDET' }).then(res => {
                if (res.isConfirmed) this.kaydetHizli(id, durum, res.value);
            });
        } else {
            this.kaydetHizli(id, durum, "");
        }
    },
    kaydetHizli: function(id, durum, redNotu) {
        const data = getData();
        const idx = data.findIndex(item => item.id === id);
        if (idx !== -1) {
            const updated = { ...data[idx], durum, mufettis: currentUser.name, redNotu: redNotu || "" };
            // saveData helper'ını kullan (bu helper ID'yi bulup güncelliyor)
            // saveData helper'ını kullan
            saveData(updated); 
            
            // Veriyi anlık olarak güncelle ve akışı temizle
            this.renderStream();
            
            // İdareci paneli açıksa cockpit'i de tazele
            const idarecPanel = document.getElementById('idarecPanel');
            if (idarecPanel && !idarecPanel.classList.contains('d-none')) {
                IdarecManager.renderCockpit();
            }
        }
    }
};

// --- IDARECI MANAGER (6 ÖZELLİK) ---
const IdarecManager = {
    switchSubTab: function(tabId) {
        this.currentSubTab = tabId;
        // Alt tabları gizle, cockpit'i koru
        document.querySelectorAll('.idarec-sub-tab').forEach(el => el.classList.add('d-none'));
        const target = document.getElementById('subTab' + tabId.charAt(0).toUpperCase() + tabId.slice(1));
        if (target) {
            target.classList.remove('d-none');
            // Dashboard'u gizle eğer bir alt taba girildiyse (opsiyonel)
            // document.getElementById('idarecPanel').classList.add('d-none');
        }
        
        // İlgili render fonksiyonunu çağır
        if (tabId === 'grafik') this.renderGrafik();
        if (tabId === 'liderlik') this.renderLiderlik();
        if (tabId === 'ariza') this.renderAriza();
        if (tabId === 'personel') this.renderUsers();
    },

    // --- COCKPIT (BINA RÖNTGENİ) ---
    renderCockpit: function() {
        const matrixContainer = document.getElementById('cockpitMatrix');
        const feedContainer = document.getElementById('cockpitFeed');
        if (!matrixContainer) return;

        const data = getData();
        const bugun = todayISO();
        const bugunRaporlari = data.filter(d => toShortDate(new Date(d.tarih).getTime()) === bugun);
        
        // 1. MATRİS OLUŞTUR (KATLAR)
        matrixContainer.innerHTML = Object.keys(katlar).map(katAd => {
            const bolumler = Object.keys(katlar[katAd]);
            const roomsHTML = bolumler.map(bolum => {
                const r = bugunRaporlari.find(d => d.kat === katAd && d.bolum === bolum);
                let statusClass = "";
                if (r) {
                    if (r.durum === 'onaylandi') statusClass = "status-clean";
                    else if (r.durum === 'bekliyor') statusClass = "status-pending";
                    else if (r.durum === 'reddedildi') statusClass = "status-alert";
                }
                return `<div class="room-pixel ${statusClass}" title="${bolum}"></div>`;
            }).join('');

            return `
                <div class="floor-card">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="x-small fw-bold text-white">${katAd.split(' ')[0]}</span>
                        <span class="x-small text-muted" style="font-size:0.6rem;">${bolumler.length} Oda</span>
                    </div>
                    <div class="room-matrix">${roomsHTML}</div>
                </div>
            `;
        }).join('');

        // 2. NABIZ HESAPLA (PULSE)
        const toplamOda = Object.values(katlar).reduce((s, k) => s + Object.keys(k).length, 0);
        const tamamlanan = bugunRaporlari.filter(d => d.durum === 'onaylandi').length;
        const pct = Math.round((tamamlanan / toplamOda) * 100) || 0;
        
        const pulseText = document.getElementById('pulseText');
        const pulseCircle = document.getElementById('pulseProgressCircle');
        if (pulseText) pulseText.innerText = pct + "%";
        if (pulseCircle) {
            const offset = 502.4 - (502.4 * pct / 100);
            pulseCircle.style.strokeDashoffset = offset;
        }

        // 3. STATLAR
        const activeStaff = new Set(bugunRaporlari.map(r => r.gorevli)).size;
        document.getElementById('cockpit-stat-active').innerText = activeStaff;
        document.getElementById('cockpit-stat-alerts').innerText = bugunRaporlari.filter(d => d.durum === 'reddedildi' || (d.not && d.not.length > 5)).length;

        // 4. CANLI AKIŞ (FEED)
        if (feedContainer) {
            const lastActs = [...data].reverse().slice(0, 10);
            feedContainer.innerHTML = lastActs.map(a => `
                <div class="d-flex align-items-start gap-2 p-2 rounded-3" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05);">
                    <div style="width:8px; height:8px; border-radius:50%; background:${a.durum==='onaylandi'?'#10b981':a.durum==='reddedildi'?'#ef4444':'#f59e0b'}; margin-top:5px;"></div>
                    <div class="flex-grow-1">
                        <div class="x-small text-white fw-bold">${a.gorevli}</div>
                        <div class="x-small text-muted">${a.bolum} • ${a.durum.toUpperCase()}</div>
                    </div>
                    <div class="x-small text-muted" style="font-size:0.6rem;">${new Date(a.tarih).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}</div>
                </div>
            `).join('') || '<div class="text-center py-3 text-muted small">Bugün henüz aktivite yok</div>';
        }
    },

    // 1. DENETİM - Isı haritası
    renderHeatmap: function() {
        const container = document.getElementById('buildingHeatmap');
        if (!container) return;
        const data = getData(); const bugun = todayISO();
        container.innerHTML = Object.keys(katlar).map(katAd => {
            const rooms = Object.keys(katlar[katAd]);
            const done = data.filter(d => d.kat === katAd && toShortDate(new Date(d.tarih).getTime()) === bugun).length;
            const pct = Math.round((done / rooms.length) * 100);
            const color = pct === 100 ? '#10b981' : pct > 50 ? '#f59e0b' : pct > 0 ? '#3b82f6' : '#374151';
            return `<div class="col" title="${katAd}: ${done}/${rooms.length}">
                <div style="height:40px; border-radius:10px; background:${color}; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:0.8rem; color:#fff;">${pct}%</div>
                <div class="x-small text-muted text-center mt-1">${katAd.split(' ')[0][0]+katAd.split(' ')[1]?.[0]??''}</div>
            </div>`;
        }).join('');
    },

    renderFloor: function(katAd) {
        const container = document.getElementById('floorMatrix');
        if (!container) return;
        const data = getData(); const bugun = todayISO();
        container.innerHTML = Object.keys(katlar[katAd] || {}).map(bolum => {
            const r = data.find(d => d.kat === katAd && d.bolum === bolum && toShortDate(new Date(d.tarih).getTime()) === bugun);
            const isDone = r && (r.durum === 'onaylandi' || r.durum === 'bekliyor');
            return `<div class="col-6 col-md-4">
                <div class="glass-card bg-slate-glass p-2 text-center ${isDone ? 'border border-emerald border-opacity-25' : ''}">
                    <div style="font-size:0.7rem; color:${isDone ? '#10b981' : '#666'};">${isDone ? '✅' : '⏳'}</div>
                    <div class="x-small fw-bold text-white mt-1">${bolum}</div>
                </div>
            </div>`;
        }).join('');
    },

    // 2. ONAY - Raporları görüntüle (sadece okuma)
    renderOnay: function() {
        const container = document.getElementById('onayListesi');
        if (!container) return;
        const pending = getData().filter(d => d.durum === 'bekliyor');
        if (pending.length === 0) {
            container.innerHTML = `<div class="text-center py-5">
                <div style="font-size:2.5rem;">✅</div>
                <div class="text-white fw-bold mt-2">Bekleyen rapor yok</div>
                <div class="text-muted small">Tüm raporlar işlendi</div>
            </div>`;
            return;
        }
        container.innerHTML = `<div class="badge badge-premium mb-3 w-100 text-center py-2">📋 ${pending.length} rapor onay bekliyor — Onay/Red için İç Mesul'e başvurun</div>` + 
        pending.map(r => `
            <div class="glass-card bg-slate-glass p-3">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <div class="fw-bold text-white small">${r.bolum}</div>
                        <div class="x-small text-muted mt-1">${r.kat} • ${r.gorevli} • ${new Date(r.tarih).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}</div>
                        ${r.not ? `<div class="x-small text-warning mt-1">📝 ${r.not}</div>` : ''}
                    </div>
                    <span class="badge bg-warning text-dark rounded-pill" style="font-size:0.6rem; white-space:nowrap;">Bekliyor</span>
                </div>
            </div>
        `).join('');
    },

    // 3. GRAFİK - Son 7 gün
    renderGrafik: function() {
        const canvas = document.getElementById('grafikCanvas');
        if (!canvas) return;
        if (this.chartInstance) { this.chartInstance.destroy(); this.chartInstance = null; }
        
        const data = getData();
        const labels = [], counts = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const label = d.toLocaleDateString('tr-TR', {weekday:'short', day:'numeric'});
            const dateStr = d.toISOString().split('T')[0];
            const count = data.filter(r => r.tarih && r.tarih.startsWith(dateStr)).length;
            labels.push(label); counts.push(count);
        }
        
        if (typeof Chart === 'undefined') {
            canvas.parentElement.innerHTML += '<div class="text-muted small text-center">Chart.js yüleniyor...</div>';
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            s.onload = () => this.renderGrafik();
            document.head.appendChild(s); return;
        }
        
        this.chartInstance = new Chart(canvas, {
            type: 'bar',
            data: {
                labels,
                datasets: [{ label: 'Rapor Sayısı', data: counts,
                    backgroundColor: 'rgba(16,185,129,0.3)',
                    borderColor: '#10b981', borderWidth: 2, borderRadius: 8 }]
            },
            options: {
                responsive: true, plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: '#888' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { ticks: { color: '#888', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' } }
                }
            }
        });
    },

    // 4. LİDERLİK - Personel sıralama
    renderLiderlik: function() {
        const container = document.getElementById('liderlikListesi');
        if (!container) return;
        const data = getData();
        const skorlar = {};
        data.forEach(r => { if (r.gorevli) skorlar[r.gorevli] = (skorlar[r.gorevli] || 0) + 1; });
        const sirali = Object.entries(skorlar).sort((a,b) => b[1]-a[1]);
        const madalyalar = ['🥇', '🥈', '🥉'];
        if (sirali.length === 0) {
            container.innerHTML = '<div class="text-muted small text-center py-4">Henüz rapor verisi yok</div>'; return;
        }
        container.innerHTML = sirali.map(([ad, sayi], i) => `
            <div class="glass-card bg-slate-glass p-3 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-3">
                    <span style="font-size:1.4rem; min-width:30px;">${madalyalar[i] || '#' + (i+1)}</span>
                    <img src="assets/logo_enderun.png" style="width:36px; height:36px; border-radius:50%; border:1px solid rgba(16,185,129,0.3); object-fit:cover;" alt="U">
                    <div>
                        <div class="fw-bold text-white small">${ad}</div>
                        <div class="x-small text-muted">Toplam ${sayi} rapor</div>
                    </div>
                </div>
                <div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:20px; padding: 4px 14px;">
                    <span class="fw-bold" style="color:#10b981; font-size:1.1rem;">${sayi}</span>
                </div>
            </div>
        `).join('');
    },

    // 5. ARIZA - Görevli notları
    renderAriza: function() {
        const container = document.getElementById('arizaListesi');
        if (!container) return;
        const notlar = getData().filter(r => r.not && r.not.trim() !== '');
        if (notlar.length === 0) {
            container.innerHTML = '<div class="text-center py-5"><div style="font-size:2rem">😊</div><div class="text-white small mt-2">Bildirilmiş arıza veya sorun yok</div></div>';
            return;
        }
        container.innerHTML = notlar.reverse().map(r => `
            <div class="glass-card bg-slate-glass p-3 border border-warning border-opacity-25">
                <div class="d-flex justify-content-between mb-1">
                    <span class="badge bg-warning text-dark rounded-pill" style="font-size:0.6rem;">NOT</span>
                    <span class="x-small text-muted">${r.gorevli} • ${r.kat} / ${r.bolum}</span>
                </div>
                <div class="text-white small mt-1">${r.not}</div>
            </div>
        `).join('');
    },

    // 6. SKOR - Genel puan kartı
    renderSkor: function() {
        const container = document.getElementById('skorContainer');
        if (!container) return;
        const data = getData(); const bugun = todayISO();
        const bugunVerisi = data.filter(d => toShortDate(new Date(d.tarih).getTime()) === bugun);
        const toplamOda = Object.values(katlar).reduce((s, k) => s + Object.keys(k).length, 0);
        const tamamlanan = bugunVerisi.length;
        const onaylanan = bugunVerisi.filter(d => d.durum === 'onaylandi').length;
        const reddedilen = bugunVerisi.filter(d => d.durum === 'reddedildi').length;
        const pct = Math.round((tamamlanan / toplamOda) * 100);
        const grade = pct >= 90 ? {l:'MÜKEMMEL', c:'#10b981'} : pct >= 70 ? {l:'İYİ', c:'#3b82f6'} : pct >= 40 ? {l:'ORTA', c:'#f59e0b'} : {l:'DÜŞÜK', c:'#ef4444'};
        
        container.innerHTML = `
            <!-- ANA SKOR -->
            <div class="glass-card p-4 text-center">
                <div style="font-size:0.7rem; color:#888; text-transform:uppercase; letter-spacing:2px; margin-bottom:8px;">Bugünkü Bina Skoru</div>
                <div style="font-size:4rem; font-weight:900; color:${grade.c}; line-height:1;">${pct}%</div>
                <div class="badge mt-2 rounded-pill px-3" style="background:${grade.c}20; color:${grade.c}; border:1px solid ${grade.c}50;">${grade.l}</div>
                <div style="margin-top:16px; height:10px; background:rgba(255,255,255,0.06); border-radius:10px; overflow:hidden;">
                    <div style="height:100%; width:${pct}%; background:linear-gradient(90deg,${grade.c},${grade.c}99); border-radius:10px; transition:width 1s;"></div>
                </div>
                <div class="x-small text-muted mt-2">${tamamlanan} / ${toplamOda} oda temizlendi</div>
            </div>

            <!-- DETAY KARTLAR -->
            <div class="row g-3">
                <div class="col-4">
                    <div class="glass-card p-3 text-center">
                        <div style="font-size:1.5rem;">📝</div>
                        <div class="h5 fw-bold text-white mb-0">${tamamlanan}</div>
                        <div class="x-small text-muted">Rapor</div>
                    </div>
                </div>
                <div class="col-4">
                    <div class="glass-card p-3 text-center">
                        <div style="font-size:1.5rem;">✅</div>
                        <div class="h5 fw-bold text-white mb-0" style="color:#10b981;">${onaylanan}</div>
                        <div class="x-small text-muted">Onaylı</div>
                    </div>
                </div>
                <div class="col-4">
                    <div class="glass-card p-3 text-center">
                        <div style="font-size:1.5rem;">❌</div>
                        <div class="h5 fw-bold text-white mb-0" style="color:#ef4444;">${reddedilen}</div>
                        <div class="x-small text-muted">Reddedilen</div>
                    </div>
                </div>
            </div>
        `;
    },

    // PERSONEL
    renderUsers: function() {
        const container = document.getElementById('userListContainer');
        if (!container) return;
        const data = getData();
        container.innerHTML = usersData.map(u => {
            const raporSayi = data.filter(d => d.gorevli === u.name).length;
            return `<div class="glass-card bg-slate-glass p-3 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-3">
                    <img src="assets/logo_enderun.png" style="width:40px; height:40px; border-radius:50%; border:1px solid rgba(16,185,129,0.3); object-fit:cover;" alt="U">
                    <div>
                        <div class="fw-bold small text-white">${u.name}</div>
                        <div class="x-small text-muted">${u.rol} • ${raporSayi} rapor</div>
                    </div>
                </div>
                <span class="badge badge-premium">${u.rol.toUpperCase()}</span>
            </div>`;
        }).join('');
    },

    mufettisKatlariYukle: function() {
        // Eski fonksiyonun yerini renderStream aldı
        MufettisFocus.renderStream();
    }
};

// --- LİSTE SORUMLUSU (OPERASYON) SİSTEMİ ---
const ListeManager = {
    load: function() {
        console.log("📊 [Liste Panel] Loading...");
        this.renderTalebeList();
    },
    renderTalebeList: function() {
        const container = document.getElementById('talebeListesi');
        if (!container) return;
        container.innerHTML = talebeData.map((t, idx) => `
            <div class="glass-card p-2 px-3 d-flex justify-content-between align-items-center mb-2">
                <div class="small fw-bold text-white">${t.name}</div>
                <div class="badge ${t.saglik === 'Alerjik Astım' ? 'bg-danger' : 'bg-emerald-glow'} x-small">${t.saglik}</div>
                <button onclick="ListeManager.talebeSil(${idx})" class="btn btn-sm text-danger border-0 p-0">X</button>
            </div>
        `).join('');
    },
    yeniTalebe: function() {
        Swal.fire({
            title: 'Yeni Talebe',
            html: `<input type="text" id="tName" class="swal2-input" placeholder="İsim Soyisim">
                   <select id="tSaglik" class="swal2-select w-100"><option value="Sağlıklı">Sağlıklı</option><option value="Alerjik Astım">Alerjik Astım</option></select>`,
            confirmButtonText: 'EKLE'
        }).then(r => {
            if (r.isConfirmed) {
                talebeData.push({ name: document.getElementById('tName').value, saglik: document.getElementById('tSaglik').value });
                localStorage.setItem('topclean_talebe', JSON.stringify(talebeData));
                this.renderTalebeList();
            }
        });
    },
    talebeSil: function(idx) {
        talebeData.splice(idx, 1);
        localStorage.setItem('topclean_talebe', JSON.stringify(talebeData));
        this.renderTalebeList();
    },
    akilliDagit: function() {
        const container = document.getElementById('dagitimListesi');
        if (!container) return;
        
        let allRooms = [];
        Object.keys(katlar).forEach(k => Object.keys(katlar[k]).forEach(b => allRooms.push({ kat: k, bolum: b })));

        let available = [...talebeData];
        container.innerHTML = allRooms.map(room => {
            const isWc = room.bolum.toLowerCase().includes("wc");
            const count = isWc ? 2 : 1;
            let assigned = [];
            for (let i = 0; i < count; i++) { if (available.length > 0) assigned.push(available.shift().name); }
            
            const isShort = assigned.length < count;
            return `
                <div class="glass-card bg-slate-glass p-3 mb-2 d-flex justify-content-between align-items-center">
                    <div style="font-size:0.75rem"><span class="text-muted fw-bold">${room.kat}</span><br><b class="text-white">${room.bolum}</b></div>
                    <div class="text-end">${isShort ? `<span class="badge bg-danger bg-opacity-25 border border-danger text-danger x-small">YETERSİZ (${assigned.length}/${count})</span>` : `<span class="badge badge-premium x-small">${assigned.join(", ")}</span>`}</div>
                </div>`;
        }).join('');
        Swal.fire("Tamamlandı", "Akıllı dağıtım yapıldı.", "success");
    }
};

// --- GÖREVLİ PANELİ (ZENGİN GÖRÜNÜM) ---
const gorevliSureler = {
    'Wc': 10, 'Wc 1': 10, 'Wc 2': 10,
    'Merdiven': 10, '-1 Merdiven': 10, '0 Merdiven': 10,
    '1 Merdiven': 10, '2 Merdiven': 10,
    'Koridor': 12,
    'Mescit': 15,
    'Kütüphane': 20,
    'Lab': 20,
    'Etüt 1': 15, 'Etüt 2': 15, 'Etüt 3': 15, 'Etüt 4': 15,
    'Yatakhane 1': 25, 'Yatakhane 2': 25, 'Yatakhane 3': 25,
    'Misafir Yatakhanesi': 25,
    'Talebe Çayhanesi': 15,
    'Çayhane': 15,
    'Toplantı Odası': 15,
};

function loadGorevliPanel(katAd) {
    const listContainer = document.getElementById('gorevliBolumListesi');
    const matrixContainer = document.getElementById('gorevliFloorMatrix');
    const nextTaskContainer = document.getElementById('nextTaskContainer');
    if (!listContainer || !matrixContainer) return;

    const data = getData();
    const bugun = todayISO();
    const bolumler = Object.keys(katlar[katAd] || {});
    
    // 1. STATLAR & HERO
    const tamamRaporlari = bolumler.filter(b => data.find(d => d.kat === katAd && d.bolum === b && toShortDate(new Date(d.tarih).getTime()) === bugun));
    const tamamCount = tamamRaporlari.length;
    const toplamCount = bolumler.length;
    const yuzde = toplamCount > 0 ? Math.round((tamamCount / toplamCount) * 100) : 0;
    
    document.getElementById('gorevliHocaIsim').innerText = currentUser.name;
    document.getElementById('gorevliTamamSayi').innerText = `${tamamCount}/${toplamCount}`;
    document.getElementById('gorevliKatAd').innerText = katAd;
    setTimeout(() => {
        const bar = document.getElementById('gorevliProgressBar');
        if (bar) bar.style.width = yuzde + '%';
    }, 100);

    // 2. KAT MATRİSİ (RÖNTGEN) - Tıklanabilir yapıldı
    matrixContainer.innerHTML = bolumler.map(bolum => {
        const r = data.find(d => d.kat === katAd && d.bolum === bolum && toShortDate(new Date(d.tarih).getTime()) === bugun);
        const statusClass = r ? (r.durum === 'onaylandi' ? 'status-clean' : r.durum === 'reddedildi' ? 'status-alert' : 'status-pending') : '';
        const clickAction = r && r.durum === 'reddedildi' ? `onclick="GorevliManager.showRedNotu('${katAd}','${bolum}','${r.redNotu || ''}')"` : '';
        return `<div class="room-pixel ${statusClass}" style="width:22px; height:22px; cursor:${clickAction?'pointer':'default'};" ${clickAction} title="${bolum}"></div>`;
    }).join('');

    // 3. SIRADAKİ GÖREV (FOCUS CARD)
    const nextRoom = bolumler.find(b => {
        const r = data.find(d => d.kat === katAd && d.bolum === b && toShortDate(new Date(d.tarih).getTime()) === bugun);
        return !r || r.durum === 'reddedildi'; // Reddedilenler de sıraya girsin
    });

    if (nextRoom && nextTaskContainer) {
        const rNext = data.find(d => d.kat === katAd && d.bolum === nextRoom && toShortDate(new Date(d.tarih).getTime()) === bugun);
        const isRed = rNext && rNext.durum === 'reddedildi';

        nextTaskContainer.innerHTML = `
            <div class="glass-card p-4 border-${isRed?'danger':'emerald'} shadow-${isRed?'danger':'success'}" style="background:linear-gradient(135deg, ${isRed?'rgba(239,68,68,0.1)':'rgba(16,185,129,0.1)'}, rgba(0,0,0,0.4));">
                <div class="x-small text-${isRed?'danger':'emerald'} fw-bold mb-1 text-uppercase">${isRed ? '⚠️ DÜZELTME GEREKİYOR' : 'SIRADAKİ GÖREVİN'}</div>
                <h3 class="h2 fw-bold text-white mb-4">${nextRoom}</h3>
                ${isRed ? `<div class="p-2 bg-dark bg-opacity-50 rounded-3 mb-3 x-small text-white italic">"${rNext.redNotu}"</div>` : ''}
                <button onclick="KriterManager.ac('${katAd}','${nextRoom}')" class="btn btn-${isRed?'danger':'emerald'} w-100 py-3 rounded-pill fw-bold" style="font-size:1.1rem;">${isRed?'TEKRAR TEMİZLE':'GÖREVE BAŞLA →'}</button>
            </div>
        `;
    } else if (nextTaskContainer) {
        nextTaskContainer.innerHTML = `
            <div class="glass-card p-4 text-center border-emerald opacity-75">
                <div style="font-size:2.5rem;">🎉</div>
                <div class="h5 fw-bold text-white mt-2">Tüm Görevler Tamam!</div>
                <p class="x-small text-muted mb-0">Katındaki tüm odaları başarıyla temizledin.</p>
            </div>
        `;
    }

    // 4. TÜM LİSTE (SADELEŞTİRİLMİŞ)
    listContainer.innerHTML = bolumler.map(bolum => {
        const r = data.find(d => d.kat === katAd && d.bolum === bolum && toShortDate(new Date(d.tarih).getTime()) === bugun);
        const isDone = r && r.durum === 'onaylandi';
        const isRed = r && r.durum === 'reddedildi';
        const isPending = r && r.durum === 'bekliyor';

        return `
            <div class="d-flex align-items-center gap-3 p-3 rounded-4 bg-slate-glass ${isDone ? 'opacity-50' : ''}" style="border:1px solid rgba(255,255,255,0.05);">
                <div style="width:10px; height:10px; border-radius:50%; background:${isDone ? '#10b981' : isRed ? '#ef4444' : isPending ? '#f59e0b' : '#333'};"></div>
                <div class="flex-grow-1">
                    <div class="small fw-bold text-white">${bolum}</div>
                    <div class="x-small text-muted">${isDone ? 'Tamamlandı' : isRed ? 'Reddedildi (Düzeltme Lazım)' : isPending ? 'Onay Bekliyor' : 'Bekliyor'}</div>
                </div>
                ${isRed ? `<button onclick="GorevliManager.showRedNotu('${katAd}','${bolum}','${r.redNotu}')" class="btn btn-sm btn-outline-danger rounded-pill px-3">Notu Gör</button>` : ''}
                ${!isDone && !isPending ? `<button onclick="KriterManager.ac('${katAd}','${bolum}')" class="btn btn-sm btn-glass-emerald rounded-pill px-3">${isRed?'Düzelt':'Başla'}</button>` : isDone ? '✅' : '⏳'}
            </div>
        `;
    }).join('');
}

// GÖREVLİ YARDIMCI NESNESİ
const GorevliManager = {
    showRedNotu: function(kat, bolum, not) {
        Swal.fire({
            title: 'Müfettiş Notu',
            text: not || "Bir açıklama bırakılmamış.",
            icon: 'warning',
            background: '#0a0f14',
            color: '#fff',
            confirmButtonText: 'HEMEN DÜZELT',
            showCancelButton: true,
            cancelButtonText: 'KAPAT',
            confirmButtonColor: '#ef4444'
        }).then(res => {
            if (res.isConfirmed) KriterManager.ac(kat, bolum);
        });
    }
};

const KriterManager = {
    kat: "", bolum: "",
    ac: function(k, b) { 
        this.kat = k; this.bolum = b; 
        showPanel('kriterPanel'); 
        document.getElementById('kriterKatAd').innerText = k; 
        document.getElementById('kriterBolumAd').innerText = b; 
        
        const list = katlar[k][b] || [];
        const container = document.getElementById('kriterListesi');
        if(container) {
            container.innerHTML = list.map((kriter, idx) => `
                <div class="form-check custom-checkbox bg-slate-glass p-3 rounded-4 d-flex align-items-center">
                    <input class="form-check-input ms-1 me-3 bg-dark border-secondary" type="checkbox" id="kriter_${idx}" onchange="KriterManager.guncelleSayac()" style="transform: scale(1.3);">
                    <label class="form-check-label text-white small w-100" for="kriter_${idx}">${kriter}</label>
                </div>
            `).join('');
            this.guncelleSayac();
        }
    },
    guncelleSayac: function() {
        const total = (katlar[this.kat][this.bolum] || []).length;
        const checked = document.querySelectorAll('#kriterListesi .form-check-input:checked').length;
        const sayacEl = document.getElementById('kriterSayac');
        if(sayacEl) sayacEl.innerText = `${checked}/${total}`;
    },
    veriyiKaydet: function() {
        const total = (katlar[this.kat][this.bolum] || []).length;
        const checked = document.querySelectorAll('#kriterListesi .form-check-input:checked').length;
        
        if(total > 0 && checked < total) {
            Swal.fire("Eksik Görev", "Lütfen tüm temizlik kriterlerini işaretleyin.", "warning");
            return;
        }

        // Kriter listesini topla
        const kriterler = [];
        document.querySelectorAll('#kriterListesi .form-check-input').forEach((cb, i) => {
            const label = document.querySelector(`label[for="kriter_${i}"]`);
            kriterler.push({ metin: label ? label.innerText : '', tamam: cb.checked });
        });

        // Not
        const not = document.getElementById('gorevliNot')?.value?.trim() || '';

        // Fotoğraf (base64)
        const fotoInput = document.getElementById('gorevliFoto');
        const saveAndRoute = (fotoBase64) => {
            saveData({ 
                kat: this.kat, 
                bolum: this.bolum, 
                tarih: new Date().toISOString(), 
                gorevli: currentUser.name, 
                durum: 'bekliyor',
                kriterler,
                not,
                foto: fotoBase64 || null
            });
            Swal.fire("Başarılı", "Rapor gönderildi, onay bekleniyor.", "success");
            _routeUser();
        };

        if (fotoInput && fotoInput.files && fotoInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => saveAndRoute(e.target.result);
            reader.readAsDataURL(fotoInput.files[0]);
        } else {
            saveAndRoute(null);
        }
    }
};

// --- UI CORE ---
function showPanel(id) {
    document.querySelectorAll('.view-panel').forEach(p => p.classList.add('d-none'));
    const target = document.getElementById(id);
    if (target) target.classList.remove('d-none');
    document.getElementById('app-header').classList.toggle('d-none', id === 'loginPanel');
}

function populateUserSelect() {
    const sel = document.getElementById('userSelect');
    if (!sel) return;
    sel.innerHTML = '<option value="" disabled selected>Kullanıcı Seçin</option>' + usersData.map(u => `<option value="${u.name}">${u.name}</option>`).join('');
    console.log("✅ User list populated.");
}

function handleLogin(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('userSelect').value;
    const pass = document.getElementById('userPass').value;
    const user = usersData.find(u => u.name === name && u.pass === pass);
    if (user) { currentUser = user; localStorage.setItem('topclean_session', JSON.stringify(user)); _routeUser(); }
    else Swal.fire("Hata", "Hatalı şifre!", "error");
}

function _routeUser() {
    if (!currentUser) { showPanel("loginPanel"); return; }
    document.getElementById("headerName").innerText = currentUser.name;
    // Geri butonu - idareci ve liste panellerinde gizle, diğerleri göster
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        const hideBack = ['idareci', 'liste'].includes(currentUser.rol);
        backBtn.style.display = hideBack ? 'none' : 'flex';
    }
    if (currentUser.rol === "idareci") { showPanel("idarecPanel"); IdarecManager.renderCockpit(); }
    else if (currentUser.rol === "mufettis") { showPanel("adminPanel"); MufettisFocus.renderStream(); }
    else if (currentUser.rol === "liste") { showPanel("listePanel"); ListeManager.load(); }
    else if (currentUser.rol === "gorevli") { showPanel("gorevliPanel"); loadGorevliPanel(currentUser.kat); }
}

// Geri tuşu mantığı
function handleBack() {
    if (!currentUser) return;
    const activePanel = document.querySelector('.view-panel:not(.d-none)');
    const panelId = activePanel ? activePanel.id : '';
    
    if (panelId === 'kriterPanel') {
        // Görevli checklist'ten görev listesine dön
        showPanel('gorevliPanel');
        loadGorevliPanel(currentUser.kat);
    } else if (panelId === 'qrPanel') {
        _routeUser();
    } else {
        // Diğer panellerden de ana route'a dön
        _routeUser();
    }
}

function syncFromCloud() {
    if (!db) return;
    db.ref('reports').on('value', snap => { if (snap.val()) { allReports = Object.values(snap.val()); if (currentUser) _routeUser(); } });
}

// --- THEME MANAGER ---
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light-mode');
    const isLight = body.classList.contains('light-mode');
    localStorage.setItem('topclean_theme', isLight ? 'light' : 'dark');
    
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.setAttribute('data-lucide', isLight ? 'moon' : 'sun');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

// --- LOGIN CINEMATIC ---
function initLoginBubbles() {
    const container = document.getElementById('loginBubbles');
    if (!container) return;
    container.innerHTML = ''; // Temizle
    for (let i = 0; i < 20; i++) {
        spawnBubble(container, false);
    }
}

function spawnBubble(container, isBurst = false) {
    const bubble = document.createElement('div');
    bubble.className = 'login-bubble';
    const size = isBurst ? (5 + Math.random() * 15) : (10 + Math.random() * 25);
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    bubble.style.left = Math.random() * 100 + '%';
    bubble.style.bottom = isBurst ? '0' : '-60px';
    
    if (isBurst) {
        bubble.style.animationDuration = (0.5 + Math.random() * 1.5) + 's';
        bubble.style.background = 'radial-gradient(circle at 30% 30%, #34d399, #10b981)';
        bubble.style.boxShadow = '0 0 20px #10b981';
    } else {
        bubble.style.animationDuration = (6 + Math.random() * 10) + 's';
        bubble.style.animationDelay = (Math.random() * 5) + 's';
    }
    
    container.appendChild(bubble);
    if (isBurst) setTimeout(() => bubble.remove(), 2000);
}

function loginReveal() {
    const landing = document.getElementById('loginLanding');
    const formWrap = document.getElementById('loginForm-wrap');
    const container = document.getElementById('loginBubbles');
    if (!landing || !formWrap) return;
    
    // ÇOKLU BALONCUK PATLAMASI (Rush)
    for (let i = 0; i < 60; i++) {
        setTimeout(() => spawnBubble(container, true), i * 10);
    }

    landing.style.opacity = '0';
    landing.style.transform = 'translateY(-20px) scale(0.95)';
    landing.style.filter = 'blur(10px)';
    
    setTimeout(() => {
        landing.style.display = 'none';
        formWrap.style.display = 'block';
        setTimeout(() => {
            formWrap.style.opacity = '1';
            formWrap.style.transform = 'scale(1)';
            formWrap.style.filter = 'blur(0px)';
            formWrap.style.pointerEvents = 'auto';
        }, 50);
    }, 500);
}

document.addEventListener("DOMContentLoaded", () => {
    populateUserSelect();
    const s = localStorage.getItem('topclean_session');
    if (s) { currentUser = JSON.parse(s); _routeUser(); }
    else showPanel("loginPanel");
    syncFromCloud();
    if (typeof lucide !== 'undefined') lucide.createIcons();
    initLoginBubbles();

    // Init Theme
    if (localStorage.getItem('topclean_theme') === 'light') {
        document.body.classList.add('light-mode');
        setTimeout(() => {
            const icon = document.getElementById('themeIcon');
            if(icon) { icon.setAttribute('data-lucide', 'moon'); lucide.createIcons(); }
        }, 300);
    }
    
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('logoutBtn')?.addEventListener('click', () => { localStorage.removeItem('topclean_session'); currentUser = null; showPanel("loginPanel"); });
    if (typeof lucide !== 'undefined') lucide.createIcons();
});
