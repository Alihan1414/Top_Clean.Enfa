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
    kat: "", odalar: [], index: 0,
    baslat: function(katAd) {
        this.kat = katAd; this.odalar = Object.keys(katlar[katAd]); this.index = 0;
        document.getElementById("mufettisKatSecim").classList.add("d-none");
        document.getElementById("mufettisOdakModu").classList.remove("d-none");
        this.odaGoster();
    },
    geriDon: function() {
        document.getElementById("mufettisOdakModu").classList.add("d-none");
        document.getElementById("mufettisKatSecim").classList.remove("d-none");
        IdarecManager.mufettisKatlariYukle();
    },
    odaGoster: function() {
        const odaAd = this.odalar[this.index];
        document.getElementById("focusOdaAd").innerText = odaAd;
        document.getElementById("focusKatIsim") && (document.getElementById("focusKatIsim").innerText = this.kat);
        const yuzde = Math.round((this.index / this.odalar.length) * 100);
        document.getElementById("focusIlerlemeBar").style.width = yuzde + "%";
        document.getElementById("focusYuzdeMetin") && (document.getElementById("focusYuzdeMetin").innerText = `%${yuzde}`);

        // Rapora ait detayları göster
        const data = getData();
        const bugun = todayISO();
        const rapor = data.find(d => d.kat === this.kat && d.bolum === odaAd && toShortDate(new Date(d.tarih).getTime()) === bugun && d.durum === 'bekliyor');

        const detayContainer = document.getElementById('mufettisDetaylar');
        if (!detayContainer) return;

        if (!rapor) {
            detayContainer.innerHTML = `<div class="text-muted small text-center py-3">Bu oda için bekleyen rapor bulunamadı.</div>`;
            return;
        }

        const hasFoto = !!rapor.foto;
        const hasNot = rapor.not && rapor.not.trim() !== '';
        const hasKriter = rapor.kriterler && rapor.kriterler.length > 0;

        detayContainer.innerHTML = `
            <div class="d-flex gap-2 mt-3 mb-4">
                <!-- FOTOĞRAF BUTONU -->
                <button onclick="MufettisFocus.gosterFoto()" 
                    class="flex-1 glass-card p-3 text-center ${hasFoto ? '' : 'opacity-40'}" 
                    style="flex:1; border: 1px solid ${hasFoto ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.05)'}; border-radius:14px; cursor:${hasFoto ? 'pointer' : 'default'};">
                    <div style="font-size:1.8rem;">📸</div>
                    <div class="x-small fw-bold text-white mt-1">Fotoğraf</div>
                    <div class="x-small" style="color: ${hasFoto ? '#10b981' : '#555'};">${hasFoto ? 'Var ✓' : 'Yok'}</div>
                </button>
                <!-- KRİTER LİSTESİ BUTONU -->
                <button onclick="MufettisFocus.gosterKriter()" 
                    class="flex-1 glass-card p-3 text-center ${hasKriter ? '' : 'opacity-40'}" 
                    style="flex:1; border: 1px solid ${hasKriter ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.05)'}; border-radius:14px; cursor:${hasKriter ? 'pointer' : 'default'};">
                    <div style="font-size:1.8rem;">✅</div>
                    <div class="x-small fw-bold text-white mt-1">Kriterler</div>
                    <div class="x-small" style="color: ${hasKriter ? '#10b981' : '#555'};">${hasKriter ? rapor.kriterler.length + ' madde' : 'Yok'}</div>
                </button>
                <!-- NOT BUTONU -->
                <button onclick="MufettisFocus.gosterNot()" 
                    class="flex-1 glass-card p-3 text-center ${hasNot ? '' : 'opacity-40'}" 
                    style="flex:1; border: 1px solid ${hasNot ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.05)'}; border-radius:14px; cursor:${hasNot ? 'pointer' : 'default'};">
                    <div style="font-size:1.8rem;">📝</div>
                    <div class="x-small fw-bold text-white mt-1">Not</div>
                    <div class="x-small" style="color: ${hasNot ? '#fbbf24' : '#555'};">${hasNot ? 'Var ✓' : 'Yok'}</div>
                </button>
            </div>
        `;
        // Mevcut raporu sakla
        this._aktifRapor = rapor;
    },
    gosterFoto: function() {
        if (!this._aktifRapor?.foto) return;
        Swal.fire({
            title: 'Temizlik Fotoğrafı',
            imageUrl: this._aktifRapor.foto,
            imageAlt: 'Temizlik fotoğrafı',
            imageWidth: '100%',
            background: '#0a0f14',
            color: '#fff',
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#10b981'
        });
    },
    gosterKriter: function() {
        if (!this._aktifRapor?.kriterler?.length) return;
        const listHTML = this._aktifRapor.kriterler.map(k => 
            `<div style="display:flex; align-items:center; gap:8px; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.06);">
                <span style="font-size:1rem;">${k.tamam ? '✅' : '❌'}</span>
                <span style="font-size:0.85rem; color:#fff;">${k.metin}</span>
            </div>`
        ).join('');
        Swal.fire({
            title: 'Kriter Listesi',
            html: `<div style="text-align:left;">${listHTML}</div>`,
            background: '#0a0f14',
            color: '#fff',
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#10b981'
        });
    },
    gosterNot: function() {
        if (!this._aktifRapor?.not) return;
        Swal.fire({
            title: 'Görevli Notu',
            html: `<div style="background:rgba(251,191,36,0.1); border:1px solid rgba(251,191,36,0.3); border-radius:12px; padding:16px; text-align:left; color:#fff; font-size:0.9rem;">${this._aktifRapor.not}</div>`,
            background: '#0a0f14',
            color: '#fff',
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#10b981'
        });
    },
    karar: function(durum) {
        if (durum === 'reddedildi') {
            Swal.fire({ title: 'Red Nedeni?', input: 'textarea', confirmButtonText: 'REDDET' }).then(r => {
                if (r.isConfirmed) this.kaydet(durum, r.value);
            });
        } else this.kaydet(durum, "");
    },
    kaydet: function(durum, not) {
        saveData({ kat: this.kat, bolum: this.odalar[this.index], durum, not, tarih: new Date().toISOString(), mufettis: currentUser.name });
        this.index++;
        if (this.index < this.odalar.length) this.odaGoster();
        else { Swal.fire("Bitti", "Kat denetimi tamamlandı.", "success"); this.geriDon(); }
    }
};

