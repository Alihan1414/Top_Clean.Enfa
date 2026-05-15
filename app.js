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
let currentInstitutionId = localStorage.getItem('topclean_inst_id') || null;
let currentConfig = null; // Will store katlar, branding, etc.

// --- MULTI-TENANCY HELPERS ---
function getRef(path) {
    if (!currentInstitutionId) return null;
    return db.ref(`institutions/${currentInstitutionId}/${path}`);
}

async function loadInstitutionContext(instId) {
    if (!db) return false;
    try {
        const snap = await db.ref(`institutions/${instId}/config`).once('value');
        const config = snap.val();
        if (config) {
            currentInstitutionId = instId;
            currentConfig = config;
            localStorage.setItem('topclean_inst_id', instId);
            
            // Update Branding
            if (config.branding) {
                if (config.branding.name) {
                    document.querySelectorAll('.brand-name, .glass-title').forEach(el => el.innerText = config.branding.name);
                    document.title = `${config.branding.name} - Yönetim`;
                }
                if (config.branding.logo) {
                    document.querySelectorAll('img[alt*="Logo"], .logo-circle img').forEach(el => el.src = config.branding.logo);
                }
            }
            
            // Populate Global Katlar (if provided by DB)
            if (config.floors) {
                // We use currentConfig.floors instead of the global 'katlar' constant
            }
            
            return true;
        }
        return false;
    } catch (e) {
        console.error("Context Load Error:", e);
        return false;
    }
}

try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        auth = firebase.auth();
        
        // --- AUTH GUARD: PERMISSION_DENIED HATASINI ÖNLEMEK İÇİN ---
        auth.signInAnonymously().then(() => {
            console.log("Firebase Auth: Anonim giriş başarılı.");
        }).catch(err => {
            console.error("Firebase Auth Error:", err);
            // Anonim giriş kapalıysa kullanıcıya uyarı verebiliriz (geliştirme aşamasında)
            if (err.code === 'auth/operation-not-allowed') {
                console.warn("Firebase Auth: Anonim giriş devre dışı. Lütfen Firebase Console -> Auth -> Sign-in Method kısmından aktif edin.");
            }
        });

        auth.onAuthStateChanged(user => {
            if (user) console.log("Firebase Auth: Aktif oturum UID:", user.uid);
            else console.warn("Firebase Auth: Oturum kapalı.");
        });

        // Veritabanı bağlantı durumunu izle
        db.ref('.info/connected').on('value', snap => {
            if (snap.val() === true) console.log("Firebase DB: Bağlantı kuruldu.");
            else console.warn("Firebase DB: Bağlantı kesildi.");
        });
    }
} catch (e) { console.error("Firebase Init Error:", e); }

// --- DYNAMIC DATA INITIALIZATION ---
let katlar = currentConfig?.floors || {
    // FALLBACK (Default for new institutions or if DB is empty)
    "Zemin Kat": { "Koridor": ["Temiz"] }
};

let usersData = currentConfig?.users || [];

let currentUser = null;
let allReports = [];
try { allReports = JSON.parse(localStorage.getItem('topclean_reports')) || []; } catch(e) { allReports = []; }

let allArizalar = [];
try { allArizalar = JSON.parse(localStorage.getItem('topclean_arizalar')) || []; } catch(e) { allArizalar = []; }

let talebeData = [];
try { 
    const savedTalebe = localStorage.getItem('topclean_talebe');
    if (savedTalebe) talebeData = JSON.parse(savedTalebe);
} catch(e) {}

let allInventory = [];
try { 
    const saved = localStorage.getItem('topclean_inventory');
    allInventory = (saved && saved !== "undefined") ? JSON.parse(saved) : []; 
    if (!Array.isArray(allInventory)) allInventory = [];
} catch(e) { allInventory = []; }

// --- CORE UTILS ---
function todayISO() { return new Date().toISOString().split('T')[0]; }
function toShortDate(ts) { return new Date(ts).toISOString().split('T')[0]; }
function getData() { return allReports; }

function saveData(item) {
    const data = allReports;
    // 1. Önce ID ile ara (en güvenli yöntem)
    let idx = -1;
    if (item.id) {
        idx = data.findIndex(r => r.id === item.id);
    }
    
    // 2. ID ile bulunamadıysa (yeni kayıt olabilir) kat, bolum ve tarih ile ara
    if (idx === -1) {
        const bugun = todayISO();
        idx = data.findIndex(r =>
            r.kat === item.kat &&
            r.bolum === item.bolum &&
            toShortDate(new Date(r.tarih).getTime()) === bugun
        );
    }

    if (idx !== -1) {
        // Mevcut kaydı güncelle
        const originalId = data[idx].id;
        data[idx] = { ...data[idx], ...item, id: originalId };
        localStorage.setItem('topclean_reports', JSON.stringify(data));
        const ref = getRef('reports/' + originalId);
        if (ref) ref.set(data[idx]);
    } else {
        // Tamamen yeni kayıt
        if (!item.id) item.id = new Date().getTime().toString();
        data.push(item);
        localStorage.setItem('topclean_reports', JSON.stringify(data));
        const ref = getRef('reports/' + item.id);
        if (ref) ref.set(item);
    }
}

function saveAriza(item) {
    if (!item.id) item.id = "ARZ-" + new Date().getTime();
    const isNew = !allArizalar.find(a => a.id === item.id);
    const idx = allArizalar.findIndex(a => a.id === item.id);
    if (idx !== -1) allArizalar[idx] = item;
    else allArizalar.push(item);
    localStorage.setItem('topclean_arizalar', JSON.stringify(allArizalar));
    const ref = getRef('arizalar/' + item.id);
    if (ref) ref.set(item);
    
    // Bildirim: Yeni Arıza
    if (isNew) {
        NotificationManager.notify("⚠️ Yeni Arıza Bildirimi", `${item.bolum} bölgesinde yeni bir arıza bildirildi.`);
    }
}

function saveInventory(item) {
    if (!item.id) item.id = "INV-" + new Date().getTime();
    const idx = allInventory.findIndex(i => i.id === item.id);
    if (idx !== -1) allInventory[idx] = item;
    else allInventory.push(item);
    localStorage.setItem('topclean_inventory', JSON.stringify(allInventory));
    const ref = getRef('inventory/' + item.id);
    if (ref) ref.set(item);
    
    // Bildirim: Kritik Stok Kontrolü
    if (item.stock <= (item.threshold || 0)) {
        NotificationManager.notify("⚠️ Kritik Stok Uyarısı", `${item.name} stokta azaldı: ${item.stock} ${item.unit} kaldı!`);
    }
}

// --- NOTIFICATION MANAGER ---
const NotificationManager = {
    askPermission: function() {
        if (!("Notification" in window)) return;
        Notification.requestPermission();
    },
    notify: function(title, body) {
        if (Notification.permission === "granted") {
            new Notification(title, { body, icon: 'icon-512.png' });
        }
    }
};