// --- IDARECI MANAGER (6 ÖZELLİK) ---
const IdarecManager = {
    currentSubTab: 'denetim',
    chartInstance: null,

    switchSubTab: function(tabId) {
        this.currentSubTab = tabId;
        // Panelleri gizle
        document.querySelectorAll('.idarec-sub-tab').forEach(el => el.classList.add('d-none'));
        const target = document.getElementById('subTab' + tabId.charAt(0).toUpperCase() + tabId.slice(1));
        if (target) target.classList.remove('d-none');
        // Tab buton stillerini güncelle
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.className = b.className.replace('btn-emerald', 'btn-glass-emerald');
        });
        const activeBtn = document.getElementById('tab-' + tabId);
        if (activeBtn) activeBtn.className = activeBtn.className.replace('btn-glass-emerald', 'btn-emerald');
        // İlgili render fonksiyonunu çağır
        if (tabId === 'denetim') { this.renderHeatmap(); this.renderFloor('Bodrum Kat'); }
        if (tabId === 'onay') this.renderOnay();
        if (tabId === 'grafik') this.renderGrafik();
        if (tabId === 'liderlik') this.renderLiderlik();
        if (tabId === 'ariza') this.renderAriza();
        if (tabId === 'skor') this.renderSkor();
        if (tabId === 'personel') this.renderUsers();
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
        const c = document.getElementById("mufettisKatButonlari");
        if (!c) return;
        const data = getData();
        const bekleyenler = data.filter(d => d.durum === 'bekliyor');
        const toplamBekleyen = bekleyenler.length;

        // Genel banner güncelle
        const badge = document.getElementById('mufettisBekleyenBadge');
        if (badge) {
            if (toplamBekleyen === 0) {
                badge.className = 'badge bg-success rounded-pill px-3 py-2';
                badge.style.fontSize = '0.85rem';
                badge.innerText = '✅ Tüm raporlar incelendi';
            } else {
                badge.className = 'badge bg-warning text-dark rounded-pill px-3 py-2';
                badge.style.fontSize = '0.85rem';
                badge.innerText = `⏳ ${toplamBekleyen} rapor onay bekliyor`;
            }
        }

        // Kat butonları
        c.innerHTML = Object.keys(katlar).map(k => {
            const katBekleyen = bekleyenler.filter(d => d.kat === k).length;
            const hasPending = katBekleyen > 0;
            return `
            <button onclick="MufettisFocus.baslat('${k}')" 
                class="btn ${hasPending ? 'btn-warning text-dark' : 'btn-glass-emerald'} w-100 py-3 fw-bold d-flex justify-content-between align-items-center px-4"
                style="border-radius:14px; ${hasPending ? 'box-shadow: 0 4px 15px rgba(251,191,36,0.3);' : ''}"
            >
                <span>${k}</span>
                ${hasPending 
                    ? `<span class="badge bg-dark text-warning rounded-pill px-3">⏳ ${katBekleyen} bekliyor</span>`
                    : `<span style="font-size:0.7rem; opacity:0.5;">Temiz</span>`
                }
            </button>`;
        }).join('');
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
    const container = document.getElementById('gorevliBolumListesi');
    if (!container) return;
    const data = getData();
    const bugun = todayISO();
    const bolumler = Object.keys(katlar[katAd] || {});
    
    // Tamamlanan sayı
    const tamam = bolumler.filter(b => 
        data.find(d => d.kat === katAd && d.bolum === b && toShortDate(new Date(d.tarih).getTime()) === bugun)
    ).length;
    const toplam = bolumler.length;
    const yuzde = toplam > 0 ? Math.round((tamam / toplam) * 100) : 0;
    
    // Hero güncelle
    document.getElementById('gorevliHocaIsim').innerText = currentUser.name;
    document.getElementById('gorevliTamamSayi').innerText = `${tamam}/${toplam}`;
    document.getElementById('gorevliYuzde').innerText = `%${yuzde}`;
    setTimeout(() => {
        const bar = document.getElementById('gorevliProgressBar');
        if (bar) bar.style.width = yuzde + '%';
    }, 100);
    
    // Bölüm kartları
    container.innerHTML = bolumler.map(bolum => {
        const rapor = data.find(d => d.kat === katAd && d.bolum === bolum && toShortDate(new Date(d.tarih).getTime()) === bugun);
        const sure = gorevliSureler[bolum] || 15;
        const isDone = !!rapor;
        const isWc = bolum.toLowerCase().includes('wc');
        const emoji = isWc ? '🚰' : bolum.toLowerCase().includes('merdiven') ? '📋' : '🧹';
        
        return `
        <div class="glass-card bg-slate-glass p-4 d-flex justify-content-between align-items-center ${isDone ? 'border border-emerald border-opacity-25' : ''}" style="transition: all 0.3s;">
            <div class="d-flex align-items-center gap-3">
                <div style="font-size:1.6rem; width:44px; height:44px; display:flex; align-items:center; justify-content:center; background:${isDone ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)'}; border-radius:12px; border: 1px solid ${isDone ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)'}">${isDone ? '✅' : emoji}</div>
                <div>
                    <div class="fw-bold text-white" style="font-size:0.9rem;">${bolum}</div>
                    <div class="d-flex align-items-center gap-2 mt-1">
                        <span class="x-small text-muted">⏱️ ${sure} dk</span>
                        ${isDone ? `<span class="badge badge-premium" style="font-size:0.55rem;">TAMAMLANDI</span>` : `<span style="font-size:0.65rem; color:#666;">Bekliyor</span>`}
                    </div>
                </div>
            </div>
            ${isDone 
                ? `<div style="width:36px; height:36px; border-radius:50%; background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.4); display:flex; align-items:center; justify-content:center;">
                       <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                   </div>` 
                : `<button onclick="KriterManager.ac('${katAd}','${bolum}')" class="btn btn-emerald px-3 py-2 rounded-3 fw-bold" style="font-size:0.8rem; white-space:nowrap;">
                       Başla →
                   </button>`
            }
        </div>`;
    }).join('');
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

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
    if (currentUser.rol === "idareci") { showPanel("idarecPanel"); IdarecManager.switchSubTab('denetim'); }
    else if (currentUser.rol === "mufettis") { showPanel("adminPanel"); IdarecManager.mufettisKatlariYukle(); }
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
    for (let i = 0; i < 15; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'login-bubble';
        const size = 12 + Math.random() * 20;
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        bubble.style.left = Math.random() * 100 + '%';
        bubble.style.bottom = '-50px';
        bubble.style.animationDuration = (5 + i * 0.8) + 's';
        bubble.style.animationDelay = (i * 0.3) + 's';
        container.appendChild(bubble);
    }
}

function loginReveal() {
    const landing = document.getElementById('loginLanding');
    const formWrap = document.getElementById('loginForm-wrap');
    if (!landing || !formWrap) return;
    
    landing.style.opacity = '0';
    landing.style.transform = 'scale(0.9)';
    landing.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    setTimeout(() => {
        landing.style.display = 'none';
        formWrap.style.opacity = '1';
        formWrap.style.transform = 'scale(1)';
        formWrap.style.filter = 'blur(0px)';
        formWrap.style.pointerEvents = 'auto';
    }, 300);
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