// --- REPORT MANAGER ---
const ReportManager = {
    generateMonthly: function() {
        if (typeof jspdf === 'undefined') return Swal.fire("Hata", "PDF kütüphanesi yüklenemedi.", "error");
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const ayIsmi = new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
        
        // BAŞLIK
        doc.setFontSize(22); doc.setTextColor(16, 185, 129); doc.text("TopClean Faaliyet Raporu", 20, 20);
        doc.setFontSize(12); doc.setTextColor(100); doc.text(`Dönem: ${ayIsmi}`, 20, 30);
        doc.line(20, 35, 190, 35);

        // 1. TEMİZLİK İSTATİSTİKLERİ
        const data = getData();
        const bugun = todayISO().substring(0, 7); // YYYY-MM
        const ayVerisi = data.filter(d => d.tarih && d.tarih.startsWith(bugun));
        
        doc.setFontSize(16); doc.setTextColor(0); doc.text("1. Temizlik Performansı", 20, 50);
        doc.setFontSize(11);
        doc.text(`Toplam Temizlenen Oda: ${ayVerisi.length}`, 25, 60);
        doc.text(`Onaylanan Rapor: ${ayVerisi.filter(d=>d.durum==='onaylandi').length}`, 25, 65);
        doc.text(`Reddedilen Rapor: ${ayVerisi.filter(d=>d.durum==='reddedildi').length}`, 25, 70);

        // 2. ARIZA DURUMU
        doc.setFontSize(16); doc.text("2. Teknik Arızalar", 20, 85);
        const resolved = allArizalar.filter(a => a.cozuldu).length;
        doc.text(`Bildirilen Toplam Arıza: ${allArizalar.length}`, 25, 95);
        doc.text(`Giderilen Arıza: ${resolved}`, 25, 100);
        doc.text(`Bekleyen Arıza: ${allArizalar.length - resolved}`, 25, 105);

        // 3. MALZEME TÜKETİMİ (TABLO)
        doc.setFontSize(16); doc.text("3. Malzeme Stok Durumu", 20, 120);
        const tableData = allInventory.map(i => [i.name, i.stock, i.unit, i.stock <= i.threshold ? 'KRİTİK' : 'YETERLİ']);
        
        doc.autoTable({
            startY: 125,
            head: [['Malzeme', 'Mevcut Stok', 'Birim', 'Durum']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [16, 185, 129] }
        });

        doc.save(`TopClean_Faaliyet_Raporu_${ayIsmi}.pdf`);
        Swal.fire("Başarılı", "Aylık faaliyet raporu oluşturuldu.", "success");
    }
};

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
    ac: function() { showPanel('inventoryPanel'); this.render(); },
    render: function() {
        const container = document.getElementById('inventoryItems');
        if (!container) return;
        
        const btnWrap = document.getElementById('inventoryAddBtnWrap');
        const isBurak = currentUser && currentUser.name === "Burakhan Karaoğlan";
        
        if (btnWrap) btnWrap.classList.toggle('d-none', !isBurak);
        if (!Array.isArray(allInventory)) allInventory = [];
        
        container.innerHTML = allInventory.map(i => {
            if (!i || !i.id) return '';
            const stock = parseInt(i.stock) || 0;
            const threshold = parseInt(i.threshold) || 0;
            const isLow = stock <= threshold;
            const progress = threshold > 0 ? Math.min(100, (stock / (threshold * 3)) * 100) : 100;
            
            return `
                <div class="col-12 col-md-6">
                    <div class="glass-card p-3 d-flex align-items-center gap-3 ${isLow ? 'border-danger-pulse' : ''}">
                        <div class="flex-grow-1">
                            <div class="d-flex justify-content-between">
                                <span class="fw-bold text-white small">${i.name || 'İsimsiz Ürün'}</span>
                                <span class="x-small text-muted">${i.unit || 'Adet'}</span>
                            </div>
                            <div class="progress mt-2 mb-1" style="height:6px; background:rgba(255,255,255,0.05);">
                                <div class="progress-bar ${isLow ? 'bg-danger' : 'bg-emerald'}" style="width:${progress}%"></div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="h5 fw-bold ${isLow ? 'text-danger' : 'text-emerald'} mb-0">${stock}</span>
                                <span class="x-small text-muted">Eşik: ${threshold}</span>
                            </div>
                        </div>
                        ${isBurak ? `
                        <div class="d-flex flex-column gap-2">
                            <button onclick="InventoryManager.editModal('${i.id}')" class="btn btn-sm btn-glass-emerald p-1 px-2" title="Eşik Ayarla"><i data-lucide="bell" style="width:14px;"></i></button>
                            <button onclick="InventoryManager.deleteItem('${i.id}')" class="btn btn-sm btn-glass-danger p-1 px-2" title="Sil"><i data-lucide="trash-2" style="width:14px;"></i></button>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('') || '<div class="text-center py-5 text-muted small w-100">Henüz malzeme eklenmemiş.</div>';
        if (window.lucide) lucide.createIcons();
    },
    addItemModal: function() {
        const el = document.getElementById('inventoryAddModal');
        if (el) new bootstrap.Modal(el).show();
    },
    saveNew: function() {
        const nameEl = document.getElementById('invName');
        const stockEl = document.getElementById('invStock');
        if (!nameEl || !stockEl) return;

        const name = nameEl.value.trim();
        const stock = parseInt(stockEl.value);
        const unit = document.getElementById('invUnit')?.value || 'Adet';
        const threshold = parseInt(document.getElementById('invThreshold')?.value) || 5;

        if(!name || isNaN(stock)) return Swal.fire("Hata", "Eksik bilgi girdiniz!", "error");
        
        saveInventory({ name, stock, unit, threshold, lastUpdate: new Date().toISOString() });
        const modal = bootstrap.Modal.getInstance(document.getElementById('inventoryAddModal'));
        if (modal) modal.hide();
        this.render();
        Swal.fire("Başarılı", "Malzeme envantere eklendi.", "success");
    },
    useModal: function() {
        const sel = document.getElementById('invUseSelect');
        const modalEl = document.getElementById('inventoryUseModal');
        if(!sel || !modalEl) return;

        if (!Array.isArray(allInventory) || allInventory.length === 0) {
            return Swal.fire("Bilgi", "Envanterde henüz ürün yok.", "info");
        }

        sel.innerHTML = allInventory.map(i => `<option value="${i.id}">${i.name} (Stok: ${i.stock})</option>`).join('');
        new bootstrap.Modal(modalEl).show();
    },
    saveUse: function() {
        const id = document.getElementById('invUseSelect')?.value;
        const qty = parseInt(document.getElementById('invUseQty')?.value);
        if (!id || isNaN(qty)) return;

        const item = allInventory.find(i => i.id === id);
        if(!item) return;
        
        if(qty > item.stock) return Swal.fire("Hata", "Yetersiz stok! Mevcut: " + item.stock, "error");
        
        item.stock -= qty;
        saveInventory(item);
        const modal = bootstrap.Modal.getInstance(document.getElementById('inventoryUseModal'));
        if (modal) modal.hide();
        this.render();
        Swal.fire("Başarılı", "Stok güncellendi.", "success");
    },
    deleteItem: function(id) {
        Swal.fire({ 
            title: 'Emin misiniz?', 
            text: "Bu malzeme listeden tamamen silinecek.", 
            icon: 'warning', 
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Evet, Sil',
            cancelButtonText: 'İptal'
        }).then(r => {
            if(r.isConfirmed) {
                allInventory = allInventory.filter(i => i.id !== id);
                localStorage.setItem('topclean_inventory', JSON.stringify(allInventory));
                const ref = getRef('inventory/' + id);
                if (ref) ref.remove();
                this.render();
            }
        });
    },
    editModal: function(id) {
        const item = allInventory.find(i => i.id === id);
        if (!item) return;
        Swal.fire({
            title: 'Kritik Eşik Ayarla',
            text: 'Stok bu sayının altına düştüğünde sistem uyarı verecektir.',
            input: 'number',
            inputValue: item.threshold || 0,
            showCancelButton: true,
            confirmButtonText: 'Güncelle'
        }).then(res => {
            if(res.isConfirmed) {
                item.threshold = parseInt(res.value) || 0;
                saveInventory(item);
                this.render();
            }
        });
    }
};

// --- CHAT SYSTEM ---
const ChatManager = {
    isOpen: false,
    isListening: false,
    toggle: function() {
        const overlay = document.getElementById('chatOverlay');
        if (!overlay) return;
        this.isOpen = !this.isOpen;
        overlay.style.left = this.isOpen ? '0' : '-100%';
        if (this.isOpen) {
            this.load();
        }
    },
    load: function() {
        if (!db) {
            console.error("ChatManager: Firebase database not initialized.");
            return;
        }
        if (this.isListening) {
            console.log("ChatManager: Already listening to messages.");
            return;
        }

        console.log("ChatManager: Starting message listener...");
        this.isListening = true;
        
        db.ref(`institutions/${currentInstitutionId}/messages`).limitToLast(40).on('value', snap => {
            const container = document.getElementById('chatMessages');
            const emptyState = document.getElementById('chatEmptyState');
            if (!container) return;
            
            // Clear existing bubbles safely
            const bubbles = container.querySelectorAll('.chat-bubble');
            bubbles.forEach(b => b.remove());

            const val = snap.val();
            if (!val) {
                if (emptyState) emptyState.style.display = 'flex';
                console.log("ChatManager: No messages found.");
                return;
            }
            if (emptyState) emptyState.style.display = 'none';

            const messages = Object.values(val);
            console.log(`ChatManager: Rendering ${messages.length} messages.`);
            
            messages.forEach(m => {
                const isMine = m.sender === currentUser?.name;
                const time = m.timestamp ? new Date(m.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : "";
                
                const bubble = document.createElement('div');
                bubble.className = `chat-bubble ${isMine ? 'mine' : 'other'}`;
                bubble.innerHTML = `
                    ${!isMine ? `<div class="chat-sender">${m.sender}</div>` : ''}
                    <div class="chat-text">${m.text}</div>
                    <div class="chat-time">${time}</div>
                `;
                container.appendChild(bubble);
            });
            
            // Scroll to bottom with a slight delay to ensure rendering is complete
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 100);
        }, error => {
            console.error("ChatManager: Firebase error:", error);
            this.isListening = false;
        });
    },
    send: function() {
        const input = document.getElementById('chatInput');
        if (!input || !input.value.trim() || !currentUser) return;
        
        const msgText = input.value.trim();
        const ref = getRef('messages');
        if (ref) {
            ref.push({ 
                sender: currentUser.name, 
                text: msgText, 
                timestamp: new Date().toISOString() 
            }).then(() => {
                console.log("ChatManager: Message sent successfully.");
            }).catch(err => {
                console.error("ChatManager: Error sending message:", err);
                Swal.fire("Hata", "Mesaj gönderilemedi: " + err.message, "error");
            });
        }
        
        input.value = "";
    },
    clear: function() {
        Swal.fire({
            title: 'Sohbeti Temizle?',
            text: "Tüm mesajlar kalıcı olarak silinecek!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Evet, Sil!',
            cancelButtonText: 'İptal'
        }).then((result) => {
            if (result.isConfirmed) {
                const ref = getRef('messages');
                if (ref) {
                    ref.remove().then(() => {
                        Swal.fire('Silindi!', 'Sohbet geçmişi temizlendi.', 'success');
                    }).catch(err => {
                        Swal.fire('Hata', 'Silme işlemi başarısız: ' + err.message, 'error');
                    });
                }
            }
        });
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
            const updated = { 
                ...data[idx], 
                durum: durum, 
                mufettis: (currentUser ? currentUser.name : "Müfettiş"), 
                redNotu: redNotu || "" 
            };
            
            // Veriyi kaydet (Yeni ID-tabanlı saveData ile)
            saveData(updated); 
            
            // UI'ı anlık olarak tazele
            this.renderStream();
            
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

    // --- ARIZA MANAGER (ADMIN) ---
    renderAriza: function() {
        const container = document.getElementById('arizaListesi');
        if (!container) return;
        
        container.innerHTML = allArizalar.map(a => `
            <div class="d-flex align-items-center gap-3 p-3 rounded-4 bg-slate-glass" style="border:1px solid rgba(255,255,255,0.05);">
                <div style="width:10px; height:10px; border-radius:50%; background:${a.durum==='cozuldu'?'#10b981':a.durum==='surec'?'#f59e0b':'#ef4444'};"></div>
                <div class="flex-grow-1">
                    <div class="small fw-bold text-white">${a.bolum} <span class="x-small text-muted fw-normal">(${a.kat})</span></div>
                    <div class="x-small text-muted">${a.detay}</div>
                </div>
                <div class="badge rounded-pill ${a.durum==='cozuldu'?'bg-success':a.durum==='surec'?'bg-warning text-dark':'bg-danger'}" style="font-size:0.6rem;">
                    ${a.durum==='cozuldu'?'Çözüldü':a.durum==='surec'?'Süreçte':'Bekliyor'}
                </div>
            </div>
        `).join('') || '<div class="text-center py-4 text-muted small">Henüz arıza kaydı yok.</div>';
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

    // 5. NOTLAR - Görevli notları
    renderNotlar: function() {
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

// --- LİSTE SORUMLUSU (OPERASYON MERKEZİ v2) ---
const ListeManager = {
    currentStep: 1,
    assignments: [],
    floorLeaders: {},

    load: function() {
        console.log("📊 [Liste Panel] Loading v2...");
        this.restoreInputs();
        this.renderLeadersUI();
        this.showStep(1);
    },

    showStep: function(step) {
        this.currentStep = step;
        document.getElementById('listeStep1').classList.toggle('d-none', step !== 1);
        document.getElementById('listeStep2').classList.toggle('d-none', step !== 2);
    },

    restoreInputs: function() {
        const saved = JSON.parse(localStorage.getItem('topclean_raw_lists') || '{}');
        if (saved.astim) document.getElementById('listAstim').value = saved.astim;
        if (saved.alerjik) document.getElementById('listAlerjik').value = saved.alerjik;
        if (saved.saglikli) document.getElementById('listSaglikli').value = saved.saglikli;
        if (saved.diger) document.getElementById('listDiger').value = saved.diger;
        
        this.assignments = JSON.parse(localStorage.getItem('topclean_assignments') || '[]');
        this.floorLeaders = JSON.parse(localStorage.getItem('topclean_floor_leaders') || '{}');
        
        if (this.assignments.length > 0) {
            this.renderFinalList();
            this.renderLeadersUI();
            this.showStep(2);
        }
    },

    saveInputs: function() {
        const lists = {
            astim: document.getElementById('listAstim').value,
            alerjik: document.getElementById('listAlerjik').value,
            saglikli: document.getElementById('listSaglikli').value,
            diger: document.getElementById('listDiger').value
        };
        localStorage.setItem('topclean_raw_lists', JSON.stringify(lists));
    },

    renderLeadersUI: function() {
        const container = document.getElementById('floorLeadersContainer');
        if (!container) return;
        
        const floors = Object.keys(katlar);
        const hocalar = usersData.filter(u => u.rol === 'gorevli');
        
        container.innerHTML = floors.map(floor => {
            const leader = this.floorLeaders[floor] || { hoca: '', baskan: '' };
            return `
                <div class="p-2 border-bottom border-secondary border-opacity-10">
                    <div class="x-small text-white fw-bold mb-2">${floor.toUpperCase()}</div>
                    <div class="row g-2">
                        <div class="col-6">
                            <select onchange="ListeManager.saveLeader('${floor}', 'hoca', this.value)" class="form-select bg-slate-glass text-white border-0 x-small py-2">
                                <option value="">Hoca Seçin...</option>
                                ${hocalar.map(h => `<option value="${h.name}" ${leader.hoca === h.name ? 'selected' : ''}>${h.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="col-6">
                            <input type="text" value="${leader.baskan}" onchange="ListeManager.saveLeader('${floor}', 'baskan', this.value)" 
                                   placeholder="Kat Başkanı..." class="form-control bg-slate-glass text-white border-0 x-small py-2">
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    saveLeader: function(floor, field, value) {
        if (!this.floorLeaders[floor]) this.floorLeaders[floor] = { hoca: '', baskan: '' };
        this.floorLeaders[floor][field] = value;
        localStorage.setItem('topclean_floor_leaders', JSON.stringify(this.floorLeaders));
    },

    parseList: function(text) {
        return text.split(/[,\n]/).map(s => s.trim()).filter(s => s.length > 0);
    },

    akilliDagit: function() {
        this.saveInputs();
        const astimList = this.parseList(document.getElementById('listAstim').value);
        const alerjikList = this.parseList(document.getElementById('listAlerjik').value);
        const saglikliList = this.parseList(document.getElementById('listSaglikli').value);
        const digerList = this.parseList(document.getElementById('listDiger').value);

        const totalTalebeCount = astimList.length + alerjikList.length + saglikliList.length + digerList.length;
        if (totalTalebeCount === 0) return Swal.fire("Hata", "Lütfen en az bir talebe ismi girin.", "error");

        let allRooms = [];
        Object.keys(katlar).forEach(k => {
            Object.keys(katlar[k]).forEach(b => {
                allRooms.push({ kat: k, bolum: b, priority: this.getRoomPriority(b) });
            });
        });

        allRooms.sort((a, b) => a.priority - b.priority);

        const sensitive = [...astimList, ...alerjikList];
        const normal = [...digerList, ...saglikliList];
        
        let pool = [...sensitive, ...normal];
        this.assignments = [];

        allRooms.forEach(room => {
            const isWc = room.bolum.toLowerCase().includes("wc") || room.bolum.toLowerCase().includes("tuvalet");
            const capacity = isWc ? 2 : 1; // TUVALETLERE 2 KİŞİ
            let assigned = [];

            for (let i = 0; i < capacity; i++) {
                if (pool.length > 0) {
                    if (room.priority <= 2 && sensitive.length > 0) {
                        const sIdx = pool.indexOf(sensitive[0]);
                        if (sIdx !== -1) {
                            assigned.push(pool.splice(sIdx, 1)[0]);
                            sensitive.shift();
                        } else { assigned.push(pool.shift()); }
                    } else {
                        assigned.push(pool.pop());
                    }
                }
            }
            this.assignments.push({ ...room, students: assigned });
        });

        localStorage.setItem('topclean_assignments', JSON.stringify(this.assignments));
        this.renderFinalList();
        this.renderLeadersUI();
        this.showStep(2);
        Swal.fire("Başarılı", "Akıllı hafıza devreye girdi ve dağıtım yapıldı.", "success");
    },

    getRoomPriority: function(name) {
        const n = name.toLowerCase();
        if (n.includes("wc") || n.includes("tuvalet")) return 5;
        if (n.includes("merdiven") || n.includes("koridor")) return 4;
        return 1;
    },

    renderFinalList: function() {
        const container = document.getElementById('finalDagitimListesi');
        if (!container) return;
        container.innerHTML = this.assignments.map(a => `
            <div class="glass-card bg-slate-glass p-3 d-flex justify-content-between align-items-center">
                <div style="font-size:0.75rem">
                    <span class="text-muted fw-bold">${a.kat}</span><br>
                    <b class="text-white">${a.bolum}</b>
                </div>
                <div class="text-end">
                    ${a.students.length > 0 ? 
                        `<span class="badge badge-premium small">${a.students.join(", ")}</span>` : 
                        `<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 small">BOŞ</span>`}
                </div>
            </div>
        `).join('');
    },

    yeniTalebeEkleModali: function() {
        Swal.fire({
            title: 'Yeni Talebe Ekle',
            html: `
                <input type="text" id="newTName" class="swal2-input" placeholder="İsim Soyisim">
                <select id="newTSaglik" class="swal2-select w-100">
                    <option value="saglikli">Sağlıklı</option>
                    <option value="astim">Astım Hastası</option>
                    <option value="alerjik">Alerjik</option>
                </select>
            `,
            confirmButtonText: 'UYGUN YERE YERLEŞTİR',
            showCancelButton: true
        }).then(r => {
            if (r.isConfirmed) {
                const name = document.getElementById('newTName').value;
                const type = document.getElementById('newTSaglik').value;
                if (!name) return;
                this.addStudentToEmptySpot(name, type);
            }
        });
    },

    addStudentToEmptySpot: function(name, type) {
        let found = false;
        const priorityLimit = (type === 'astim' || type === 'alerjik') ? 2 : 10;
        
        for (let a of this.assignments) {
            const isWc = a.bolum.toLowerCase().includes("wc") || a.bolum.toLowerCase().includes("tuvalet");
            const capacity = isWc ? 2 : 1;
            if (a.students.length < capacity && a.priority <= priorityLimit) {
                a.students.push(name);
                found = true;
                break;
            }
        }
        
        if (!found) {
            for (let a of this.assignments) {
                const isWc = a.bolum.toLowerCase().includes("wc") || a.bolum.toLowerCase().includes("tuvalet");
                const capacity = isWc ? 2 : 1;
                if (a.students.length < capacity) {
                    a.students.push(name);
                    found = true;
                    break;
                }
            }
        }

        if (found) {
            localStorage.setItem('topclean_assignments', JSON.stringify(this.assignments));
            this.renderFinalList();
            Swal.fire("Eklendi", `${name} uygun boş bir bölgeye atandı.`, "success");
        }
    },

    pdfUret: function() {
        if (this.assignments.length === 0) {
            return Swal.fire("Hata", "Önce 'Akıllı Hafızayı Çalıştır' butonuna basarak dağıtım yapmalısınız!", "error");
        }

        const floors = Object.keys(katlar);
        
        // PDF için geçici bir konteyner oluştur (DOM'da olması html2canvas için daha güvenli)
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = '800px';
        container.style.background = 'white';
        document.body.appendChild(container);

        let htmlContent = "";
        floors.forEach((floor) => {
            const leader = this.floorLeaders[floor] || { hoca: 'Belirtilmedi', baskan: 'Belirtilmedi' };
            const floorData = this.assignments.filter(a => a.kat === floor);
            
            htmlContent += `
                <div style="padding: 40px; background: white; color: #333; font-family: 'Inter', sans-serif; page-break-after: always; min-height: 1050px; position: relative;">
                    <!-- Header -->
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 5px solid #10b981; padding-bottom: 20px; margin-bottom: 30px;">
                        <div>
                            <h1 style="margin: 0; color: #10b981; font-size: 32px; font-weight: 800; letter-spacing: -1.5px;">TOPCLEAN</h1>
                            <p style="margin: 0; color: #666; font-size: 13px; font-weight: 600; text-transform: uppercase;">Bina Hijyen ve Temizlik Planı</p>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 20px; font-weight: 800; color: #111;">${floor.toUpperCase()}</div>
                            <div style="font-size: 12px; color: #999; margin-top: 4px;">Baskı: ${new Date().toLocaleDateString('tr-TR')}</div>
                        </div>
                    </div>

                    <!-- Sorumlular -->
                    <div style="display: flex; gap: 20px; margin-bottom: 35px;">
                        <div style="flex: 1; background: #f0fdf4; border: 1.5px solid #bbf7d0; padding: 18px; border-radius: 15px;">
                            <div style="font-size: 11px; color: #15803d; font-weight: 800; text-transform: uppercase; margin-bottom: 6px;">Kat Sorumlusu (Hoca)</div>
                            <div style="font-size: 18px; font-weight: 700; color: #166534;">${leader.hoca || "Hoca Belirtilmedi"}</div>
                        </div>
                        <div style="flex: 1; background: #f0fdf4; border: 1.5px solid #bbf7d0; padding: 18px; border-radius: 15px;">
                            <div style="font-size: 11px; color: #15803d; font-weight: 800; text-transform: uppercase; margin-bottom: 6px;">Kat Başkanı (Talebe)</div>
                            <div style="font-size: 18px; font-weight: 700; color: #166534;">${leader.baskan || "Başkan Belirtilmedi"}</div>
                        </div>
                    </div>

                    <!-- Liste Tablosu -->
                    <table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #edf2f7; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);">
                        <thead>
                            <tr style="background: #10b981;">
                                <th style="padding: 18px; text-align: left; font-size: 14px; font-weight: 800; color: white; border-right: 1px solid rgba(255,255,255,0.1);">TEMİZLİK BÖLGESİ / MAHAL</th>
                                <th style="padding: 18px; text-align: left; font-size: 14px; font-weight: 800; color: white;">GÖREVLİ ÖĞRENCİLER</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${floorData.map((a, i) => `
                                <tr style="background: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                                    <td style="padding: 18px; font-weight: 700; color: #2d3748; font-size: 15px; border-bottom: 1px solid #edf2f7; border-right: 1px solid #edf2f7;">${a.bolum}</td>
                                    <td style="padding: 18px; color: #4a5568; font-size: 15px; font-weight: 600; border-bottom: 1px solid #edf2f7;">${a.students.join(", ") || "-"}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <!-- Footer -->
                    <div style="position: absolute; bottom: 40px; left: 40px; right: 40px; text-align: center; border-top: 1px solid #edf2f7; padding-top: 25px;">
                        <p style="margin: 0; color: #10b981; font-weight: 800; font-size: 16px; font-style: italic;">"Temizlik imandandır."</p>
                        <p style="margin: 8px 0 0; color: #a0aec0; font-size: 11px;">Enderun Eğitim Kurumları - TopClean Otomatik Dağıtım Sistemi</p>
                    </div>
                </div>
            `;
        });

        container.innerHTML = htmlContent;

        const opt = {
            margin: 0,
            filename: `TopClean_Afiş_${new Date().toLocaleDateString('tr-TR')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false, letterRendering: true, windowWidth: 800 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        Swal.fire({
            title: 'Afiş Üretiliyor...',
            text: 'Profesyonel şablon işleniyor, lütfen bekleyin.',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        html2pdf().set(opt).from(container).save().then(() => {
            Swal.fire("Başarılı", "Profesyonel afişiniz indirildi!", "success");
            document.body.removeChild(container);
        }).catch(err => {
            console.error("PDF Error:", err);
            Swal.fire("Hata", "PDF üretilirken bir sorun oluştu.", "error");
            document.body.removeChild(container);
        });
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
// --- NAVIGATION SYSTEM ---
let panelHistory = [];

function showPanel(id, pushToHistory = true) {
    document.querySelectorAll('.view-panel').forEach(p => p.classList.add('d-none'));
    const target = document.getElementById(id);
    if (target) {
        target.classList.remove('d-none');
        if (pushToHistory) {
            if (panelHistory[panelHistory.length - 1] !== id) {
                panelHistory.push(id);
            }
        }
    }
    const header = document.getElementById('app-header');
    if (header) header.classList.toggle('d-none', id === 'loginPanel');
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.style.display = (panelHistory.length > 1 && id !== 'loginPanel') ? 'flex' : 'none';
    }
}

function handleBack() {
    if (panelHistory.length > 1) {
        panelHistory.pop();
        const prevPanel = panelHistory[panelHistory.length - 1];
        if (prevPanel === 'listePanel' && typeof ListeManager !== 'undefined' && ListeManager.currentStep === 2) {
            ListeManager.showStep(1);
            return;
        }
        showPanel(prevPanel, false);
    } else {
        _routeUser();
    }
}

async function populateUserSelect(instId) {
    const sel = document.getElementById('userSelect');
    if (!sel) return;
    
    const success = await loadInstitutionContext(instId);
    if (success) {
        usersData = currentConfig.users || [];
        katlar = currentConfig.floors || {};
        sel.innerHTML = '<option value="" disabled selected>Kullanıcı Seçin</option>' + usersData.map(u => `<option value="${u.name}">${u.name}</option>`).join('');
        return true;
    } else {
        sel.innerHTML = '<option value="" disabled selected>Kurum Bulunamadı</option>';
        return false;
    }
}

async function handleLogin(e) {
    if (e) e.preventDefault();
    const instId = document.getElementById('instCode').value.trim();
    const name = document.getElementById('userSelect').value;
    const pass = document.getElementById('userPass').value;

    if (!instId) return Swal.fire("Hata", "Lütfen Kurum Kodu girin!", "error");
    
    // Eğer kurum henüz yüklenmediyse yükle
    if (currentInstitutionId !== instId) {
        const loaded = await populateUserSelect(instId);
        if (!loaded) return Swal.fire("Hata", "Geçersiz Kurum Kodu!", "error");
    }

    const user = usersData.find(u => u.name === name && u.pass === pass);
    if (user) { 
        currentUser = user; 
        localStorage.setItem('topclean_session', JSON.stringify(user)); 
        _routeUser(); 
    }
    else Swal.fire("Hata", "Hatalı şifre!", "error");
}

// Kurum kodu değiştikçe kullanıcı listesini tazele
document.addEventListener('DOMContentLoaded', () => {
    const instInput = document.getElementById('instCode');
    if (instInput) {
        instInput.addEventListener('blur', () => {
            const val = instInput.value.trim();
            if (val) populateUserSelect(val);
        });
    }

    // Formu bağla
    const form = document.getElementById('loginForm');
    if (form) form.onsubmit = handleLogin;

    // Oturum kontrolü
    const savedSession = localStorage.getItem('topclean_session');
    const savedInst = localStorage.getItem('topclean_inst_id');
    if (savedSession && savedInst) {
        currentUser = JSON.parse(savedSession);
        document.getElementById('instCode').value = savedInst;
        populateUserSelect(savedInst).then(() => {
             _routeUser();
        });
    } else {
        showPanel('loginPanel');
    }
});

function _routeUser() {
    if (!currentUser) { showPanel("loginPanel"); return; }
    document.getElementById("headerName").innerText = currentUser.name;
    panelHistory = [];
    if (currentUser.rol === "idareci") { showPanel("idarecPanel"); IdarecManager.renderCockpit(); }
    else if (currentUser.rol === "mufettis") { showPanel("adminPanel"); MufettisFocus.renderStream(); }
    else if (currentUser.rol === "liste") { showPanel("listePanel"); ListeManager.load(); }
    else if (currentUser.rol === "gorevli") { 
        showPanel("gorevliPanel"); 
        loadGorevliPanel(currentUser.kat);
        const emraBtn = document.getElementById('emraHocaArizaBtn');
        if (emraBtn) emraBtn.classList.toggle('d-none', currentUser.name !== "Emra Karabalak");
        
        const depoBtn = document.getElementById('burakHocaDepoBtn');
        if (depoBtn) depoBtn.classList.toggle('d-none', currentUser.name !== "Burakhan Karaoğlan");
    }
}

const ArizaManager = {
    bildirimModaliAc: function() {
        const select = document.getElementById('arizaBolumSec');
        if (!select) return;
        
        let optionsHtml = '';
        Object.keys(katlar).forEach(k => {
            optionsHtml += `<optgroup label="${k}">`;
            Object.keys(katlar[k]).forEach(b => {
                optionsHtml += `<option value="${k}|${b}">${b}</option>`;
            });
            optionsHtml += `</optgroup>`;
        });
        select.innerHTML = optionsHtml;

        const modal = new bootstrap.Modal(document.getElementById('arizaModal'));
        modal.show();
    },
    kaydet: function() {
        const bolum = document.getElementById('arizaBolumSec').value;
        const detay = document.getElementById('arizaDetayText').value;
        if (!detay) return Swal.fire("Hata", "Lütfen arıza detayını yazın.", "error");
        
        let arizaKat = currentUser.kat || "Bilinmiyor";
        let arizaBolum = bolum;
        if (bolum && bolum.includes('|')) {
            const parts = bolum.split('|');
            arizaKat = parts[0];
            arizaBolum = parts[1];
        }

        const yeniAriza = { id: Date.now().toString(), kat: arizaKat, bolum: arizaBolum, gorevli: currentUser.name, detay: detay, tarih: new Date().toISOString(), durum: "bekliyor" };
        saveAriza(yeniAriza);
        bootstrap.Modal.getInstance(document.getElementById('arizaModal')).hide();
        document.getElementById('arizaDetayText').value = "";
        Swal.fire("Başarılı", "Arıza bildirimi iletildi.", "success");
        loadGorevliPanel(currentUser.kat);
    },
    renderYonetim: function() {
        const container = document.getElementById('arizaYonetimListesi');
        if (!container) return;
        const activeArizalar = allArizalar.filter(a => a.durum !== 'cozuldu');
        container.innerHTML = activeArizalar.reverse().map(a => `
            <div class="glass-card p-4 shadow-lg border-emerald border-opacity-10 mb-3">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <div class="x-small text-emerald fw-bold text-uppercase">${a.kat} / ${a.bolum}</div>
                        <h3 class="h5 fw-bold text-white mb-0">${a.detay}</h3>
                    </div>
                    <div class="x-small text-muted">${new Date(a.tarih).toLocaleDateString('tr-TR')}</div>
                </div>
                <div class="d-flex flex-wrap gap-2">
                    <button onclick="ArizaManager.durumGuncelle('${a.id}', 'cozulemedi')" class="btn btn-sm btn-outline-danger flex-grow-1 rounded-pill ${a.durum==='cozulemedi'?'active':''}">Bekliyor</button>
                    <button onclick="ArizaManager.durumGuncelle('${a.id}', 'surec')" class="btn btn-sm btn-outline-warning flex-grow-1 rounded-pill ${a.durum==='surec'?'active':''}">Süreçte</button>
                    <button onclick="ArizaManager.durumGuncelle('${a.id}', 'cozuldu')" class="btn btn-sm btn-outline-success flex-grow-1 rounded-pill">Çözüldü</button>
                </div>
            </div>
        `).join('') || '<div class="text-center py-5 text-muted small">Arıza bildirimi yok.</div>';
    },
    durumGuncelle: function(id, yeniDurum) {
        const a = allArizalar.find(item => item.id === id);
        if (a) { a.durum = yeniDurum; saveAriza(a); this.renderYonetim(); }
    }
};

function syncFromCloud() {
    if (!db) return;
    
    // Raporları dinle
    db.ref('reports').on('value', snap => {
        if (snap.val()) {
            allReports = Object.values(snap.val());
            // Eğer idareci veya müfettiş panelindeysek paneli tazele
            if (currentUser) {
                if (currentUser.rol === 'idareci') IdarecManager.renderCockpit();
                if (currentUser.rol === 'mufettis') MufettisFocus.renderStream();
                if (currentUser.rol === 'gorevli') loadGorevliPanel(currentUser.kat);
            }
        }
    });

    // Arızaları dinle
    db.ref('arizalar').on('value', snap => {
        if (snap.val()) {
            allArizalar = Object.values(snap.val());
            const arizaPanel = document.getElementById('arizaYonetimPanel');
            if (arizaPanel && !arizaPanel.classList.contains('d-none')) ArizaManager.renderYonetim();
            if (currentUser && currentUser.rol === 'idareci') IdarecManager.renderAriza();
        }
    });

    // Envanteri dinle
    db.ref('inventory').on('value', snap => {
        if (snap.val()) {
            allInventory = Object.values(snap.val());
            const invPanel = document.getElementById('inventoryPanel');
            if (invPanel && !invPanel.classList.contains('d-none')) InventoryManager.render();
            if (currentUser && currentUser.rol === 'idareci') IdarecManager.renderSkor(); // Skoru tazele
        }
    });
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

    if (typeof ListeManager !== 'undefined' && ListeManager.renderLeadersUI) {
        ListeManager.renderLeadersUI();
    }
}

// --- PREMIUM LOGIN CINEMATIC ---
function initLoginBubbles() {
    const container = document.getElementById('loginBubbles');
    if (!container) return;
    container.innerHTML = ''; 
    for (let i = 0; i < 15; i++) {
        spawnPremiumBubble(container);
    }
}

function spawnPremiumBubble(container) {
    const bubble = document.createElement('div');
    bubble.className = 'premium-bubble';
    const size = 15 + Math.random() * 45;
    const duration = 15 + Math.random() * 25;
    const xMove = (Math.random() - 0.5) * 100 + 'px';
    const yMove = -(100 + Math.random() * 200) + 'px'; // Hepsi yukarı doğru çıksın
    
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    bubble.style.left = Math.random() * 100 + '%';
    bubble.style.bottom = '-50px'; // Aşağıdan başlasınlar
    bubble.style.setProperty('--duration', duration + 's');
    bubble.style.setProperty('--xMove', xMove);
    bubble.style.setProperty('--yMove', yMove);
    bubble.style.animationDelay = -(Math.random() * duration) + 's';
    
    container.appendChild(bubble);
    
    // Animasyon bittiğinde temizle ve yenisini çıkar
    setTimeout(() => {
        bubble.remove();
        spawnPremiumBubble(container);
    }, duration * 1000);
}

function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light-mode');
    const isLight = body.classList.contains('light-mode');
    localStorage.setItem('topclean_theme', isLight ? 'light' : 'dark');
    if (typeof ListeManager !== 'undefined' && ListeManager.renderLeadersUI) {
        ListeManager.renderLeadersUI();
    }
}

// ============================================================
// AERO-EMERALD LOGIN ANIMATION ENGINE
// ============================================================
function initAeroBackground() {
    const particlesEl = document.getElementById('particles');
    const dataLinesEl = document.getElementById('dataLines');
    if (!particlesEl || !dataLinesEl) return;

    // -- PARTICLES --
    for (let i = 0; i < 35; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = 1 + Math.random() * 3;
        p.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${Math.random() * 100}%;
            animation-duration: ${8 + Math.random() * 15}s;
            animation-delay: ${Math.random() * 10}s;
            opacity: ${0.3 + Math.random() * 0.7};
        `;
        particlesEl.appendChild(p);
    }

    // -- DATA LINES --
    for (let i = 0; i < 8; i++) {
        const line = document.createElement('div');
        line.className = 'data-line';
        const width = 100 + Math.random() * 200;
        line.style.cssText = `
            top: ${Math.random() * 100}%;
            width: ${width}px;
            animation-duration: ${5 + Math.random() * 8}s;
            animation-delay: ${Math.random() * 6}s;
        `;
        dataLinesEl.appendChild(line);
    }
}

function initGlitchEffect() {
    const el = document.getElementById('glitchTitle');
    if (!el) return;
    setInterval(() => {
        el.classList.add('glitching');
        setTimeout(() => el.classList.remove('glitching'), 200);
    }, 4000 + Math.random() * 3000);
}

function initPasswordToggle() {
    const toggle = document.getElementById('togglePassword');
    const passInput = document.getElementById('userPass');
    if (!toggle || !passInput) return;
    toggle.addEventListener('click', () => {
        const isPass = passInput.type === 'password';
        passInput.type = isPass ? 'text' : 'password';
        // swap icon
        toggle.setAttribute('data-lucide', isPass ? 'eye-off' : 'eye');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });
}

function setLoginBtnLoading(loading, success = false) {
    const btn = document.getElementById('loginBtn');
    if (!btn) return;
    const spinner = btn.querySelector('.spinner');
    const check = btn.querySelector('.success-check');
    const text = btn.querySelector('.btn-text');
    if (loading) {
        btn.classList.add('loading');
        btn.disabled = true;
        if (spinner) spinner.style.display = 'inline-block';
        if (text) text.textContent = 'GİRİŞ YAPILIYOR...';
    } else if (success) {
        if (spinner) spinner.style.display = 'none';
        if (check) check.style.display = 'inline';
        if (text) text.textContent = 'BAŞARILI!';
        btn.style.borderColor = '#00ff88';
        btn.style.background = 'rgba(0,255,136,0.15)';
    } else {
        btn.classList.remove('loading');
        btn.disabled = false;
        if (spinner) spinner.style.display = 'none';
        if (check) check.style.display = 'none';
        if (text) text.textContent = 'GİRİŞ YAP';
    }
}

// ============================================================
// PREMIUM CLEANING ANIMATION ENGINE (BUBBLES, FOAM, WIPE)
// ============================================================
let bubbleInterval = null;

function spawnPremiumBubble() {
    const container = document.getElementById('loginBubbles');
    if (!container) return;

    const bubble = document.createElement('div');
    bubble.classList.add('premium-bubble');

    // More variety in size and duration
    const size = Math.random() * 80 + 20;
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';

    bubble.style.left = Math.random() * 100 + '%';
    bubble.style.bottom = '-100px';

    // Horizontal drift
    const xMove = (Math.random() - 0.5) * 300;
    const yMove = -(window.innerHeight + 200);
    bubble.style.setProperty('--xMove', xMove + 'px');
    bubble.style.setProperty('--yMove', yMove + 'px');

    const duration = Math.random() * 10 + 10;
    bubble.style.setProperty('--duration', duration + 's');
    
    // Add random rotation speed
    const rotation = (Math.random() - 0.5) * 360;
    bubble.style.setProperty('--rotation', rotation + 'deg');

    container.appendChild(bubble);

    // Click to pop!
    bubble.style.pointerEvents = 'auto';
    bubble.addEventListener('mousedown', (e) => {
        createPopParticles(e.clientX, e.clientY);
        bubble.style.transform = 'scale(1.5)';
        bubble.style.opacity = '0';
        setTimeout(() => bubble.remove(), 200);
    });

    setTimeout(() => {
        if (bubble.parentNode) bubble.remove();
    }, duration * 1000);
}

function initLoginBubbles() {
    const container = document.getElementById('loginBubbles');
    if (!container) return;

    container.innerHTML = '';
    if (bubbleInterval) clearInterval(bubbleInterval);

    // Initial burst
    for (let i = 0; i < 20; i++) {
        setTimeout(() => spawnPremiumBubble(), Math.random() * 5000);
    }

    bubbleInterval = setInterval(() => {
        if (document.getElementById('loginBubbles')) {
            spawnPremiumBubble();
        } else {
            clearInterval(bubbleInterval);
        }
    }, 1200);
}

function initFoamLayer() {
    const container = document.getElementById('foamLayer');
    if (!container) return;
    
    container.innerHTML = '';
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'foam-particle';
        const size = 40 + Math.random() * 100;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.left = Math.random() * 100 + '%';
        p.style.bottom = (Math.random() * 20 - 10) + 'px';
        p.style.animationDelay = (Math.random() * 4) + 's';
        p.style.animationDuration = (3 + Math.random() * 3) + 's';
        container.appendChild(p);
    }
}

function createPopParticles(x, y) {
    const container = document.getElementById('loginBubbles');
    if (!container) return;

    for (let i = 0; i < 8; i++) {
        const p = document.createElement('div');
        p.style.position = 'absolute';
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        p.style.width = '4px';
        p.style.height = '4px';
        p.style.background = 'rgba(255,255,255,0.8)';
        p.style.borderRadius = '50%';
        p.style.pointerEvents = 'none';
        p.style.zIndex = '10';

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 5 + 2;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;

        container.appendChild(p);

        let op = 1;
        const anim = setInterval(() => {
            x += vx;
            y += vy;
            op -= 0.05;
            p.style.left = x + 'px';
            p.style.top = y + 'px';
            p.style.opacity = op;
            if (op <= 0) {
                clearInterval(anim);
                p.remove();
            }
        }, 16);
    }
}

function initCondensation() {
    const container = document.getElementById('glassDrops');
    if (!container) return;

    container.innerHTML = '';
    const dropCount = 150;
    for (let i = 0; i < dropCount; i++) {
        const drop = document.createElement('div');
        drop.className = 'glass-drop';
        const size = Math.random() * 8 + 2;
        drop.style.width = size + 'px';
        drop.style.height = (size * (1 + Math.random())) + 'px';
        drop.style.left = Math.random() * 100 + '%';
        drop.style.top = Math.random() * 100 + '%';
        drop.style.opacity = Math.random() * 0.5 + 0.2;
        container.appendChild(drop);
    }
}

function createWipeStreak(x, y, angle) {
    const container = document.getElementById('loginPanel');
    const streak = document.createElement('div');
    streak.className = 'wipe-streak';
    streak.style.left = x + 'vw';
    streak.style.top = y + 'vh';
    streak.style.width = '30vw';
    streak.style.transform = `rotate(${angle}deg)`;
    streak.style.opacity = '0.4';
    
    container.appendChild(streak);
    
    setTimeout(() => {
        streak.style.transition = 'opacity 1s, filter 1s';
        streak.style.opacity = '0';
        streak.style.filter = 'blur(10px)';
        setTimeout(() => streak.remove(), 1000);
    }, 100);
}

function performWipe(squeegee, mist) {
    let progress = 0;
    const duration = 2500;
    const start = performance.now();
    
    // Clear existing drops near the wipe path
    const drops = document.querySelectorAll('.glass-drop');

    function animate(time) {
        let elapsed = time - start;
        progress = Math.min(elapsed / duration, 1);

        const x = progress * 120; 
        const y = progress * 100;
        const angle = -35 + (progress * 15);

        squeegee.style.transform = `translate(${x}vw, ${y}vh) rotate(${angle}deg)`;

        // Cinematic Streak
        if (Math.random() > 0.7) {
            createWipeStreak(x, y, angle);
        }

        // Dynamic Reveal
        const linearMask = `linear-gradient(${135}deg, transparent ${progress * 120}%, black ${progress * 120 + 5}%)`;
        mist.style.webkitMaskImage = linearMask;

        // Clear droplets in the path
        drops.forEach(drop => {
            const dropX = parseFloat(drop.style.left);
            const dropY = parseFloat(drop.style.top);
            // Rough diagonal check
            if (dropX + dropY < progress * 200) {
                drop.style.opacity = '0';
                drop.style.transition = 'opacity 0.5s';
            }
        });

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            setTimeout(() => {
                squeegee.style.opacity = '0';
                squeegee.style.transition = 'opacity 1s';
            }, 500);
        }
    }

    requestAnimationFrame(animate);
}

function initPasswordToggle() {
    const toggle = document.getElementById('togglePassword');
    const passInput = document.getElementById('userPass');
    if (!toggle || !passInput) return;

    toggle.addEventListener('click', () => {
        const isPassword = passInput.type === 'password';
        passInput.type = isPassword ? 'text' : 'password';
        toggle.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    // Theme Init
    if (localStorage.getItem('topclean_theme') === 'light') {
        document.body.classList.add('light-mode');
    }

    populateUserSelect();
    const s = localStorage.getItem('topclean_session');
    if (s) { 
        currentUser = JSON.parse(s); 
        _routeUser(); 
    } else { 
        showPanel("loginPanel");
        // Boot Premium Login animations
        setTimeout(() => {
            initLoginBubbles();
            initFoamLayer();
            initCondensation();
            initSqueegeeWipe();
            initPasswordToggle();
        }, 100);
    }
    
    syncFromCloud();

    // ---- LOGIN FORM: New .login-btn submit handler ----
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            setLoginBtnLoading(true);
            // Small artificial delay for the cyberpunk feel
            await new Promise(r => setTimeout(r, 600));
            const result = handleLogin(e);
            // If handleLogin returns false (bad credentials), stop loader
            // handleLogin calls Swal internally and returns nothing on success
            if (result === false) {
                setLoginBtnLoading(false);
            } else {
                setLoginBtnLoading(false, true);
                // Give success animation a moment before routing
                setTimeout(() => {}, 500);
            }
        });
    }

    document.getElementById('logoutBtn')?.addEventListener('click', () => { 
        localStorage.removeItem('topclean_session'); 
        currentUser = null; 
        // Force a hard reload to clear any memory/cache issues as requested
        window.location.reload();
    });
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
    updateSyncStatus();
});

// --- SYNC & ONLINE STATUS ---
window.addEventListener('online', updateSyncStatus);
window.addEventListener('offline', updateSyncStatus);

function updateSyncStatus() {
    const indicator = document.getElementById('syncStatusIndicator');
    if (!indicator) return;
    
    if (navigator.onLine) {
        indicator.innerHTML = '<span class="pulse-dot bg-success"></span> <span class="x-small text-success">Bulut Senkronize</span>';
        indicator.title = "İnternet Bağlantısı Aktif";
    } else {
        indicator.innerHTML = '<span class="pulse-dot bg-danger"></span> <span class="x-small text-danger">Çevrimdışı (Yerel Kayıt)</span>';
        indicator.title = "İnternet Yok - Veriler Cihazda Tutuluyor";
    }
}

// --- MIGRATION & SETUP HELPER ---
// Bu nesne sadece ilk kurulumda veya yeni kurum eklerken konsoldan kullanılabilir.
const MigrationHelper = {
    setupNewInstitution: async function(instId, name, logo) {
        if (!db) return console.error("DB bağlantısı yok.");
        
        const config = {
            branding: {
                name: name || "TopClean",
                logo: logo || "icon-512.png"
            },
            floors: {
                "Bodrum Kat": {
                    "-1 Merdiven": ["Zemin süpürülmüş ve temiz", "Korkuluklar silinmiş ve tozsuz", "Çöp kutuları boşaltılmış", "Etraf düzenli", "Lekeler silinmiş"],
                    "Koridor": ["Zemin temiz", "Camlar silinmiş", "Çöp yok", "Koku yok", "Etraf Düzenli"],
                    "Wc": ["Zemin temiz", "Lavabolar temiz", "Koku yok", "Kağıt var", "Sabun var"]
                },
                "Zemin Kat": {
                    "Koridor": ["Zemin temiz", "Camlar silinmiş", "Çöp yok", "Koku yok", "Ayna Silinmiş"],
                    "İdareci Odası": ["Masa düzenli", "Zemin temiz", "Koku yok", "Koltuklar Temiz", "Çöp kutusu boş"]
                }
            },
            users: [
                { name: "Yurt Mesulü", pass: "1111", kat: "", rol: "idareci" },
                { name: "Müfettiş", pass: "1111", kat: "", rol: "mufettis" },
                { name: "Görevli", pass: "1234", kat: "Zemin Kat", rol: "gorevli" }
            ]
        };
        
        try {
            await db.ref(`institutions/${instId}/config`).set(config);
            console.log(`✅ ${instId} kurumu başarıyla oluşturuldu!`);
            Swal.fire("Başarılı", `${instId} kurumu oluşturuldu. Giriş yapabilirsiniz.`, "success");
        } catch (e) {
            console.error("Setup Error:", e);
        }
    }
};

// Global erişim için
window.MigrationHelper = MigrationHelper;
