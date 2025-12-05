
// ========================================
// PERFORMANCE OPTIMIZATION
// ========================================
const PRODUCTION_MODE = true; // Set to false for debugging
const log = PRODUCTION_MODE ? () => { } : console.log.bind(console);
const warn = PRODUCTION_MODE ? () => { } : console.warn.bind(console);
const error = console.error.bind(console); // Always log errors

// ========================================
// ========================================
// DATA SYNC VERIFICATION SYSTEM
// ========================================
let dataSyncCheckInterval = null;
let lastDataSyncCheck = null;
let dataSyncMismatches = [];
const DATA_SYNC_CHECK_INTERVAL = 5 * 60 * 1000; // 5 dakika

// ========================================
// ========================================
// NAVIGATION FUNCTIONS
// ========================================



// ========================================
// NAVIGATION FUNCTIONS - DÜZELTMİŞ VERSİYON
// ========================================
let isNavigationInProgress = false;

// ========================================
// CACHED DATA - Performance Optimization
// ========================================
const CACHED_LIST_NAMES = {
    atanacak: '📋 Atanacak',
    parcaBekliyor: '⚙️ Parça Bekliyor',
    phonecheck: '📱 PhoneCheck',
    gokhan: '🧑‍🔧 Gökhan',
    enes: '🧑‍🔧 Enes',
    yusuf: '🧑‍🔧 Yusuf',
    samet: '🧑‍🔧 Samet',
    engin: '🧑‍🔧 Engin',
    ismail: '🧑‍🔧 İsmail',
    mehmet: '🧑‍🔧 Mehmet',
    onarim: '🔧 Onarım Tamamlandı',
    onCamDisServis: '🔨 Ön Cam Dış Servis',
    anakartDisServis: '🔨 Anakart Dış Servis',
    satisa: '💰 Satışa Gidecek',
    sahiniden: '🏪 Sahibinden',
    mediaMarkt: '🛒 Media Markt',
    SonKullanıcı: '👤 Son Kullanıcı',
    teslimEdilenler: '✅ Teslim Edilenler'
};

function showMainView() {
    if (isNavigationInProgress) return;
    isNavigationInProgress = true;

    try {
        // ✅ TÜM PANELLERİ ÖNCE GİZLE
        document.getElementById('warehousePanel').style.display = 'none';
        document.getElementById('userManagement').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'none';

        // ✅ ANA LAYOUT'U GÖSTER
        document.getElementById('mainLayout').style.display = 'flex';

        // ✅ ADMIN PANEL - SADECE ADMIN VE SEMI-ADMIN
        if (currentUserRole === 'admin' || currentUserRole === 'semi-admin') {
            document.getElementById('adminPanel').style.display = 'block';
        }

        // ✅ DASHBOARD - SADECE ADMIN VE SEMI-ADMIN
        if (currentUserRole === 'admin' || currentUserRole === 'semi-admin') {
            document.getElementById('dashboardPanel').style.display = 'block';
            updateDashboardDate();
            loadDashboardStats();
        } else {
            document.getElementById('dashboardPanel').style.display = 'none';
        }

        // ✅ TIMEOUT DASHBOARD - TÜM KULLANICILAR (DEPOCU HARİÇ)
        if (currentUserRole !== 'warehouse') {
            document.getElementById('timeoutDashboardPanel').style.display = 'block';
            loadTimeoutDashboard(); // Son kaydedilen veriyi yükle

            // Click handler'ları başlat
            setTimeout(() => {
                initTimeoutDashboardClickHandlers();
            }, 100);
        } else {
            document.getElementById('timeoutDashboardPanel').style.display = 'none';
        }

        if (document.getElementById('reportsModal').classList.contains('active')) {
            closeReportsModalWithoutNavigation();
        }

        updateNavButtons('main');

        // ✅ ÖNEMLİ: Input listener'ları yeniden başlat
        setTimeout(() => {
            reinitializeAllInputListeners();
            log('✅ Ana sayfaya geçildi, input listener\'lar yeniden başlatıldı');
        }, 100);
    } finally {
        isNavigationInProgress = false;
    }
}

function showReportsView() {
    if (isNavigationInProgress) return;
    isNavigationInProgress = true;

    try {
        // Raporlar modal'ını aç
        document.getElementById('reportsModal').classList.add('active');

        // Navigasyon butonlarını güncelle
        updateNavButtons('reports');
    } finally {
        isNavigationInProgress = false;
    }
}

function showUserManagement() {
    if (isNavigationInProgress) return;
    isNavigationInProgress = true;

    try {
        // ✅ TÜM DİĞER PANELLERİ GİZLE
        document.getElementById('dashboardPanel').style.display = 'none';
        document.getElementById('mainLayout').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'none';
        document.getElementById('warehousePanel').style.display = 'none';

        // ✅ SADECE KULLANICI YÖNETİMİNİ GÖSTER
        document.getElementById('userManagement').style.display = 'block';

        // Modal'ları kapat
        if (document.getElementById('reportsModal').classList.contains('active')) {
            closeReportsModalWithoutNavigation();
        }

        // Navigasyon butonlarını güncelle
        updateNavButtons('users');

        // Kullanıcıları yükle (admin ise)
        if (currentUserRole === 'admin') {
            loadUsers();
        }
    } finally {
        isNavigationInProgress = false;
    }
}

function showSystemLogs() {
    if (currentUserRole !== 'admin') {
        alert('Bu özelliğe sadece admin erişebilir!');
        return;
    }

    // Modal'ı aç
    document.getElementById('systemLogsModal').style.display = 'flex';

    // Bugünün tarihini varsayılan olarak ayarla
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('logsEndDate').value = today;

    // Başlangıç tarihi: 7 gün önce
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    document.getElementById('logsStartDate').value = weekAgo.toISOString().split('T')[0];

    // Navigasyon butonlarını güncelle
    updateNavButtons('systemLogs');
}

function closeReportsModal() {
    document.getElementById('reportsModal').classList.remove('active');
    disableExcelExport();
}

// Yeni fonksiyon: Navigasyon olmadan rapor modalını kapat
function closeReportsModalWithoutNavigation() {
    document.getElementById('reportsModal').classList.remove('active');
    disableExcelExport();
}
function updateNavButtons(activeButton) {
    const buttons = {
        'main': document.getElementById('mainViewBtn'),
        'reports': document.getElementById('reportsBtn'),
        'users': document.getElementById('userManagementBtn'),
        'warehouse': document.getElementById('warehouseViewBtn'),
        'priceList': document.getElementById('priceListBtn'),
        'accounting': document.getElementById('accountingBtn'),
        'systemLogs': document.getElementById('systemLogsBtn')
    };

    // Tüm butonlardan active class'ını kaldır
    Object.values(buttons).forEach(btn => {
        if (btn) btn.classList.remove('active');
    });

    // Aktif butona active class'ını ekle
    if (buttons[activeButton]) {
        buttons[activeButton].classList.add('active');
    }
}

// Fiyat Listesi sayfasını aç
function openPriceList() {
    window.open('fiyatlar.html', '_blank');
}

// Muhasebe Sistemi sayfasını aç
function openAccounting() {
    window.open('muhasebe.html', '_blank');
}


// Depocu butonunu göster/gizle
function toggleWarehouseButton() {
    const warehouseBtn = document.getElementById('warehouseViewBtn');
    if (warehouseBtn) {
        warehouseBtn.style.display = (currentUserRole === 'warehouse') ? 'block' : 'none';
    }
}

function closeReportsModal() {
    document.getElementById('reportsModal').classList.remove('active');
    disableExcelExport();

    if (currentUserRole === 'admin') {
        showMainView();
    }
}

// ========================================
// REPORTS - generateReport FONKSİYONU DEĞİŞTİRİLECEK
// ========================================

// YENİ KOD BAŞLADI - Eski generateReport fonksiyonunu tamamen değiştir
// ========================================
// REPORTS - generateReport FONKSİYONU DEĞİŞTİRİLECEK
// ========================================

// YENİ KOD BAŞLADI - Eski generateReport fonksiyonunu tamamen değiştir
async function generateReport() {
    const startDateInput = document.getElementById('reportStartDate').value;
    const endDateInput = document.getElementById('reportEndDate').value;
    const listSelect = document.getElementById('reportList').value;

    if (!startDateInput || !endDateInput) {
        alert('Lütfen başlangıç ve bitiş tarihlerini seçin!');
        return;
    }

    // Parça İsteklerim için özel rapor
    if (listSelect === 'partOrders') {
        await generatePartOrdersReport(startDateInput, endDateInput);
        return;
    }

    // Teslim Edilenler için özel rapor
    if (listSelect === 'teslimEdilenler') {
        await generateDeliveryReport(startDateInput, endDateInput);
        return;
    }

    // Service Returns için özel rapor
    if (listSelect === 'serviceReturn') {
        await generateServiceReturnReport(startDateInput, endDateInput);
        return;
    }

    // Bugün Teslim Alınan için özel rapor
    if (listSelect === 'dailyReceived') {
        await generateDailyReceivedReport(startDateInput, endDateInput);
        return;
    }

    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);
    endDate.setHours(23, 59, 59, 999);

    if (startDate > endDate) {
        alert('Başlangıç tarihi bitiş tarihinden büyük olamaz!');
        return;
    }

    const startOfPeriod = startDate.getTime();
    const endOfPeriod = endDate.getTime();

    try {
        const reportResults = document.getElementById('reportResults');
        reportResults.innerHTML = '<div style="text-align: center; padding: 20px;"><div style="display: inline-block; width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 1s linear infinite;"></div></div>';
        reportResults.classList.add('active');

        const listsToCheck = listSelect ? [listSelect] : Object.keys(userCodes);
        let totalActions = 0;
        let userStats = {};
        let detailsData = [];

        for (const listName of listsToCheck) {
            const snapshot = await db.ref(`servis/history`).once('value');
            const historyData = snapshot.val();

            if (!historyData) continue;

            for (const [barcode, barcodeHistory] of Object.entries(historyData)) {
                const historyArray = Object.values(barcodeHistory);

                // PhoneCheck geçmişini kontrol et
                let phoneCheckInfo = null;
                const phoneCheckEntry = historyArray.find(entry => entry.to === 'phonecheck');
                if (phoneCheckEntry) {
                    phoneCheckInfo = {
                        user: phoneCheckEntry.user,
                        timestamp: phoneCheckEntry.timestamp,
                        action: 'Giriş'
                    };
                }

                // Seçilen listeye tarih aralığında giriş yapan kayıtları bul
                const entryToList = historyArray.find(entry =>
                    entry.to === listName &&
                    entry.timestampRaw >= startOfPeriod &&
                    entry.timestampRaw <= endOfPeriod
                );

                if (!entryToList) continue;

                totalActions++;

                const user = entryToList.user || 'Bilinmeyen';
                userStats[user] = (userStats[user] || 0) + 1;

                // Barkodun şu anki durumunu belirle
                const isCurrentlyInList = userCodes[listName] && userCodes[listName].has(barcode);
                let currentStatus = '';
                let statusColor = '';

                if (isCurrentlyInList) {
                    currentStatus = '✅ Aktif (Halen Bu Listede)';
                    statusColor = '#2ecc71';
                } else {
                    let foundInOtherList = false;
                    for (const [otherListName, codeSet] of Object.entries(userCodes)) {
                        if (codeSet.has(barcode)) {
                            const listNames = {
                                atanacak: '📋 Atanacak',
                                parcaBekliyor: '⚙️ Parça Bekliyor',
                                phonecheck: '📱 PhoneCheck',
                                gokhan: '🧑‍🔧 Gökhan',
                                enes: '🧑‍🔧 Enes',
                                yusuf: '🧑‍🔧 Yusuf',
                                samet: '🧑‍🔧 Samet',
                                engin: '🧑‍🔧 Engin',
                                ismail: '🧑‍🔧 İsmail',
                                mehmet: '🧑‍🔧 Mehmet',
                                onarim: '🔧 Onarım Tamamlandı',
                                onCamDisServis: '🔨 Ön Cam Dış Servis',
                                anakartDisServis: '🔨 Anakart Dış Servis',
                                satisa: '💰 Satışa Gidecek',
                                sahiniden: '🏪 Sahibinden',
                                mediaMarkt: '🛒 Media Markt',
                                SonKullanıcı: '👤 Son Kullanıcı',
                                teslimEdilenler: '✅ Teslim Edilenler'
                            };
                            currentStatus = `⏭️ Taşındı: ${listNames[otherListName] || otherListName}`;
                            statusColor = '#95a5a6';
                            foundInOtherList = true;
                            break;
                        }
                    }

                    if (!foundInOtherList) {
                        currentStatus = '❌ Sistemde Yok (Silinmiş/Teslim Edilmiş)';
                        statusColor = '#e74c3c';
                    }
                }

                const listNames = {
                    atanacak: '📋 Atanacak',
                    parcaBekliyor: '⚙️ Parça Bekliyor',
                    phonecheck: '📱 PhoneCheck',
                    gokhan: '🧑‍🔧 Gökhan',
                    enes: '🧑‍🔧 Enes',
                    yusuf: '🧑‍🔧 Yusuf',
                    samet: '🧑‍🔧 Samet',
                    engin: '🧑‍🔧 Engin',
                    ismail: '🧑‍🔧 İsmail',
                    mehmet: '🧑‍🔧 Mehmet',
                    onarim: '🔧 Onarım Tamamlandı',
                    onCamDisServis: '🔨 Ön Cam Dış Servis',
                    anakartDisServis: '🔨 Anakart Dış Servis',
                    satisa: '💰 Satışa Gidecek',
                    sahiniden: '🏪 Sahibinden',
                    mediaMarkt: '🛒 Media Markt',
                    SonKullanıcı: '👤 Son Kullanıcı',
                    teslimEdilenler: '✅ Teslim Edilenler'
                };

                const fromName = listNames[entryToList.from] || entryToList.from;
                const toName = listNames[entryToList.to] || entryToList.to;

                // Parça sipariş bilgilerini al
                let partOrderInfo = null;
                try {
                    const partOrdersSnapshot = await db.ref('partOrders').once('value');
                    const allPartOrders = partOrdersSnapshot.val();
                    if (allPartOrders) {
                        // Bu barkoda ait tüm siparişleri bul
                        const matchingOrders = Object.entries(allPartOrders)
                            .filter(([_, order]) => order.barcode === barcode)
                            .sort(([_, a], [__, b]) => b.timestamp - a.timestamp);

                        if (matchingOrders.length > 0) {
                            partOrderInfo = matchingOrders.map(([orderId, order]) => ({
                                model: order.model,
                                customer: order.customer || '',
                                statusField: order.statusField || '',
                                service: order.service || '',
                                note: order.note || '',
                                parts: order.parts.map(p => p.name).join(', '),
                                technician: order.technician,
                                status: order.status
                            }));
                        }
                    }
                } catch (error) {
                    console.error('Parça bilgileri alınırken hata:', error);
                }

                detailsData.push({
                    barcode: barcode,
                    fromName: fromName,
                    toName: toName,
                    user: user,
                    timestamp: entryToList.timestamp,
                    entryDate: entryToList.timestampRaw,
                    currentStatus: currentStatus,
                    statusColor: statusColor,
                    isActive: isCurrentlyInList,
                    phoneCheckInfo: phoneCheckInfo,
                    partOrderInfo: partOrderInfo,
                    rawData: entryToList
                });
            }
        }

        if (totalActions === 0) {
            reportResults.innerHTML = `
          <div class="no-results">
            📭 Seçilen tarih ve liste için kayıt bulunamadı.
          </div>
        `;
            return;
        }

        // Kayıtları sırala: Önce aktif olanlar, sonra taşınanlar
        detailsData.sort((a, b) => {
            if (a.isActive && !b.isActive) return -1;
            if (!a.isActive && b.isActive) return 1;
            return b.entryDate - a.entryDate;
        });

        const listName = listSelect ? document.querySelector(`#reportList option[value="${listSelect}"]`).textContent : 'Tüm Listeler';
        const dateRangeText = `${startDateInput} - ${endDateInput}`;

        const activeCount = detailsData.filter(item => item.isActive).length;
        const movedCount = detailsData.filter(item => !item.isActive).length;

        let summaryHTML = `
        <div class="report-summary">
          <div class="summary-card">
            <div class="label">Toplam Kayıt</div>
            <div class="value">${totalActions}</div>
          </div>
          <div class="summary-card" style="background: rgba(46, 204, 113, 0.2);">
            <div class="label">✅ Aktif (Halen Bu Listede)</div>
            <div class="value" style="color: #2ecc71;">${activeCount}</div>
          </div>
          <div class="summary-card" style="background: rgba(149, 165, 166, 0.2);">
            <div class="label">⏭️ Taşınmış</div>
            <div class="value" style="color: #95a5a6;">${movedCount}</div>
          </div>
          <div class="summary-card">
            <div class="label">Tarih Aralığı</div>
            <div class="value" style="font-size: 16px;">${dateRangeText}</div>
          </div>
          <div class="summary-card">
            <div class="label">Rapor Türü</div>
            <div class="value" style="font-size: 14px;">${listName}</div>
          </div>
        </div>
      `;

        let userStatsHTML = '<div class="user-stats"><h4>👥 Kullanıcı İstatistikleri</h4>';
        const sortedUsers = Object.entries(userStats).sort((a, b) => b[1] - a[1]);
        sortedUsers.forEach(([user, count]) => {
            userStatsHTML += `
          <div class="user-stat-item">
            <span class="user-stat-name">👤 ${user}</span>
            <span class="user-stat-count">${count} kayıt</span>
          </div>
        `;
        });
        userStatsHTML += '</div>';

        const detailFiltersHTML = `
        <div class="detail-filters">
          <input type="text" class="detail-filter-input" id="detailBarcodeFilter" placeholder="🔍 Barkod ara...">
          <input type="text" class="detail-filter-input" id="detailUserFilter" placeholder="👤 Kullanıcı ara...">
          <input type="text" class="detail-filter-input" id="detailStatusFilter" placeholder="📍 Durum ara...">
          <select class="detail-filter-input" id="detailActiveFilter">
            <option value="">Tüm Kayıtlar</option>
            <option value="active">✅ Sadece Aktif</option>
            <option value="moved">⏭️ Sadece Taşınmış</option>
          </select>
        </div>
        <div class="filter-info" id="filterInfo">
          Toplam ${detailsData.length} kayıt gösteriliyor (✅ ${activeCount} Aktif, ⏭️ ${movedCount} Taşınmış)
        </div>
        <button class="clear-filters-btn" onclick="clearDetailFilters()" style="display: none;" id="clearFiltersBtn">
          🗑️ Filtreleri Temizle
        </button>
      `;

        let detailsHTML = '<div class="detail-list-container" id="detailListContainer">';
        detailsData.forEach(item => {
            detailsHTML += `
          <div class="detail-item" data-barcode="${item.barcode}" data-user="${item.user}" 
               data-status="${item.currentStatus}" 
               data-active="${item.isActive ? 'active' : 'moved'}"
               data-phonecheck="${item.phoneCheckInfo ? 'var' : 'yok'}"
               style="border-left: 4px solid ${item.statusColor};">
            <div class="barcode">${item.barcode}</div>
            <div class="info">${item.fromName} → ${item.toName}</div>
            <div class="info">👤 ${item.user} • 🕒 ${item.timestamp}</div>
            ${item.phoneCheckInfo ? `
              <div class="info" style="color: #3498db;">
                📱 PhoneCheck: ${item.phoneCheckInfo.action} - ${item.phoneCheckInfo.user} (${item.phoneCheckInfo.timestamp})
              </div>
            ` : `
              <div class="info" style="color: #95a5a6;">
                📱 PhoneCheck: Yok
              </div>
            `}
            ${item.partOrderInfo && item.partOrderInfo.length > 0 ? `
              <div class="info" style="color: #2ecc71; margin-top: 5px; padding: 8px; background: rgba(46, 204, 113, 0.1); border-radius: 6px;">
                <strong>🔧 Parça Siparişleri:</strong>
                ${item.partOrderInfo.map((order, idx) => `
                  <div style="margin-top: 5px; padding-left: 10px; border-left: 2px solid rgba(46, 204, 113, 0.5);">
                    ${item.partOrderInfo.length > 1 ? `<strong>Sipariş #${idx + 1}:</strong><br>` : ''}
                    <strong>Model:</strong> ${order.model}<br>
                    ${order.customer ? `<strong>Müşteri/Bayi:</strong> ${order.customer}<br>` : ''}
                    ${order.statusField ? `<strong>Statü:</strong> ${order.statusField}<br>` : ''}
                    ${order.service ? `<strong>Hizmet:</strong> ${order.service}<br>` : ''}
                    ${order.note ? `<strong>Not:</strong> ${order.note}<br>` : ''}
                    <strong>Parçalar:</strong> ${order.parts}<br>
                    <strong>Teknisyen:</strong> ${order.technician}
                  </div>
                `).join('')}
              </div>
            ` : ''}
            <div class="info" style="color: ${item.statusColor}; font-weight: bold;">
              ${item.currentStatus}
            </div>
          </div>
        `;
        });
        detailsHTML += '</div>';

        reportResults.innerHTML = `
        ${summaryHTML}
        ${userStatsHTML}
        <div class="report-details">
          <h3>📋 Detaylı Kayıt Listesi</h3>
          ${detailFiltersHTML}
          ${detailsHTML}
        </div>
      `;

        setupDetailFiltersEnhanced(detailsData, activeCount, movedCount);
        enableExcelExport({
            details: detailsData,
            totalActions,
            activeCount,
            movedCount,
            userCount: Object.keys(userStats).length,
            userStats,
            reportDate: dateRangeText,
            selectedList: listName
        });

    } catch (error) {
        console.error('Rapor oluşturulurken hata:', error);
        alert('Rapor oluşturulurken hata oluştu!');
        document.getElementById('reportResults').innerHTML = `
        <div class="no-results">
          ❌ Rapor oluşturulurken bir hata oluştu.
        </div>
      `;
    }
}
// YENİ KOD BİTTİ - generateReport fonksiyonu sonu
// YENİ KOD BİTTİ - generateReport fonksiyonu sonu
// ========================================
// PARÇA İSTEKLERİM RAPORU
// ========================================
async function generatePartOrdersReport(startDateInput, endDateInput) {
    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);
    endDate.setHours(23, 59, 59, 999);

    if (startDate > endDate) {
        alert('Başlangıç tarihi bitiş tarihinden büyük olamaz!');
        return;
    }

    const startOfPeriod = startDate.getTime();
    const endOfPeriod = endDate.getTime();

    try {
        const reportResults = document.getElementById('reportResults');
        reportResults.innerHTML = '<div style="text-align: center; padding: 20px;"><div style="display: inline-block; width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 1s linear infinite;"></div></div>';
        reportResults.classList.add('active');

        const snapshot = await db.ref('partOrders').once('value');
        const ordersData = snapshot.val();

        if (!ordersData) {
            reportResults.innerHTML = `
        <div class="no-results">
          📭 Seçilen tarih aralığında parça siparişi bulunamadı.
        </div>
      `;
            return;
        }

        let totalOrders = 0;
        let pendingCount = 0;
        let readyCount = 0;
        let ordersArray = [];
        let technicianStats = {};
        let statusStats = { pending: 0, ready: 0 };

        for (const [orderId, order] of Object.entries(ordersData)) {
            // Tarih aralığında mı kontrol et
            if (order.timestamp >= startOfPeriod && order.timestamp <= endOfPeriod) {
                totalOrders++;

                if (order.status === 'pending') {
                    pendingCount++;
                } else if (order.status === 'ready') {
                    readyCount++;
                }

                statusStats[order.status] = (statusStats[order.status] || 0) + 1;

                // Teknisyen istatistikleri
                technicianStats[order.technician] = (technicianStats[order.technician] || 0) + 1;

                ordersArray.push({
                    orderId: orderId,
                    ...order
                });
            }
        }

        if (totalOrders === 0) {
            reportResults.innerHTML = `
        <div class="no-results">
          📭 Seçilen tarih aralığında parça siparişi bulunamadı.
        </div>
      `;
            return;
        }

        // Tarihe göre sırala (en yeni önce)
        ordersArray.sort((a, b) => b.timestamp - a.timestamp);

        const dateRangeText = `${startDateInput} - ${endDateInput}`;

        let summaryHTML = `
      <div class="report-summary">
        <div class="summary-card">
          <div class="label">Toplam İstek</div>
          <div class="value">${totalOrders}</div>
        </div>
        <div class="summary-card" style="background: rgba(243, 156, 18, 0.2);">
          <div class="label">⏳ Bekleyen</div>
          <div class="value" style="color: #f39c12;">${pendingCount}</div>
        </div>
        <div class="summary-card" style="background: rgba(46, 204, 113, 0.2);">
          <div class="label">✅ Hazır</div>
          <div class="value" style="color: #2ecc71;">${readyCount}</div>
        </div>
        <div class="summary-card">
          <div class="label">Tarih Aralığı</div>
          <div class="value" style="font-size: 16px;">${dateRangeText}</div>
        </div>
      </div>
    `;

        let techStatsHTML = '<div class="user-stats"><h4>👥 Teknisyen İstatistikleri</h4>';
        const sortedTechs = Object.entries(technicianStats).sort((a, b) => b[1] - a[1]);
        sortedTechs.forEach(([tech, count]) => {
            techStatsHTML += `
        <div class="user-stat-item">
          <span class="user-stat-name">👤 ${tech}</span>
          <span class="user-stat-count">${count} istek</span>
        </div>
      `;
        });
        techStatsHTML += '</div>';

        let ordersHTML = '<div class="report-details"><h3>🔧 Parça Siparişleri Detayı</h3>';
        ordersArray.forEach(order => {
            const statusColor = order.status === 'ready' ? '#2ecc71' : '#f39c12';
            const statusText = order.status === 'ready' ? '✅ Hazır' : '⏳ Bekliyor';

            ordersHTML += `
        <div class="detail-item" style="border-left: 4px solid ${statusColor};">
          <div class="barcode">${order.barcode}</div>
          <div class="info"><strong>📱 Model:</strong> ${order.model}</div>
          ${order.customer ? `<div class="info"><strong>👤 Müşteri/Bayi:</strong> ${order.customer}</div>` : ''}
          ${order.statusField ? `<div class="info"><strong>📊 Statü:</strong> ${order.statusField}</div>` : ''}
          ${order.service ? `<div class="info"><strong>🔧 Hizmet:</strong> ${order.service}</div>` : ''}
          ${order.technicianDamage ? `<div class="info"><strong>⚠️ Teknisyen Hasarı:</strong> ${order.technicianDamage}</div>` : ''}
          <div class="info"><strong>🧑‍🔧 Teknisyen:</strong> ${order.technician}</div>
          <div class="info"><strong>📦 Parçalar:</strong> ${order.parts && Array.isArray(order.parts) ? order.parts.map(p => p.name).join(', ') : 'Parça bilgisi yok'}</div>
          ${order.note ? `<div class="info" style="background: rgba(241, 196, 15, 0.1); padding: 8px; border-radius: 6px; margin-top: 5px;"><strong>📝 Not:</strong> ${order.note}</div>` : ''}
          <div class="info"><strong>📅 Tarih:</strong> ${order.timestampReadable}</div>
          <div class="info" style="color: ${statusColor}; font-weight: bold;">
            ${statusText}
          </div>
        </div>
      `;
        });
        ordersHTML += '</div>';

        reportResults.innerHTML = `
      ${summaryHTML}
      ${techStatsHTML}
      ${ordersHTML}
    `;

        enableExcelExport({
            isPartOrdersReport: true,
            totalOrders,
            pendingCount,
            readyCount,
            technicianStats,
            ordersArray,
            reportDate: dateRangeText
        });

    } catch (error) {
        console.error('Parça istekleri raporu oluşturulurken hata:', error);
        alert('Parça istekleri raporu oluşturulurken hata oluştu!');
        document.getElementById('reportResults').innerHTML = `
      <div class="no-results">
        ❌ Parça istekleri raporu oluşturulurken bir hata oluştu.
      </div>
    `;
    }
}

async function generateDeliveryReport(startDateInput, endDateInput) {
    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);
    endDate.setHours(23, 59, 59, 999);

    if (startDate > endDate) {
        alert('Başlangıç tarihi bitiş tarihinden büyük olamaz!');
        return;
    }

    const startOfPeriod = startDate.getTime();
    const endOfPeriod = endDate.getTime();

    try {
        const reportResults = document.getElementById('reportResults');
        reportResults.innerHTML = '<div style="text-align: center; padding: 20px;"><div style="display: inline-block; width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 1s linear infinite;"></div></div>';
        reportResults.classList.add('active');

        const snapshot = await db.ref(`servis/history`).once('value');
        const historyData = snapshot.val();

        if (!historyData) {
            reportResults.innerHTML = `
          <div class="no-results">
            📭 Seçilen tarih aralığında teslim edilen cihaz bulunamadı.
          </div>
        `;
            return;
        }

        let totalDelivered = 0;
        let deliveredIMEIs = [];
        let sourceBreakdown = {
            atanacak: 0,
            SonKullanıcı: 0,
            sahiniden: 0,
            mediaMarkt: 0
        };
        let dailyBreakdown = {};
        let userStats = {};

        for (const [barcode, barcodeHistory] of Object.entries(historyData)) {
            const historyArray = Object.values(barcodeHistory);

            const deliveryEntry = historyArray.find(entry =>
                entry.to === 'teslimEdilenler' &&
                entry.timestampRaw >= startOfPeriod &&
                entry.timestampRaw <= endOfPeriod
            );

            if (!deliveryEntry) continue;

            totalDelivered++;

            const user = deliveryEntry.user || 'Bilinmeyen';
            userStats[user] = (userStats[user] || 0) + 1;

            let source = 'atanacak';
            for (const entry of historyArray) {
                if (entry.to === 'teslimEdilenler') break;
                if (['atanacak', 'SonKullanıcı', 'sahiniden', 'mediaMarkt'].includes(entry.from)) {
                    source = entry.from;
                    break;
                }
            }

            sourceBreakdown[source] = (sourceBreakdown[source] || 0) + 1;

            const deliveryDate = new Date(deliveryEntry.timestampRaw).toISOString().split('T')[0];
            dailyBreakdown[deliveryDate] = (dailyBreakdown[deliveryDate] || 0) + 1;

            let phoneCheckInfo = null;
            const phoneCheckEntry = historyArray.find(entry => entry.to === 'phonecheck');
            if (phoneCheckEntry) {
                phoneCheckInfo = {
                    user: phoneCheckEntry.user,
                    timestamp: phoneCheckEntry.timestamp,
                    action: 'Giriş'
                };
            }

            // Parça sipariş bilgilerini al
            let partOrderInfo = null;
            try {
                const partOrdersSnapshot = await db.ref('partOrders').once('value');
                const allPartOrders = partOrdersSnapshot.val();
                if (allPartOrders) {
                    // Bu barkoda ait tüm siparişleri bul
                    const matchingOrders = Object.entries(allPartOrders)
                        .filter(([_, order]) => order.barcode === barcode)
                        .sort(([_, a], [__, b]) => b.timestamp - a.timestamp);

                    if (matchingOrders.length > 0) {
                        partOrderInfo = matchingOrders.map(([orderId, order]) => ({
                            model: order.model,
                            customer: order.customer || '',
                            statusField: order.statusField || '',
                            service: order.service || '',
                            note: order.note || '',
                            parts: order.parts.map(p => p.name).join(', '),
                            technician: order.technician,
                            status: order.status
                        }));
                    }
                }
            } catch (error) {
                console.error('Parça bilgileri alınırken hata:', error);
            }

            deliveredIMEIs.push({
                imei: barcode,
                source: source,
                user: user,
                timestamp: deliveryEntry.timestamp,
                timestampRaw: deliveryEntry.timestampRaw,
                phoneCheckInfo: phoneCheckInfo,
                partOrderInfo: partOrderInfo
            });
        }

        if (totalDelivered === 0) {
            reportResults.innerHTML = `
          <div class="no-results">
            📭 Seçilen tarih aralığında teslim edilen cihaz bulunamadı.
          </div>
        `;
            return;
        }

        const dayCount = Object.keys(dailyBreakdown).length;
        const avgPerDay = (totalDelivered / dayCount).toFixed(1);

        const dateRangeText = `${startDateInput} - ${endDateInput}`;

        let summaryHTML = `
        <div class="report-summary">
          <div class="summary-card">
            <div class="label">Toplam Teslim</div>
            <div class="value">${totalDelivered}</div>
          </div>
          <div class="summary-card">
            <div class="label">Gün Sayısı</div>
            <div class="value">${dayCount}</div>
          </div>
          <div class="summary-card">
            <div class="label">Günlük Ortalama</div>
            <div class="value">${avgPerDay}</div>
          </div>
          <div class="summary-card">
            <div class="label">Tarih Aralığı</div>
            <div class="value" style="font-size: 16px;">${dateRangeText}</div>
          </div>
        </div>
      `;

        let sourceHTML = '<div class="report-details"><h3>📊 Kaynak Bazlı Dağılım</h3>';
        const sourceNames = {
            atanacak: '📋 Atanacak',
            SonKullanıcı: '👤 Son Kullanıcı',
            sahiniden: '🏪 Sahibinden',
            mediaMarkt: '🛒 Media Markt'
        };

        Object.entries(sourceBreakdown).forEach(([source, count]) => {
            if (count > 0) {
                const percentage = ((count / totalDelivered) * 100).toFixed(1);
                sourceHTML += `
            <div class="detail-item">
              <div class="barcode">${sourceNames[source] || source}</div>
              <div class="info">${count} adet (%${percentage})</div>
            </div>
          `;
            }
        });
        sourceHTML += '</div>';

        let userStatsHTML = '<div class="user-stats"><h4>👥 Kullanıcı İstatistikleri</h4>';
        const sortedUsers = Object.entries(userStats).sort((a, b) => b[1] - a[1]);
        sortedUsers.forEach(([user, count]) => {
            userStatsHTML += `
          <div class="user-stat-item">
            <span class="user-stat-name">👤 ${user}</span>
            <span class="user-stat-count">${count} teslim</span>
          </div>
        `;
        });
        userStatsHTML += '</div>';

        let dailyHTML = '<div class="report-details"><h3>📅 Günlük Teslim Detayı</h3>';
        const sortedDays = Object.entries(dailyBreakdown)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .slice(0, 10);

        sortedDays.forEach(([date, count]) => {
            const dateObj = new Date(date);
            const formattedDate = dateObj.toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });

            dailyHTML += `
          <div class="detail-item">
            <div class="barcode">${formattedDate}</div>
            <div class="info">${count} teslim</div>
          </div>
        `;
        });

        if (Object.keys(dailyBreakdown).length > 10) {
            dailyHTML += `<div class="info" style="text-align: center; color: rgba(255,255,255,0.7);">
          ...ve ${Object.keys(dailyBreakdown).length - 10} gün daha
        </div>`;
        }
        dailyHTML += '</div>';

        let imeiHTML = '<div class="report-details"><h3>📱 Son Teslim Edilen Cihazlar</h3>';
        const recentIMEIs = deliveredIMEIs
            .sort((a, b) => b.timestampRaw - a.timestampRaw)
            .slice(0, 50);

        recentIMEIs.forEach(item => {
            const sourceName = sourceNames[item.source] || item.source;
            imeiHTML += `
          <div class="detail-item">
            <div class="barcode">${item.imei}</div>
            <div class="info">${sourceName} • 👤 ${item.user}</div>
            <div class="info">📅 ${item.timestamp}</div>
            ${item.phoneCheckInfo ? `
              <div class="info" style="color: #3498db;">
                📱 PhoneCheck: ${item.phoneCheckInfo.action} - ${item.phoneCheckInfo.user}
              </div>
            ` : ''}
            ${item.partOrderInfo && item.partOrderInfo.length > 0 ? `
              <div class="info" style="color: #2ecc71; margin-top: 5px; padding: 8px; background: rgba(46, 204, 113, 0.1); border-radius: 6px;">
                <strong>🔧 Parça Siparişleri:</strong>
                ${item.partOrderInfo.map((order, idx) => `
                  <div style="margin-top: 5px; padding-left: 10px; border-left: 2px solid rgba(46, 204, 113, 0.5);">
                    ${item.partOrderInfo.length > 1 ? `<strong>Sipariş #${idx + 1}:</strong><br>` : ''}
                    <strong>Model:</strong> ${order.model}<br>
                    ${order.customer ? `<strong>Müşteri/Bayi:</strong> ${order.customer}<br>` : ''}
                    ${order.statusField ? `<strong>Statü:</strong> ${order.statusField}<br>` : ''}
                    ${order.service ? `<strong>Hizmet:</strong> ${order.service}<br>` : ''}
                    ${order.note ? `<strong>Not:</strong> ${order.note}<br>` : ''}
                    <strong>Parçalar:</strong> ${order.parts}<br>
                    <strong>Teknisyen:</strong> ${order.technician}
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `;
        });

        if (deliveredIMEIs.length > 50) {
            imeiHTML += `<div class="info" style="text-align: center; color: rgba(255,255,255,0.7);">
          ...ve ${deliveredIMEIs.length - 50} cihaz daha
        </div>`;
        }
        imeiHTML += '</div>';

        reportResults.innerHTML = `
        ${summaryHTML}
        ${sourceHTML}
        ${userStatsHTML}
        ${dailyHTML}
        ${imeiHTML}
      `;

        enableExcelExport({
            isDeliveryReport: true,
            totalDelivered,
            dayCount,
            avgPerDay,
            sourceBreakdown,
            dailyBreakdown,
            deliveredIMEIs,
            userStats,
            reportDate: dateRangeText
        });

    } catch (error) {
        console.error('Teslim edilenler raporu oluşturulurken hata:', error);
        alert('Teslim edilenler raporu oluşturulurken hata oluştu!');
        document.getElementById('reportResults').innerHTML = `
        <div class="no-results">
          ❌ Teslim edilenler raporu oluşturulurken bir hata oluştu.
        </div>
      `;
    }
}

// ========================================
// YENİ FONKSİYON EKLENECEK - setupDetailFiltersEnhanced
// ========================================

// YENİ KOD BAŞLADI - Geliştirilmiş filtreleme fonksiyonu (eskisinin yerine geçiyor)
function setupDetailFiltersEnhanced(detailsData, activeCount, movedCount) {
    const barcodeFilter = document.getElementById('detailBarcodeFilter');
    const userFilter = document.getElementById('detailUserFilter');
    const statusFilter = document.getElementById('detailStatusFilter');
    const activeFilter = document.getElementById('detailActiveFilter');
    const filterInfo = document.getElementById('filterInfo');
    const detailItems = document.querySelectorAll('.detail-item');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');

    function updateClearButton() {
        const hasFilters = barcodeFilter.value || userFilter.value || statusFilter.value || activeFilter.value;
        clearFiltersBtn.style.display = hasFilters ? 'block' : 'none';
    }

    function applyFilters() {
        const barcodeValue = barcodeFilter.value.toLowerCase();
        const userValue = userFilter.value.toLowerCase();
        const statusValue = statusFilter.value.toLowerCase();
        const activeValue = activeFilter.value;

        let visibleCount = 0;
        let visibleActive = 0;
        let visibleMoved = 0;

        detailItems.forEach(item => {
            const barcode = item.getAttribute('data-barcode').toLowerCase();
            const user = item.getAttribute('data-user').toLowerCase();
            const status = item.getAttribute('data-status').toLowerCase();
            const isActive = item.getAttribute('data-active');

            const matchesBarcode = barcode.includes(barcodeValue);
            const matchesUser = user.includes(userValue);
            const matchesStatus = status.includes(statusValue);
            const matchesActive = !activeValue || isActive === activeValue;

            if (matchesBarcode && matchesUser && matchesStatus && matchesActive) {
                item.classList.remove('hidden');
                visibleCount++;
                if (isActive === 'active') visibleActive++;
                else visibleMoved++;
            } else {
                item.classList.add('hidden');
            }
        });

        filterInfo.textContent = `${visibleCount} kayıt gösteriliyor (✅ ${visibleActive} Aktif, ⏭️ ${visibleMoved} Taşınmış) - Toplam: ${detailsData.length}`;
        updateClearButton();

        if (visibleCount === 0) {
            const container = document.getElementById('detailListContainer');
            if (!container.querySelector('.no-detail-results')) {
                const noResults = document.createElement('div');
                noResults.className = 'no-detail-results';
                noResults.innerHTML = `
            Filtre kriterlerinize uygun kayıt bulunamadı.
            <button class="clear-filters-btn" onclick="clearDetailFilters()" style="margin-top: 10px;">
              🗑️ Filtreleri Temizle
            </button>
          `;
                container.innerHTML = '';
                container.appendChild(noResults);
            }
        } else {
            const noResults = document.querySelector('.no-detail-results');
            if (noResults) {
                noResults.remove();
            }
        }
    }

    [barcodeFilter, userFilter, statusFilter, activeFilter].forEach(input => {
        input.addEventListener('input', () => {
            applyFilters();
            updateClearButton();
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyFilters();
                updateClearButton();
            }
        });
    });

    updateClearButton();
}
// YENİ KOD BİTTİ

// ========================================
// clearDetailFilters FONKSİYONU DEĞİŞTİRİLECEK
// ========================================

// DEĞİŞTİRİLECEK BAŞLADI - Mevcut fonksiyona activeFilter temizleme ekleniyor
function clearDetailFilters() {
    document.getElementById('detailBarcodeFilter').value = '';
    document.getElementById('detailUserFilter').value = '';
    document.getElementById('detailStatusFilter').value = '';
    document.getElementById('detailActiveFilter').value = '';

    const detailItems = document.querySelectorAll('.detail-item');
    detailItems.forEach(item => {
        item.classList.remove('hidden');
    });

    const filterInfo = document.getElementById('filterInfo');
    if (filterInfo) {
        filterInfo.textContent = `Toplam ${detailItems.length} kayıt gösteriliyor`;
    }

    document.getElementById('clearFiltersBtn').style.display = 'none';

    const noResults = document.querySelector('.no-detail-results');
    if (noResults) {
        noResults.remove();
    }

    alert('Filtreler temizlendi!');
}
// DEĞİŞTİRİLECEK BİTTİ
function clearDetailFilters() {
    document.getElementById('detailBarcodeFilter').value = '';
    document.getElementById('detailUserFilter').value = '';
    document.getElementById('detailListFilter').value = '';
    document.getElementById('detailStatusFilter').value = ''; // BU SATIRI EKLEYİN

    // Filtreleri uygula (tüm kayıtları göster)
    const detailItems = document.querySelectorAll('.detail-item');
    detailItems.forEach(item => {
        item.classList.remove('hidden');
    });

    // Bilgi mesajını güncelle
    const filterInfo = document.getElementById('filterInfo');
    if (filterInfo) {
        filterInfo.textContent = `Toplam ${detailItems.length} kayıt gösteriliyor`;
    }

    // Clear butonunu gizle
    document.getElementById('clearFiltersBtn').style.display = 'none';

    // No-results mesajını temizle
    const noResults = document.querySelector('.no-detail-results');
    if (noResults) {
        noResults.remove();
    }

    showToast('Filtreler temizlendi!', 'info');
}

// ========================================
// EXCEL EXPORT FUNCTIONALITY
// ========================================
let currentReportData = null;

function enableExcelExport(data) {
    currentReportData = data;
    document.getElementById('exportExcelBtn').disabled = false;
}

function disableExcelExport() {
    currentReportData = null;
    document.getElementById('exportExcelBtn').disabled = true;
}

function exportToExcel() {
    if (!currentReportData) {
        alert('Önce rapor oluşturmanız gerekiyor!');
        return;
    }

    try {
        // Parça İsteklerim raporu için özel export
        if (currentReportData.isPartOrdersReport) {
            exportPartOrdersReportToExcel();
            return;
        }

        // Service Return raporu için özel export
        if (currentReportData.isServiceReturnReport) {
            exportServiceReturnReportToExcel();
            return;
        }

        // Daily Received raporu için özel export
        if (currentReportData.isDailyReceivedReport) {
            exportDailyReceivedReportToExcel();
            return;
        }

        // Delivery raporu için özel export
        if (currentReportData.isDeliveryReport) {
            exportDeliveryReportToExcel();
            return;
        }

        // Normal rapor için mevcut kod
        const workbook = XLSX.utils.book_new();

        // Sheet 1: Özet Bilgiler
        const summaryData = [
            ['RAPOR ÖZETİ'],
            [''],
            ['Rapor Tarihi:', currentReportData.reportDate || 'Bilinmiyor'],
            ['Seçilen Liste:', currentReportData.selectedList || 'Tümü'],
            ['Toplam İşlem:', currentReportData.totalActions || 0],
            ['Aktif Kullanıcı Sayısı:', currentReportData.userCount || 0],
            [''],
            ['KULLANICI İSTATİSTİKLERİ'],
            ['Kullanıcı', 'İşlem Sayısı']
        ];

        if (currentReportData.userStats) {
            Object.entries(currentReportData.userStats)
                .sort((a, b) => b[1] - a[1])
                .forEach(([user, count]) => {
                    summaryData.push([user, count]);
                });
        }

        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Özet');

        // Sheet 2: Detaylı Liste
        if (currentReportData.details && currentReportData.details.length > 0) {
            const detailHeaders = ['Barkod', 'Model', 'Müşteri/Bayi', 'Statü', 'Hizmet', 'Not', 'Kimden', 'Kime', 'Kullanıcı', 'Tarih', 'Güncel Durum', 'PhoneCheck Bilgisi', 'Parça Siparişleri'];
            const detailRows = currentReportData.details.map(item => {
                // Model ve diğer bilgileri parça siparişlerinden al
                let model = '';
                let customer = '';
                let statusField = '';
                let service = '';
                let note = '';
                let parts = '';

                if (item.partOrderInfo && item.partOrderInfo.length > 0) {
                    // İlk siparişin bilgilerini al
                    model = item.partOrderInfo[0].model || '';
                    customer = item.partOrderInfo[0].customer || '';
                    statusField = item.partOrderInfo[0].statusField || '';
                    service = item.partOrderInfo[0].service || '';
                    note = item.partOrderInfo[0].note || '';
                    // Tüm parçaları birleştir
                    parts = item.partOrderInfo.map((order, idx) => {
                        let orderText = item.partOrderInfo.length > 1 ? `Sipariş ${idx + 1}: ` : '';
                        orderText += `${order.parts} (${order.technician})`;
                        if (order.customer) orderText += ` - ${order.customer}`;
                        if (order.statusField) orderText += ` - ${order.statusField}`;
                        if (order.service) orderText += ` - ${order.service}`;
                        return orderText;
                    }).join(' | ');
                }

                return [
                    item.barcode,
                    model,
                    customer,
                    statusField,
                    service,
                    note,
                    item.fromName,
                    item.toName,
                    item.user,
                    item.timestamp,
                    item.currentStatus,
                    item.phoneCheckInfo ?
                        `${item.phoneCheckInfo.action} - ${item.phoneCheckInfo.user} (${item.phoneCheckInfo.timestamp})` :
                        'Yok',
                    parts || 'Yok'
                ];
            });

            const detailData = [detailHeaders, ...detailRows];
            const detailSheet = XLSX.utils.aoa_to_sheet(detailData);

            detailSheet['!cols'] = [
                { wch: 15 },  // Barkod
                { wch: 20 },  // Model
                { wch: 20 },  // Müşteri/Bayi
                { wch: 20 },  // Statü
                { wch: 20 },  // Hizmet
                { wch: 30 },  // Not
                { wch: 20 },  // Kimden
                { wch: 20 },  // Kime
                { wch: 15 },  // Kullanıcı
                { wch: 18 },  // Tarih
                { wch: 25 },  // Güncel Durum
                { wch: 30 },  // PhoneCheck
                { wch: 40 }   // Parça Siparişleri
            ];

            XLSX.utils.book_append_sheet(workbook, detailSheet, 'Detaylı Liste');
        }

        const fileName = `Rapor_${currentReportData.reportDate?.replace(/\s/g, '_') || 'Bilinmiyor'}.xlsx`;
        XLSX.writeFile(workbook, fileName);

        alert('Excel dosyası başarıyla indirildi! 📊');
    } catch (error) {
        console.error('Excel export hatası:', error);
        alert('Excel dosyası oluşturulurken hata oluştu!');
    }
}

// Service Return Raporu için Excel Export
function exportServiceReturnReportToExcel() {
    try {
        const workbook = XLSX.utils.book_new();

        // Sheet 1: Özet
        const summaryData = [
            ['SERVİSE GERİ DÖNÜŞ RAPORU'],
            [''],
            ['Tarih Aralığı:', currentReportData.reportDate || 'Bilinmiyor'],
            ['Toplam Geri Dönüş:', currentReportData.totalReturns || 0],
            ['Aktif Cihazlar:', currentReportData.activeCount || 0],
            ['Sistemden Çıkanlar:', currentReportData.deletedCount || 0],
            [''],
            ['KULLANICI İSTATİSTİKLERİ'],
            ['Kullanıcı', 'Geri Dönüş Sayısı']
        ];

        if (currentReportData.userStats) {
            Object.entries(currentReportData.userStats)
                .sort((a, b) => b[1] - a[1])
                .forEach(([user, count]) => {
                    summaryData.push([user, count]);
                });
        }

        summaryData.push([''], ['HEDEF LİSTE DAĞILIMI'], ['Hedef Liste', 'Sayı']);

        if (currentReportData.targetListStats) {
            Object.entries(currentReportData.targetListStats)
                .sort((a, b) => b[1] - a[1])
                .forEach(([target, count]) => {
                    const listNames = {
                        atanacak: '📋 Atanacak',
                        gokhan: '🧑‍🔧 Gökhan',
                        enes: '🧑‍🔧 Enes',
                        yusuf: '🧑‍🔧 Yusuf',
                        samet: '🧑‍🔧 Samet',
                        engin: '🧑‍🔧 Engin',
                        ismail: '🧑‍🔧 İsmail',
                        mehmet: '🧑‍🔧 Mehmet',
                        onarim: '🔧 Onarım Tamamlandı',
                        phonecheck: '📱 PhoneCheck',
                        parcaBekliyor: '⚙️ Parça Bekliyor',
                        onCamDisServis: '🔨 Ön Cam Dış Servis',
                        anakartDisServis: '🔨 Anakart Dış Servis',
                        satisa: '💰 Satışa Gidecek',
                        sahiniden: '🏪 Sahibinden',
                        mediaMarkt: '🛒 Media Markt',
                        SonKullanıcı: '👤 Son Kullanıcı'
                    };

                    const displayName = listNames[target] || `🧑‍🔧 ${target.charAt(0).toUpperCase() + target.slice(1)}`;
                    summaryData.push([displayName, count]);
                });
        }

        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Özet');

        // Sheet 2: Detaylı Liste
        if (currentReportData.returnDetails && currentReportData.returnDetails.length > 0) {
            const detailHeaders = [
                'Barkod',
                'Kullanıcı',
                'Hedef Liste',
                'Geri Dönüş Tarihi',
                'Şu Anki Durum',
                'Şu Anki Liste',
                'Geçmiş Hareket'
            ];

            const detailRows = currentReportData.returnDetails.map(item => {
                const listNames = {
                    atanacak: '📋 Atanacak',
                    gokhan: '🧑‍🔧 Gökhan',
                    enes: '🧑‍🔧 Enes',
                    yusuf: '🧑‍🔧 Yusuf',
                    samet: '🧑‍🔧 Samet',
                    engin: '🧑‍🔧 Engin',
                    ismail: '🧑‍🔧 İsmail',
                    mehmet: '🧑‍🔧 Mehmet',
                    onarim: '🔧 Onarım Tamamlandı',
                    phonecheck: '📱 PhoneCheck',
                    parcaBekliyor: '⚙️ Parça Bekliyor',
                    onCamDisServis: '🔨 Ön Cam Dış Servis',
                    anakartDisServis: '🔨 Anakart Dış Servis',
                    satisa: '💰 Satışa Gidecek',
                    sahiniden: '🏪 Sahibinden',
                    mediaMarkt: '🛒 Media Markt',
                    SonKullanıcı: '👤 Son Kullanıcı',
                    teslimEdilenler: '✅ Teslim Edilenler'
                };

                const targetName = listNames[item.targetList] || item.targetList;
                const currentListName = listNames[item.currentList] || item.currentList;

                let historyInfo = '';
                if (item.historyEntry) {
                    historyInfo = `${item.historyEntry.from} → ${item.historyEntry.to}`;
                } else if (item.fromServiceReturns) {
                    historyInfo = 'Service Returns Kaydı';
                }

                return [
                    item.barcode,
                    item.user,
                    targetName,
                    item.timestamp,
                    item.currentStatus,
                    currentListName || 'Yok',
                    historyInfo
                ];
            });

            const detailData = [detailHeaders, ...detailRows];
            const detailSheet = XLSX.utils.aoa_to_sheet(detailData);

            detailSheet['!cols'] = [
                { wch: 18 },
                { wch: 15 },
                { wch: 20 },
                { wch: 20 },
                { wch: 30 },
                { wch: 20 },
                { wch: 25 }
            ];

            XLSX.utils.book_append_sheet(workbook, detailSheet, 'Detaylı Liste');
        }

        // Sheet 3: Günlük Dağılım
        if (currentReportData.returnDetails && currentReportData.returnDetails.length > 0) {
            const dailyStats = {};

            currentReportData.returnDetails.forEach(item => {
                const dateStr = new Date(item.timestampRaw).toISOString().split('T')[0];
                const formattedDate = new Date(dateStr).toLocaleDateString('tr-TR');
                dailyStats[formattedDate] = (dailyStats[formattedDate] || 0) + 1;
            });

            const dailyHeaders = ['Tarih', 'Geri Dönüş Sayısı'];
            const dailyRows = Object.entries(dailyStats)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([date, count]) => [date, count]);

            const dailyData = [dailyHeaders, ...dailyRows];
            const dailySheet = XLSX.utils.aoa_to_sheet(dailyData);

            dailySheet['!cols'] = [
                { wch: 15 },
                { wch: 18 }
            ];

            XLSX.utils.book_append_sheet(workbook, dailySheet, 'Günlük Dağılım');
        }

        const fileName = `Servis_Geri_Donus_${currentReportData.reportDate?.replace(/\s/g, '_') || 'Bilinmiyor'}.xlsx`;
        XLSX.writeFile(workbook, fileName);

        alert('Servis Geri Dönüş Excel dosyası başarıyla indirildi! 📊');
    } catch (error) {
        console.error('Service Return Excel export hatası:', error);
        alert('Excel dosyası oluşturulurken hata oluştu!');
    }
}

// Daily Received Raporu için Excel Export
function exportDailyReceivedReportToExcel() {
    try {
        const workbook = XLSX.utils.book_new();

        // Sheet 1: Özet
        const summaryData = [
            ['GÜNLÜK TESLİM ALINAN RAPORU'],
            [''],
            ['Tarih Aralığı:', currentReportData.reportDate || 'Bilinmiyor'],
            ['Toplam Teslim Alınan:', currentReportData.totalReceived || 0],
            ['Gün Sayısı:', currentReportData.dayCount || 0],
            ['Günlük Ortalama:', currentReportData.avgPerDay || 0],
            [''],
            ['KAYNAK BAZLI DAĞILIM'],
            ['Kaynak', 'Adet', 'Yüzde']
        ];

        if (currentReportData.sourceStats) {
            const sourceNames = {
                atanacak: '📋 Atanacak',
                SonKullanıcı: '👤 Son Kullanıcı',
                sahiniden: '🏪 Sahibinden',
                mediaMarkt: '🛒 Media Markt',
                serviceReturn: '🔄 Servise Geri Dönenler'
            };

            Object.entries(currentReportData.sourceStats).forEach(([source, count]) => {
                if (count > 0) {
                    const percentage = ((count / currentReportData.totalReceived) * 100).toFixed(1);
                    summaryData.push([sourceNames[source] || source, count, `%${percentage}`]);
                }
            });
        }

        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Özet');

        // Sheet 2: Detaylı Liste
        if (currentReportData.receivedDetails && currentReportData.receivedDetails.length > 0) {
            const detailHeaders = [
                'Barkod',
                'Kaynak',
                'Kullanıcı',
                'Tarih',
                'Servis Geri Dönüş',
                'Orijinal Hedef',
                'IMEI Geçmişi'
            ];

            const detailRows = currentReportData.receivedDetails.map(item => {
                const sourceNames = {
                    atanacak: '📋 Atanacak',
                    SonKullanıcı: '👤 Son Kullanıcı',
                    sahiniden: '🏪 Sahibinden',
                    mediaMarkt: '🛒 Media Markt',
                    serviceReturn: '🔄 Servise Geri Dönenler'
                };

                return [
                    item.barcode,
                    sourceNames[item.source] || item.source,
                    item.user,
                    item.timestamp,
                    item.isServiceReturn ? 'Evet' : 'Hayır',
                    item.originalTarget || '',
                    item.imeiDetails || ''
                ];
            });

            const detailData = [detailHeaders, ...detailRows];
            const detailSheet = XLSX.utils.aoa_to_sheet(detailData);

            detailSheet['!cols'] = [
                { wch: 18 },
                { wch: 20 },
                { wch: 15 },
                { wch: 20 },
                { wch: 15 },
                { wch: 20 },
                { wch: 40 }
            ];

            XLSX.utils.book_append_sheet(workbook, detailSheet, 'Detaylı Liste');
        }

        // Sheet 3: Kullanıcı İstatistikleri
        if (currentReportData.userStats) {
            const userHeaders = ['Kullanıcı', 'Teslim Alım Sayısı'];
            const userRows = Object.entries(currentReportData.userStats)
                .sort((a, b) => b[1] - a[1])
                .map(([user, count]) => [user, count]);

            const userData = [userHeaders, ...userRows];
            const userSheet = XLSX.utils.aoa_to_sheet(userData);

            userSheet['!cols'] = [
                { wch: 20 },
                { wch: 18 }
            ];

            XLSX.utils.book_append_sheet(workbook, userSheet, 'Kullanıcı İstatistikleri');
        }

        const fileName = `Gunluk_Teslim_Alinan_${currentReportData.reportDate?.replace(/\s/g, '_') || 'Bilinmiyor'}.xlsx`;
        XLSX.writeFile(workbook, fileName);

        alert('Günlük Teslim Alınan Excel dosyası başarıyla indirildi! 📊');
    } catch (error) {
        console.error('Daily Received Excel export hatası:', error);
        alert('Excel dosyası oluşturulurken hata oluştu!');
    }
}


// Parça İsteklerim Raporu için Excel Export
function exportPartOrdersReportToExcel() {
    try {
        const workbook = XLSX.utils.book_new();

        // Sheet 1: Özet
        const summaryData = [
            ['PARÇA İSTEKLERİM RAPORU'],
            [''],
            ['Tarih Aralığı:', currentReportData.reportDate || 'Bilinmiyor'],
            ['Toplam İstek:', currentReportData.totalOrders || 0],
            ['Bekleyen:', currentReportData.pendingCount || 0],
            ['Hazır:', currentReportData.readyCount || 0],
            [''],
            ['TEKNİSYEN İSTATİSTİKLERİ'],
            ['Teknisyen', 'İstek Sayısı']
        ];

        if (currentReportData.technicianStats) {
            Object.entries(currentReportData.technicianStats)
                .sort((a, b) => b[1] - a[1])
                .forEach(([tech, count]) => {
                    summaryData.push([tech, count]);
                });
        }

        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Özet');

        // Sheet 2: Detaylı Parça İstekleri
        if (currentReportData.ordersArray && currentReportData.ordersArray.length > 0) {
            const detailHeaders = [
                'TARİH',
                'MODEL',
                'IMEI',
                'TEKNİSYEN',
                'TEKNİSYEN HASARI',
                'STATU',
                'MÜŞTERİ',
                'HİZMETLER',
                '1.PARÇA',
                '2.PARÇA',
                '3.PARÇA',
                '4.PARÇA',
                'NOT',
                'DURUM'
            ];

            const detailRows = currentReportData.ordersArray.map(order => {
                // Parçaları ayır (maksimum 4) - güvenli kontrol ekle
                const parts = order.parts && Array.isArray(order.parts) ? order.parts : [];
                const part1 = parts[0] ? parts[0].name : '';
                const part2 = parts[1] ? parts[1].name : '';
                const part3 = parts[2] ? parts[2].name : '';
                const part4 = parts[3] ? parts[3].name : '';

                return [
                    order.timestampReadable,
                    order.model,
                    order.barcode,
                    order.technician,
                    order.technicianDamage || '',
                    order.statusField || '',
                    order.customer || '',
                    order.service || '',
                    part1,
                    part2,
                    part3,
                    part4,
                    order.note || '',
                    order.status === 'ready' ? 'HAZIR' : 'BEKLİYOR'
                ];
            });

            const detailData = [detailHeaders, ...detailRows];
            const detailSheet = XLSX.utils.aoa_to_sheet(detailData);

            detailSheet['!cols'] = [
                { wch: 18 },  // TARİH
                { wch: 20 },  // MODEL
                { wch: 16 },  // IMEI
                { wch: 15 },  // TEKNİSYEN
                { wch: 18 },  // TEKNİSYEN HASARI
                { wch: 20 },  // STATU
                { wch: 20 },  // MÜŞTERİ
                { wch: 20 },  // HİZMETLER
                { wch: 20 },  // 1.PARÇA
                { wch: 20 },  // 2.PARÇA
                { wch: 20 },  // 3.PARÇA
                { wch: 20 },  // 4.PARÇA
                { wch: 40 },  // NOT
                { wch: 12 }   // DURUM
            ];

            XLSX.utils.book_append_sheet(workbook, detailSheet, 'Parça İstekleri');
        }

        const fileName = `Parca_Isteklerim_${currentReportData.reportDate?.replace(/\s/g, '_') || 'Bilinmiyor'}.xlsx`;
        XLSX.writeFile(workbook, fileName);

        alert('Excel dosyası başarıyla indirildi! 📊');
    } catch (error) {
        console.error('Excel export hatası:', error);
        alert('Excel dosyası oluşturulurken hata oluştu!');
    }
}

function exportDeliveryReportToExcel() {
    try {
        const workbook = XLSX.utils.book_new();

        // Sheet 1: Özet
        const summaryData = [
            ['TESLİM EDİLENLER RAPORU'],
            [''],
            ['Tarih Aralığı:', currentReportData.reportDate || 'Bilinmiyor'],
            ['Toplam Teslim:', currentReportData.totalDelivered || 0],
            ['Gün Sayısı:', currentReportData.dayCount || 0],
            ['Günlük Ortalama:', currentReportData.avgPerDay || 0],
            [''],
            ['KAYNAK BAZLI DAĞILIM'],
            ['Kaynak', 'Adet', 'Yüzde']
        ];

        if (currentReportData.sourceBreakdown) {
            const sourceNames = {
                atanacak: '📋 Atanacak',
                SonKullanıcı: '👤 Son Kullanıcı',
                sahiniden: '🏪 Sahibinden',
                mediaMarkt: '🛒 Media Markt'
            };

            Object.entries(currentReportData.sourceBreakdown).forEach(([source, count]) => {
                if (count > 0) {
                    const percentage = ((count / currentReportData.totalDelivered) * 100).toFixed(1);
                    summaryData.push([sourceNames[source] || source, count, `%${percentage}`]);
                }
            });
        }

        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Özet');

        // Sheet 2: IMEI Detayları
        if (currentReportData.deliveredIMEIs && currentReportData.deliveredIMEIs.length > 0) {
            const imeiHeaders = ['IMEI', 'Model', 'Müşteri/Bayi', 'Statü', 'Hizmet', 'Not', 'Kaynak', 'Kullanıcı', 'Tarih', 'Saat', 'PhoneCheck Bilgisi', 'Parça Siparişleri'];
            const imeiRows = currentReportData.deliveredIMEIs.map(item => {
                const dateObj = new Date(item.timestampRaw);
                const sourceNames = {
                    atanacak: '📋 Atanacak',
                    SonKullanıcı: '👤 Son Kullanıcı',
                    sahiniden: '🏪 Sahibinden',
                    mediaMarkt: '🛒 Media Markt'
                };

                let phoneCheckText = 'Yok';
                if (item.phoneCheckInfo) {
                    phoneCheckText = `${item.phoneCheckInfo.action} - ${item.phoneCheckInfo.user} (${item.phoneCheckInfo.timestamp})`;
                }

                // Model ve diğer bilgileri parça siparişlerinden al
                let model = '';
                let customer = '';
                let statusField = '';
                let service = '';
                let note = '';
                let parts = '';

                if (item.partOrderInfo && item.partOrderInfo.length > 0) {
                    model = item.partOrderInfo[0].model || '';
                    customer = item.partOrderInfo[0].customer || '';
                    statusField = item.partOrderInfo[0].statusField || '';
                    service = item.partOrderInfo[0].service || '';
                    note = item.partOrderInfo[0].note || '';
                    parts = item.partOrderInfo.map((order, idx) => {
                        let orderText = item.partOrderInfo.length > 1 ? `Sipariş ${idx + 1}: ` : '';
                        orderText += `${order.parts} (${order.technician})`;
                        if (order.customer) orderText += ` - ${order.customer}`;
                        if (order.statusField) orderText += ` - ${order.statusField}`;
                        if (order.service) orderText += ` - ${order.service}`;
                        return orderText;
                    }).join(' | ');
                }

                return [
                    item.imei,
                    model,
                    customer,
                    statusField,
                    service,
                    note,
                    sourceNames[item.source] || item.source,
                    item.user,
                    dateObj.toLocaleDateString('tr-TR'),
                    dateObj.toLocaleTimeString('tr-TR'),
                    phoneCheckText,
                    parts || 'Yok'
                ];
            });

            const imeiData = [imeiHeaders, ...imeiRows];
            const imeiSheet = XLSX.utils.aoa_to_sheet(imeiData);

            imeiSheet['!cols'] = [
                { wch: 18 },  // IMEI
                { wch: 20 },  // Model
                { wch: 20 },  // Müşteri/Bayi
                { wch: 20 },  // Statü
                { wch: 20 },  // Hizmet
                { wch: 30 },  // Not
                { wch: 20 },  // Kaynak
                { wch: 15 },  // Kullanıcı
                { wch: 12 },  // Tarih
                { wch: 10 },  // Saat
                { wch: 40 },  // PhoneCheck
                { wch: 40 }   // Parça Siparişleri
            ];

            XLSX.utils.book_append_sheet(workbook, imeiSheet, 'IMEI Detayları');
        }

        // Sheet 3: Günlük Detay
        if (currentReportData.dailyBreakdown) {
            const dailyHeaders = ['Tarih', 'Teslim Edilen Sayısı'];
            const dailyRows = Object.entries(currentReportData.dailyBreakdown)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([date, count]) => {
                    const dateObj = new Date(date);
                    const formattedDate = dateObj.toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long'
                    });
                    return [formattedDate, count];
                });

            const dailyData = [dailyHeaders, ...dailyRows];
            const dailySheet = XLSX.utils.aoa_to_sheet(dailyData);

            dailySheet['!cols'] = [
                { wch: 35 },
                { wch: 20 }
            ];

            XLSX.utils.book_append_sheet(workbook, dailySheet, 'Günlük Detay');
        }

        const fileName = `Teslim_Edilenler_${currentReportData.reportDate?.replace(/\s/g, '_') || 'Bilinmiyor'}.xlsx`;
        XLSX.writeFile(workbook, fileName);

        alert('Excel dosyası başarıyla indirildi! 📊');
    } catch (error) {
        console.error('Excel export hatası:', error);
        alert('Excel dosyası oluşturulurken hata oluştu!');
    }
}



// İndir


let dailyReceivedIMEIs = new Set(); // Bugün teslim alınan IMEI'ler
let dailyDeliveredCount = 0; // Bugün teslim edilen sayısı

let lastCheckedDate = null; // Son kontrol edilen tarih


function checkMidnightReset() {
    const today = getTodayDateString();

    // İlk çalıştırmada lastCheckedDate'i set et
    if (!lastCheckedDate) {
        lastCheckedDate = today;
        console.log(`✅ İlk kontrol - Tarih: ${today}`);
        return;
    }

    // Tarih değiştiyse sıfırla
    if (lastCheckedDate !== today) {
        console.log(`🌙 Gece yarısı geçti (Türkiye saati): ${lastCheckedDate} → ${today}`);

        // Lokal değişkenleri sıfırla
        dailyReceivedIMEIs.clear();
        dailyDeliveredCount = 0;

        // UI'ı güncelle
        updateDashboardUI({});

        // Yeni günü kaydet
        lastCheckedDate = today;

        showToast('Günlük sayaçlar sıfırlandı - Yeni güne hoş geldiniz! 🌅', 'info');
    }
}


setInterval(checkMidnightReset, 60000); // 60 saniye - Optimized



// Senkronizasyon modalını aç
function openSyncModal() {
    log('🔄 openSyncModal called');
    const modal = document.getElementById('syncModal');
    log('Sync modal element:', modal);
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex'; // Force display
        log('Modal class list:', modal.classList);
    }
    analyzeSyncIssues();
}

// Senkronizasyon modalını kapat
function closeSyncModal() {
    log('❌ closeSyncModal called');
    const modal = document.getElementById('syncModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

// Çakışmaları analiz et
async function analyzeSyncIssues() {
    const syncResults = document.getElementById('syncResults');
    const fixAllBtn = document.getElementById('fixAllBtn');

    if (!syncResults) return;

    try {
        // Tüm listelerdeki barkodları kontrol et
        const conflicts = [];

        // Tüm barkodları topla
        const allBarcodes = new Set();
        Object.values(userCodes).forEach(set => {
            if (set && set.forEach) {
                set.forEach(barcode => allBarcodes.add(barcode));
            }
        });

        // Her barkod için hangi listelerde olduğunu kontrol et
        for (const barcode of allBarcodes) {
            const lists = [];
            Object.entries(userCodes).forEach(([listName, codeSet]) => {
                if (codeSet && codeSet.has && codeSet.has(barcode)) {
                    lists.push(listName);
                }
            });

            // Eğer birden fazla listedeyse çakışma var
            if (lists.length > 1) {
                conflicts.push({
                    barcode: barcode,
                    lists: lists,
                    priority: getListPriority(lists)
                });
            }
        }

        if (conflicts.length === 0) {
            syncResults.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #2ecc71;">
                    <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
                    <h3>Harika! Hiç çakışma bulunamadı.</h3>
                    <p>Tüm barkodlar doğru listelerde.</p>
                </div>
            `;
            if (fixAllBtn) fixAllBtn.disabled = true;
            return;
        }

        // Çakışmaları grupla
        const phonecheckOnarimConflicts = conflicts.filter(c =>
            c.lists.includes('phonecheck') && c.lists.includes('onarim')
        );

        const onarimTeslimConflicts = conflicts.filter(c =>
            c.lists.includes('onarim') && c.lists.includes('teslimEdilenler')
        );

        const otherConflicts = conflicts.filter(c =>
            !(c.lists.includes('phonecheck') && c.lists.includes('onarim')) &&
            !(c.lists.includes('onarim') && c.lists.includes('teslimEdilenler'))
        );

        let resultsHTML = `
            <div style="margin-bottom: 20px;">
                <h3>📊 Çakışma Özeti</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
                    <div style="background: rgba(52, 152, 219, 0.2); padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #3498db;">${conflicts.length}</div>
                        <div style="font-size: 12px;">Toplam Çakışma</div>
                    </div>
                    <div style="background: rgba(243, 156, 18, 0.2); padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #f39c12;">${phonecheckOnarimConflicts.length}</div>
                        <div style="font-size: 12px;">PhoneCheck ↔ Onarım</div>
                    </div>
                    <div style="background: rgba(231, 76, 60, 0.2); padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #e74c3c;">${onarimTeslimConflicts.length}</div>
                        <div style="font-size: 12px;">Onarım ↔ Teslim</div>
                    </div>
                </div>
            </div>
        `;

        // PhoneCheck ↔ Onarım çakışmaları
        if (phonecheckOnarimConflicts.length > 0) {
            resultsHTML += `
                <div style="margin-bottom: 20px;">
                    <h4>📱 PhoneCheck ↔ 🔧 Onarım Çakışmaları</h4>
                    <div style="background: rgba(243, 156, 18, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                        <strong>Kural:</strong> PhoneCheck'teki kayıt silinecek, Onarım Tamamlandı'daki tutulacak
                    </div>
                    <div style="max-height: 200px; overflow-y: auto;">
            `;

            phonecheckOnarimConflicts.forEach(conflict => {
                resultsHTML += `
                    <div style="padding: 8px; margin-bottom: 5px; background: rgba(255,255,255,0.1); border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                        <span>${conflict.barcode}</span>
                        <span style="font-size: 12px; color: #f39c12;">PhoneCheck → Onarım</span>
                    </div>
                `;
            });

            resultsHTML += `</div></div>`;
        }

        // Onarım ↔ Teslim çakışmaları
        if (onarimTeslimConflicts.length > 0) {
            resultsHTML += `
                <div style="margin-bottom: 20px;">
                    <h4>🔧 Onarım ↔ ✅ Teslim Çakışmaları</h4>
                    <div style="background: rgba(231, 76, 60, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                        <strong>Kural:</strong> Onarım Tamamlandı'daki kayıt silinecek, Teslim Edilenler'deki tutulacak
                    </div>
                    <div style="max-height: 200px; overflow-y: auto;">
            `;

            onarimTeslimConflicts.forEach(conflict => {
                resultsHTML += `
                    <div style="padding: 8px; margin-bottom: 5px; background: rgba(255,255,255,0.1); border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                        <span>${conflict.barcode}</span>
                        <span style="font-size: 12px; color: #e74c3c;">Onarım → Teslim</span>
                    </div>
                `;
            });

            resultsHTML += `</div></div>`;
        }

        // Diğer çakışmalar
        if (otherConflicts.length > 0) {
            resultsHTML += `
                <div style="margin-bottom: 20px;">
                    <h4>⚠️ Diğer Çakışmalar</h4>
                    <div style="max-height: 200px; overflow-y: auto;">
            `;

            otherConflicts.forEach(conflict => {
                resultsHTML += `
                    <div style="padding: 8px; margin-bottom: 5px; background: rgba(255,255,255,0.1); border-radius: 4px;">
                        <div>${conflict.barcode}</div>
                        <div style="font-size: 12px; color: #95a5a6;">${conflict.lists.join(' ↔ ')}</div>
                    </div>
                `;
            });

            resultsHTML += `</div></div>`;
        }

        syncResults.innerHTML = resultsHTML;
        if (fixAllBtn) fixAllBtn.disabled = false;

    } catch (error) {
        console.error('Çakışma analiz hatası:', error);
        if (syncResults) {
            syncResults.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #e74c3c;">
                    <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                    <h3>Çakışmalar analiz edilirken hata oluştu</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
        if (fixAllBtn) fixAllBtn.disabled = true;
    }
}

// Liste önceliklerini belirle
function getListPriority(lists) {
    // Öncelik sırası: Teslim Edilenler > Onarım Tamamlandı > PhoneCheck > Diğerleri
    if (lists.includes('teslimEdilenler')) return 'teslimEdilenler';
    if (lists.includes('onarim')) return 'onarim';
    if (lists.includes('phonecheck')) return 'phonecheck';
    return lists[0]; // İlk listedeki tutulsun
}

// Tüm çakışmaları düzelt
async function fixAllConflicts() {
    console.log('🔄 fixAllConflicts called');
    const fixAllBtn = document.getElementById('fixAllBtn');
    const syncResults = document.getElementById('syncResults');

    if (!fixAllBtn || !syncResults) {
        console.log('❌ Button or results not found', fixAllBtn, syncResults);
        return;
    }

    fixAllBtn.disabled = true;
    fixAllBtn.innerHTML = '🔄 Düzeltiliyor...';

    try {
        // Tüm barkodları topla ve çakışmaları bul
        const allBarcodes = new Set();
        Object.values(userCodes).forEach(set => {
            if (set && set.forEach) {
                set.forEach(barcode => allBarcodes.add(barcode));
            }
        });

        let fixedCount = 0;

        for (const barcode of allBarcodes) {
            const lists = [];
            Object.entries(userCodes).forEach(([listName, codeSet]) => {
                if (codeSet && codeSet.has && codeSet.has(barcode)) {
                    lists.push(listName);
                }
            });

            // Çakışma varsa düzelt
            if (lists.length > 1) {
                await fixConflict(barcode, lists);
                fixedCount++;
            }
        }

        syncResults.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #2ecc71;">
                <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
                <h3>Senkronizasyon Tamamlandı!</h3>
                <p><strong>${fixedCount}</strong> çakışma başarıyla düzeltildi.</p>
                <p>Sayfayı yenilemek için <strong>3 saniye</strong> sonra yönlendirileceksiniz...</p>
            </div>
        `;

        showToast(`✅ ${fixedCount} çakışma başarıyla düzeltildi!`, 'success');

        hideConflictNotification();

        // 3 saniye sonra sayfayı yenile
        setTimeout(() => {
            location.reload();
        }, 3000);

    } catch (error) {
        console.error('Çakışma düzeltme hatası:', error);
        syncResults.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #e74c3c;">
                <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                <h3>Çakışmalar düzeltilirken hata oluştu</h3>
                <p>${error.message}</p>
            </div>
        `;
        fixAllBtn.disabled = false;
        fixAllBtn.innerHTML = '🔄 Tüm Çakışmaları Düzelt';
    }
}

// Tekil çakışmayı düzelt
async function fixConflict(barcode, lists) {
    // Kural 1: PhoneCheck ve Onarım Tamamlandı'da aynı anda bulunuyorsa → PhoneCheck'ten sil
    if (lists.includes('phonecheck') && lists.includes('onarim')) {
        await removeFromList(barcode, 'phonecheck');
        return;
    }

    // Kural 2: Onarım Tamamlandı ve Teslim Edilenler'de aynı anda bulunuyorsa → Onarım Tamamlandı'dan sil
    if (lists.includes('onarim') && lists.includes('teslimEdilenler')) {
        await removeFromList(barcode, 'onarim');
        return;
    }

    // Kural 3: Diğer çakışmalar için ilk listedekini tut, diğerlerinden sil
    const listToKeep = getListPriority(lists);
    for (const listName of lists) {
        if (listName !== listToKeep) {
            await removeFromList(barcode, listName);
        }
    }
}

// Belirli bir listeden barkodu sil
async function removeFromList(barcode, listName) {
    if (!userCodes[listName] || !userCodes[listName].has(barcode)) {
        return; // Zaten silinmiş
    }

    const dbPath = listName === 'onarim' ? 'onarimTamamlandi' : listName;

    try {
        // Firebase'den sil
        await db.ref(`servis/${dbPath}/${barcode}`).remove();

        // Yerel verilerden sil
        userCodes[listName].delete(barcode);
        delete codeTimestamps[listName][barcode];
        delete codeUsers[listName][barcode];

        // Geçmişe kaydet
        saveBarcodeHistory(barcode, listName, 'SENKRONİZASYON_SİLİNDİ', `${currentUserName} (Manuel Senkronizasyon: ${listName} listesinden kaldırıldı)`);

        // UI'ı güncelle
        updateLabelAndCount(listName);
        renderMiniList(listName);

        console.log(`✅ Manuel Senkronizasyon: ${barcode} - ${listName} listesinden kaldırıldı`);

    } catch (error) {
        console.error(`❌ ${barcode} - ${listName} listesinden kaldırılırken hata:`, error);
        throw error;
    }
}


// Sayfa yüklendiğinde de kontrol et
window.addEventListener('load', () => {
    lastCheckedDate = getTodayDateString();
    checkMidnightReset();
});

// Güncel tarihi formatla
function getTodayDateString() {
    // Türkiye saati için doğrudan UTC+3 hesapla
    const now = new Date();
    const turkeyTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (3 * 60 * 60 * 1000));

    const year = turkeyTime.getFullYear();
    const month = String(turkeyTime.getMonth() + 1).padStart(2, '0');
    const day = String(turkeyTime.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function updateDashboardDate() {
    const dateElement = document.getElementById('dashboardDate');
    if (dateElement) {
        // Türkiye saatini kullan
        const now = new Date();
        const turkeyTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (3 * 60 * 60 * 1000));

        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
            timeZone: 'Europe/Istanbul'
        };
        dateElement.textContent = turkeyTime.toLocaleDateString('tr-TR', options);
    }
}

// Tarih aralığındaki tüm günleri döndür
function getDateRange(startDate, endDate) {
    const dates = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
        dates.push(new Date(currentDate).toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}

// Ay başlangıç ve bitiş tarihlerini al
function getMonthRange(year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Ayın son günü

    return {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
    };
}

// Yıl başlangıç ve bitiş tarihlerini al
function getYearRange(year) {
    return {
        start: `${year}-01-01`,
        end: `${year}-12-31`
    };
}


// Dashboard istatistiklerini yükle
async function loadDashboardStats() {
    const todayDate = getTodayDateString();

    if (!lastCheckedDate) {
        lastCheckedDate = todayDate;
    }



    try {
        const snapshot = await db.ref(`dashboard/daily/${todayDate}`).once('value');
        const data = snapshot.val();

        if (data) {
            // Veriyi set'e çevir
            if (data.receivedIMEIs) {
                dailyReceivedIMEIs = new Set(Object.keys(data.receivedIMEIs));
            }
            dailyDeliveredCount = data.deliveredCount || 0;

            // Kaynak bazlı sayıları da yükle
            updateDashboardUI(data);
        } else {
            // Bugün için veri yoksa sıfırla
            dailyReceivedIMEIs.clear();
            dailyDeliveredCount = 0;
            updateDashboardUI({});
        }
    } catch (error) {
        console.error('Dashboard verileri yüklenirken hata:', error);
    }
}

// Dashboard UI'ını güncelle
function updateDashboardUI(data = {}) {
    document.getElementById('dashboardTeslimAlinan').textContent = dailyReceivedIMEIs.size;
    document.getElementById('dashboardTeslimEdilen').textContent = dailyDeliveredCount;

    // Detaylı sayılar
    document.getElementById('dashboardAtanacakCount').textContent = data.sources?.atanacak || 0;
    document.getElementById('dashboardSonKullanıcıCount').textContent = data.sources?.SonKullanıcı || 0;
    document.getElementById('dashboardSahibindenCount').textContent = data.sources?.sahiniden || 0;
    document.getElementById('dashboardMediaMarktCount').textContent = data.sources?.mediaMarkt || 0;

    // ✅ YENİ EKLENEN - Servise geri dönenler
    document.getElementById('dashboardServiceReturnCount').textContent = data.sources?.serviceReturn || 0;
}

// Teslim alınan IMEI ekle
async function addReceivedIMEI(imei, source) {
    // Eğer IMEI daha önce eklenmemişse
    if (!dailyReceivedIMEIs.has(imei)) {
        dailyReceivedIMEIs.add(imei);

        const todayDate = getTodayDateString();
        const updates = {};
        updates[`dashboard/daily/${todayDate}/receivedIMEIs/${imei}`] = {
            source: source,
            timestamp: Date.now(),
            user: currentUserName
        };
        updates[`dashboard/daily/${todayDate}/sources/${source}`] =
            (await db.ref(`dashboard/daily/${todayDate}/sources/${source}`).once('value')).val() + 1 || 1;

        try {
            await db.ref().update(updates);
            loadDashboardStats(); // UI'ı güncelle
        } catch (error) {
            console.error('IMEI eklenirken hata:', error);
        }
    }
}

// Teslim edilen sayısını artır
async function incrementDeliveredCount() {
    dailyDeliveredCount++;

    const todayDate = getTodayDateString();
    try {
        await db.ref(`dashboard/daily/${todayDate}/deliveredCount`).set(dailyDeliveredCount);
        updateDashboardUI();
    } catch (error) {
        console.error('Teslim edilen sayısı güncellenirken hata:', error);
    }
}

// ♻️ DASHBOARD GERİ YÜKLEME FONKSİYONU
// Dashboard verilerini database'den yeniden hesaplayıp geri yükler
async function restoreDashboard() {
    if (currentUserRole !== 'admin') {
        showToast('❌ Bu işlem sadece admin yetkisi gerektirir!', 'error');
        return;
    }

    const confirmation = confirm(
        '♻️ DASHBOARD GERİ YÜKLEME\n\n' +
        'Bu işlem şunları yapacak:\n\n' +
        '✅ Tüm history kayıtlarını tarayacak\n' +
        '✅ Bugünkü teslim alınan cihazları yeniden sayacak\n' +
        '✅ Bugünkü teslim edilen cihazları yeniden sayacak\n' +
        '✅ Kaynak dağılımını yeniden hesaplayacak\n\n' +
        'Dashboard verileri güncel hale gelecek.\n\n' +
        'Devam etmek istiyor musunuz?'
    );

    if (!confirmation) return;

    showToast('🔄 Dashboard geri yükleniyor, lütfen bekleyin...', 'info');

    try {
        const todayDate = getTodayDateString();
        const todayTimestamp = new Date(todayDate).getTime();
        const todayEndTimestamp = todayTimestamp + (24 * 60 * 60 * 1000); // Günün sonu

        console.log('📅 Bugün:', todayDate);
        console.log('⏰ Timestamp aralığı:', todayTimestamp, '-', todayEndTimestamp);

        // 1️⃣ TÜM HISTORY KAYITLARINI TARA
        const receivedIMEIs = new Set();
        const sourceCounts = {
            atanacak: 0,
            SonKullanıcı: 0,
            sahiniden: 0,
            mediaMarkt: 0,
            serviceReturn: 0
        };

        // Tüm history kayıtlarını çek
        const allHistorySnapshot = await db.ref('servis/history').once('value');
        const allHistory = allHistorySnapshot.val();

        if (allHistory) {
            console.log('📚 History kayıtları taranıyor...');

            Object.keys(allHistory).forEach(imei => {
                const imeiHistory = allHistory[imei];
                const entries = Object.values(imeiHistory).sort((a, b) => a.timestampRaw - b.timestampRaw);

                let alreadyCountedAsReceived = false;

                // Bu IMEI bugün ilk kez sisteme girmiş mi kontrol et
                entries.forEach(entry => {
                    if (entry.timestampRaw && entry.timestampRaw >= todayTimestamp && entry.timestampRaw < todayEndTimestamp) {
                        // Bugün yapılan işlem

                        // Eğer bir kaynak listesine (atanacak, SonKullanıcı, etc.) eklenmiş ve "from" değeri "Yeni Ekleme" ise
                        // Bu cihaz bugün teslim alınmış demektir
                        if ((entry.from === 'Yeni Ekleme' || !entry.from) && !alreadyCountedAsReceived) {
                            const targetList = entry.to;

                            // Dashboard kaynak listelerinden birine eklenmişse
                            if (['atanacak', 'SonKullanıcı', 'sahiniden', 'mediaMarkt'].includes(targetList)) {
                                receivedIMEIs.add(imei);
                                sourceCounts[targetList]++;
                                alreadyCountedAsReceived = true;
                                console.log(`✅ Teslim alındı: ${imei} → ${targetList}`);
                            }
                        }
                    }
                });

                // Servise geri dönenler için özel kontrol - BU IMEI İÇİN BİR KEZ KONTROL ET
                if (!alreadyCountedAsReceived) {
                    // Cihaz daha önce teslim edilmiş mi?
                    const wasDeliveredBefore = entries.some(e =>
                        e.to === 'teslimEdilenler' &&
                        e.timestampRaw < todayTimestamp
                    );

                    // Bugün servise geri mi döndü?
                    const returnedToday = entries.some(e =>
                        e.from === 'teslimEdilenler' &&
                        e.timestampRaw >= todayTimestamp &&
                        e.timestampRaw < todayEndTimestamp
                    );

                    if (wasDeliveredBefore && returnedToday) {
                        receivedIMEIs.add(imei);
                        sourceCounts.serviceReturn++;
                        console.log(`🔄 Servise geri döndü: ${imei}`);
                    }
                }
            });
        }

        console.log('📊 Teslim Alınan Sonuçları:', {
            totalReceived: receivedIMEIs.size,
            sources: sourceCounts
        });

        // 2️⃣ BUGÜN TESLİM EDİLEN CİHAZLARI HESAPLA
        let deliveredCount = 0;

        if (allHistory) {
            console.log('📤 Teslim edilenler taranıyor...');

            Object.keys(allHistory).forEach(imei => {
                const imeiHistory = allHistory[imei];
                const entries = Object.values(imeiHistory);

                // Bu IMEI bugün teslim edilmiş mi kontrol et
                const deliveredToday = entries.some(entry =>
                    entry.to === 'teslimEdilenler' &&
                    entry.timestampRaw >= todayTimestamp &&
                    entry.timestampRaw < todayEndTimestamp
                );

                if (deliveredToday) {
                    deliveredCount++;
                    console.log(`✅ Teslim edildi: ${imei}`);
                }
            });
        }

        console.log('📊 Teslim Edilen Sayısı:', deliveredCount);

        // 3️⃣ DATABASE'İ GÜNCELLE
        const updates = {};

        // ReceivedIMEIs'i yeniden oluştur
        const receivedIMEIsObject = {};
        receivedIMEIs.forEach(imei => {
            // Her IMEI için kaynak bilgisini history'den bul
            if (allHistory && allHistory[imei]) {
                const entries = Object.values(allHistory[imei]);
                const firstEntry = entries
                    .filter(e => e.timestampRaw >= todayTimestamp && e.timestampRaw < todayEndTimestamp)
                    .sort((a, b) => a.timestampRaw - b.timestampRaw)[0];

                if (firstEntry) {
                    receivedIMEIsObject[imei] = {
                        source: firstEntry.to,
                        timestamp: firstEntry.timestampRaw,
                        user: firstEntry.user || 'unknown'
                    };
                }
            }
        });

        updates[`dashboard/daily/${todayDate}/receivedIMEIs`] = receivedIMEIsObject;
        updates[`dashboard/daily/${todayDate}/deliveredCount`] = deliveredCount;
        updates[`dashboard/daily/${todayDate}/sources`] = sourceCounts;

        await db.ref().update(updates);

        // 4️⃣ LOKAL DEĞİŞKENLERİ GÜNCELLE
        dailyReceivedIMEIs = receivedIMEIs;
        dailyDeliveredCount = deliveredCount;

        // 5️⃣ UI'I GÜNCELLE
        await loadDashboardStats();

        showToast(
            '✅ Dashboard başarıyla geri yüklendi!\n\n' +
            `📥 Teslim Alınan: ${receivedIMEIs.size}\n` +
            `📤 Teslim Edilen: ${deliveredCount}\n` +
            `📋 Atanacak: ${sourceCounts.atanacak}\n` +
            `👤 SonKullanıcı: ${sourceCounts.SonKullanıcı}\n` +
            `🏪 Sahibinden: ${sourceCounts.sahiniden}\n` +
            `🛒 Media Markt: ${sourceCounts.mediaMarkt}\n` +
            `🔄 Servise Geri Dönen: ${sourceCounts.serviceReturn}`,
            'success'
        );

        console.log('✅ Dashboard geri yüklendi:', {
            receivedCount: receivedIMEIs.size,
            deliveredCount,
            sources: sourceCounts
        });

    } catch (error) {
        console.error('❌ Dashboard geri yüklenirken hata:', error);
        showToast('❌ Dashboard geri yüklenirken bir hata oluştu: ' + error.message, 'error');
    }
}


// Dashboard görünümünü göster/gizle


// generateReport fonksiyonunun sonuna şu satırı ekleyin:
// enableExcelExport({ details: detailsData, totalActions, userCount: Object.keys(userStats).length, userStats, reportDate: dateInput, selectedList: listName });

// closeReportsModal fonksiyonuna şu satırı ekleyin:
// disableExcelExport(); 

const firebaseConfig = {
    apiKey: "AIzaSyCbwCl4dKOV7w9e1enR_pxG8GyNIbmzCNs",
    authDomain: "cokluhaber-dc6ff.firebaseapp.com",
    projectId: "cokluhaber-dc6ff",
    storageBucket: "cokluhaber-dc6ff.appspot.com",
    messagingSenderId: "433806685700",
    appId: "1:433806685700:web:8bedc51407c6c4b56f2751",
    measurementId: "G-TYRTT351HP",
    databaseURL: "https://cokluhaber-dc6ff-default-rtdb.firebaseio.com/"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// ========================================
// İNTERNET BAĞLANTISI KONTROLÜ
// ========================================
let isConnected = true;
let connectionInitialized = false; // İlk bağlantı kuruldu mu?
const connectionWarning = document.getElementById('connectionWarning');
const connectionStatus = document.getElementById('connectionStatus');

// Firebase bağlantı durumunu izle
const connectedRef = db.ref('.info/connected');
connectedRef.on('value', (snap) => {
    if (snap.val() === true) {
        // İlk bağlantı
        if (!connectionInitialized) {
            connectionInitialized = true;
            isConnected = true;
            console.log('✅ Firebase bağlantısı kuruldu');
        } else {
            // Bağlantı yeniden kuruldu
            handleConnectionRestored();
        }
    } else {
        // Bağlantı kesildi (sadece daha önce kurulmuşsa uyar)
        if (connectionInitialized) {
            handleConnectionLost();
        }
    }
});

function handleConnectionLost() {
    if (isConnected) {
        isConnected = false;
        console.error('❌ İnternet bağlantısı kesildi!');
        console.error('⏰ 3 saniye uyarı gösterilecek, ardından uyarı kalkacak ve sistem sessizce kilitlenecek...');

        // Uyarı ekranını göster
        connectionWarning.style.display = 'flex';

        // KIRMIZI TEMA - Bağlantı Kesildi
        const warningBox = document.getElementById('connectionWarningBox');
        const connectionIcon = document.getElementById('connectionIcon');
        const connectionTitle = document.getElementById('connectionTitle');
        const connectionMessage = document.getElementById('connectionMessage');

        if (warningBox) warningBox.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
        if (connectionIcon) connectionIcon.textContent = '📡❌';
        if (connectionTitle) connectionTitle.textContent = 'İNTERNET BAĞLANTISI KESİLDİ!';
        if (connectionMessage) connectionMessage.innerHTML = 'Database bağlantısı kurulamadı.<br><strong>Lütfen sistemi kullanmayın!</strong><br>Girdiğiniz veriler kaydedilmeyecektir.';

        // Durum mesajını güncelle
        updateConnectionStatus('❌ Bağlantı kesildi! Lütfen internet bağlantınızı kontrol edin.');

        // Toast bildirimi
        showToast('❌ İNTERNET BAĞLANTISI KESİLDİ! Sistem kilitlenecek...', 'error');

        // 3 saniye sonra uyarıyı KALDIR ve input'ları kilitle
        setTimeout(() => {
            connectionWarning.style.display = 'none'; // Uyarıyı kapat
            lockAllInputs(); // Alanları kilitle
            console.error('🔒 Uyarı kaldırıldı. Tüm input alanları kilitlendi!');
            console.error('📡 İnternet bağlantısı bekleniyor...');
        }, 3000);
    }
}

function handleConnectionRestored() {
    if (!isConnected) {
        isConnected = true;
        console.log('✅ İnternet bağlantısı yeniden kuruldu!');
        console.log('🔄 Sayfa 3 saniye içinde yenilenecek...');

        // Uyarı ekranını göster (yeşil)
        connectionWarning.style.display = 'flex';

        // YEŞİL TEMA - Bağlantı Kuruldu
        const warningBox = document.getElementById('connectionWarningBox');
        const connectionIcon = document.getElementById('connectionIcon');
        const connectionTitle = document.getElementById('connectionTitle');
        const connectionMessage = document.getElementById('connectionMessage');

        if (warningBox) warningBox.style.background = 'linear-gradient(135deg, #27ae60, #229954)';
        if (connectionIcon) connectionIcon.textContent = '✅📡';
        if (connectionTitle) connectionTitle.textContent = 'BAĞLANTI KURULDU!';
        if (connectionMessage) connectionMessage.innerHTML = 'İnternet bağlantısı yeniden sağlandı.<br><strong>Sayfa yenileniyor...</strong><br>Verileriniz güncellenecek.';

        // Durum mesajını güncelle
        updateConnectionStatus('✅ Bağlantı kuruldu! Sayfa yenileniyor...');

        // Toast bildirimi
        showToast('✅ Bağlantı yeniden kuruldu! Sayfa 3 saniye içinde yenilenecek...', 'success');

        // 3 saniye sonra sayfa yenileme
        let countdown = 3;
        const countdownInterval = setInterval(() => {
            countdown--;
            updateConnectionStatus(`✅ Bağlantı kuruldu! Sayfa ${countdown} saniye içinde yenilenecek...`);

            if (countdown <= 0) {
                clearInterval(countdownInterval);
                updateConnectionStatus('🔄 Sayfa yenileniyor...');
            }
        }, 1000);

        setTimeout(() => {
            location.reload();
        }, 3000);
    }
}

function updateConnectionStatus(message) {
    if (connectionStatus) {
        connectionStatus.textContent = message;
    }
}

function lockAllInputs() {
    console.log('🔒 Tüm input alanları kilitleniyor...');

    // Tüm textarea'ları kilitle
    Object.values(inputs).forEach(input => {
        if (input) {
            input.disabled = true;
            input.style.opacity = '0.3';
            input.style.cursor = 'not-allowed';
            input.style.background = '#2c3e50';
            input.placeholder = '🔒 BAĞLANTI KESİLDİ - KULLANILAMAZ';
        }
    });

    // Tüm butonları kilitle
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach(button => {
        button.disabled = true;
        button.style.opacity = '0.3';
        button.style.cursor = 'not-allowed';
    });
}

function unlockAllInputs() {
    console.log('🔓 Input alanları açılıyor...');

    // Rol bazlı izinleri yeniden uygula
    applyRoleBasedPermissions();

    // Tüm butonları aç
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach(button => {
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
    });
}

// Browser online/offline event'leri - sadece console log
window.addEventListener('online', () => {
    console.log('🌐 Tarayıcı online oldu');
    // Firebase zaten kendi kontrol ediyor, ekstra işlem gerekmiyor
});

window.addEventListener('offline', () => {
    console.log('📡 Tarayıcı offline oldu');
    // Firebase zaten kendi kontrol ediyor, burada tekrar çağırmaya gerek yok
});

// ========================================
// DEVAM EDEN KOD
// ========================================

const loginScreen = document.getElementById("loginScreen");
const appContainer = document.getElementById("appContainer");
const userInfo = document.getElementById("userInfo");
const userName = document.getElementById("userName");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");
const errorMessage = document.getElementById("errorMessage");

const inputs = {
    atanacak: document.getElementById("atanacakInput"),
    parcaBekliyor: document.getElementById("parcaBekliyorInput"),
    phonecheck: document.getElementById("phonecheckInput"),
    gokhan: document.getElementById("gokhanInput"),
    enes: document.getElementById("enesInput"),
    yusuf: document.getElementById("yusufInput"),
    samet: document.getElementById("sametInput"),

    engin: document.getElementById("enginInput"),
    ismail: document.getElementById("ismailInput"),
    mehmet: document.getElementById("mehmetInput"),
    scanner: document.getElementById("scannerInput"),
    search: document.getElementById("searchInput"),
    searchNormal: document.getElementById("searchInputNormal"),
    onarim: document.getElementById("onarimInput"),
    onCamDisServis: document.getElementById("onCamDisServisInput"),        // YENİ EKLENDİ
    anakartDisServis: document.getElementById("anakartDisServisInput"),    // YENİ EKLENDİ

    satisa: document.getElementById("satisaInput"),
    sahiniden: document.getElementById("sahinidenInput"),
    mediaMarkt: document.getElementById("mediaMarktInput"),
    SonKullanıcı: document.getElementById("SonKullanıcıInput"),
    teslimEdilenler: document.getElementById("teslimEdilenlerInput")
};

const labels = {
    atanacak: document.getElementById("atanacakLabel"),
    parcaBekliyor: document.getElementById("parcaBekliyorLabel"),
    phonecheck: document.getElementById("phonecheckLabel"),
    gokhan: document.getElementById("gokhanLabel"),
    enes: document.getElementById("enesLabel"),
    yusuf: document.getElementById("yusufLabel"),
    samet: document.getElementById("sametLabel"),

    engin: document.getElementById("enginLabel"),
    ismail: document.getElementById("ismailLabel"),
    mehmet: document.getElementById("mehmetLabel"),
    onarim: document.getElementById("onarimLabel"),
    SonKullanıcı: document.getElementById("SonKullanıcıLabel"),
    onCamDisServis: document.getElementById("onCamDisServisLabel"),        // YENİ EKLENDİ
    anakartDisServis: document.getElementById("anakartDisServisLabel"),    // YENİ EKLENDİ
    satisa: document.getElementById("satisaLabel"),
    sahiniden: document.getElementById("sahinidenLabel"),
    mediaMarkt: document.getElementById("mediaMarktLabel"),
    teslimEdilenler: document.getElementById("teslimEdilenlerLabel")
};

const miniLists = {
    atanacak: document.getElementById("atanacakList"),
    parcaBekliyor: document.getElementById("parcaBekliyorList"),
    phonecheck: document.getElementById("phonecheckList"),
    gokhan: document.getElementById("gokhanList"),
    enes: document.getElementById("enesList"),
    yusuf: document.getElementById("yusufList"),
    samet: document.getElementById("sametList"),

    engin: document.getElementById("enginList"),
    ismail: document.getElementById("ismailList"),
    mehmet: document.getElementById("mehmetList"),
    onarim: document.getElementById("onarimList"),
    SonKullanıcı: document.getElementById("SonKullanıcıList"),
    onCamDisServis: document.getElementById("onCamDisServisList"),
    anakartDisServis: document.getElementById("anakartDisServisList"),
    satisa: document.getElementById("satisaList"),
    sahiniden: document.getElementById("sahinidenList"),
    mediaMarkt: document.getElementById("mediaMarktList"),
    teslimEdilenler: document.getElementById("teslimEdilenlerList")
};

const searchResult = document.getElementById("searchResult");
const historyLog = document.getElementById("historyLog");
const scannedCodes = new Set();
const allCodes = new Set();
const userCodes = {
    atanacak: new Set(),
    parcaBekliyor: new Set(),
    phonecheck: new Set(),
    gokhan: new Set(),
    enes: new Set(),
    yusuf: new Set(),
    samet: new Set(),

    engin: new Set(),
    ismail: new Set(),
    mehmet: new Set(),
    onCamDisServis: new Set(),    // YENİ EKLENDİ
    anakartDisServis: new Set(),  // YENİ EKLENDİ
    onarim: new Set(),
    SonKullanıcı: new Set(),
    satisa: new Set(),
    sahiniden: new Set(),
    mediaMarkt: new Set(),
    teslimEdilenler: new Set()
};
const codeTimestamps = {
    atanacak: {},
    parcaBekliyor: {},
    phonecheck: {},
    gokhan: {},
    enes: {},
    yusuf: {},
    samet: {},

    engin: {},
    ismail: {},
    mehmet: {},
    onarim: {},
    SonKullanıcı: {},
    onCamDisServis: {},    // YENİ EKLENDİ
    anakartDisServis: {},  // YENİ EKLENDİ
    satisa: {},
    sahiniden: {},
    mediaMarkt: {},
    teslimEdilenler: {}
};
const codeUsers = {
    atanacak: {},
    parcaBekliyor: {},
    phonecheck: {},
    gokhan: {},
    enes: {},
    yusuf: {},
    samet: {},
    engin: {},
    ismail: {},
    onCamDisServis: {},    // YENİ EKLENDİ
    anakartDisServis: {},  // YENİ EKLENDİ
    mehmet: {},
    onarim: {},
    SonKullanıcı: {},
    satisa: {},
    sahiniden: {},
    mediaMarkt: {},
    teslimEdilenler: {}
};

let currentUserRole = null;
let currentUserName = null;
let currentUserPermissions = null;
let isUpdating = false;
let dataLoaded = false;
let editingBarcode = null;
let editingList = null;
let editingUserId = null;

// ========================================
// TOAST NOTIFICATION SYSTEM
// ========================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    toast.innerHTML = `
        <div class="toast-icon"></div>
        <div class="toast-message">${message}</div>
      `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}

// ========================================
// PARÇA SİPARİŞ SİSTEMİ
// ========================================
function openPartOrderModal() {
    document.getElementById('partOrderModal').classList.add('active');
    // Clear form
    document.getElementById('partOrderBarcode').value = '';
    document.getElementById('partOrderModel').value = '';
    document.getElementById('partOrderCustomer').value = '';
    document.getElementById('partOrderStatus').value = '';
    document.getElementById('partOrderService').value = '';
    document.getElementById('partOrderNote').value = '';
    document.getElementById('partOrderPart1').value = '';
    document.getElementById('partOrderPart2').value = '';
    document.getElementById('partOrderPart3').value = '';
    document.getElementById('partOrderPart4').value = '';
}

function closePartOrderModal() {
    document.getElementById('partOrderModal').classList.remove('active');
}

async function submitPartOrder() {
    const barcode = document.getElementById('partOrderBarcode').value.trim();
    const model = document.getElementById('partOrderModel').value.trim();
    const customer = document.getElementById('partOrderCustomer').value.trim();
    const statusField = document.getElementById('partOrderStatus').value.trim();
    const service = document.getElementById('partOrderService').value.trim();
    const note = document.getElementById('partOrderNote').value.trim();
    const part1 = document.getElementById('partOrderPart1').value.trim();
    const part2 = document.getElementById('partOrderPart2').value.trim();
    const part3 = document.getElementById('partOrderPart3').value.trim();
    const part4 = document.getElementById('partOrderPart4').value.trim();

    if (!barcode || barcode.length !== 15 || !/^\d+$/.test(barcode)) {
        showToast('Geçerli bir 15 haneli barkod giriniz!', 'error');
        return;
    }

    if (!model) {
        showToast('Cihaz modelini giriniz!', 'error');
        return;
    }
    /*
        if (!part1) {
            showToast('En az 1 parça girmelisiniz!', 'error');
            return;
        }
    */
    const parts = [];
    if (part1) parts.push({ name: part1, status: 'pending' });
    if (part2) parts.push({ name: part2, status: 'pending' });
    if (part3) parts.push({ name: part3, status: 'pending' });
    if (part4) parts.push({ name: part4, status: 'pending' });

    // UNIQUE ID OLUŞTUR - Aynı barkod için birden fazla sipariş olabilsin
    const uniqueOrderId = `${barcode}_${Date.now()}`;

    const orderData = {
        barcode: barcode,
        model: model,
        customer: customer || '',  // Müşteri bilgisi (isteğe bağlı)
        statusField: statusField || '',  // Statü bilgisi (isteğe bağlı)
        service: service || '',  // Hizmet bilgisi (isteğe bağlı)
        note: note || '',  // Not bilgisi (isteğe bağlı)
        parts: parts,
        technician: currentUserName,
        status: 'pending',
        timestamp: Date.now(),
        timestampReadable: getTimestamp()
    };

    try {
        // IMEI bazlı değil, unique ID bazlı kayıt
        await db.ref(`partOrders/${uniqueOrderId}`).set(orderData);
        showToast('Parça siparişi başarıyla gönderildi!', 'success');
        closePartOrderModal();

        // Teknisyen sipariş listesini güncelle
        if (currentUserRole === 'technician') {
            loadTechnicianPartOrders();
        }
    } catch (error) {
        console.error('Parça siparişi gönderilirken hata:', error);
        showToast('Parça siparişi gönderilirken hata oluştu!', 'error');
    }
}

async function loadTechnicianPartOrders() {
    // Teknisyen kullanıcıları listesi
    const technicianUsers = ['gokhan', 'samet', 'yusuf', 'ismail', 'engin', 'mehmet', 'enes'];

    // Rol kontrolü - technician rolü VEYA teknisyen kullanıcı listesinde olması
    if (currentUserRole !== 'technician' && !technicianUsers.includes(currentUserName)) return;

    try {
        const snapshot = await db.ref('partOrders').once('value');
        const orders = snapshot.val();
        const ordersList = document.getElementById('technicianOrdersList');

        if (!orders) {
            ordersList.innerHTML = '<div class="no-orders">Henüz parça siparişi bulunmuyor.</div>';
            return;
        }

        const myOrders = Object.entries(orders)
            .filter(([_, order]) => order.technician === currentUserName)
            .sort(([_, a], [__, b]) => b.timestamp - a.timestamp);

        if (myOrders.length === 0) {
            ordersList.innerHTML = '<div class="no-orders">Henüz parça siparişi bulunmuyor.</div>';
            return;
        }

        ordersList.innerHTML = '';

        // Son 3 istek - her zaman görünür
        const recentOrders = myOrders.slice(0, 3);
        const olderOrders = myOrders.slice(3);

        // Son 3 isteği göster
        recentOrders.forEach(([orderId, order]) => {
            const card = createTechnicianOrderCard(orderId, order);
            ordersList.appendChild(card);
        });

        // Eski istekler varsa açılır-kapanır bölüm oluştur
        if (olderOrders.length > 0) {
            const toggleSection = document.createElement('div');
            toggleSection.style.marginTop = '15px';
            toggleSection.style.borderTop = '2px solid rgba(255,255,255,0.2)';
            toggleSection.style.paddingTop = '15px';

            const toggleButton = document.createElement('button');
            toggleButton.style.width = '100%';
            toggleButton.style.padding = '12px';
            toggleButton.style.background = 'rgba(255,255,255,0.1)';
            toggleButton.style.border = '2px solid rgba(255,255,255,0.3)';
            toggleButton.style.borderRadius = '8px';
            toggleButton.style.color = '#fff';
            toggleButton.style.fontSize = '15px';
            toggleButton.style.fontWeight = '600';
            toggleButton.style.cursor = 'pointer';
            toggleButton.style.transition = 'all 0.3s ease';
            toggleButton.innerHTML = `📦 Eski İstekler (${olderOrders.length}) - Göster ▼`;

            const olderOrdersContainer = document.createElement('div');
            olderOrdersContainer.style.display = 'none';
            olderOrdersContainer.style.marginTop = '10px';
            olderOrdersContainer.style.animation = 'slideDown 0.3s ease';

            olderOrders.forEach(([orderId, order]) => {
                const card = createTechnicianOrderCard(orderId, order);
                card.style.opacity = '0.85';
                olderOrdersContainer.appendChild(card);
            });

            toggleButton.addEventListener('click', () => {
                if (olderOrdersContainer.style.display === 'none') {
                    olderOrdersContainer.style.display = 'block';
                    toggleButton.innerHTML = `📦 Eski İstekler (${olderOrders.length}) - Gizle ▲`;
                    toggleButton.style.background = 'rgba(255,255,255,0.2)';
                } else {
                    olderOrdersContainer.style.display = 'none';
                    toggleButton.innerHTML = `📦 Eski İstekler (${olderOrders.length}) - Göster ▼`;
                    toggleButton.style.background = 'rgba(255,255,255,0.1)';
                }
            });

            toggleButton.addEventListener('mouseenter', () => {
                toggleButton.style.background = 'rgba(255,255,255,0.2)';
                toggleButton.style.transform = 'translateY(-2px)';
            });

            toggleButton.addEventListener('mouseleave', () => {
                if (olderOrdersContainer.style.display === 'none') {
                    toggleButton.style.background = 'rgba(255,255,255,0.1)';
                }
                toggleButton.style.transform = 'translateY(0)';
            });

            toggleSection.appendChild(toggleButton);
            toggleSection.appendChild(olderOrdersContainer);
            ordersList.appendChild(toggleSection);
        }
    } catch (error) {
        console.error('Parça siparişleri yüklenirken hata:', error);
    }
}

function createTechnicianOrderCard(orderId, order) {
    const isReady = order.status === 'ready';
    const card = document.createElement('div');
    card.className = `part-order-card ${isReady ? 'ready' : ''}`;
    card.style.marginBottom = '15px';

    // Status badge
    const statusBadge = isReady
        ? '<span class="order-status ready">✅ Hazır</span>'
        : '<span class="order-status pending">⏳ Bekliyor</span>';

    // Parts list
    let partsHTML = '<div class="order-parts"><div class="order-parts-title">🔧 İstenen Parçalar:</div><div class="order-parts-list">';

    // EĞER order.parts VARSA döngüye gir, YOKSA boş dizi ([]) kabul et
    (order.parts || []).forEach((part) => {
        // part nesnesinin ve isminin varlığını da kontrol edelim
        if (part && part.name) {
            partsHTML += `<span class="part-tag">${part.name}</span>`;
        }
    });
    partsHTML += '</div></div>';

    card.innerHTML = `
        <div class="order-header">
          <div class="order-barcode">${order.barcode}</div>
          ${statusBadge}
        </div>
        
        <div class="order-body">
          <div class="order-field">
            <div class="order-field-label">Model</div>
            <div class="order-field-value">📱 ${order.model}</div>
          </div>
          
          ${order.customer ? `
            <div class="order-field">
              <div class="order-field-label">Müşteri/Bayi</div>
              <div class="order-field-value">👤 ${order.customer}</div>
            </div>
          ` : ''}
          
          ${order.statusField ? `
            <div class="order-field">
              <div class="order-field-label">Statü</div>
              <div class="order-field-value">📊 ${order.statusField}</div>
            </div>
          ` : ''}
          
          ${order.service ? `
            <div class="order-field">
              <div class="order-field-label">Hizmet</div>
              <div class="order-field-value">🔧 ${order.service}</div>
            </div>
          ` : ''}
          
          <div class="order-field">
            <div class="order-field-label">Tarih</div>
            <div class="order-field-value">📅 ${order.timestampReadable}</div>
          </div>
        </div>
        
        ${order.note ? `
          <div class="order-note">
            <div class="order-field-label">Not</div>
            <div class="order-field-value">📝 ${order.note}</div>
          </div>
        ` : ''}
        
        ${partsHTML}
      `;

    return card;
}

async function loadWarehouseOrders() {
    if (currentUserRole !== 'warehouse') return;

    try {
        const snapshot = await db.ref('partOrders').once('value');
        const orders = snapshot.val();

        // Containers
        const pendingContainer = document.getElementById('warehousePendingOrders');
        const completedContainer = document.getElementById('warehouseCompletedOrders');
        const markAllBtn = document.getElementById('markAllReadyBtn');

        // Clear containers
        pendingContainer.innerHTML = '';
        completedContainer.innerHTML = '';

        if (!orders) {
            pendingContainer.innerHTML = '<div class="no-warehouse-orders">Bekleyen parça siparişi bulunmuyor.</div>';
            completedContainer.innerHTML = '<div class="no-warehouse-orders">Tamamlanan sipariş bulunmuyor.</div>';
            updateWarehouseStats(0, 0);
            if (markAllBtn) markAllBtn.style.display = 'none';
            return;
        }

        const ordersArray = Object.entries(orders).sort(([_, a], [__, b]) => b.timestamp - a.timestamp);

        // Bekleyen ve hazır siparişleri ayır
        const pendingOrders = ordersArray.filter(([_, order]) => order.status === 'pending');
        const readyOrders = ordersArray.filter(([_, order]) => order.status === 'ready');

        // Toplu hazır butonunu göster/gizle
        if (markAllBtn) {
            markAllBtn.style.display = pendingOrders.length > 0 ? 'block' : 'none';
        }

        // Bekleyen siparişler başlık
        const pendingHeader = document.createElement('div');
        pendingHeader.style.padding = '10px';
        pendingHeader.style.marginBottom = '10px';
        pendingHeader.innerHTML = '<h3 style="margin: 0; font-size: 18px; color: #f39c12;">⏳ Bekleyen İstekler</h3>';
        pendingContainer.appendChild(pendingHeader);

        if (pendingOrders.length === 0) {
            const noPending = document.createElement('div');
            noPending.className = 'no-warehouse-orders';
            noPending.textContent = 'Bekleyen istek yok.';
            pendingContainer.appendChild(noPending);
        } else {
            pendingOrders.forEach(([orderId, order]) => {
                const card = createWarehouseOrderCard(orderId, order, true);
                pendingContainer.appendChild(card);
            });
        }

        // Hazır siparişler başlık
        const readyHeader = document.createElement('div');
        readyHeader.style.padding = '10px';
        readyHeader.style.marginBottom = '10px';
        readyHeader.style.position = 'sticky';
        readyHeader.style.top = '0';
        readyHeader.style.background = 'rgba(40, 45, 75, 0.95)';
        readyHeader.style.zIndex = '10';
        readyHeader.innerHTML = '<h3 style="margin: 0; font-size: 18px; color: #2ecc71;">✅ Tamamlanan İstekler (Son 3)</h3>';
        completedContainer.appendChild(readyHeader);

        if (readyOrders.length === 0) {
            const noReady = document.createElement('div');
            noReady.className = 'no-warehouse-orders';
            noReady.textContent = 'Tamamlanan istek yok.';
            completedContainer.appendChild(noReady);
        } else {
            readyOrders.forEach(([orderId, order]) => {
                const card = createWarehouseOrderCard(orderId, order, false);
                completedContainer.appendChild(card);
            });
        }

        updateWarehouseStats(pendingOrders.length, readyOrders.length);
    } catch (error) {
        console.error('Depo siparişleri yüklenirken hata:', error);
    }
}

function createWarehouseOrderCard(orderId, order, isPending) {
    const card = document.createElement('div');
    card.className = 'warehouse-order-card';
    card.style.borderLeft = `4px solid ${isPending ? '#f39c12' : '#2ecc71'}`;

    // Status badge
    const statusBadge = isPending
        ? '<span class="order-status pending">⏳ Bekliyor</span>'
        : '<span class="order-status ready">✅ Hazır</span>';

    // --- DÜZELTME BAŞLANGICI ---
    // Parts list - Hata vermemesi için ekstra güvenlik önlemi
    let partsHTML = '<div class="order-parts"><div class="order-parts-title">🔧 İstenen Parçalar:</div><div class="order-parts-list">';

    // Eğer order.parts bir dizi ise onu kullan, değilse boş bir dizi kullan
    const partsList = Array.isArray(order.parts) ? order.parts : [];

    partsList.forEach((part) => {
        // part nesnesi boş değilse ve ismi varsa ekle
        if (part && part.name) {
            partsHTML += `<span class="part-tag">${part.name}</span>`;
        }
    });
    partsHTML += '</div></div>';
    // --- DÜZELTME BİTİŞİ ---

    card.innerHTML = `
        <div class="order-header">
          <div class="order-barcode">${order.barcode || 'Barkod Yok'}</div>
          ${statusBadge}
        </div>
        
        <div class="order-body">
          <div class="order-field">
            <div class="order-field-label">Model</div>
            <div class="order-field-value">📱 ${order.model || '-'}</div>
          </div>
          
          ${order.customer ? `
            <div class="order-field">
              <div class="order-field-label">Müşteri/Bayi</div>
              <div class="order-field-value">👤 ${order.customer}</div>
            </div>
          ` : ''}
          
          ${order.statusField ? `
            <div class="order-field">
              <div class="order-field-label">Statü</div>
              <div class="order-field-value">📊 ${order.statusField}</div>
            </div>
          ` : ''}
          
          ${order.service ? `
            <div class="order-field">
              <div class="order-field-label">Hizmet</div>
              <div class="order-field-value">🔧 ${order.service}</div>
            </div>
          ` : ''}
          
          <div class="order-field">
            <div class="order-field-label">Teknisyen</div>
            <div class="order-field-value">👤 ${order.technician || '-'}</div>
          </div>
          
          <div class="order-field">
            <div class="order-field-label">Tarih</div>
            <div class="order-field-value">📅 ${order.timestampReadable || '-'}</div>
          </div>
        </div>
        
        ${order.note ? `
          <div class="order-note">
            <div class="order-field-label">Not</div>
            <div class="order-field-value">📝 ${order.note}</div>
          </div>
        ` : ''}
        
        ${partsHTML}
        
        <div class="order-actions">
          ${isPending ? `
            <button class="warehouse-action-btn ready" onclick="markOrderReady('${orderId}')">
              ✅ Hazır Olarak İşaretle
            </button>
          ` : `
            <button class="warehouse-action-btn ready" disabled style="opacity: 0.5; cursor: not-allowed;">
              ✅ Tamamlandı
            </button>
          `}
          <button class="warehouse-action-btn cancel" onclick="cancelOrder('${orderId}')">
            🗑️ İptal Et
          </button>
        </div>
      `;

    return card;
}

function updateWarehouseStats(pending, ready) {
    document.getElementById('warehousePendingCount').textContent = pending;
    document.getElementById('warehouseReadyCount').textContent = ready;
    document.getElementById('warehouseTotalCount').textContent = pending + ready;
}

async function updatePartStatus(orderId, partIndex, status) {
    try {
        await db.ref(`partOrders/${orderId}/parts/${partIndex}/status`).set(status);
        showToast(`Parça durumu güncellendi: ${status === 'available' ? 'Stokta var' : 'Stokta yok'}`, 'info');
        loadWarehouseOrders();
    } catch (error) {
        console.error('Parça durumu güncellenirken hata:', error);
        showToast('Parça durumu güncellenirken hata oluştu!', 'error');
    }
}

async function markOrderReady(orderId) {
    try {
        await db.ref(`partOrders/${orderId}/status`).set('ready');
        showToast('Sipariş hazır olarak işaretlendi!', 'success');
        loadWarehouseOrders();
    } catch (error) {
        console.error('Sipariş hazır olarak işaretlenirken hata:', error);
        showToast('Sipariş işaretlenirken hata oluştu!', 'error');
    }
}

async function cancelOrder(orderId) {
    if (!confirm('Bu siparişi iptal etmek istediğinizden emin misiniz?')) {
        return;
    }

    try {
        await db.ref(`partOrders/${orderId}`).remove();
        showToast('Sipariş iptal edildi!', 'success');
        loadWarehouseOrders();
    } catch (error) {
        console.error('Sipariş iptal edilirken hata:', error);
        showToast('Sipariş iptal edilirken hata oluştu!', 'error');
    }
}

// TOPLU HAZIR İŞARETLEME FONKSİYONU
async function markAllOrdersReady() {
    if (!confirm('Tüm bekleyen siparişleri hazır olarak işaretlemek istediğinizden emin misiniz?')) {
        return;
    }

    try {
        const snapshot = await db.ref('partOrders').once('value');
        const orders = snapshot.val();

        if (!orders) {
            showToast('İşaretlenecek sipariş bulunamadı!', 'warning');
            return;
        }

        // Bekleyen siparişleri bul
        const pendingOrders = Object.entries(orders).filter(([_, order]) => order.status === 'pending');

        if (pendingOrders.length === 0) {
            showToast('Bekleyen sipariş bulunamadı!', 'warning');
            return;
        }

        let successCount = 0;

        // Her bir siparişi hazır olarak işaretle
        for (const [orderId, order] of pendingOrders) {
            try {
                await db.ref(`partOrders/${orderId}/status`).set('ready');
                successCount++;
            } catch (error) {
                console.error(`Sipariş ${orderId} işaretlenirken hata:`, error);
            }
        }

        if (successCount > 0) {
            showToast(`${successCount} sipariş başarıyla hazır olarak işaretlendi!`, 'success');
        } else {
            showToast('Hiçbir sipariş işaretlenemedi!', 'error');
        }

        loadWarehouseOrders();
    } catch (error) {
        console.error('Toplu işaretleme sırasında hata:', error);
        showToast('Toplu işaretleme sırasında bir hata oluştu!', 'error');
    }
}

// Parça bilgilerini gösterme fonksiyonu - Aynı barkoda birden fazla sipariş olabileceği için güncelledik
async function displayPartInfo(barcode, containerElementId) {
    try {
        const snapshot = await db.ref('partOrders').once('value');
        const allOrders = snapshot.val();
        const container = document.getElementById(containerElementId);

        if (!allOrders) {
            container.style.display = 'none';
            return;
        }

        // Bu barkoda ait tüm siparişleri bul
        const matchingOrders = Object.entries(allOrders)
            .filter(([_, order]) => order.barcode === barcode)
            .sort(([_, a], [__, b]) => b.timestamp - a.timestamp); // En yeni önce

        if (matchingOrders.length === 0) {
            container.style.display = 'none';
            return;
        }

        let html = '<div class="part-info-display">';
        html += '<h4>🔧 Parça Sipariş Bilgileri</h4>';

        // Her sipariş için ayrı gösterim
        matchingOrders.forEach(([orderId, order], index) => {
            html += '<div class="part-info-history" style="margin-bottom: 15px; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 15px;">';

            if (matchingOrders.length > 1) {
                html += `<div class="part-info-item"><strong>Sipariş #${index + 1}</strong></div>`;
            }

            html += `<div class="part-info-item"><strong>Model:</strong> ${order.model}</div>`;
            if (order.customer) {
                html += `<div class="part-info-item"><strong>Müşteri/Bayi:</strong> ${order.customer}</div>`;
            }
            if (order.statusField) {
                html += `<div class="part-info-item"><strong>Statü:</strong> ${order.statusField}</div>`;
            }
            if (order.service) {
                html += `<div class="part-info-item"><strong>Hizmet:</strong> ${order.service}</div>`;
            }
            if (order.note) {
                html += `<div class="part-info-item"><strong>Not:</strong> ${order.note}</div>`;
            }
            html += `<div class="part-info-item"><strong>Teknisyen:</strong> ${order.technician}</div>`;
            html += `<div class="part-info-item"><strong>Durum:</strong> ${order.status === 'ready' ? '✅ Hazır' : '⏳ Bekliyor'}</div>`;

            html += '<div class="part-info-item"><strong>İstenilen Parçalar:</strong><br>';
            order.parts.forEach(part => {
                const icon = part.status === 'available' ? '✅' :
                    part.status === 'unavailable' ? '❌' : '⏳';
                html += `${icon} ${part.name}<br>`;
            });
            html += '</div>';

            html += `<div class="part-info-item"><strong>Sipariş Tarihi:</strong> ${order.timestampReadable}</div>`;
            html += '</div>';
        });

        html += '</div>';

        container.innerHTML = html;
        container.style.display = 'block';
    } catch (error) {
        console.error('Parça bilgileri yüklenirken hata:', error);
    }
}

// ========================================
// TEKNİSYEN PERMISSION HELPERS
// ========================================
let ALL_SECTIONS = [
    { id: 'atanacak', name: '📋 Atanacak' },
    { id: 'parcaBekliyor', name: '⚙️ Parça Bekliyor' },
    { id: 'phonecheck', name: '📱 PhoneCheck' },
    { id: 'gokhan', name: '🧑‍🔧 Gökhan' },
    { id: 'enes', name: '🧑‍🔧 Enes' },
    { id: 'yusuf', name: '🧑‍🔧 Yusuf' },
    { id: 'samet', name: '🧑‍🔧 Samet' },

    { id: 'engin', name: '🧑‍🔧 Engin' },
    { id: 'ismail', name: '🧑‍🔧 İsmail' },
    { id: 'mehmet', name: '🧑‍🔧 Mehmet' },
    { id: 'onarim', name: '🔧 Onarım Tamamlandı' },
    { id: 'onCamDisServis', name: '🔨 Ön Cam Dış Servis' },      // YENİ EKLENDİ
    { id: 'anakartDisServis', name: '🔨 Anakart Dış Servis' },  // YENİ EKLENDİ
    { id: 'satisa', name: '💰 Satışa Gidecek' },
    { id: 'sahiniden', name: '🏪 Sahibinden' },
    { id: 'mediaMarkt', name: '🛒 Media Markt' },
    { id: 'SonKullanıcı', name: '🛒 Son Kullanıcı' },
    { id: 'teslimEdilenler', name: '✅ Teslim Edilenler' }
];

async function updateAllSectionsList() {
    try {
        // Firebase'den tüm kullanıcıları al
        const snapshot = await db.ref('users').once('value');
        const users = snapshot.val();

        if (!users) return;

        // Teknisyen rolündeki kullanıcıları bul
        const technicianUsers = Object.entries(users)
            .filter(([uid, userData]) => userData.role === 'technician' && userData.technicianName)
            .map(([uid, userData]) => ({
                id: userData.technicianName,
                name: `🧑‍🔧 ${userData.technicianName.charAt(0).toUpperCase() + userData.technicianName.slice(1)}`
            }));

        // Mevcut statik listeden teknisyen bölümlerini çıkar
        const staticSections = ALL_SECTIONS.filter(section =>
            !['gokhan', 'enes', 'yusuf', 'samet', 'engin', 'ismail', 'mehmet'].includes(section.id)
        );

        // Statik bölümler + dinamik teknisyenler
        const specialSections = staticSections.filter(s => !s.id.match(/^(atanacak|parcaBekliyor|phonecheck)$/));
        const topSections = staticSections.filter(s => s.id.match(/^(atanacak|parcaBekliyor|phonecheck)$/));

        // Yeni listeyi oluştur: Üst bölümler + Tüm teknisyenler + Diğer bölümler
        ALL_SECTIONS = [...topSections, ...technicianUsers, ...specialSections];

    } catch (error) {
        console.error('Teknisyen listesi güncellenirken hata:', error);
    }
}

function handleRoleChange() {
    const role = document.getElementById('newUserRole').value;
    const permissionsDiv = document.getElementById('technicianPermissions');

    if (role === 'technician') {
        permissionsDiv.style.display = 'block';
        renderPermissionsGrid();
    } else {
        permissionsDiv.style.display = 'none';
    }
}

async function renderPermissionsGrid() {
    // Önce listeyi güncelle
    await updateAllSectionsList();

    const grid = document.getElementById('permissionsGrid');
    grid.innerHTML = '';

    ALL_SECTIONS.forEach(section => {
        const item = document.createElement('div');
        item.className = 'permission-item';
        item.innerHTML = `
          <input type="checkbox" id="perm_${section.id}" value="${section.id}">
          <label for="perm_${section.id}">${section.name}</label>
          <select class="permission-type-select" id="permType_${section.id}">
            <option value="view">👁️ Görüntüle</option>
            <option value="edit">✏️ Düzenle</option>
          </select>
        `;
        grid.appendChild(item);
    });
}

function collectTechnicianPermissions() {
    const permissions = {};

    ALL_SECTIONS.forEach(section => {
        const checkbox = document.getElementById(`perm_${section.id}`);
        const select = document.getElementById(`permType_${section.id}`);

        if (checkbox && checkbox.checked) {
            permissions[section.id] = select ? select.value : 'view';
        }
    });

    return permissions;
}

// ========================================
// USER EDIT FUNCTIONS
// ========================================
function openEditUserModal(uid, userData) {
    console.log('✏️ openEditUserModal called', uid, userData);
    editingUserId = uid;
    const modal = document.getElementById('editUserModal');
    console.log('Edit user modal element:', modal);
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex'; // Force display
    }
    document.getElementById('editUserEmail').textContent = userData.email;
    document.getElementById('editUserRole').value = userData.role || 'viewer';

    if (userData.role === 'technician' && userData.permissions) {
        document.getElementById('editTechnicianPermissions').style.display = 'block';
        renderEditPermissionsGrid(userData.permissions);
    } else {
        document.getElementById('editTechnicianPermissions').style.display = 'none';
    }
}

function closeEditUserModal() {
    console.log('❌ closeEditUserModal called');
    const modal = document.getElementById('editUserModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
    editingUserId = null;
}

function handleEditRoleChange() {
    const role = document.getElementById('editUserRole').value;
    const permissionsDiv = document.getElementById('editTechnicianPermissions');

    if (role === 'technician') {
        permissionsDiv.style.display = 'block';
        renderEditPermissionsGrid();
    } else {
        permissionsDiv.style.display = 'none';
    }
}

async function renderEditPermissionsGrid(existingPermissions = {}) {
    await updateAllSectionsList();

    const grid = document.getElementById('editPermissionsGrid');
    grid.innerHTML = '';

    ALL_SECTIONS.forEach(section => {
        const item = document.createElement('div');
        item.className = 'permission-item';

        const isChecked = existingPermissions[section.id] ? 'checked' : '';
        const permType = existingPermissions[section.id] || 'view';

        item.innerHTML = `
          <input type="checkbox" id="editPerm_${section.id}" value="${section.id}" ${isChecked}>
          <label for="editPerm_${section.id}">${section.name}</label>
          <select class="permission-type-select" id="editPermType_${section.id}">
            <option value="view" ${permType === 'view' ? 'selected' : ''}>👁️ Görüntüle</option>
            <option value="edit" ${permType === 'edit' ? 'selected' : ''}>✏️ Düzenle</option>
          </select>
        `;
        grid.appendChild(item);
    });
}

function collectEditTechnicianPermissions() {
    const permissions = {};

    ALL_SECTIONS.forEach(section => {
        const checkbox = document.getElementById(`editPerm_${section.id}`);
        const select = document.getElementById(`editPermType_${section.id}`);

        if (checkbox && checkbox.checked) {
            permissions[section.id] = select ? select.value : 'view';
        }
    });

    return permissions;
}

async function saveEditedUser() {
    console.log('💾 saveEditedUser called', editingUserId);
    if (!editingUserId) {
        console.log('❌ No editingUserId');
        return;
    }

    const newRole = document.getElementById('editUserRole').value;

    try {
        const userSnapshot = await db.ref(`users/${editingUserId}`).once('value');
        const currentUserData = userSnapshot.val();
        const oldRole = currentUserData.role;
        const oldTechnicianName = currentUserData.technicianName;

        const updateData = {
            role: newRole,
            updatedAt: Date.now(),
            updatedBy: currentUserName
        };

        // Teknisyen izinleri
        if (newRole === 'technician') {
            const permissions = collectEditTechnicianPermissions();

            if (Object.keys(permissions).length === 0) {
                showToast('Lütfen en az bir izin seçin!', 'error');
                return;
            }

            updateData.permissions = permissions;

            // Yeni teknisyen alanı oluştur
            if (!currentUserData.technicianName) {
                const technicianName = currentUserData.email.split('@')[0];
                updateData.technicianName = technicianName;

                await db.ref(`servis/${technicianName}`).set({
                    adet: 0,
                    createdAt: Date.now()
                });
            }
        } else {
            // Teknisyen değilse izinleri ve teknisyen adını kaldır
            updateData.permissions = null;
            updateData.technicianName = null;

            // Eski teknisyen alanını sil
            if (oldRole === 'technician' && oldTechnicianName) {
                await db.ref(`servis/${oldTechnicianName}`).remove();
            }
        }

        await db.ref(`users/${editingUserId}`).update(updateData);

        showToast('Kullanıcı başarıyla güncellendi!', 'success');
        closeEditUserModal();
        loadUsers();

        // Eğer rol değiştiyse sayfayı yenile
        if (oldRole !== newRole || (newRole === 'technician' && !currentUserData.technicianName)) {
            setTimeout(() => location.reload(), 1500);
        }
    } catch (error) {
        console.error('Kullanıcı güncellenirken hata:', error);
        showToast('Kullanıcı güncellenirken hata oluştu!', 'error');
    }
}

// ========================================
// USER MANAGEMENT FUNCTIONS
// ========================================
function openAddUserModal() {
    document.getElementById('addUserModal').classList.add('active');
    document.getElementById('newUserEmail').value = '';
    document.getElementById('newUserPassword').value = '';
    document.getElementById('newUserRole').value = 'viewer';
    document.getElementById('technicianPermissions').style.display = 'none';
}

function closeAddUserModal() {
    document.getElementById('addUserModal').classList.remove('active');
}

async function addNewUser() {
    const email = document.getElementById('newUserEmail').value.trim();
    const password = document.getElementById('newUserPassword').value;
    const role = document.getElementById('newUserRole').value;

    if (!email || !password) {
        showToast('Email ve şifre gereklidir!', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('Şifre en az 6 karakter olmalıdır!', 'error');
        return;
    }

    let permissions = null;
    let technicianName = null;

    if (role === 'technician') {
        permissions = collectTechnicianPermissions();

        if (Object.keys(permissions).length === 0) {
            showToast('Lütfen en az bir izin seçin!', 'error');
            return;
        }

        technicianName = email.split('@')[0];
    }

    try {
        const secondaryApp = firebase.initializeApp(firebaseConfig, 'Secondary-' + Date.now());
        const userCredential = await secondaryApp.auth().createUserWithEmailAndPassword(email, password);
        const newUid = userCredential.user.uid;
        await secondaryApp.auth().signOut();
        await secondaryApp.delete();

        const userData = {
            email: email,
            role: role,
            createdAt: Date.now(),
            createdBy: currentUserName
        };

        if (role === 'technician') {
            userData.permissions = permissions;
            userData.technicianName = technicianName;

            await db.ref(`servis/${technicianName}`).set({
                adet: 0,
                createdAt: Date.now()
            });
        }

        await db.ref(`users/${newUid}`).set(userData);

        showToast(`Kullanıcı başarıyla eklendi: ${email}${role === 'technician' ? ' (Teknisyen alanı oluşturuldu)' : ''}`, 'success');
        closeAddUserModal();
        loadUsers();

        if (role === 'technician') {
            setTimeout(() => location.reload(), 1500);
        }
    } catch (error) {
        console.error('Kullanıcı ekleme hatası:', error);
        let message = 'Kullanıcı eklenirken hata oluştu!';

        if (error.code === 'auth/email-already-in-use') {
            message = 'Bu email zaten kullanılıyor!';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Geçersiz email adresi!';
        } else if (error.code === 'auth/weak-password') {
            message = 'Şifre çok zayıf!';
        }

        showToast(message, 'error');
    }
}

async function deleteUser(uid, email) {
    if (!confirm(`${email} kullanıcısını silmek istediğinizden emin misiniz?`)) {
        return;
    }

    try {
        const userSnapshot = await db.ref(`users/${uid}`).once('value');
        const userData = userSnapshot.val();

        if (userData && userData.role === 'technician' && userData.technicianName) {
            await db.ref(`servis/${userData.technicianName}`).remove();
        }

        await db.ref(`users/${uid}`).remove();

        showToast(`Kullanıcı silindi: ${email}`, 'success');
        loadUsers();

        if (userData && userData.role === 'technician') {
            setTimeout(() => location.reload(), 1500);
        }
    } catch (error) {
        console.error('Kullanıcı silme hatası:', error);
        showToast('Kullanıcı silinirken hata oluştu!', 'error');
    }
}

async function loadUsers() {
    if (currentUserRole !== 'admin') return;

    try {
        const snapshot = await db.ref('users').once('value');
        const users = snapshot.val();
        const userList = document.getElementById('userList');
        userList.innerHTML = '';

        if (!users) {
            userList.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.7);">Henüz kullanıcı eklenmemiş</p>';
            return;
        }

        const currentUser = auth.currentUser;
        if (currentUser && currentUser.email === 'admin@servis.com') {
            const adminSnapshot = await db.ref(`users/${currentUser.uid}`).once('value');
            if (!adminSnapshot.exists()) {
                await db.ref(`users/${currentUser.uid}`).set({
                    email: 'admin@servis.com',
                    role: 'admin',
                    createdAt: Date.now(),
                    createdBy: 'System'
                });
            }
        }

        Object.entries(users).forEach(([uid, userData]) => {
            const roleIcons = {
                viewer: '👁️',
                editor: '✏️',
                'semi-admin': '👔',
                admin: '👑',
                technician: '🔧',
                warehouse: '📦'
            };

            const roleNames = {
                viewer: 'Görüntüleyici',
                editor: 'Düzenleyici',
                'semi-admin': 'Yarı Admin',
                admin: 'Admin',
                technician: 'Teknisyen',
                warehouse: 'Depocu'
            };

            const userCard = document.createElement('div');
            userCard.className = 'user-card';

            let permissionsInfo = '';
            if (userData.role === 'technician' && userData.permissions) {
                const permCount = Object.keys(userData.permissions).length;
                permissionsInfo = `<div style="font-size: 11px; color: rgba(255,255,255,0.7); margin-top: 5px;">${permCount} alan izni</div>`;
            }

            // JSON stringify ile userData'yı güvenli bir şekilde attribute'a ekle
            const userDataStr = JSON.stringify(userData).replace(/"/g, '&quot;');

            userCard.innerHTML = `
            <div class="user-card-header">
              <span class="user-email">${userData.email}</span>
            </div>
            <div class="user-role">${roleIcons[userData.role] || '👤'} ${roleNames[userData.role] || userData.role}</div>
            ${permissionsInfo}
            <div class="user-actions">
              ${userData.email !== 'admin@servis.com' && userData.email !== 'depo@mobilfon.com' ? `
                <button class="user-action-btn" style="background: #3498db; color: white;" onclick='openEditUserModal("${uid}", ${userDataStr})'>✏️ Düzenle</button>
                <button class="user-action-btn delete" onclick="deleteUser('${uid}', '${userData.email}')">🗑️ Sil</button>
              ` : '<span style="font-size: 11px; color: rgba(255,255,255,0.5); text-align: center; width: 100%;">Korumalı Kullanıcı</span>'}
            </div>
          `;
            userList.appendChild(userCard);
        });
    } catch (error) {
        console.error('Kullanıcılar yüklenirken hata:', error);
        showToast('Kullanıcılar yüklenirken hata oluştu!', 'error');
    }
}

// ========================================
// DYNAMIC TECHNICIAN SECTIONS
// ========================================
async function loadTechnicianSections() {
    try {
        const snapshot = await db.ref('users').once('value');
        const users = snapshot.val();

        if (!users) return;

        const technicians = Object.entries(users)
            .filter(([uid, userData]) => userData.role === 'technician')
            .map(([uid, userData]) => userData.technicianName)
            .filter(name => name);

        const container = document.getElementById('techniciansContainer');

        technicians.forEach(techName => {
            if (!document.querySelector(`[data-section="${techName}"]`)) {
                createTechnicianSection(techName, container);
            }
        });
    } catch (error) {
        console.error('Teknisyen bölümleri yüklenirken hata:', error);
    }
}

function createTechnicianSection(techName, container) {
    const section = document.createElement('div');
    section.className = 'section';
    section.setAttribute('data-section', techName);

    const capitalizedName = techName.charAt(0).toUpperCase() + techName.slice(1);



    section.innerHTML = `
        <label for="${techName}Input">
          <span id="${techName}Label">🧑‍🔧 ${capitalizedName}'ın Cihazları -  0</span>
        </label>
        <textarea id="${techName}Input" placeholder="${capitalizedName}'ın barkodlarını buraya yapıştır..."></textarea>
        <div id="${techName}List" class="mini-list"></div>
      `;

    container.appendChild(section);

    inputs[techName] = document.getElementById(`${techName}Input`);
    labels[techName] = document.getElementById(`${techName}Label`);
    miniLists[techName] = document.getElementById(`${techName}List`);
    userCodes[techName] = new Set();
    codeTimestamps[techName] = {};
    codeUsers[techName] = {};

    inputs[techName].addEventListener("input", () => {
        if (inputs[techName].name === "scanner" || inputs[techName].name === "search") return;
        saveCodes(techName, inputs[techName].value);
    });

    setTimeout(() => {
        const sectionElem = document.querySelector(`[data-section="${techName}"]`);
        const list = document.getElementById(`${techName}List`);

        if (sectionElem && list && !list.dataset.toggleSetup) {
            list.dataset.toggleSetup = 'true';
            setupSectionToggle(sectionElem, `${techName}List`, `${techName}Label`);
        }
    }, 100);
}

// ========================================
// BARCODE EDIT/DELETE FUNCTIONS
// ========================================
function openEditBarcodeModal(code, listName) {
    editingBarcode = code;
    editingList = listName;
    document.getElementById('editBarcodeModal').classList.add('active');
    document.getElementById('editBarcodeInput').value = code;
}

function closeEditBarcodeModal() {
    document.getElementById('editBarcodeModal').classList.remove('active');
    editingBarcode = null;
    editingList = null;
}

async function saveEditedBarcode() {
    const newCode = document.getElementById('editBarcodeInput').value.trim();

    if (!newCode || newCode.length !== 15 || !/^\d+$/.test(newCode)) {
        showToast('Geçerli bir 15 haneli barkod giriniz!', 'error');
        return;
    }

    if (newCode === editingBarcode) {
        showToast('Barkod değiştirilmedi!', 'info');
        closeEditBarcodeModal();
        return;
    }

    try {
        const dbPath = editingList === 'onarim' ? 'onarimTamamlandi' : editingList;
        const timestamp = getTimestamp();

        await db.ref(`servis/${dbPath}/${editingBarcode}`).remove();
        await db.ref(`servis/${dbPath}/${newCode}`).set({
            ts: timestamp,
            user: currentUserName
        });

        saveBarcodeHistory(newCode, editingList, editingList, `${currentUserName} (Düzenleme: ${editingBarcode})`);

        userCodes[editingList].delete(editingBarcode);
        userCodes[editingList].add(newCode);
        delete codeTimestamps[editingList][editingBarcode];
        delete codeUsers[editingList][editingBarcode];
        codeTimestamps[editingList][newCode] = timestamp;
        codeUsers[editingList][newCode] = currentUserName;

        showToast(`Barkod güncellendi: ${editingBarcode} → ${newCode}`, 'success');
        closeEditBarcodeModal();
        renderList();
    } catch (error) {
        console.error('Barkod düzenleme hatası:', error);
        showToast('Barkod düzenlenirken hata oluştu!', 'error');
    }
}

async function deleteBarcode(code, listName) {
    if (!confirm(`${code} barkodunu silmek istediğinizden emin misiniz?`)) {
        return;
    }

    try {
        const dbPath = listName === 'onarim' ? 'onarimTamamlandi' : listName;

        await db.ref(`servis/${dbPath}/${code}`).remove();
        saveBarcodeHistory(code, listName, 'SİLİNDİ', `${currentUserName} (Silme)`);

        userCodes[listName].delete(code);
        delete codeTimestamps[listName][code];
        delete codeUsers[listName][code];

        showToast(`Barkod silindi: ${code}`, 'success');
        updateLabelAndCount(listName);
        renderList();
    } catch (error) {
        console.error('Barkod silme hatası:', error);
        showToast('Barkod silinirken hata oluştu!', 'error');
    }
}

// ========================================
// AUTH & LOGIN
// ========================================
// ========================================
// AUTH & LOGIN - DÜZELTMİŞ VERSİYON
// ========================================
auth.onAuthStateChanged(async user => {
    if (user) {
        loginScreen.style.display = "none";
        appContainer.style.display = "block";

        // ESKİ USERINFO'YU GİZLE
        if (document.getElementById('userInfo')) {
            document.getElementById('userInfo').style.display = 'none';
        }

        const name = user.email.split('@')[0];
        currentUserName = name;

        await loadTechnicianSections();

        if (user.email === 'admin@servis.com') {
            const adminSnapshot = await db.ref(`users/${user.uid}`).once('value');
            if (!adminSnapshot.exists()) {
                await db.ref(`users/${user.uid}`).set({
                    email: 'admin@servis.com',
                    role: 'admin',
                    createdAt: Date.now(),
                    createdBy: 'System'
                });
            }
        }

        // Depocu kontrolü
        if (user.email === 'depo@mobilfon.com') {
            const depocuSnapshot = await db.ref(`users/${user.uid}`).once('value');
            if (!depocuSnapshot.exists()) {
                await db.ref(`users/${user.uid}`).set({
                    email: 'depo@mobilfon.com',
                    role: 'warehouse',
                    createdAt: Date.now(),
                    createdBy: 'System'
                });
            }
        }

        try {
            const userSnapshot = await db.ref(`users/${user.uid}`).once('value');
            const userData = userSnapshot.val();

            if (user.email === 'admin@servis.com') {
                currentUserRole = 'admin';
                document.getElementById('userManagementBtn').style.display = 'block';
                document.getElementById('systemLogsBtn').style.display = 'block'; // Sistem Logları butonu
                document.getElementById('resetDashboardBtn').style.display = 'block';
                document.getElementById('restoreDashboardBtn').style.display = 'inline-block';
                currentUserPermissions = null;
                document.getElementById('adminNav').style.display = 'flex';
                document.getElementById('navUserInfo').style.display = 'flex';




                // ✅ DATA SYNC AUTO CHECK BAŞLAT (SADECE ADMIN)
                setTimeout(() => {
                    startDataSyncAutoCheck();
                    console.log('✅ Data Sync Otomatik Kontrol Sistemi Başlatıldı');
                }, 3000);

                // ✅ ADMIN DOĞRUDAN ANA SAYFAYI GÖRSÜN
                setTimeout(() => showMainView(), 100);
            } else if (user.email === 'depo@mobilfon.com') {
                currentUserRole = 'warehouse';
                currentUserPermissions = null;
                document.getElementById('navUserInfo').style.display = 'flex';
                // DEPOCU İÇİN İLK GİRİŞTE WAREHOUSE PANELİNİ GÖSTER
                setTimeout(() => showWarehouseView(), 100);
            } else if (userData && userData.role) {
                // ✅ ÖZEL DURUM: Enes'in rolü yanlışlıkla warehouse ise düzelt
                if (name === 'enes' && userData.role === 'warehouse') {
                    console.warn('⚠️ Enes kullanıcısının rolü yanlışlıkla warehouse! Editor olarak düzeltiliyor...');
                    currentUserRole = 'editor';
                    // Firebase'de de düzelt
                    db.ref(`users/${user.uid}/role`).set('editor');
                } else {
                    currentUserRole = userData.role;
                }

                currentUserPermissions = userData.permissions || null;
                document.getElementById('navUserInfo').style.display = 'flex';

                // ✅ DEPO DIŞINDA HERKES ANA SAYFAYI GÖRSÜN
                setTimeout(() => showMainView(), 100);
            } else {
                if (name === 'admin') {
                    currentUserRole = 'admin';
                } else if (name === 'samil' || name === 'ibrahim') {
                    currentUserRole = 'semi-admin';
                } else if (name === 'enes') {
                    currentUserRole = 'editor';
                } else {
                    currentUserRole = 'viewer';
                }
                currentUserPermissions = null;
                document.getElementById('navUserInfo').style.display = 'flex';

                // ✅ YENİ EKLENEN: Bu kullanıcılar için de ana sayfayı göster
                setTimeout(() => showMainView(), 100);
            }

            // Role config (DEPOCU EKLENDİ)
            const roleConfig = {
                'admin': {
                    icon: '👑',
                    text: 'Admin',
                    gradient: 'linear-gradient(135deg, #93fb98ff, #5796f5ff)',
                    showAdminPanel: true,
                    showUserManagement: true,
                    showNav: true
                },
                'semi-admin': {
                    icon: '👔',
                    text: `${name.charAt(0).toUpperCase() + name.slice(1)} (Yarı Admin)`,
                    gradient: 'linear-gradient(135deg, #f39c12, #e67e22)',
                    showAdminPanel: true,
                    showUserManagement: false,
                    showNav: false
                },
                'editor': {
                    icon: '✏️',
                    text: `${name.charAt(0).toUpperCase() + name.slice(1)} (Düzenleyici)`,
                    gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
                    showAdminPanel: false,
                    showUserManagement: false,
                    showNav: false
                },
                'viewer': {
                    icon: '👁️',
                    text: `${name.charAt(0).toUpperCase() + name.slice(1)} (Görüntüleme)`,
                    gradient: 'linear-gradient(135deg, #95a5a6, #7f8c8d)',
                    showAdminPanel: false,
                    showUserManagement: false,
                    showNav: false
                },
                'technician': {
                    icon: '🔧',
                    text: `${name.charAt(0).toUpperCase() + name.slice(1)} (Teknisyen)`,
                    gradient: 'linear-gradient(135deg, #e67e22, #d35400)',
                    showAdminPanel: false,
                    showUserManagement: false,
                    showNav: false
                },
                'warehouse': {
                    icon: '📦',
                    text: 'Depocu',
                    gradient: 'linear-gradient(135deg, #2ecc71, #27ae60)',
                    showAdminPanel: false,
                    showUserManagement: false,
                    showNav: true,
                    showWarehousePanel: true // YENİ EKLENDİ
                }
            };

            const config = roleConfig[currentUserRole] || roleConfig['viewer'];

            document.getElementById('navUserName').textContent = `${config.icon} ${config.text}`;

            // ✅ TÜM PANELLERİ ÖNCE GİZLE
            document.getElementById('adminPanel').style.display = 'none';
            document.getElementById('userManagement').style.display = 'none';
            document.getElementById('warehousePanel').style.display = 'none';
            document.getElementById('mainLayout').style.display = 'none';
            document.getElementById('dashboardPanel').style.display = 'none';

            // ✅ SADECE İLGİLİ PANELLERİ GÖSTER
            if (config.showAdminPanel) {
                document.getElementById('adminPanel').style.display = 'block';
            }
            if (config.showUserManagement) {
                document.getElementById('userManagement').style.display = 'block';
            }

            document.getElementById('adminNav').style.display = 'flex';

            // ✅ DEPOCU İÇİN ÖZEL KONTROL - SADECE WAREHOUSE PANEL
            if (currentUserRole === 'warehouse') {
                document.getElementById('warehousePanel').style.display = 'block';
                document.getElementById('mainLayout').style.display = 'none';
                document.getElementById('adminPanel').style.display = 'none';
                loadWarehouseOrders();
            }

            // Dashboard kontrolü
            if (currentUserRole === 'admin' || currentUserRole === 'semi-admin') {
                document.getElementById('dashboardPanel').style.display = 'block';
                updateDashboardDate();
                loadDashboardStats();
            } else {
                document.getElementById('dashboardPanel').style.display = 'none';
            }

            if (config.showUserManagement) {
                loadUsers();
            }

            // Teknisyen için parça sipariş özellikleri
            const technicianUsers = ['technician', 'samet', 'yusuf', 'ismail', 'gokhan', 'engin', 'enes', 'mehmet'];
            if (currentUserRole === 'technician' || technicianUsers.includes(name)) {
                document.getElementById('partOrderButton').style.display = 'flex';
                document.getElementById('technicianPartOrders').style.display = 'block';
                loadTechnicianPartOrders();

                db.ref('partOrders').on('value', () => {
                    loadTechnicianPartOrders();
                });
            }

            // ✅ Başlangıç görünümü artık yukarıda her rol için ayrı ayrı ayarlanıyor

        } catch (error) {
            console.error('Kullanıcı rolü alınırken hata:', error);
            currentUserRole = 'viewer';
            document.getElementById('navUserName').textContent = `👁️ ${name.charAt(0).toUpperCase() + name.slice(1)} (Görüntüleme)`;
            document.getElementById('navUserInfo').style.display = 'flex';
            document.getElementById('adminNav').style.display = 'flex';
        }

        dataLoaded = false;
        loadData();
        applyPermissions();

        const normalUserSearch = document.getElementById('normalUserSearch');
        const scannerSection = document.getElementById('scannerSection');
        const normalSearchSection = document.getElementById('normalSearchSection');

        if (currentUserRole === 'admin' || currentUserRole === 'semi-admin') {
            if (normalUserSearch) normalUserSearch.style.display = 'none';
        } else {
            if (normalUserSearch) normalUserSearch.style.display = 'flex';
        }

        const technicianUsers = ['gokhan', 'samet', 'yusuf', 'ismail', 'engin', 'mehmet', 'enes'];
        const isTechnician = currentUserRole === 'technician' || technicianUsers.includes(currentUserName);

        if (isTechnician && scannerSection && normalSearchSection) {
            const parentContainer = scannerSection.parentNode;
            const scannerIndex = Array.from(parentContainer.children).indexOf(scannerSection);
            const searchIndex = Array.from(parentContainer.children).indexOf(normalSearchSection);

            if (searchIndex < scannerIndex) {
                parentContainer.insertBefore(scannerSection, normalSearchSection);
            }
        }

        setTimeout(() => {
            setupSectionToggle();
        }, 500);


        if (currentUserRole === 'admin' || currentUserRole === 'semi-admin') {
            startConflictMonitoring();
        } else {
            stopConflictMonitoring();
        }

    } else {
        loginScreen.style.display = "flex";
        appContainer.style.display = "none";
        document.getElementById('adminNav').style.display = 'none';
        document.getElementById('navUserInfo').style.display = 'none';
        currentUserRole = null;
        currentUserName = null;
        currentUserPermissions = null;
        dataLoaded = false;
    }
});


function showWarehouseView() {
    // ✅ SADECE DEPOCU ERİŞEBİLİR
    if (currentUserRole !== 'warehouse') {
        console.warn('⚠️ Bu panele sadece depocu kullanıcısı erişebilir!');
        showToast('Bu panele sadece depocu kullanıcısı erişebilir!', 'error');
        return;
    }

    if (isNavigationInProgress) return;
    isNavigationInProgress = true;

    try {
        // ✅ TÜM DİĞER PANELLERİ GİZLE
        document.getElementById('mainLayout').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'none';
        document.getElementById('dashboardPanel').style.display = 'none';
        document.getElementById('userManagement').style.display = 'none';

        // ✅ SADECE WAREHOUSE PANELİNİ GÖSTER
        document.getElementById('warehousePanel').style.display = 'block';

        // Modal'ları kapat
        if (document.getElementById('reportsModal').classList.contains('active')) {
            closeReportsModalWithoutNavigation();
        }

        // Navigasyon butonlarını güncelle
        updateNavButtons('warehouse');

        // Depo siparişlerini yükle
        loadWarehouseOrders();
    } finally {
        isNavigationInProgress = false;
    }
}


loginButton.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showError("Email ve şifre gereklidir!");
        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Giriş yapılıyor...";

    try {
        await auth.signInWithEmailAndPassword(email, password);
        errorMessage.style.display = "none";
    } catch (error) {
        console.error("Giriş hatası:", error);
        let message = "Giriş başarısız! " + (error.message || "");
        if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
            message = "Email veya şifre hatalı!";
        } else if (error.code === "auth/user-not-found") {
            message = "Kullanıcı bulunamadı!";
        } else if (error.code === "auth/invalid-email") {
            message = "Geçersiz email adresi!";
        } else if (error.code === "auth/too-many-requests") {
            message = "Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.";
        }
        showError(message);
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = "Giriş Yap";
    }
});

passwordInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        loginButton.click();
    }
});

document.getElementById('navLogoutButton').addEventListener("click", () => {
    stopConflictMonitoring(); // ⬅️ BU SATIRI EKLEYİN
    auth.signOut();
});

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    setTimeout(() => {
        errorMessage.style.display = "none";
    }, 5000);
}

function applyPermissions() {
    const normalUsers = ['gokhan', 'enes', 'yusuf', 'samet', 'ismail', 'engin', 'mehmet'];
    const specialInputs = ['phonecheck', 'parcaBekliyor', 'atanacak', 'satisa', 'sahiniden', 'mediaMarkt'];

    // Teknisyen izinleri
    if (currentUserRole === 'technician' && currentUserPermissions) {
        // Tüm section'ları topla (dinamik teknisyenler dahil)
        const allSectionIds = [...normalUsers, ...specialInputs, 'onarim', 'teslimEdilenler'];

        // Dinamik olarak eklenen teknisyen section'larını da ekle
        Object.keys(inputs).forEach(name => {
            if (!allSectionIds.includes(name) && name !== 'scanner' && name !== 'search' && name !== 'searchNormal') {
                allSectionIds.push(name);
            }
        });

        allSectionIds.forEach(name => {
            if (inputs[name]) {
                const permission = currentUserPermissions[name];

                if (!permission) {
                    const section = document.querySelector(`[data-section="${name}"]`);
                    if (section) section.style.display = 'none';

                    const rightSection = inputs[name].closest('.right-section, .special-right-section, .delivered-section');
                    if (rightSection) rightSection.style.display = 'none';
                } else if (permission === 'view') {
                    inputs[name].disabled = true;
                    inputs[name].style.opacity = '0.7';
                    inputs[name].style.cursor = 'not-allowed';
                    inputs[name].placeholder = '🔒 Sadece görüntüleme izniniz var';
                } else if (permission === 'edit') {
                    inputs[name].disabled = false;
                    inputs[name].style.opacity = '1';
                    inputs[name].style.cursor = 'text';
                }
            }
        });

        if (inputs[currentUserName]) {
            inputs[currentUserName].disabled = false;
            inputs[currentUserName].style.opacity = '1';
            inputs[currentUserName].style.cursor = 'text';
        }

        if (inputs.atanacak) {
            inputs.atanacak.disabled = true;
            inputs.atanacak.style.opacity = '0.6';
            inputs.atanacak.style.cursor = 'not-allowed';
            inputs.atanacak.placeholder = '🔒 Teknisyenler cihaz atayamaz';
        }

        inputs.scanner.disabled = false;
        inputs.scanner.style.opacity = '1';
        inputs.scanner.style.cursor = 'text';

        if (inputs.searchNormal) {
            inputs.searchNormal.disabled = false;
            inputs.searchNormal.style.opacity = '1';
            inputs.searchNormal.style.cursor = 'text';
        }

        return;
    }

    if (currentUserRole === 'semi-admin') {
        const allInputNames = ['atanacak', 'parcaBekliyor', 'phonecheck', 'gokhan', 'enes', 'yusuf', 'samet', 'engin', 'ismail', 'mehmet', 'onarim', 'satisa', 'sahiniden', 'mediaMarkt', 'teslimEdilenler'];

        Object.keys(inputs).forEach(name => {
            if (!allInputNames.includes(name) && inputs[name] && name !== 'scanner' && name !== 'search' && name !== 'searchNormal') {
                allInputNames.push(name);
            }
        });

        allInputNames.forEach(name => {
            if (inputs[name]) {
                inputs[name].disabled = true;
                inputs[name].style.opacity = '0.7';
                inputs[name].style.cursor = 'not-allowed';
                inputs[name].placeholder = '🔒 Sadece görüntüleme - Düzenleme yetkiniz yok';
            }
        });

        inputs.scanner.disabled = true;
        inputs.scanner.style.opacity = '0.6';
        inputs.scanner.style.cursor = 'not-allowed';
        inputs.scanner.placeholder = '🔒 Barkod okutma yetkiniz yok';

        if (inputs.search) {
            inputs.search.disabled = false;
            inputs.search.style.opacity = '1';
            inputs.search.style.cursor = 'text';
            inputs.search.placeholder = 'Aramak istediğiniz barkodu girin...';
        }

        if (inputs.searchNormal) {
            inputs.searchNormal.disabled = false;
            inputs.searchNormal.style.opacity = '1';
            inputs.searchNormal.style.cursor = 'text';
            inputs.searchNormal.placeholder = 'Aramak istediğiniz barkodu girin...';
        }

        return;
    }

    specialInputs.forEach(name => {
        if (inputs[name]) {
            inputs[name].disabled = false;
            inputs[name].style.opacity = '1';
            inputs[name].style.cursor = 'text';
        }
    });

    if (currentUserName === 'yusuf') {
        inputs.onarim.disabled = false;
        inputs.onarim.style.opacity = '1';
        inputs.onarim.style.cursor = 'text';
        inputs.onarim.placeholder = 'Onarımı tamamlanan barkodları girin...';
    } else {
        inputs.onarim.disabled = true;
        inputs.onarim.style.opacity = '0.6';
        inputs.onarim.style.cursor = 'not-allowed';
        inputs.onarim.placeholder = '🔒 Sadece Yusuf düzenleyebilir - Görüntüleme modu';
    }

    // Teslim Edilenler: admin, mehmet ve samet erişebilir
    if (currentUserRole === 'admin' || currentUserName === 'mehmet' || currentUserName === 'samet') {
        inputs.teslimEdilenler.disabled = false;
        inputs.teslimEdilenler.style.opacity = '1';
        inputs.teslimEdilenler.style.cursor = 'text';
        inputs.teslimEdilenler.placeholder = 'Teslim edilen barkodları girin...';
    } else {
        inputs.teslimEdilenler.disabled = true;
        inputs.teslimEdilenler.style.opacity = '0.6';
        inputs.teslimEdilenler.style.cursor = 'not-allowed';
        inputs.teslimEdilenler.placeholder = '🔒 Sadece Admin, Mehmet ve Samet düzenleyebilir - Görüntüleme modu';
    }

    if (currentUserRole === 'viewer') {
        normalUsers.forEach(name => {
            if (inputs[name]) {
                inputs[name].disabled = true;
                inputs[name].style.opacity = '0.6';
                inputs[name].style.cursor = 'not-allowed';
                inputs[name].placeholder = '🔒 Sadece görüntüleme - Düzenleme yetkiniz yok';
            }
        });

        inputs.atanacak.disabled = true;
        inputs.atanacak.style.opacity = '0.6';
        inputs.atanacak.style.cursor = 'not-allowed';
        inputs.atanacak.placeholder = '🔒 Sadece görüntüleme - Düzenleme yetkiniz yok';

        if (inputs.search) {
            inputs.search.disabled = false;
            inputs.search.style.opacity = '1';
            inputs.search.style.cursor = 'text';
            inputs.search.placeholder = 'Aramak istediğiniz barkodu girin...';
        }

        if (inputs.searchNormal) {
            inputs.searchNormal.disabled = false;
            inputs.searchNormal.style.opacity = '1';
            inputs.searchNormal.style.cursor = 'text';
            inputs.searchNormal.placeholder = 'Aramak istediğiniz barkodu girin...';
        }
    } else {
        normalUsers.forEach(name => {
            if (inputs[name]) {
                inputs[name].disabled = false;
                inputs[name].style.opacity = '1';
                inputs[name].style.cursor = 'text';
            }
        });

        inputs.atanacak.disabled = false;
        inputs.atanacak.style.opacity = '1';
        inputs.atanacak.style.cursor = 'text';

        if (inputs.search) {
            inputs.search.disabled = false;
            inputs.search.style.opacity = '1';
            inputs.search.style.cursor = 'text';
        }

        if (inputs.searchNormal) {
            inputs.searchNormal.disabled = false;
            inputs.searchNormal.style.opacity = '1';
            inputs.searchNormal.style.cursor = 'text';
        }
    }
}

function getTimestamp() {
    const now = new Date();
    return now.toLocaleString('tr-TR');
}

function saveBarcodeHistory(code, fromList, toList, user) {
    const timestamp = getTimestamp();
    const historyEntry = {
        from: fromList || 'Yeni Ekleme',
        to: toList,
        user: user,
        timestamp: timestamp,
        timestampRaw: Date.now()
    };

    db.ref(`servis/history/${code}`).push(historyEntry);
}

async function loadAndDisplayHistory(code) {
    try {
        const snapshot = await db.ref(`servis/history/${code}`).once('value');
        const historyData = snapshot.val();

        if (!historyData) {
            historyLog.innerHTML = `
            <h4>📜 Geçmiş Hareketler</h4>
            <div class="no-history">Bu barkod için henüz hareket kaydı bulunmuyor.</div>
          `;
            historyLog.style.display = 'block';
            return;
        }

        const historyArray = Object.values(historyData).sort((a, b) => b.timestampRaw - a.timestampRaw);

        const listNames = {
            atanacak: '📋 Atanacak',
            parcaBekliyor: '⚙️ Parça Bekliyor',
            phonecheck: '📱 PhoneCheck',
            gokhan: '🧑‍🔧 Gökhan',
            enes: '🧑‍🔧 Enes',
            yusuf: '🧑‍🔧 Yusuf',
            samet: '🧑‍🔧 Samet',

            engin: '🧑‍🔧 Engin',
            ismail: '🧑‍🔧 İsmail',
            mehmet: '🧑‍🔧 Mehmet',
            onarim: '🔧 Onarım Tamamlandı',

            satisa: '💰 Satışa Gidecek',
            sahiniden: '🏪 Sahibinden',
            mediaMarkt: '🛒 Media Markt',
            teslimEdilenler: '✅ Teslim Edildi',
            'SİLİNDİ': '🗑️ Silindi'
        };

        let historyHTML = '<div class="history-header"><h4>📜 Geçmiş Hareketler</h4></div><div class="history-timeline">';

        historyArray.forEach((entry, index) => {
            const fromName = listNames[entry.from] || `🧑‍🔧 ${entry.from.charAt(0).toUpperCase() + entry.from.slice(1)}`;
            const toName = listNames[entry.to] || `🧑‍🔧 ${entry.to.charAt(0).toUpperCase() + entry.to.slice(1)}`;
            const isCurrent = index === 0;

            historyHTML += `
            <div class="history-card ${isCurrent ? 'history-current' : ''}">
              <div class="history-card-header">
                ${isCurrent ? '<span class="history-badge current">📍 Şu Anda</span>' : '<span class="history-badge past">↪️ Geçmiş</span>'}
              </div>
              <div class="history-card-body">
                <div class="history-route">
                  <span class="history-from">${fromName}</span>
                  <span class="history-arrow">→</span>
                  <span class="history-to">${toName}</span>
                </div>
                <div class="history-meta">
                  <span class="history-user">👤 ${entry.user || 'Bilinmeyen'}</span>
                  <span class="history-time">🕒 ${entry.timestamp}</span>
                </div>
                ${entry.reason ? `<div class="history-reason">📝 ${entry.reason}</div>` : ''}
              </div>
            </div>
          `;
        });

        historyHTML += '</div>';
        historyLog.innerHTML = historyHTML;
        historyLog.style.display = 'block';
    } catch (error) {
        console.error('Geçmiş yüklenirken hata:', error);
        historyLog.innerHTML = `
          <h4>📜 Geçmiş Hareketler</h4>
          <div class="no-history">Geçmiş yüklenirken bir hata oluştu.</div>
        `;
        historyLog.style.display = 'block';
    }
}

function removeFromOtherLists(code, exceptList) {
    const allLists = ['atanacak', 'parcaBekliyor', 'phonecheck', 'gokhan', 'enes', 'yusuf', 'samet', 'engin', 'ismail', 'mehmet', 'onarim', 'onCamDisServis', 'anakartDisServis', 'SonKullanıcı', 'satisa', 'sahiniden', 'mediaMarkt', 'teslimEdilenler'];

    // Dinamik olarak eklenen tüm listeleri dahil et
    Object.keys(userCodes).forEach(key => {
        if (!allLists.includes(key)) {
            allLists.push(key);
        }
    });

    let removedFrom = null;

    allLists.forEach(name => {
        if (name !== exceptList && userCodes[name] && userCodes[name].has(code)) {
            removedFrom = name;
            userCodes[name].delete(code);
            delete codeTimestamps[name][code];
            delete codeUsers[name][code];
            const dbPath = name === 'onarim' ? 'onarimTamamlandi' : name;
            db.ref(`servis/${dbPath}`).child(code).remove();
            updateLabelAndCount(name);
            renderMiniList(name);

            // ========================================
            if (name === 'teslimEdilenler' && exceptList !== 'teslimEdilenler') {
                // Servise geri dönüş tespit edildi
                handleServiceReturn(code, exceptList);
                console.log(`🔄 Servise Geri Dönüş: ${code} - ${name} → ${exceptList}`);
            }
            // ========================================
            // YENİ KISIM BİTİŞ
        }
    });



    return removedFrom;
}

// burası değişti - servise geri dönüşte DELIVERED sayacını azalt
async function handleServiceReturn(code, targetList) {
    try {
        const todayDate = getTodayDateString();

        // Firebase'de servise geri dönüş kaydı oluştur
        await db.ref(`servis/serviceReturns/${code}`).set({
            returnDate: Date.now(),
            returnDateReadable: getTimestamp(),
            targetList: targetList,
            user: currentUserName
        });

        // Delivered sayacını azalt
        const deliveredSnapshot = await db.ref(`dashboard/daily/${todayDate}/deliveredCount`).once('value');
        const currentDelivered = deliveredSnapshot.val() || 0;

        if (currentDelivered > 0) {
            await db.ref(`dashboard/daily/${todayDate}/deliveredCount`).set(currentDelivered - 1);
            dailyDeliveredCount = currentDelivered - 1;
        }

        // ✅ YENİ GÜNCELLEME - Servise geri dönüş kaydı
        if (!dailyReceivedIMEIs.has(code)) {
            dailyReceivedIMEIs.add(code);

            const updates = {};
            updates[`dashboard/daily/${todayDate}/receivedIMEIs/${code}`] = {
                source: 'serviceReturn', // ✅ Kaynak: serviceReturn
                originalTarget: targetList, // Hangi listeye döndüğü
                timestamp: Date.now(),
                user: currentUserName,
                isServiceReturn: true
            };

            // ✅ Servise geri dönüş sayacını artır
            const serviceReturnSnapshot = await db.ref(`dashboard/daily/${todayDate}/sources/serviceReturn`).once('value');
            const currentServiceReturnCount = serviceReturnSnapshot.val() || 0;
            updates[`dashboard/daily/${todayDate}/sources/serviceReturn`] = currentServiceReturnCount + 1;

            await db.ref().update(updates);
        }

        showToast(`📥 Servise Geri Dönüş: ${code} - ${targetList} listesine eklendi`, 'info');

        if (currentUserRole === 'admin' || currentUserRole === 'semi-admin') {
            updateAdminStats();
        }

        if (currentUserRole === 'admin' || currentUserRole === 'semi-admin') {
            loadDashboardStats();
        }

    } catch (error) {
        console.error('Servise geri dönüş kaydedilirken hata:', error);
    }
}


function renderList() {
    const allLists = ["atanacak", "parcaBekliyor", "phonecheck", "gokhan", "enes", "yusuf", "samet", "engin", "ismail", "mehmet", "onarim", "satisa", "sahiniden", "mediaMarkt", "teslimEdilenler"];

    Object.keys(userCodes).forEach(key => {
        if (!allLists.includes(key)) {
            allLists.push(key);
        }
    });

    allLists.forEach(name => renderMiniList(name));

    if (currentUserRole === 'admin' || currentUserRole === 'semi-admin') {
        updateAdminStats();
    }
}

function updateLabelAndCount(name) {
    if (!userCodes[name]) {
        console.warn(`⚠️ userCodes[${name}] tanımlı değil`);
        return;
    }

    const count = userCodes[name].size;
    console.log(`📊 ${name} güncelleniyor: ${count} adet`);

    const labelTexts = {
        atanacak: '📋 Atanacak',
        parcaBekliyor: '⚙️ Parça Bekliyor',
        phonecheck: '📱 PhoneCheck',
        onarim: '🔧 Onarım Tamamlandı',
        onCamDisServis: '🔨 Ön Cam Dış Servis',
        anakartDisServis: '🔨 Anakart Dış Servis',
        SonKullanıcı: '👤 Son Kullanıcı',
        satisa: '💰 Satışa Gidecek',
        sahiniden: '🏪 Sahibinden',
        mediaMarkt: '🛒 Media Markt',
        teslimEdilenler: '✅ Teslim Edilenler'
    };

    const labelText = labelTexts[name] || `🧑‍🔧 ${name.charAt(0).toUpperCase() + name.slice(1)}'ın Cihazları`;

    if (labels[name]) {
        labels[name].textContent = `${labelText} - Adet: ${count}`;
        console.log(`✅ ${name} label güncellendi: ${count}`);
    } else {
        console.warn(`❌ ${name} label elementi bulunamadı`);
        // Elementi tekrar ara
        setTimeout(() => {
            const labelElement = document.getElementById(`${name}Label`);
            if (labelElement) {
                labels[name] = labelElement;
                labelElement.textContent = `${labelText} - Adet: ${count}`;
                console.log(`✅ ${name} label sonradan bulundu ve güncellendi`);
            }
        }, 500);
    }

    const dbPath = name === 'onarim' ? 'onarimTamamlandi' : name;
    db.ref(`servis/${dbPath}/adet`).set(count);
}

// ========================================
// YENİ EKLENEN: INPUT LISTENER'LARI YENİDEN BAŞLATMA FONKSİYONU
// ========================================
function reinitializeAllInputListeners() {
    console.log('🔄 Tüm input listener\'lar yeniden başlatılıyor...');

    // Tüm bölüm isimleri
    const allSections = [
        'atanacak', 'parcaBekliyor', 'phonecheck',
        'gokhan', 'enes', 'yusuf', 'samet', 'engin', 'ismail', 'mehmet',
        'onarim', 'onCamDisServis', 'anakartDisServis',
        'SonKullanıcı', 'satisa', 'sahiniden', 'mediaMarkt', 'teslimEdilenler'
    ];

    allSections.forEach(section => {
        const inputElement = inputs[section];

        if (inputElement) {
            // Eski event listener'ı kaldır ve yeni ekle
            const newInput = inputElement.cloneNode(true);
            if (inputElement.parentNode) {
                inputElement.parentNode.replaceChild(newInput, inputElement);

                // inputs objesini güncelle
                inputs[section] = newInput;

                // Yeni listener ekle
                newInput.addEventListener("input", () => {
                    if (section === "scanner" || section === "search") return;
                    saveCodes(section, newInput.value);
                });

                console.log(`✅ ${section} input listener yenilendi`);
            }
        }
    });

    // Dinamik teknisyen bölümleri için de listener'ları yenile
    Object.keys(inputs).forEach(key => {
        if (!allSections.includes(key) && key !== 'scanner' && key !== 'search' && key !== 'searchNormal') {
            const inputElement = inputs[key];
            if (inputElement) {
                const newInput = inputElement.cloneNode(true);
                if (inputElement.parentNode) {
                    inputElement.parentNode.replaceChild(newInput, inputElement);
                    inputs[key] = newInput;

                    newInput.addEventListener("input", () => {
                        saveCodes(key, newInput.value);
                    });

                    console.log(`✅ ${key} (dinamik teknisyen) input listener yenilendi`);
                }
            }
        }
    });
}

function saveCodes(name, value) {
    if (isUpdating || !dataLoaded) return;

    if (currentUserRole === 'semi-admin') {
        return;
    }

    if (currentUserRole === 'technician') {
        if (name === currentUserName) {
            // İzin var, devam et
        } else if (currentUserPermissions && currentUserPermissions[name]) {
            if (currentUserPermissions[name] === 'view') {
                return;
            }
        } else {
            return;
        }
    }

    if (name === 'onarim' && currentUserName !== 'yusuf') {
        return;
    }
    // ✅ DEĞİŞTİRİLDİ: Admin, mehmet ve samet kullanıcıları teslim edilenler alanına veri girebilir
    if (name === 'teslimEdilenler' && currentUserRole !== 'admin' && currentUserName !== 'mehmet' && currentUserName !== 'samet') {
        showToast('Sadece admin, mehmet ve samet kullanıcıları teslim edilenler listesine veri girebilir!', 'warning');
        return;
    }

    isUpdating = true;

    const rawLines = value.trim().split("\n").map(l => l.trim()).filter(l => l.length > 0);
    const codes = rawLines.map(line => {
        const m = line.match(/(\d{15})/);
        return m ? m[1] : null;
    }).filter(Boolean);

    const timestamp = getTimestamp();

    const specialLists = ['phonecheck', 'parcaBekliyor', 'atanacak', 'onarim', 'onCamDisServis', 'anakartDisServis', 'satisa', 'sahiniden', 'mediaMarkt', 'SonKullanıcı', 'teslimEdilenler'];
    const dashboardSourceLists = ['atanacak', 'SonKullanıcı', 'sahiniden', 'mediaMarkt'];

    // saveCodes fonksiyonunda (satır ~1020 civarı)
    if (specialLists.includes(name)) {
        codes.forEach(code => {
            if (!userCodes[name].has(code)) {
                const previousList = removeFromOtherLists(code, name);

                saveBarcodeHistory(code, previousList, name, currentUserName);

                // burası değişti - Son Kullanıcı kontrolü eklendi ↓
                if (dashboardSourceLists.includes(name)) {
                    addReceivedIMEI(code, name);
                }

                // burası değişti - Teslim edilenler listesine ekleniyorsa sayaç artır VE received'dan çıkar
                if (name === 'teslimEdilenler') {
                    incrementDeliveredCount();
                    // Eğer daha önce receivedIMEIs'te varsa çıkar

                }

                if (name === 'onarim') {
                    if (userCodes.phonecheck.has(code) || codeUsers.phonecheck[code]) {
                        db.ref(`servis/phonecheck/${code}`).remove();
                        userCodes.phonecheck.delete(code);
                        delete codeTimestamps.phonecheck[code];
                        delete codeUsers.phonecheck[code];
                        updateLabelAndCount('phonecheck');
                        renderMiniList('phonecheck');
                    }

                    db.ref(`servis/onarimTamamlandi/${code}`).set({ ts: timestamp, user: currentUserName });
                    codeTimestamps.onarim[code] = timestamp;
                    codeUsers.onarim[code] = currentUserName;
                    userCodes.onarim.add(code);
                    // onarim barkodlarını da toplam barkodlara ekliyoruz
                    allCodes.add(code); // BU SATIR EKLENDİ
                } else if (name === 'teslimEdilenler') {
                    db.ref(`servis/${name}/${code}`).set({ ts: timestamp, user: currentUserName });
                    codeTimestamps[name][code] = timestamp;
                    codeUsers[name][code] = currentUserName;
                    userCodes[name].add(code);
                    // teslimEdilenler'i toplam barkodlara EKLEMİYORUZ
                } else {
                    db.ref(`servis/${name}/${code}`).set({ ts: timestamp, user: currentUserName });
                    codeTimestamps[name][code] = timestamp;
                    codeUsers[name][code] = currentUserName;
                    userCodes[name].add(code);
                    allCodes.add(code);
                }
            }
        });

        updateLabelAndCount(name);
        renderList();
        isUpdating = false;
        return;
    }

    codes.forEach(code => {
        if (!userCodes[name].has(code)) {
            const previousList = removeFromOtherLists(code, name);

            saveBarcodeHistory(code, previousList, name, currentUserName);

            db.ref(`servis/${name}/${code}`).set(timestamp);
            codeTimestamps[name][code] = timestamp;
            codeUsers[name][code] = null;
            userCodes[name].add(code);
            allCodes.add(code);
        }
    });

    updateLabelAndCount(name);
    renderList();

    isUpdating = false;
}

Object.entries(inputs).forEach(([name, textarea]) => {
    if (textarea) {
        textarea.addEventListener("input", () => {
            if (name === "scanner" || name === "search") return;
            saveCodes(name, textarea.value);
        });
    }
});

let searchTimeout;

if (inputs.search) {
    inputs.search.addEventListener("input", e => {
        performSearch(e.target.value, 'searchResult', 'historyLog', 'partInfoAdmin');
        // 4 parametre gönderiliyor ↓
    });
}

if (inputs.searchNormal) {
    inputs.searchNormal.addEventListener("input", e => {
        performSearch(e.target.value, 'searchResultNormal', 'historyLogNormal', 'partInfoNormal');
        // 4 parametre gönderiliyor ↓
    });
}

// performSearch fonksiyonunu güncelleyin
function performSearch(value, resultElementId, historyElementId, partInfoElementId) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const allMatches = value.match(/\d{15}/g);
        const query = allMatches ? allMatches[allMatches.length - 1] : value.trim().slice(0, 15);
        const searchResult = document.getElementById(resultElementId);
        const historyLog = document.getElementById(historyElementId);
        const partInfo = document.getElementById(partInfoElementId);

        if (query.length === 0) {
            searchResult.style.display = "none";
            historyLog.style.display = "none";
            if (partInfo) partInfo.style.display = "none";
            return;
        }

        searchResult.style.display = "block";
        const foundIn = [];
        const allLists = ["atanacak", "parcaBekliyor", "phonecheck", "gokhan", "enes", "yusuf", "samet", "engin", "ismail", "mehmet", "onarim", "satisa", "sahiniden", "mediaMarkt", "teslimEdilenler"];

        Object.keys(userCodes).forEach(key => {
            if (!allLists.includes(key)) {
                allLists.push(key);
            }
        });

        allLists.forEach(name => {
            if (userCodes[name] && userCodes[name].has(query)) {
                let status = "";
                const specialListsWithUser = ['phonecheck', 'onarim', 'satisa', 'sahiniden', 'mediaMarkt', 'teslimEdilenler'];

                if (name === 'atanacak' || name === 'parcaBekliyor') {
                    status = "⏰ Bekliyor";
                } else if (specialListsWithUser.includes(name)) {
                    const labelMap = {
                        phonecheck: '📱 PhoneCheck',
                        onarim: '🔧 Onarım Tamamlandı',
                        satisa: '💰 Satışa Gidecek',
                        sahiniden: '🏪 Sahibinden',
                        mediaMarkt: '🛒 Media Markt',
                        teslimEdilenler: '✅ Teslim Edildi'
                    };
                    status = `${labelMap[name]}'te - ${codeUsers[name][query] || ''}`;
                } else {
                    status = scannedCodes.has(query) ? "✅ Eşleşti" : "❌ Henüz eşleşmedi";
                }

                const displayName = name === 'atanacak' ? 'Atanacak Cihazlar' :
                    name === 'parcaBekliyor' ? 'Parça Bekliyor' :
                        name === 'phonecheck' ? 'PhoneCheck' :
                            name === 'onarim' ? 'Onarım Tamamlandı' :
                                name === 'satisa' ? 'Satışa Gidecek' :
                                    name === 'sahiniden' ? 'Sahibinden' :
                                        name === 'mediaMarkt' ? 'Media Markt' :
                                            name === 'teslimEdilenler' ? 'Teslim Edilenler' :
                                                name.charAt(0).toUpperCase() + name.slice(1);
                foundIn.push(`<strong>${displayName}</strong>: ${status}`);
            }
        });

        if (foundIn.length > 0) {
            searchResult.innerHTML = `<div style="color: #2ecc71;">📦 Barkod bulundu:</div>${foundIn.join("<br>")}`;
            loadAndDisplayHistoryToElement(query, historyElementId);

            // Parça bilgilerini göster
            if (partInfo) {
                displayPartInfo(query, partInfoElementId);
            }
        } else {
            searchResult.innerHTML = `<div style="color: #e74c3c;">❌ Barkod bulunamadı</div>`;
            historyLog.style.display = "none";
            if (partInfo) partInfo.style.display = "none";
        }
    }, 500); // Optimized debounce
}

async function loadAndDisplayHistoryToElement(code, historyElementId) {
    const historyLog = document.getElementById(historyElementId);

    try {
        const snapshot = await db.ref(`servis/history/${code}`).once('value');
        const historyData = snapshot.val();

        if (!historyData) {
            historyLog.innerHTML = `
            <h4>📜 Geçmiş Hareketler</h4>
            <div class="no-history">Bu barkod için henüz hareket kaydı bulunmuyor.</div>
          `;
            historyLog.style.display = 'block';
            return;
        }

        const historyArray = Object.values(historyData).sort((a, b) => b.timestampRaw - a.timestampRaw);

        const listNames = {
            atanacak: '📋 Atanacak',
            parcaBekliyor: '⚙️ Parça Bekliyor',
            phonecheck: '📱 PhoneCheck',
            gokhan: '🧑‍🔧 Gökhan',
            enes: '🧑‍🔧 Enes',
            yusuf: '🧑‍🔧 Yusuf',
            samet: '🧑‍🔧 Samet',

            engin: '🧑‍🔧 Engin',
            ismail: '🧑‍🔧 İsmail',
            mehmet: '🧑‍🔧 Mehmet',
            onarim: '🔧 Onarım Tamamlandı',
            satisa: '💰 Satışa Gidecek',
            sahiniden: '🏪 Sahibinden',
            mediaMarkt: '🛒 Media Markt',
            teslimEdilenler: '✅ Teslim Edildi',
            'SİLİNDİ': '🗑️ Silindi'
        };

        let historyHTML = '<div class="history-header"><h4>📜 Geçmiş Hareketler</h4></div><div class="history-timeline">';

        historyArray.forEach((entry, index) => {
            const fromName = listNames[entry.from] || `🧑‍🔧 ${entry.from.charAt(0).toUpperCase() + entry.from.slice(1)}`;
            const toName = listNames[entry.to] || `🧑‍🔧 ${entry.to.charAt(0).toUpperCase() + entry.to.slice(1)}`;
            const isCurrent = index === 0;

            historyHTML += `
            <div class="history-card ${isCurrent ? 'history-current' : ''}">
              <div class="history-card-header">
                ${isCurrent ? '<span class="history-badge current">📍 Şu Anda</span>' : '<span class="history-badge past">↪️ Geçmiş</span>'}
              </div>
              <div class="history-card-body">
                <div class="history-route">
                  <span class="history-from">${fromName}</span>
                  <span class="history-arrow">→</span>
                  <span class="history-to">${toName}</span>
                </div>
                <div class="history-meta">
                  <span class="history-user">👤 ${entry.user || 'Bilinmeyen'}</span>
                  <span class="history-time">🕒 ${entry.timestamp}</span>
                </div>
                ${entry.reason ? `<div class="history-reason">📝 ${entry.reason}</div>` : ''}
              </div>
            </div>
          `;
        });

        historyHTML += '</div>';
        historyLog.innerHTML = historyHTML;
        historyLog.style.display = 'block';
    } catch (error) {
        console.error('Geçmiş yüklenirken hata:', error);
        historyLog.innerHTML = `
          <h4>📜 Geçmiş Hareketler</h4>
          <div class="no-history">Geçmiş yüklenirken bir hata oluştu.</div>
        `;
        historyLog.style.display = 'block';
    }
}

let scannerTimeout;
inputs.scanner.addEventListener("input", e => {
    if (currentUserRole === 'semi-admin') {
        e.target.value = '';
        return;
    }

    clearTimeout(scannerTimeout);
    scannerTimeout = setTimeout(() => {
        const raw = e.target.value.trim();
        const m = raw.match(/(\d{15})/);
        const code = m ? m[1] : null;
        if (code && !scannedCodes.has(code)) {
            scannedCodes.add(code);
            const timestamp = getTimestamp();
            db.ref(`servis/eslesenler/${code}`).set(timestamp);

            Object.keys(userCodes).forEach(name => {
                db.ref(`servis/${name}/${code}`).once("value", snap => {
                    if (snap.exists()) {
                        db.ref(`servis/${name}/eslesenler/${code}`).set(timestamp);
                    }
                });
            });

            renderList();
            showToast(`Barkod eşleşti: ${code}`, 'success');
        }
        e.target.value = "";
    }, 150);
});

function renderMiniList(name) {
    // ✅ ÖNCE KONTROL: userCodes[name] var mı?
    if (!miniLists[name] || !userCodes[name]) {
        return;
    }

    const list = miniLists[name];

    // ✅ GÜVENLİ KONTROL: list elementi var mı?
    if (!list) {
        return;
    }

    // ✅ PERFORMANCE: Use DocumentFragment for batch DOM updates
    const fragment = document.createDocumentFragment();
    list.innerHTML = "";

    // ✅ TOPLU SİLME: Admin ise checkbox container ekle
    if (currentUserRole === 'admin' && (name === 'atanacak' || name === 'teslimEdilenler')) {
        const bulkDeleteContainer = document.createElement('div');
        bulkDeleteContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      background: rgba(231, 76, 60, 0.1);
      border-radius: 8px;
      margin-bottom: 10px;
      border: 2px solid #e74c3c;
    `;

        bulkDeleteContainer.innerHTML = `
      <input type="checkbox" id="selectAll_${name}" 
             onchange="toggleSelectAll('${name}')"
             style="width: 18px; height: 18px; cursor: pointer;">
      <label for="selectAll_${name}" style="cursor: pointer; font-weight: bold; user-select: none;">Tümünü Seç</label>
      <button onclick="deleteSelectedBarcodes('${name}')" 
              id="bulkDeleteBtn_${name}"
              style="
                margin-left: auto;
                padding: 8px 15px;
                background: #e74c3c;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 13px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                display: none;
              "
              onmouseover="this.style.background='#c0392b'; this.style.transform='translateY(-2px)';"
              onmouseout="this.style.background='#e74c3c'; this.style.transform='translateY(0)';">
        🗑️ Seçilenleri Sil (<span id="selectedCount_${name}">0</span>)
      </button>
    `;

        fragment.appendChild(bulkDeleteContainer);
    }

    // ✅ GÜVENLİ KONTROL: userCodes[name] Set objesi mi?
    if (!(userCodes[name] instanceof Set)) {
        console.error(`❌ renderMiniList: userCodes[${name}] Set değil:`, userCodes[name]);
        userCodes[name] = new Set(); // Otomatik düzelt
    }

    // Barkodları tarih/saate göre sırala
    const codesArray = Array.from(userCodes[name]).map(code => ({
        code: code,
        timestamp: codeTimestamps[name] ? (codeTimestamps[name][code] || "Tarih yok") : "Tarih yok",
        timestampRaw: convertToTimestamp(codeTimestamps[name] ? codeTimestamps[name][code] : ""),
        user: codeUsers[name] ? (codeUsers[name][code] || "") : ""
    }));

    codesArray.sort((a, b) => b.timestampRaw - a.timestampRaw);

    codesArray.forEach(item => {
        const code = item.code;
        const div = document.createElement("div");
        div.className = "mini-item";

        const specialClasses = {
            atanacak: "waiting",
            parcaBekliyor: "waiting",
            phonecheck: "phonecheck",
            onarim: "onarim",
            onCamDisServis: "waiting",
            anakartDisServis: "waiting",
            satisa: "satisa",
            sahiniden: "sahiniden",
            mediaMarkt: "mediamarkt",
            teslimEdilenler: "teslim",
            SonKullanıcı: "waiting"
        };

        // Teknisyen listesi kontrol - gokhan, yusuf, enes, samet, engin, mehmet, ismail
        const technicianLists = ['gokhan', 'yusuf', 'enes', 'samet', 'engin', 'mehmet', 'ismail'];

        if (specialClasses[name]) {
            div.classList.add(specialClasses[name]);
        } else if (technicianLists.includes(name)) {
            // Teknisyen listelerinde: tarandıysa yeşil (matched), taranmadıysa kırmızı (unmatched)
            div.classList.add(scannedCodes.has(code) ? "matched" : "unmatched");
        } else {
            div.classList.add(scannedCodes.has(code) ? "matched" : "unmatched");
        }

        let codeDisplay = code;

        const listsWithUser = ['phonecheck', 'parcaBekliyor', 'atanacak', 'onarim', 'onCamDisServis', 'anakartDisServis', 'satisa', 'sahiniden', 'mediaMarkt', 'teslimEdilenler', 'SonKullanıcı'];

        if (listsWithUser.includes(name) && item.user) {
            codeDisplay = `${code} - ${item.user}`;
        }

        // ✅ TOPLU SİLME: Checkbox ekleme
        const checkboxHTML = (currentUserRole === 'admin' && (name === 'atanacak' || name === 'teslimEdilenler'))
            ? `<input type="checkbox" class="barcode-checkbox" data-list="${name}" data-barcode="${code}" 
               onchange="updateBulkDeleteButton('${name}')"
               style="width: 18px; height: 18px; cursor: pointer; margin-right: 8px;">`
            : '';

        div.innerHTML = `
      <div class="mini-item-row" style="display: flex; align-items: center;">
        ${checkboxHTML}
        <span style="flex: 1;">${codeDisplay}</span>
        <span class="status"></span>
      </div>
      <div class="mini-item-time">📅 ${item.timestamp}${item.user ? ' • ' + item.user : ''}</div>
      ${currentUserRole === 'admin' ? `
        <div class="mini-item-actions">
          <button class="item-action-btn edit" onclick="openEditBarcodeModal('${code}', '${name}')">✏️ Düzenle</button>
          <button class="item-action-btn delete" onclick="deleteBarcode('${code}', '${name}')">🗑️ Sil</button>
        </div>
      ` : ''}
    `;
        fragment.appendChild(div);
    });

    // ✅ PERFORMANCE: Append all items at once
    list.appendChild(fragment);
}


function convertToTimestamp(dateString) {
    if (!dateString || dateString === "Tarih yok") return 0;

    try {
        // Türkiye saatine göre parse et
        const dateParts = dateString.split(' ');
        if (dateParts.length >= 2) {
            const datePart = dateParts[0];
            const timePart = dateParts[1];

            const [day, month, year] = datePart.split('.');
            const [hours, minutes, seconds] = timePart.split(':');

            // Türkiye saati (UTC+3)
            const date = new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day),
                parseInt(hours || 0),
                parseInt(minutes || 0),
                parseInt(seconds || 0)
            );

            return date.getTime();
        }
    } catch (error) {
        console.warn(`Tarih çevirme hatası: ${dateString}`, error);
    }

    return Date.now(); // Fallback
}
// ========================================
// ✅ YENİ FONKSİYONLAR: TOPLU SİLME İÇİN
// ========================================

// Tümünü seç/seçimi kaldır
function toggleSelectAll(listName) {
    const selectAllCheckbox = document.getElementById(`selectAll_${listName}`);
    const checkboxes = document.querySelectorAll(`.barcode-checkbox[data-list="${listName}"]`);

    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });

    updateBulkDeleteButton(listName);
}

// Toplu silme butonunu güncelle
function updateBulkDeleteButton(listName) {
    const checkboxes = document.querySelectorAll(`.barcode-checkbox[data-list="${listName}"]:checked`);
    const bulkDeleteBtn = document.getElementById(`bulkDeleteBtn_${listName}`);
    const selectedCount = document.getElementById(`selectedCount_${listName}`);
    const selectAllCheckbox = document.getElementById(`selectAll_${listName}`);

    if (bulkDeleteBtn && selectedCount) {
        if (checkboxes.length > 0) {
            bulkDeleteBtn.style.display = 'block';
            selectedCount.textContent = checkboxes.length;
        } else {
            bulkDeleteBtn.style.display = 'none';
        }
    }

    // "Tümünü Seç" checkbox'ını güncelle
    if (selectAllCheckbox) {
        const allCheckboxes = document.querySelectorAll(`.barcode-checkbox[data-list="${listName}"]`);
        selectAllCheckbox.checked = allCheckboxes.length > 0 && checkboxes.length === allCheckboxes.length;
    }
}

// Seçili barkodları toplu sil
async function deleteSelectedBarcodes(listName) {
    const checkboxes = document.querySelectorAll(`.barcode-checkbox[data-list="${listName}"]:checked`);
    const barcodes = Array.from(checkboxes).map(cb => cb.getAttribute('data-barcode'));

    if (barcodes.length === 0) {
        showToast('Lütfen silinecek barkodları seçin!', 'warning');
        return;
    }

    const confirmMessage = `${barcodes.length} adet barkodu silmek istediğinizden emin misiniz?\n\nSilinecek barkodlar:\n${barcodes.slice(0, 5).join('\n')}${barcodes.length > 5 ? '\n...' : ''}`;

    if (!confirm(confirmMessage)) {
        return;
    }

    const bulkDeleteBtn = document.getElementById(`bulkDeleteBtn_${listName}`);
    if (bulkDeleteBtn) {
        bulkDeleteBtn.disabled = true;
        bulkDeleteBtn.innerHTML = '⏳ Siliniyor...';
    }

    try {
        const dbPath = listName === 'onarim' ? 'onarimTamamlandi' : listName;
        let deletedCount = 0;
        let errorCount = 0;

        // Her barkodu sırayla sil
        for (const code of barcodes) {
            try {
                await db.ref(`servis/${dbPath}/${code}`).remove();
                saveBarcodeHistory(code, listName, 'TOPLU_SİLİNDİ', `${currentUserName} (Toplu Silme)`);

                userCodes[listName].delete(code);
                delete codeTimestamps[listName][code];
                delete codeUsers[listName][code];

                deletedCount++;
            } catch (error) {
                console.error(`${code} silinirken hata:`, error);
                errorCount++;
            }
        }

        showToast(`✅ ${deletedCount} barkod silindi!${errorCount > 0 ? ` (${errorCount} hata)` : ''}`, 'success');

        updateLabelAndCount(listName);
        renderList();

        // "Tümünü Seç" checkbox'ını temizle
        const selectAllCheckbox = document.getElementById(`selectAll_${listName}`);
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
        }

    } catch (error) {
        console.error('Toplu silme hatası:', error);
        showToast('Toplu silme sırasında hata oluştu!', 'error');
    } finally {
        if (bulkDeleteBtn) {
            bulkDeleteBtn.disabled = false;
            bulkDeleteBtn.innerHTML = '🗑️ Seçilenleri Sil (<span id="selectedCount_' + listName + '">0</span>)';
            bulkDeleteBtn.style.display = 'none';
        }
    }
}

function updateAdminStats() {
    const totalCodesWithOnarim = new Set();
    // onarim listesini de dahil ediyoruz
    const listsToCount = ['atanacak', 'parcaBekliyor', 'phonecheck', 'gokhan', 'enes', 'yusuf', 'samet', 'engin', 'ismail', 'mehmet', 'onCamDisServis', 'anakartDisServis', 'satisa', 'sahiniden', 'mediaMarkt', 'onarim'];

    Object.keys(userCodes).forEach(key => {
        if (!listsToCount.includes(key) && !['teslimEdilenler'].includes(key)) {
            listsToCount.push(key);
        }
    });

    listsToCount.forEach(name => {
        if (userCodes[name]) {
            userCodes[name].forEach(code => totalCodesWithOnarim.add(code));
        }
    });

    const totalBarcodes = totalCodesWithOnarim.size;

    // Teknisyen cihazlarını hesapla
    const teknisyenListeleri = ['gokhan', 'enes', 'yusuf', 'samet', 'engin', 'ismail', 'mehmet'];
    let toplamTeknisyenCihazlari = 0;

    teknisyenListeleri.forEach(teknisyen => {
        if (userCodes[teknisyen]) {
            toplamTeknisyenCihazlari += userCodes[teknisyen].size;
        }
    });

    // Dinamik teknisyenleri de ekle
    Object.keys(userCodes).forEach(key => {
        if (!teknisyenListeleri.includes(key) &&
            !['atanacak', 'parcaBekliyor', 'phonecheck', 'onarim', 'onCamDisServis', 'anakartDisServis', 'satisa', 'sahiniden', 'mediaMarkt', 'teslimEdilenler'].includes(key)) {
            toplamTeknisyenCihazlari += userCodes[key].size;
        }
    });

    document.getElementById('adminTotalBarcodes').textContent = totalBarcodes;
    document.getElementById('adminTeknisyenler').textContent = toplamTeknisyenCihazlari;
    document.getElementById('adminTeslimEdilenler').textContent = userCodes.teslimEdilenler ? userCodes.teslimEdilenler.size : 0;
    document.getElementById('adminAtanacak').textContent = userCodes.atanacak ? userCodes.atanacak.size : 0;
    document.getElementById('SonKullanıcı').textContent = userCodes.SonKullanıcı ? userCodes.SonKullanıcı.size : 0;
    document.getElementById('adminParcaBekliyor').textContent = userCodes.parcaBekliyor ? userCodes.parcaBekliyor.size : 0;
    document.getElementById('adminPhonecheck').textContent = userCodes.phonecheck ? userCodes.phonecheck.size : 0;
    document.getElementById('adminOnarim').textContent = userCodes.onarim ? userCodes.onarim.size : 0;
    document.getElementById('adminOnCamDisServis').textContent = userCodes.onCamDisServis ? userCodes.onCamDisServis.size : 0;      // YENİ EKLENDİ
    document.getElementById('adminAnakartDisServis').textContent = userCodes.anakartDisServis ? userCodes.anakartDisServis.size : 0;  // YENİ EKLENDİ
    document.getElementById('adminSatisa').textContent = userCodes.satisa ? userCodes.satisa.size : 0;
    document.getElementById('adminSahiniden').textContent = userCodes.sahiniden ? userCodes.sahiniden.size : 0;
    document.getElementById('adminMediaMarkt').textContent = userCodes.mediaMarkt ? userCodes.mediaMarkt.size : 0;
}
function syncTextareaWithData(name) {
    if (!dataLoaded || !inputs[name]) return;

    const codes = Array.from(userCodes[name] || []);
    if (codes.length > 0) {
        inputs[name].value = codes.join('\n');
    }
}

function loadData() {
    db.ref('servis').once('value', snapshot => {
        const data = snapshot.val();
        if (!data) return;

        const allKeys = Object.keys(data).filter(k => k !== 'eslesenler' && k !== 'history');

        let loadedCount = 0;
        const totalLists = allKeys.length + 1;

        allKeys.forEach(name => {
            const localName = name === 'onarimTamamlandi' ? 'onarim' : name;

            // ✅ GÜVENLİ BAŞLANGIÇ: userCodes[localName] yoksa oluştur
            if (!userCodes[localName]) {
                userCodes[localName] = new Set();
                codeTimestamps[localName] = {};
                codeUsers[localName] = {};

                if (!inputs[localName] && !['eslesenler', 'history', 'adet'].includes(localName)) {
                    const container = document.getElementById('techniciansContainer');
                    if (container) {
                        createTechnicianSection(localName, container);
                    }
                }
            }

            db.ref(`servis/${name}`).once("value", snap => {
                const listData = snap.val();

                // ✅ GÜVENLİ TEMİZLEME: Set varsa temizle
                if (userCodes[localName]) {
                    userCodes[localName].clear();
                } else {
                    userCodes[localName] = new Set();
                }

                codeTimestamps[localName] = {};
                codeUsers[localName] = {};

                if (!listData) {
                    loadedCount++;
                    if (loadedCount === totalLists) {
                        dataLoaded = true;
                        renderList();
                        setTimeout(() => {
                            const allSections = [
                                'atanacak', 'parcaBekliyor', 'phonecheck', 'onarim',
                                'onCamDisServis', 'anakartDisServis', 'SonKullanıcı',
                                'satisa', 'sahiniden', 'mediaMarkt', 'teslimEdilenler'
                            ];

                            allSections.forEach(section => {
                                updateLabelAndCount(section);
                            });

                            setupAllSectionToggles();
                        }, 1000);
                    }
                    updateLabelAndCount(localName);
                    return;
                }

                const keys = Object.keys(listData).filter(k => {
                    // eslesenler ve adet'i atla
                    if (k === "eslesenler" || k === "adet") return false;
                    // Sadece 15 haneli barkodları al
                    return /^\d{15}$/.test(k);
                });

                keys.forEach(code => {
                    const val = listData[code];

                    // ✅ GÜVENLİ EKLEME: userCodes[localName] kontrolü
                    if (!userCodes[localName]) {
                        userCodes[localName] = new Set();
                    }

                    if (typeof val === 'object') {
                        const user = val.user || '';
                        const ts = val.ts || '';
                        codeTimestamps[localName][code] = ts;
                        codeUsers[localName][code] = user;
                        userCodes[localName].add(code);
                        if (localName !== 'teslimEdilenler') {
                            allCodes.add(code);
                        }
                    } else {
                        codeTimestamps[localName][code] = val;
                        codeUsers[localName][code] = null;
                        userCodes[localName].add(code);
                        if (localName !== 'teslimEdilenler') {
                            allCodes.add(code);
                        }
                    }
                });

                updateLabelAndCount(localName);

                if (listData.eslesenler) {
                    Object.keys(listData.eslesenler).forEach(code => scannedCodes.add(code));
                }

                loadedCount++;
                if (loadedCount === totalLists) {
                    dataLoaded = true;
                    renderList();
                }
            });
        });

        db.ref("servis/eslesenler").once("value", snap => {
            const data = snap.val();
            if (data) {
                scannedCodes.clear();
                Object.keys(data).forEach(code => scannedCodes.add(code));
            }
            loadedCount++;
            if (loadedCount === totalLists) {
                dataLoaded = true;
                renderList();
                setTimeout(() => {
                    setupAllSectionToggles();
                }, 500);
            }
        });
    }); // ← db.ref('servis').once kapanış parantezi

    // Dashboard verilerini yükle (admin ise)
    if (currentUserRole === 'admin') {
        loadDashboardStats();
    }
} // ← loadData fonksiyonu kapanış parantezi

// 4 dakikada bir otomatik sayfa yenileme
setInterval(function () {
    location.reload();
}, 10 * 60 * 1000);

// ========================================
// TOGGLE FUNCTIONS - YENİ VERSİYON
// ========================================
function setupSectionToggle(sectionElement, listId, labelId) {
    const list = document.getElementById(listId);
    const label = document.getElementById(labelId);
    const textarea = list ? list.previousElementSibling : null;

    if (sectionElement && list && textarea && label) {
        list.style.display = 'none';
        textarea.style.display = 'none';
        sectionElement.style.cursor = 'pointer';

        if (!label.textContent.includes('(Gizli)') && !label.textContent.includes('(Açık)')) {
            label.textContent = label.textContent.replace(' - ', ' - ') + ' (Gizli)';
        }

        sectionElement.addEventListener('click', (event) => {
            if (event.target === textarea ||
                event.target.tagName === 'TEXTAREA' ||
                event.target.tagName === 'INPUT' ||
                event.target.closest('textarea') ||
                event.target.closest('input')) {
                return;
            }

            if (list.style.display === 'none') {
                list.style.display = 'flex';
                textarea.style.display = 'block';
                label.textContent = label.textContent.replace(' (Gizli)', ' (Açık)');
            } else {
                list.style.display = 'none';
                textarea.style.display = 'none';
                label.textContent = label.textContent.replace(' (Açık)', ' (Gizli)');
            }
        });

        textarea.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    }
}


function setupAllSectionToggles() {
    // TÜM section'ları bul (hem sol hem sağ)
    const allSections = document.querySelectorAll('.section[data-section]');

    allSections.forEach(section => {
        const sectionName = section.getAttribute('data-section');
        const listId = `${sectionName}List`;
        const labelId = `${sectionName}Label`;

        const list = document.getElementById(listId);
        if (list && !list.dataset.toggleSetup) {
            list.dataset.toggleSetup = 'true';
            setupSectionToggle(section, listId, labelId);
        }
    });


    // YENİ VE BASİT: Right section'lar için doğrudan setupRightSectionToggles çağır
    setupRightSectionToggles();

    // ✅ BU KISIM EKLENDİ - Teslim Edilenler için özel toggle ↓
    const teslimSection = document.querySelector('.section:has(#teslimEdilenlerInput)');
    const teslimList = document.getElementById('teslimEdilenlerList');
    const teslimLabel = document.getElementById('teslimEdilenlerLabel');

    if (teslimSection && teslimList && !teslimList.dataset.toggleSetup) {
        teslimList.dataset.toggleSetup = 'true';
        setupSectionToggle(teslimSection, 'teslimEdilenlerList', 'teslimEdilenlerLabel');
        console.log('✅ Teslim Edilenler toggle kuruldu');
    }
}

// YENİ: Güncellenmiş setupRightSectionToggles
function setupRightSectionToggles() {
    const rightSections = document.querySelectorAll('.right-section, .special-right-section, .delivered-section');

    rightSections.forEach(section => {
        const label = section.querySelector('label');
        const textarea = section.querySelector('textarea');
        const miniList = section.querySelector('.mini-list');

        if (label && textarea && miniList && !section.dataset.toggleSetup) {
            section.dataset.toggleSetup = 'true'; // Tekrar kurulmasını önle

            // Başlangıçta gizli
            textarea.style.display = 'none';
            miniList.style.display = 'none';

            // Tüm section'a tıklanabilir yap
            section.style.cursor = 'pointer';

            // Durum göstergesi ekle
            if (!label.textContent.includes('(Gizli)') && !label.textContent.includes('(Açık)')) {
                label.textContent = label.textContent + ' (Gizli)';
            }

            // Section'a tıklama event'i
            section.addEventListener('click', (event) => {
                if (event.target === textarea || event.target.closest('textarea')) {
                    return; // Textarea'ya tıklandıysa işlem yapma
                }

                const isHidden = textarea.style.display === 'none';
                textarea.style.display = isHidden ? 'block' : 'none';
                miniList.style.display = isHidden ? 'flex' : 'none';
                label.textContent = label.textContent.replace(
                    isHidden ? ' (Gizli)' : ' (Açık)',
                    isHidden ? ' (Açık)' : ' (Gizli)'
                );
            });

            // Textarea tıklamasını section'a yayma
            textarea.addEventListener('click', (event) => {
                event.stopPropagation();
            });
        }
    });
}

// ========================================
// NAV BAR ARAMA FONKSİYONLARI
// ========================================
document.addEventListener('DOMContentLoaded', function () {
    const navSearchInput = document.getElementById('navSearchInput');
    const navSearchResult = document.getElementById('navSearchResult');

    if (navSearchInput) {
        let navSearchTimeout;

        navSearchInput.addEventListener('input', function (e) {
            clearTimeout(navSearchTimeout);
            navSearchTimeout = setTimeout(() => {
                performNavSearch(e.target.value);
            }, 300);
        });

        navSearchInput.addEventListener('focus', function () {
            if (this.value.trim().length > 0) {
                performNavSearch(this.value);
            }
        });

        document.addEventListener('click', function (e) {
            if (!navSearchInput.contains(e.target) && !navSearchResult.contains(e.target)) {
                navSearchResult.classList.remove('active');
            }
        });
    }

    // Setup toggle functions
    setTimeout(() => {
        setupSectionToggle();
        setupRightSectionToggles();
    }, 1000);
});

function performNavSearch(query) {
    const navSearchResult = document.getElementById('navSearchResult');
    const queryTrimmed = query.trim();

    if (queryTrimmed.length === 0) {
        navSearchResult.classList.remove('active');
        return;
    }

    if (queryTrimmed.length !== 15 || !/^\d+$/.test(queryTrimmed)) {
        navSearchResult.innerHTML = `
            <div style="color: #e74c3c; text-align: center; padding: 10px;">
                ⚠️ Lütfen 15 haneli geçerli bir barkod girin
            </div>
        `;
        navSearchResult.classList.add('active');
        return;
    }

    const foundIn = [];
    const allLists = ["atanacak", "parcaBekliyor", "phonecheck", "gokhan", "enes", "yusuf", "samet", "engin", "ismail", "mehmet", "onarim", "onCamDisServis", "anakartDisServis", "SonKullanıcı", "satisa", "sahiniden", "mediaMarkt", "teslimEdilenler"];

    Object.keys(userCodes).forEach(key => {
        if (!allLists.includes(key)) {
            allLists.push(key);
        }
    });

    allLists.forEach(name => {
        if (userCodes[name] && userCodes[name].has(queryTrimmed)) {
            const listNames = {
                atanacak: '📋 Atanacak',
                parcaBekliyor: '⚙️ Parça Bekliyor',
                phonecheck: '📱 PhoneCheck',
                gokhan: '🧑‍🔧 Gökhan',
                enes: '🧑‍🔧 Enes',
                yusuf: '🧑‍🔧 Yusuf',
                samet: '🧑‍🔧 Samet',

                engin: '🧑‍🔧 Engin',
                ismail: '🧑‍🔧 İsmail',
                mehmet: '🧑‍🔧 Mehmet',
                onarim: '🔧 Onarım Tamamlandı',
                onCamDisServis: '🔨 Ön Cam Dış Servis',
                anakartDisServis: '🔨 Anakart Dış Servis',
                SonKullanıcı: '👤 Son Kullanıcı',
                satisa: '💰 Satışa Gidecek',
                sahiniden: '🏪 Sahibinden',
                mediaMarkt: '🛒 Media Markt',
                teslimEdilenler: '✅ Teslim Edilenler'
            };

            const displayName = listNames[name] || `🧑‍🔧 ${name.charAt(0).toUpperCase() + name.slice(1)}`;
            const timestamp = codeTimestamps[name][queryTrimmed] || 'Tarih yok';
            const user = codeUsers[name][queryTrimmed] || '';

            foundIn.push({
                name: displayName,
                timestamp: timestamp,
                user: user
            });
        }
    });

    if (foundIn.length > 0) {
        let resultHTML = `
            <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                <div style="color: #2ecc71; font-weight: bold; font-size: 16px;">
                    ✅ Barkod Bulundu: ${queryTrimmed}
                </div>
            </div>
        `;

        foundIn.forEach(item => {
            resultHTML += `
                <div style="margin-bottom: 8px; padding: 8px; background: #f8f9fa; border-radius: 5px;">
                    <div style="font-weight: bold; color: #333;">${item.name}</div>
                    <div style="font-size: 12px; color: #666;">
                        📅 ${item.timestamp}${item.user ? ` • 👤 ${item.user}` : ''}
                    </div>
                </div>
            `;
        });

        resultHTML += `
            <div style="margin-top: 10px; text-align: center;">
                <button onclick="showFullBarcodeDetails('${queryTrimmed}')" 
                        style="padding: 8px 15px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">
                    📊 Detaylı Bilgi Göster
                </button>
            </div>
        `;

        navSearchResult.innerHTML = resultHTML;
    } else {
        navSearchResult.innerHTML = `
            <div style="color: #e74c3c; text-align: center; padding: 20px;">
                ❌ Barkod bulunamadı: ${queryTrimmed}
            </div>
        `;
    }

    navSearchResult.classList.add('active');
}

function showFullBarcodeDetails(barcode) {
    document.getElementById('navSearchResult').classList.remove('active');
    showMainView();

    setTimeout(() => {
        const adminSearchInput = document.getElementById('searchInput');
        if (adminSearchInput) {
            adminSearchInput.value = barcode;
            performSearch(barcode, 'searchResult', 'historyLog', 'partInfoAdmin');

            const searchResult = document.getElementById('searchResult');
            if (searchResult) {
                searchResult.style.display = 'block';
                searchResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, 500);
}


function openResetDashboardModal() {
    console.log('🔄 openResetDashboardModal called');
    // Modal'ı aç ve mevcut değerleri göster
    const modal = document.getElementById('resetDashboardModal');
    console.log('Modal element:', modal);
    document.getElementById('resetTeslimAlinan').textContent = dailyReceivedIMEIs.size;
    document.getElementById('resetTeslimEdilen').textContent = dailyDeliveredCount;
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex'; // Force display
        console.log('Modal class list:', modal.classList);
        console.log('Modal style display:', modal.style.display);
    }
}

function closeResetDashboardModal() {
    console.log('❌ closeResetDashboardModal called');
    const modal = document.getElementById('resetDashboardModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

async function confirmResetDashboard() {
    console.log('✅ confirmResetDashboard called');
    const todayDate = getTodayDateString();

    try {
        // Mevcut verileri yedekle (log için)
        const currentSnapshot = await db.ref(`dashboard/daily/${todayDate}`).once('value');
        const currentData = currentSnapshot.val();

        // Reset log'u oluştur
        const resetLog = {
            timestamp: Date.now(),
            timestampReadable: getTimestamp(),
            user: currentUserName,
            previousData: {
                receivedCount: dailyReceivedIMEIs.size,
                deliveredCount: dailyDeliveredCount,
                receivedIMEIs: currentData?.receivedIMEIs ? Object.keys(currentData.receivedIMEIs) : [],
                sources: currentData?.sources || {}
            }
        };

        // Log'u database'e kaydet
        await db.ref(`dashboard/resetLogs/${todayDate}/${Date.now()}`).set(resetLog);

        // Dashboard verilerini sıfırla
        await db.ref(`dashboard/daily/${todayDate}`).set({
            receivedIMEIs: {},
            deliveredCount: 0,
            sources: {
                atanacak: 0,
                SonKullanıcı: 0,
                sahiniden: 0,
                mediaMarkt: 0,
                serviceReturn: 0 // ✅ YENİ EKLENEN
            }
        });

        // Lokal değişkenleri sıfırla
        dailyReceivedIMEIs.clear();
        dailyDeliveredCount = 0;

        // UI'ı güncelle
        updateDashboardUI({
            sources: {
                atanacak: 0,
                SonKullanıcı: 0,
                sahiniden: 0,
                mediaMarkt: 0,
                serviceReturn: 0 // ✅ YENİ EKLENEN
            }
        });

        closeResetDashboardModal();
        showToast('✅ Dashboard başarıyla sıfırlandı ve işlem loglandı!', 'success');

        console.log('📊 Dashboard Reset Log:', resetLog);

    } catch (error) {
        console.error('❌ Dashboard sıfırlama hatası:', error);
        showToast('Dashboard sıfırlanırken hata oluştu!', 'error');
    }
}

// Modal dışına tıklanınca kapat
document.addEventListener('click', function (e) {
    const modal = document.getElementById('resetDashboardModal');
    if (e.target === modal) {
        closeResetDashboardModal();
    }
});


function addSyncButtonToNav() {
    const navButtons = document.querySelector('.nav-buttons');
    if (navButtons && !document.getElementById('syncButton')) {
        const syncButton = document.createElement('button');
        syncButton.id = 'syncButton';
        syncButton.innerHTML = '🔄 Senkronize';
        syncButton.style.display = (currentUserRole === 'admin' || currentUserRole === 'semi-admin') ? 'block' : 'none';
        syncButton.onclick = openSyncModal;
        syncButton.style.padding = '10px 15px';
        syncButton.style.background = '#3498db';
        syncButton.style.color = 'white';
        syncButton.style.border = 'none';
        syncButton.style.borderRadius = '8px';
        syncButton.style.fontSize = '10px';
        syncButton.style.fontWeight = '600';
        syncButton.style.cursor = 'pointer';
        syncButton.style.transition = 'all 0.3s ease';

        syncButton.addEventListener('mouseenter', function () {
            this.style.background = '#2980b9';
            this.style.transform = 'translateY(-2px)';
        });

        syncButton.addEventListener('mouseleave', function () {
            this.style.background = '#3498db';
            this.style.transform = 'translateY(0)';
        });

        // Dashboard Sıfırla butonundan sonra ekle
        const resetBtn = document.getElementById('resetDashboardBtn');
        if (resetBtn) {
            resetBtn.parentNode.insertBefore(syncButton, resetBtn.nextSibling);
        } else {
            navButtons.appendChild(syncButton);
        }
    }
}


let conflictCheckInterval = null;

// Çakışmaları kontrol et ve bildir
async function checkAndNotifyConflicts() {
    if (currentUserRole !== 'admin' && currentUserRole !== 'semi-admin') {
        hideConflictNotification();
        return;
    }

    try {
        const conflicts = await getConflictCount();

        if (conflicts > 0) {
            showConflictNotification(conflicts);
        } else {
            hideConflictNotification();
        }
    } catch (error) {
        console.error('Çakışma kontrolü hatası:', error);
    }
}

// Çakışma sayısını hesapla
async function getConflictCount() {
    const allBarcodes = new Set();
    Object.values(userCodes).forEach(set => {
        if (set && set.forEach) {
            set.forEach(barcode => allBarcodes.add(barcode));
        }
    });

    let conflictCount = 0;

    for (const barcode of allBarcodes) {
        const lists = [];
        Object.entries(userCodes).forEach(([listName, codeSet]) => {
            if (codeSet && codeSet.has && codeSet.has(barcode)) {
                lists.push(listName);
            }
        });

        if (lists.length > 1) {
            conflictCount++;
        }
    }

    return conflictCount;
}

// Çakışma bildirimini göster
function showConflictNotification(count) {
    const notification = document.getElementById('conflictNotification');
    const countElement = document.getElementById('conflictCount');

    if (notification && countElement) {
        countElement.textContent = count;
        // Sadece çakışma varsa göster
        if (count > 0) {
            notification.style.display = 'block';
        } else {
            notification.style.display = 'none';
        }
    }
}

// Çakışma bildirimini gizle
function hideConflictNotification() {
    const notification = document.getElementById('conflictNotification');
    if (notification) {
        notification.style.display = 'none';
    }
}

// Bildirimden senkronizasyon modalını aç
function openSyncModalFromNotification() {
    openSyncModal();
}

// Çakışma kontrolünü başlat
function startConflictMonitoring() {
    // İlk kontrol
    setTimeout(() => {
        checkAndNotifyConflicts();
    }, 3000);

    // Her 60 saniyede bir kontrol et
    conflictCheckInterval = setInterval(() => {
        checkAndNotifyConflicts();
    }, 60000);
}

// Çakışma kontrolünü durdur
function stopConflictMonitoring() {
    if (conflictCheckInterval) {
        clearInterval(conflictCheckInterval);
        conflictCheckInterval = null;
    }
    hideConflictNotification();
}


async function generateServiceReturnReport(startDateInput, endDateInput) {
    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);
    endDate.setHours(23, 59, 59, 999);

    if (startDate > endDate) {
        alert('Başlangıç tarihi bitiş tarihinden büyük olamaz!');
        return;
    }

    const startOfPeriod = startDate.getTime();
    const endOfPeriod = endDate.getTime();

    try {
        const reportResults = document.getElementById('reportResults');
        reportResults.innerHTML = '<div style="text-align: center; padding: 20px;"><div style="display: inline-block; width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 1s linear infinite;"></div></div>';
        reportResults.classList.add('active');

        let totalReturns = 0;
        let returnDetails = [];
        let userStats = {};
        let targetListStats = {};

        // TÜM tarihsel service return verilerini history'den al
        const historySnapshot = await db.ref(`servis/history`).once('value');
        const historyData = historySnapshot.val();

        if (historyData) {
            for (const [barcode, barcodeHistory] of Object.entries(historyData)) {
                const historyArray = Object.values(barcodeHistory);

                // Bu barkod için service return geçmişini ara
                const serviceReturnEntries = historyArray.filter(entry =>
                    entry.user && entry.user.includes('Servise Geri Dönüş') ||
                    (entry.from === 'teslimEdilenler' && entry.to !== 'teslimEdilenler')
                );

                // Tarih aralığına uygun service return'ları bul
                for (const entry of serviceReturnEntries) {
                    if (entry.timestampRaw >= startOfPeriod && entry.timestampRaw <= endOfPeriod) {
                        totalReturns++;

                        // Kullanıcıyı parse et
                        let user = 'Bilinmeyen';
                        let targetList = 'Bilinmeyen';

                        if (entry.user && entry.user.includes('Servise Geri Dönüş')) {
                            const userMatch = entry.user.match(/Servise Geri Dönüş: (.+?) - (.+?) listesine eklendi/);
                            if (userMatch) {
                                user = userMatch[1] || 'Bilinmeyen';
                                targetList = userMatch[2] || 'Bilinmeyen';
                            } else {
                                // Alternatif format kontrolü
                                const altMatch = entry.user.match(/👤 (.+?) \(Servise Geri Dönüş/);
                                if (altMatch) {
                                    user = altMatch[1] || 'Bilinmeyen';
                                    targetList = entry.to || 'Bilinmeyen';
                                } else {
                                    user = entry.user.split(' ')[0] || 'Bilinmeyen';
                                    targetList = entry.to || 'Bilinmeyen';
                                }
                            }
                        } else {
                            // Eski format için fallback
                            user = entry.user || 'Bilinmeyen';
                            targetList = entry.to || 'Bilinmeyen';
                        }

                        userStats[user] = (userStats[user] || 0) + 1;
                        targetListStats[targetList] = (targetListStats[targetList] || 0) + 1;

                        // Barkodun şu anki durumunu kontrol et
                        let currentStatus = '';
                        let statusColor = '';
                        let currentList = '';

                        // Barkodun şu anda hangi listede olduğunu bul
                        for (const [listName, codeSet] of Object.entries(userCodes)) {
                            if (codeSet && codeSet.has(barcode)) {
                                currentList = listName;
                                break;
                            }
                        }

                        const listNames = {
                            atanacak: '📋 Atanacak',
                            gokhan: '🧑‍🔧 Gökhan',
                            enes: '🧑‍🔧 Enes',
                            yusuf: '🧑‍🔧 Yusuf',
                            samet: '🧑‍🔧 Samet',
                            engin: '🧑‍🔧 Engin',
                            ismail: '🧑‍🔧 İsmail',
                            mehmet: '🧑‍🔧 Mehmet',
                            onarim: '🔧 Onarım Tamamlandı',
                            phonecheck: '📱 PhoneCheck',
                            parcaBekliyor: '⚙️ Parça Bekliyor',
                            onCamDisServis: '🔨 Ön Cam Dış Servis',
                            anakartDisServis: '🔨 Anakart Dış Servis',
                            satisa: '💰 Satışa Gidecek',
                            sahiniden: '🏪 Sahibinden',
                            mediaMarkt: '🛒 Media Markt',
                            SonKullanıcı: '👤 Son Kullanıcı',
                            teslimEdilenler: '✅ Teslim Edilenler'
                        };

                        if (currentList) {
                            currentStatus = `📍 Şu Anda: ${listNames[currentList] || currentList}`;
                            statusColor = '#3498db';
                        } else {
                            currentStatus = '❌ Sistemde Yok (Silinmiş/Teslim Edilmiş)';
                            statusColor = '#e74c3c';
                        }

                        returnDetails.push({
                            barcode: barcode,
                            user: user,
                            targetList: targetList,
                            currentList: currentList,
                            currentStatus: currentStatus,
                            statusColor: statusColor,
                            timestamp: entry.timestamp,
                            timestampRaw: entry.timestampRaw,
                            historyEntry: entry
                        });

                        break; // Aynı barkod için sadece bir kere ekle
                    }
                }
            }
        }

        // Ayrıca serviceReturns tablosundan da kontrol et (mevcut sistemle uyumluluk için)
        const serviceReturnsSnapshot = await db.ref(`servis/serviceReturns`).once('value');
        const serviceReturnsData = serviceReturnsSnapshot.val();

        if (serviceReturnsData) {
            for (const [barcode, returnData] of Object.entries(serviceReturnsData)) {
                const returnTimestamp = returnData.returnDate || returnData.timestamp;

                if (returnTimestamp >= startOfPeriod && returnTimestamp <= endOfPeriod) {
                    // Bu barkod zaten history'de eklendiyse atla
                    const alreadyAdded = returnDetails.some(item => item.barcode === barcode);
                    if (alreadyAdded) continue;

                    totalReturns++;

                    const user = returnData.user || 'Bilinmeyen';
                    userStats[user] = (userStats[user] || 0) + 1;

                    const targetList = returnData.targetList || 'Bilinmeyen';
                    targetListStats[targetList] = (targetListStats[targetList] || 0) + 1;

                    // Barkodun şu anki durumunu kontrol et
                    let currentStatus = '';
                    let statusColor = '';
                    let currentList = '';

                    for (const [listName, codeSet] of Object.entries(userCodes)) {
                        if (codeSet && codeSet.has(barcode)) {
                            currentList = listName;
                            break;
                        }
                    }

                    const listNames = {
                        atanacak: '📋 Atanacak',
                        gokhan: '🧑‍🔧 Gökhan',
                        enes: '🧑‍🔧 Enes',
                        yusuf: '🧑‍🔧 Yusuf',
                        samet: '🧑‍🔧 Samet',
                        engin: '🧑‍🔧 Engin',
                        ismail: '🧑‍🔧 İsmail',
                        mehmet: '🧑‍🔧 Mehmet',
                        onarim: '🔧 Onarım Tamamlandı',
                        phonecheck: '📱 PhoneCheck',
                        parcaBekliyor: '⚙️ Parça Bekliyor',
                        onCamDisServis: '🔨 Ön Cam Dış Servis',
                        anakartDisServis: '🔨 Anakart Dış Servis',
                        satisa: '💰 Satışa Gidecek',
                        sahiniden: '🏪 Sahibinden',
                        mediaMarkt: '🛒 Media Markt',
                        SonKullanıcı: '👤 Son Kullanıcı',
                        teslimEdilenler: '✅ Teslim Edilenler'
                    };

                    if (currentList) {
                        currentStatus = `📍 Şu Anda: ${listNames[currentList] || currentList}`;
                        statusColor = '#3498db';
                    } else {
                        currentStatus = '❌ Sistemde Yok (Silinmiş/Teslim Edilmiş)';
                        statusColor = '#e74c3c';
                    }

                    returnDetails.push({
                        barcode: barcode,
                        user: user,
                        targetList: targetList,
                        currentList: currentList,
                        currentStatus: currentStatus,
                        statusColor: statusColor,
                        timestamp: returnData.returnDateReadable || new Date(returnTimestamp).toLocaleString('tr-TR'),
                        timestampRaw: returnTimestamp,
                        fromServiceReturns: true
                    });
                }
            }
        }

        if (totalReturns === 0) {
            reportResults.innerHTML = `
          <div class="no-results">
            📭 Seçilen tarih aralığında servise geri dönen cihaz bulunamadı.
          </div>
        `;
            return;
        }

        const dateRangeText = `${startDateInput} - ${endDateInput}`;

        // İstatistikleri hesapla
        const activeCount = returnDetails.filter(item => item.currentList).length;
        const deletedCount = returnDetails.filter(item => !item.currentList).length;

        let summaryHTML = `
        <div class="report-summary">
          <div class="summary-card">
            <div class="label">Toplam Geri Dönüş</div>
            <div class="value">${totalReturns}</div>
          </div>
          <div class="summary-card" style="background: rgba(52, 152, 219, 0.2);">
            <div class="label">📍 Aktif Cihazlar</div>
            <div class="value" style="color: #3498db;">${activeCount}</div>
          </div>
          <div class="summary-card" style="background: rgba(231, 76, 60, 0.2);">
            <div class="label">❌ Sistemden Çıkan</div>
            <div class="value" style="color: #e74c3c;">${deletedCount}</div>
          </div>
          <div class="summary-card">
            <div class="label">Tarih Aralığı</div>
            <div class="value" style="font-size: 16px;">${dateRangeText}</div>
          </div>
        </div>
      `;

        let userStatsHTML = '<div class="user-stats"><h4>👥 Kullanıcı İstatistikleri</h4>';
        const sortedUsers = Object.entries(userStats).sort((a, b) => b[1] - a[1]);
        sortedUsers.forEach(([user, count]) => {
            userStatsHTML += `
          <div class="user-stat-item">
            <span class="user-stat-name">👤 ${user}</span>
            <span class="user-stat-count">${count} geri dönüş</span>
          </div>
        `;
        });
        userStatsHTML += '</div>';

        let targetStatsHTML = '<div class="report-details"><h3>🎯 Hedef Liste Dağılımı</h3>';
        const sortedTargets = Object.entries(targetListStats).sort((a, b) => b[1] - a[1]);
        sortedTargets.forEach(([target, count]) => {
            const listNames = {
                atanacak: '📋 Atanacak',
                gokhan: '🧑‍🔧 Gökhan',
                enes: '🧑‍🔧 Enes',
                yusuf: '🧑‍🔧 Yusuf',
                samet: '🧑‍🔧 Samet',
                engin: '🧑‍🔧 Engin',
                ismail: '🧑‍🔧 İsmail',
                mehmet: '🧑‍🔧 Mehmet',
                onarim: '🔧 Onarım Tamamlandı',
                phonecheck: '📱 PhoneCheck',
                parcaBekliyor: '⚙️ Parça Bekliyor',
                onCamDisServis: '🔨 Ön Cam Dış Servis',
                anakartDisServis: '🔨 Anakart Dış Servis',
                satisa: '💰 Satışa Gidecek',
                sahiniden: '🏪 Sahibinden',
                mediaMarkt: '🛒 Media Markt',
                SonKullanıcı: '👤 Son Kullanıcı'
            };

            const displayName = listNames[target] || `🧑‍🔧 ${target.charAt(0).toUpperCase() + target.slice(1)}`;
            targetStatsHTML += `
          <div class="detail-item">
            <div class="barcode">${displayName}</div>
            <div class="info">${count} geri dönüş</div>
          </div>
        `;
        });
        targetStatsHTML += '</div>';

        let detailsHTML = '<div class="report-details"><h3>📋 Tarihsel Geri Dönüş Listesi</h3>';

        // Filtreleme için HTML
        const detailFiltersHTML = `
        <div class="detail-filters">
          <input type="text" class="detail-filter-input" id="detailBarcodeFilter" placeholder="🔍 Barkod ara...">
          <input type="text" class="detail-filter-input" id="detailUserFilter" placeholder="👤 Kullanıcı ara...">
          <input type="text" class="detail-filter-input" id="detailTargetFilter" placeholder="🎯 Hedef liste ara...">
          <select class="detail-filter-input" id="detailStatusFilter">
            <option value="">Tüm Kayıtlar</option>
            <option value="active">📍 Sadece Aktif</option>
            <option value="deleted">❌ Sadece Silinmiş</option>
          </select>
        </div>
        <div class="filter-info" id="filterInfo">
          Toplam ${returnDetails.length} tarihsel geri dönüş kaydı bulundu (📍 ${activeCount} Aktif, ❌ ${deletedCount} Sistemden Çıkan)
        </div>
        <button class="clear-filters-btn" onclick="clearDetailFilters()" style="display: none;" id="clearFiltersBtn">
          🗑️ Filtreleri Temizle
        </button>
      `;

        detailsHTML += detailFiltersHTML;
        detailsHTML += '<div class="detail-list-container" id="detailListContainer">';

        returnDetails.sort((a, b) => b.timestampRaw - a.timestampRaw).forEach(item => {
            const listNames = {
                atanacak: '📋 Atanacak',
                gokhan: '🧑‍🔧 Gökhan',
                enes: '🧑‍🔧 Enes',
                yusuf: '🧑‍🔧 Yusuf',
                samet: '🧑‍🔧 Samet',
                engin: '🧑‍🔧 Engin',
                ismail: '🧑‍🔧 İsmail',
                mehmet: '🧑‍🔧 Mehmet',
                onarim: '🔧 Onarım Tamamlandı',
                phonecheck: '📱 PhoneCheck',
                parcaBekliyor: '⚙️ Parça Bekliyor',
                onCamDisServis: '🔨 Ön Cam Dış Servis',
                anakartDisServis: '🔨 Anakart Dış Servis',
                satisa: '💰 Satışa Gidecek',
                sahiniden: '🏪 Sahibinden',
                mediaMarkt: '🛒 Media Markt',
                SonKullanıcı: '👤 Son Kullanıcı',
                teslimEdilenler: '✅ Teslim Edilenler'
            };

            const targetName = listNames[item.targetList] || `🧑‍🔧 ${item.targetList.charAt(0).toUpperCase() + item.targetList.slice(1)}`;
            const statusType = item.currentList ? 'active' : 'deleted';

            detailsHTML += `
          <div class="detail-item" data-barcode="${item.barcode}" data-user="${item.user}" 
               data-target="${item.targetList}" data-status="${statusType}"
               style="border-left: 4px solid ${item.statusColor};">
            <div class="barcode">${item.barcode}</div>
            <div class="info">🎯 Hedef: ${targetName} • 👤 ${item.user}</div>
            <div class="info">📅 ${item.timestamp}</div>
            <div class="info" style="color: ${item.statusColor}; font-weight: bold;">
              ${item.currentStatus}
            </div>
            ${item.historyEntry ? `
              <div class="info" style="font-size: 12px; color: #95a5a6;">
                📝 ${item.historyEntry.from} → ${item.historyEntry.to}
              </div>
            ` : ''}
          </div>
        `;
        });
        detailsHTML += '</div></div>';

        reportResults.innerHTML = `
        ${summaryHTML}
        ${userStatsHTML}
        ${targetStatsHTML}
        ${detailsHTML}
      `;

        // Filtreleme fonksiyonunu çağır
        setupServiceReturnFilters(returnDetails, activeCount, deletedCount);

        enableExcelExport({
            isServiceReturnReport: true,
            totalReturns,
            activeCount,
            deletedCount,
            userStats,
            targetListStats,
            returnDetails,
            reportDate: dateRangeText
        });

    } catch (error) {
        console.error('Servis geri dönüş raporu oluşturulurken hata:', error);
        alert('Servis geri dönüş raporu oluşturulurken hata oluştu!');
        document.getElementById('reportResults').innerHTML = `
        <div class="no-results">
          ❌ Servis geri dönüş raporu oluşturulurken bir hata oluştu.
        </div>
      `;
    }
}

// Service Return filtreleme fonksiyonu
function setupServiceReturnFilters(returnDetails, activeCount, deletedCount) {
    const barcodeFilter = document.getElementById('detailBarcodeFilter');
    const userFilter = document.getElementById('detailUserFilter');
    const targetFilter = document.getElementById('detailTargetFilter');
    const statusFilter = document.getElementById('detailStatusFilter');
    const filterInfo = document.getElementById('filterInfo');
    const detailItems = document.querySelectorAll('.detail-item');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');

    function updateClearButton() {
        const hasFilters = barcodeFilter.value || userFilter.value || targetFilter.value || statusFilter.value;
        clearFiltersBtn.style.display = hasFilters ? 'block' : 'none';
    }

    function applyFilters() {
        const barcodeValue = barcodeFilter.value.toLowerCase();
        const userValue = userFilter.value.toLowerCase();
        const targetValue = targetFilter.value.toLowerCase();
        const statusValue = statusFilter.value;

        let visibleCount = 0;
        let visibleActive = 0;
        let visibleDeleted = 0;

        detailItems.forEach(item => {
            const barcode = item.getAttribute('data-barcode').toLowerCase();
            const user = item.getAttribute('data-user').toLowerCase();
            const target = item.getAttribute('data-target').toLowerCase();
            const status = item.getAttribute('data-status');

            const matchesBarcode = barcode.includes(barcodeValue);
            const matchesUser = user.includes(userValue);
            const matchesTarget = target.includes(targetValue);
            const matchesStatus = !statusValue || status === statusValue;

            if (matchesBarcode && matchesUser && matchesTarget && matchesStatus) {
                item.classList.remove('hidden');
                visibleCount++;
                if (status === 'active') visibleActive++;
                else visibleDeleted++;
            } else {
                item.classList.add('hidden');
            }
        });

        filterInfo.textContent = `${visibleCount} kayıt gösteriliyor (📍 ${visibleActive} Aktif, ❌ ${visibleDeleted} Sistemden Çıkan) - Toplam: ${returnDetails.length}`;
        updateClearButton();
    }

    [barcodeFilter, userFilter, targetFilter, statusFilter].forEach(input => {
        input.addEventListener('input', applyFilters);
    });

    updateClearButton();
}


async function generateDailyReceivedReport(startDateInput, endDateInput) {
    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);
    endDate.setHours(23, 59, 59, 999);

    if (startDate > endDate) {
        alert('Başlangıç tarihi bitiş tarihinden büyük olamaz!');
        return;
    }

    const startOfPeriod = startDate.getTime();
    const endOfPeriod = endDate.getTime();

    try {
        const reportResults = document.getElementById('reportResults');
        reportResults.innerHTML = '<div style="text-align: center; padding: 20px;"><div style="display: inline-block; width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 1s linear infinite;"></div></div>';
        reportResults.classList.add('active');

        let totalReceived = 0;
        let receivedDetails = [];
        let sourceStats = {};
        let userStats = {};

        // Tüm günleri döngüye al
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];

            try {
                const snapshot = await db.ref(`dashboard/daily/${dateStr}`).once('value');
                const dailyData = snapshot.val();

                if (dailyData && dailyData.receivedIMEIs) {
                    Object.entries(dailyData.receivedIMEIs).forEach(([barcode, imeiData]) => {
                        // Tarih kontrolü - timestamp varsa onu kullan
                        const imeiTimestamp = imeiData.timestamp || new Date(dateStr).getTime();

                        if (imeiTimestamp >= startOfPeriod && imeiTimestamp <= endOfPeriod) {
                            totalReceived++;

                            const source = imeiData.source || 'Bilinmeyen';
                            sourceStats[source] = (sourceStats[source] || 0) + 1;

                            const user = imeiData.user || 'Bilinmeyen';
                            userStats[user] = (userStats[user] || 0) + 1;

                            // IMEI bilgilerini topla
                            const imeiInfo = {
                                barcode: barcode,
                                source: source,
                                user: user,
                                date: dateStr,
                                timestamp: imeiData.timestamp ? new Date(imeiData.timestamp).toLocaleString('tr-TR') : dateStr,
                                timestampRaw: imeiTimestamp,
                                isServiceReturn: imeiData.isServiceReturn || false,
                                originalTarget: imeiData.originalTarget || '',
                                imeiDetails: 'Yükleniyor...'
                            };

                            receivedDetails.push(imeiInfo);

                            // IMEI detaylarını history'den al
                            getBarcodeHistoryDetails(barcode).then(historyDetails => {
                                imeiInfo.imeiDetails = historyDetails;
                            });
                        }
                    });
                }
            } catch (error) {
                console.error(`${dateStr} tarihli veri okunurken hata:`, error);
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // IMEI detaylarını yüklemek için biraz bekle
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (totalReceived === 0) {
            reportResults.innerHTML = `
                <div class="no-results">
                    📭 Seçilen tarih aralığında teslim alınan cihaz bulunamadı.
                </div>
            `;
            return;
        }

        const dateRangeText = `${startDateInput} - ${endDateInput}`;
        const dayCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const avgPerDay = (totalReceived / dayCount).toFixed(1);

        let summaryHTML = `
            <div class="report-summary">
                <div class="summary-card">
                    <div class="label">Toplam Teslim Alınan</div>
                    <div class="value">${totalReceived}</div>
                </div>
                <div class="summary-card">
                    <div class="label">Gün Sayısı</div>
                    <div class="value">${dayCount}</div>
                </div>
                <div class="summary-card">
                    <div class="label">Günlük Ortalama</div>
                    <div class="value">${avgPerDay}</div>
                </div>
                <div class="summary-card">
                    <div class="label">Tarih Aralığı</div>
                    <div class="value" style="font-size: 16px;">${dateRangeText}</div>
                </div>
            </div>
        `;

        let sourceStatsHTML = '<div class="report-details"><h3>📊 Kaynak Bazlı Dağılım</h3>';
        const sourceNames = {
            atanacak: '📋 Atanacak',
            SonKullanıcı: '👤 Son Kullanıcı',
            sahiniden: '🏪 Sahibinden',
            mediaMarkt: '🛒 Media Markt',
            serviceReturn: '🔄 Servise Geri Dönenler'
        };

        Object.entries(sourceStats).sort((a, b) => b[1] - a[1]).forEach(([source, count]) => {
            const percentage = ((count / totalReceived) * 100).toFixed(1);
            sourceStatsHTML += `
                <div class="detail-item">
                    <div class="barcode">${sourceNames[source] || source}</div>
                    <div class="info">${count} adet (%${percentage})</div>
                </div>
            `;
        });
        sourceStatsHTML += '</div>';

        let userStatsHTML = '<div class="user-stats"><h4>👥 Kullanıcı İstatistikleri</h4>';
        const sortedUsers = Object.entries(userStats).sort((a, b) => b[1] - a[1]);
        sortedUsers.forEach(([user, count]) => {
            userStatsHTML += `
                <div class="user-stat-item">
                    <span class="user-stat-name">👤 ${user}</span>
                    <span class="user-stat-count">${count} teslim alım</span>
                </div>
            `;
        });
        userStatsHTML += '</div>';

        let detailsHTML = '<div class="report-details"><h3>📋 Detaylı Teslim Alım Listesi (IMEI Bilgileri)</h3>';

        // Filtreleme için HTML
        const detailFiltersHTML = `
            <div class="detail-filters">
                <input type="text" class="detail-filter-input" id="detailBarcodeFilter" placeholder="🔍 Barkod ara...">
                <input type="text" class="detail-filter-input" id="detailUserFilter" placeholder="👤 Kullanıcı ara...">
                <input type="text" class="detail-filter-input" id="detailSourceFilter" placeholder="📊 Kaynak ara...">
                <select class="detail-filter-input" id="detailServiceReturnFilter">
                    <option value="">Tüm Kayıtlar</option>
                    <option value="serviceReturn">🔄 Sadece Servis Geri Dönüş</option>
                    <option value="normal">📥 Sadece Normal Teslim</option>
                </select>
            </div>
            <div class="filter-info" id="filterInfo">
                Toplam ${receivedDetails.length} kayıt gösteriliyor
            </div>
            <button class="clear-filters-btn" onclick="clearDetailFilters()" style="display: none;" id="clearFiltersBtn">
                🗑️ Filtreleri Temizle
            </button>
        `;

        detailsHTML += detailFiltersHTML;
        detailsHTML += '<div class="detail-list-container" id="detailListContainer">';

        receivedDetails.sort((a, b) => b.timestampRaw - a.timestampRaw).forEach(item => {
            const sourceName = sourceNames[item.source] || item.source;
            const serviceReturnIcon = item.isServiceReturn ? ' 🔄' : '';
            const serviceReturnText = item.isServiceReturn ? ` (Geri Dönüş: ${item.originalTarget || 'Bilinmeyen'})` : '';

            detailsHTML += `
                <div class="detail-item" data-barcode="${item.barcode}" data-user="${item.user}" 
                     data-source="${item.source}" data-servicereturn="${item.isServiceReturn ? 'serviceReturn' : 'normal'}">
                    <div class="barcode">${item.barcode}${serviceReturnIcon}</div>
                    <div class="info">${sourceName}${serviceReturnText} • 👤 ${item.user}</div>
                    <div class="info">📅 ${item.timestamp}</div>
                    <div class="info" style="font-size: 12px; color: #666; margin-top: 5px;">
                        <strong>IMEI Geçmişi:</strong><br>
                        ${item.imeiDetails || 'Yükleniyor...'}
                    </div>
                </div>
            `;
        });
        detailsHTML += '</div></div>';

        reportResults.innerHTML = `
            ${summaryHTML}
            ${sourceStatsHTML}
            ${userStatsHTML}
            ${detailsHTML}
        `;

        // Filtreleme fonksiyonunu çağır
        setupDailyReceivedFilters(receivedDetails);

        enableExcelExport({
            isDailyReceivedReport: true,
            totalReceived,
            dayCount,
            avgPerDay,
            sourceStats,
            userStats,
            receivedDetails,
            reportDate: dateRangeText
        });

    } catch (error) {
        console.error('Günlük teslim alınan raporu oluşturulurken hata:', error);
        alert('Günlük teslim alınan raporu oluşturulurken hata oluştu!');
        document.getElementById('reportResults').innerHTML = `
            <div class="no-results">
                ❌ Günlük teslim alınan raporu oluşturulurken bir hata oluştu.
            </div>
        `;
    }
}

// Yardımcı fonksiyon: Barkod geçmiş detaylarını getir
async function getBarcodeHistoryDetails(barcode) {
    try {
        const snapshot = await db.ref(`servis/history/${barcode}`).once('value');
        const historyData = snapshot.val();

        if (!historyData) {
            return 'Geçmiş kaydı bulunamadı';
        }

        const historyArray = Object.values(historyData).sort((a, b) => b.timestampRaw - a.timestampRaw);
        let historyText = '';

        // Son 3 hareketi göster
        historyArray.slice(0, 3).forEach((entry, index) => {
            const listNames = {
                atanacak: 'Atanacak',
                parcaBekliyor: 'Parça Bekliyor',
                phonecheck: 'PhoneCheck',
                gokhan: 'Gökhan',
                enes: 'Enes',
                yusuf: 'Yusuf',
                samet: 'Samet',
                engin: 'Engin',
                ismail: 'İsmail',
                mehmet: 'Mehmet',
                onarim: 'Onarım',
                satisa: 'Satış',
                sahiniden: 'Sahibinden',
                mediaMarkt: 'Media Markt',
                teslimEdilenler: 'Teslim',
                'SİLİNDİ': 'Silindi'
            };

            const fromName = listNames[entry.from] || entry.from;
            const toName = listNames[entry.to] || entry.to;
            const time = entry.timestamp ? entry.timestamp.split(' ')[1] : '';

            if (index === 0) {
                historyText += `📍 ${toName} (${time})`;
            } else {
                historyText += ` ← ${fromName}`;
            }
        });

        return historyText || 'Geçmiş bilgisi yok';
    } catch (error) {
        return 'Geçmiş yüklenirken hata';
    }
}

// Daily Received filtreleme fonksiyonu
function setupDailyReceivedFilters(receivedDetails) {
    const barcodeFilter = document.getElementById('detailBarcodeFilter');
    const userFilter = document.getElementById('detailUserFilter');
    const sourceFilter = document.getElementById('detailSourceFilter');
    const serviceReturnFilter = document.getElementById('detailServiceReturnFilter');
    const filterInfo = document.getElementById('filterInfo');
    const detailItems = document.querySelectorAll('.detail-item');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');

    function updateClearButton() {
        const hasFilters = barcodeFilter.value || userFilter.value || sourceFilter.value || serviceReturnFilter.value;
        clearFiltersBtn.style.display = hasFilters ? 'block' : 'none';
    }

    function applyFilters() {
        const barcodeValue = barcodeFilter.value.toLowerCase();
        const userValue = userFilter.value.toLowerCase();
        const sourceValue = sourceFilter.value.toLowerCase();
        const serviceReturnValue = serviceReturnFilter.value;

        let visibleCount = 0;

        detailItems.forEach(item => {
            const barcode = item.getAttribute('data-barcode').toLowerCase();
            const user = item.getAttribute('data-user').toLowerCase();
            const source = item.getAttribute('data-source').toLowerCase();
            const isServiceReturn = item.getAttribute('data-servicereturn');

            const matchesBarcode = barcode.includes(barcodeValue);
            const matchesUser = user.includes(userValue);
            const matchesSource = source.includes(sourceValue);
            const matchesServiceReturn = !serviceReturnValue ||
                (serviceReturnValue === 'serviceReturn' && isServiceReturn === 'serviceReturn') ||
                (serviceReturnValue === 'normal' && isServiceReturn === 'normal');

            if (matchesBarcode && matchesUser && matchesSource && matchesServiceReturn) {
                item.classList.remove('hidden');
                visibleCount++;
            } else {
                item.classList.add('hidden');
            }
        });

        filterInfo.textContent = `${visibleCount} kayıt gösteriliyor - Toplam: ${receivedDetails.length}`;
        updateClearButton();
    }

    [barcodeFilter, userFilter, sourceFilter, serviceReturnFilter].forEach(input => {
        input.addEventListener('input', applyFilters);
    });

    updateClearButton();
}
// ========================================
// DATA SYNC VERIFICATION SYSTEM - CORE FUNCTIONS
// ========================================

// Otomatik kontrol sistemini başlat (sadece admin için)
function startDataSyncAutoCheck() {
    if (currentUserRole !== 'admin') {
        console.log('🔒 Data Sync Auto Check: Sadece admin erişebilir');
        return;
    }

    console.log('✅ Data Sync Auto Check başlatıldı - Her 5 dakikada kontrol edilecek');

    // İlk kontrolü 30 saniye sonra yap
    setTimeout(() => {
        performDataSyncCheck(false); // false = sessiz kontrol (bildirim gösterme)
    }, 30000);

    // 5 dakikada bir otomatik kontrol
    dataSyncCheckInterval = setInterval(() => {
        performDataSyncCheck(false);
    }, DATA_SYNC_CHECK_INTERVAL);
}

// Otomatik kontrol sistemini durdur
function stopDataSyncAutoCheck() {
    if (dataSyncCheckInterval) {
        clearInterval(dataSyncCheckInterval);
        dataSyncCheckInterval = null;
        console.log('⏹️ Data Sync Auto Check durduruldu');
    }
}

// Veri kontrolü yap
async function performDataSyncCheck(showNotification = false) {
    if (currentUserRole !== 'admin') return;

    try {
        console.log('🔍 Veri senkronizasyon kontrolü başlatılıyor...');
        lastDataSyncCheck = new Date();
        dataSyncMismatches = [];

        // 1. TÜM LİSTELERİN SAYIM KONTROLÜ
        const listNames = [
            'atanacak', 'parcaBekliyor', 'phonecheck',
            'gokhan', 'enes', 'yusuf', 'samet', 'engin', 'ismail', 'mehmet',
            'onarim', 'onCamDisServis', 'anakartDisServis',
            'satisa', 'sahiniden', 'mediaMarkt', 'SonKullanıcı', 'teslimEdilenler'
        ];

        for (const listName of listNames) {
            // Frontend'deki barkodlar
            const frontendCodes = userCodes[listName] ? Array.from(userCodes[listName]) : [];
            const frontendCount = frontendCodes.length;

            // Database path mapping - onarim -> onarimTamamlandi
            const dbPath = listName === 'onarim' ? 'onarimTamamlandi' : listName;

            // Database'deki barkodlar - SADECE 15 HANELİ
            const dbSnapshot = await db.ref(`servis/${dbPath}`).once('value');
            const dbData = dbSnapshot.val();

            let dbCodes = [];
            if (dbData) {
                // Sadece 15 haneli barkodları al
                dbCodes = Object.keys(dbData).filter(key => /^\d{15}$/.test(key));
            }

            const dbCount = dbCodes.length;

            // SADECE GERÇEK FARKLARI TESPIT ET
            if (frontendCount !== dbCount) {
                // Eksik ve fazla barkodları bul
                const frontendSet = new Set(frontendCodes);
                const dbSet = new Set(dbCodes);

                const missingInFrontend = dbCodes.filter(code => !frontendSet.has(code));
                const missingInDB = frontendCodes.filter(code => !dbSet.has(code));

                // Sadece gerçekten eksik/fazla varsa rapor et
                if (missingInFrontend.length > 0 || missingInDB.length > 0) {
                    const difference = Math.abs(frontendCount - dbCount);

                    dataSyncMismatches.push({
                        type: 'count_mismatch',
                        listName: listName,
                        frontendCount: frontendCount,
                        dbCount: dbCount,
                        difference: difference,
                        severity: difference > 10 ? 'high' : 'medium',
                        missingInFrontend: missingInFrontend.slice(0, 5),
                        missingInDB: missingInDB.slice(0, 5),
                        totalMissingInFrontend: missingInFrontend.length,
                        totalMissingInDB: missingInDB.length
                    });

                    console.warn(`⚠️ ${listName}: Frontend=${frontendCount}, DB=${dbCount}, Fark=${difference}`);
                    if (missingInFrontend.length > 0) {
                        console.warn(`   📍 DB'de olup Frontend'de olmayan: ${missingInFrontend.length} adet`);
                    }
                    if (missingInDB.length > 0) {
                        console.warn(`   📍 Frontend'de olup DB'de olmayan: ${missingInDB.length} adet`);
                    }
                } else {
                    // Sayılar farklı ama barkodlar aynı - bu normal olabilir
                    console.info(`ℹ️ ${listName}: Sayı farkı var (${frontendCount} vs ${dbCount}) ama barkodlar aynı - ignore`);
                }
            }
        }

        // 2. DASHBOARD İSTATİSTİKLERİNİ KONTROL ET
        const today = new Date().toISOString().split('T')[0];
        const dashboardSnapshot = await db.ref(`dashboard/daily/${today}`).once('value');
        const dashboardData = dashboardSnapshot.val();

        if (dashboardData) {
            // Bugün Teslim Alınan - receivedIMEIs object'inden say
            const dbReceivedIMEIs = dashboardData.receivedIMEIs || {};
            const dbReceivedCount = Object.keys(dbReceivedIMEIs).filter(key => /^\d{15}$/.test(key)).length;

            const frontendReceivedElement = document.getElementById('dashboardTeslimAlinan');
            const frontendReceivedCount = frontendReceivedElement ? parseInt(frontendReceivedElement.textContent) || 0 : 0;

            // Gerçek fark var mı kontrol et
            if (dbReceivedCount !== frontendReceivedCount) {
                const receivedDiff = Math.abs(dbReceivedCount - frontendReceivedCount);

                dataSyncMismatches.push({
                    type: 'dashboard_mismatch',
                    field: 'Bugün Teslim Alınan',
                    frontendValue: frontendReceivedCount,
                    dbValue: dbReceivedCount,
                    difference: receivedDiff,
                    severity: receivedDiff > 10 ? 'high' : 'medium'
                });
                console.warn(`⚠️ Dashboard Teslim Alınan: Frontend=${frontendReceivedCount}, DB=${dbReceivedCount}, Fark=${receivedDiff}`);
            }

            // Bugün Teslim Edilen - deliveredCount field'ını kullan (direkt sayı)
            const dbDeliveredCount = dashboardData.deliveredCount || 0;
            const frontendDeliveredElement = document.getElementById('dashboardTeslimEdilen');
            const frontendDeliveredCount = frontendDeliveredElement ? parseInt(frontendDeliveredElement.textContent) || 0 : 0;

            // Gerçek fark var mı kontrol et
            if (dbDeliveredCount !== frontendDeliveredCount) {
                const deliveredDiff = Math.abs(dbDeliveredCount - frontendDeliveredCount);

                dataSyncMismatches.push({
                    type: 'dashboard_mismatch',
                    field: 'Bugün Teslim Edilen',
                    frontendValue: frontendDeliveredCount,
                    dbValue: dbDeliveredCount,
                    difference: deliveredDiff,
                    severity: deliveredDiff > 10 ? 'high' : 'medium'
                });
                console.warn(`⚠️ Dashboard Teslim Edilen: Frontend=${frontendDeliveredCount}, DB=${dbDeliveredCount}, Fark=${deliveredDiff}`);
            }
        }

        // 3. SONUÇLARI GÖSTER
        if (dataSyncMismatches.length > 0) {
            console.warn(`⚠️ ${dataSyncMismatches.length} adet veri uyumsuzluğu tespit edildi!`);
            if (showNotification) {
                showDataSyncNotification();
            } else {
                // Sessiz modda sadece bildirim göster
                updateDataSyncNotificationBadge();
            }
        } else {
            console.log('✅ Tüm veriler senkronize - Uyumsuzluk yok');
            hideDataSyncNotification();
        }

    } catch (error) {
        console.error('❌ Veri senkronizasyon kontrolünde hata:', error);
    }
}

// Bildirim göster
function showDataSyncNotification() {
    if (currentUserRole !== 'admin') return;

    const notification = document.getElementById('dataSyncNotification');
    const countElement = document.getElementById('dataSyncCount');

    if (notification && countElement) {
        countElement.textContent = dataSyncMismatches.length;
        // Sadece uyumsuzluk varsa göster
        if (dataSyncMismatches.length > 0) {
            notification.style.display = 'block';
        } else {
            notification.style.display = 'none';
        }
    }
}

// Bildirim gizle
function hideDataSyncNotification() {
    const notification = document.getElementById('dataSyncNotification');
    if (notification) {
        notification.style.display = 'none';
    }
}

// Bildirim sayısını güncelle
function updateDataSyncNotificationBadge() {
    if (currentUserRole !== 'admin') return;

    const countElement = document.getElementById('dataSyncCount');
    if (countElement && dataSyncMismatches.length > 0) {
        countElement.textContent = dataSyncMismatches.length;
        showDataSyncNotification();
    }
}

// Data Sync Modal'ı aç
function openDataSyncModal() {
    if (currentUserRole !== 'admin') {
        alert('Bu özelliğe sadece admin erişebilir!');
        return;
    }

    const modal = document.getElementById('dataSyncModal');
    if (modal) {
        modal.style.display = 'flex';
        displayDataSyncResults();
    }
}

// Data Sync Modal'ı kapat
function closeDataSyncModal() {
    const modal = document.getElementById('dataSyncModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Sonuçları göster
function displayDataSyncResults() {
    const resultsContainer = document.getElementById('dataSyncResults');
    const lastCheckElement = document.getElementById('lastSyncCheck');
    const fixAllBtn = document.getElementById('fixAllDataBtn');

    if (!resultsContainer) return;

    // Son kontrol zamanını güncelle
    if (lastCheckElement && lastDataSyncCheck) {
        lastCheckElement.textContent = lastDataSyncCheck.toLocaleString('tr-TR');
    }

    if (dataSyncMismatches.length === 0) {
        resultsContainer.innerHTML = `
      <div style="text-align: center; padding: 40px; background: rgba(46, 204, 113, 0.2); border-radius: 12px; border: 2px solid #2ecc71;">
        <div style="font-size: 60px; margin-bottom: 15px;">✅</div>
        <h3 style="color: #2ecc71; margin-bottom: 10px;">Tüm Veriler Senkronize!</h3>
        <p style="opacity: 0.8;">Database ile frontend verileri tamamen eşleşiyor.</p>
      </div>
    `;
        if (fixAllBtn) fixAllBtn.disabled = true;
        return;
    }

    // Uyumsuzlukları listele
    let html = `
    <div style="margin-bottom: 20px; padding: 15px; background: rgba(231, 76, 60, 0.2); border-radius: 8px; border-left: 4px solid #e74c3c;">
      <h3 style="margin: 0 0 10px 0; color: #e74c3c;">⚠️ ${dataSyncMismatches.length} Adet Uyumsuzluk Tespit Edildi</h3>
      <p style="margin: 0; opacity: 0.9;">Aşağıdaki uyumsuzlukları inceleyip düzeltebilirsiniz.</p>
    </div>
  `;

    const listNameMap = {
        atanacak: '📋 Atanacak',
        parcaBekliyor: '⚙️ Parça Bekliyor',
        phonecheck: '📱 PhoneCheck',
        gokhan: '🧑‍🔧 Gökhan',
        enes: '🧑‍🔧 Enes',
        yusuf: '🧑‍🔧 Yusuf',
        samet: '🧑‍🔧 Samet',
        engin: '🧑‍🔧 Engin',
        ismail: '🧑‍🔧 İsmail',
        mehmet: '🧑‍🔧 Mehmet',
        onarim: '🔧 Onarım Tamamlandı',
        onCamDisServis: '🔨 Ön Cam Dış Servis',
        anakartDisServis: '🔨 Anakart Dış Servis',
        satisa: '💰 Satışa Gidecek',
        sahiniden: '🏪 Sahibinden',
        mediaMarkt: '🛒 Media Markt',
        SonKullanıcı: '👤 Son Kullanıcı',
        teslimEdilenler: '✅ Teslim Edilenler'
    };

    dataSyncMismatches.forEach((mismatch, index) => {
        const severityColor = mismatch.severity === 'high' ? '#e74c3c' : '#f39c12';
        const severityIcon = mismatch.severity === 'high' ? '🔴' : '🟡';

        if (mismatch.type === 'count_mismatch') {
            const listLabel = listNameMap[mismatch.listName] || mismatch.listName;

            // Detaylı bilgi varsa göster
            let detailsHTML = '';
            if (mismatch.missingInFrontend || mismatch.missingInDB) {
                detailsHTML = `
          <div style="margin-top: 15px; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 6px; font-size: 12px;">
            <strong>🔍 Detaylı Analiz:</strong><br>
        `;

                if (mismatch.totalMissingInFrontend > 0) {
                    detailsHTML += `
            <div style="margin-top: 8px; padding: 8px; background: rgba(46, 204, 113, 0.1); border-left: 3px solid #2ecc71; border-radius: 4px;">
              <strong>✅ DB'de var, Frontend'de yok:</strong> ${mismatch.totalMissingInFrontend} adet<br>
              ${mismatch.missingInFrontend.length > 0 ? `
                <div style="margin-top: 5px; font-family: monospace; font-size: 11px; opacity: 0.9;">
                  ${mismatch.missingInFrontend.join(', ')}
                  ${mismatch.totalMissingInFrontend > 5 ? `<br><em>... ve ${mismatch.totalMissingInFrontend - 5} adet daha</em>` : ''}
                </div>
              ` : ''}
            </div>
          `;
                }

                if (mismatch.totalMissingInDB > 0) {
                    detailsHTML += `
            <div style="margin-top: 8px; padding: 8px; background: rgba(231, 76, 60, 0.1); border-left: 3px solid #e74c3c; border-radius: 4px;">
              <strong>❌ Frontend'de var, DB'de yok:</strong> ${mismatch.totalMissingInDB} adet<br>
              ${mismatch.missingInDB.length > 0 ? `
                <div style="margin-top: 5px; font-family: monospace; font-size: 11px; opacity: 0.9;">
                  ${mismatch.missingInDB.join(', ')}
                  ${mismatch.totalMissingInDB > 5 ? `<br><em>... ve ${mismatch.totalMissingInDB - 5} adet daha</em>` : ''}
                </div>
              ` : ''}
            </div>
          `;
                }

                detailsHTML += '</div>';
            }

            html += `
        <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid ${severityColor};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <strong style="font-size: 16px;">${severityIcon} ${listLabel}</strong>
            <span style="font-size: 12px; opacity: 0.7;">Liste Sayım Uyumsuzluğu</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 10px;">
            <div style="background: rgba(52, 152, 219, 0.2); padding: 10px; border-radius: 6px;">
              <div style="font-size: 12px; opacity: 0.8;">Frontend</div>
              <div style="font-size: 20px; font-weight: bold;">${mismatch.frontendCount}</div>
            </div>
            <div style="background: rgba(46, 204, 113, 0.2); padding: 10px; border-radius: 6px;">
              <div style="font-size: 12px; opacity: 0.8;">Database (Gerçek)</div>
              <div style="font-size: 20px; font-weight: bold;">${mismatch.dbCount}</div>
            </div>
            <div style="background: rgba(231, 76, 60, 0.2); padding: 10px; border-radius: 6px;">
              <div style="font-size: 12px; opacity: 0.8;">Fark</div>
              <div style="font-size: 20px; font-weight: bold;">${mismatch.difference}</div>
            </div>
          </div>
          ${detailsHTML}
        </div>
      `;
        } else if (mismatch.type === 'dashboard_mismatch') {
            html += `
        <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid ${severityColor};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <strong style="font-size: 16px;">${severityIcon} ${mismatch.field}</strong>
            <span style="font-size: 12px; opacity: 0.7;">Dashboard Uyumsuzluğu</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 10px;">
            <div style="background: rgba(52, 152, 219, 0.2); padding: 10px; border-radius: 6px;">
              <div style="font-size: 12px; opacity: 0.8;">Frontend</div>
              <div style="font-size: 20px; font-weight: bold;">${mismatch.frontendValue}</div>
            </div>
            <div style="background: rgba(46, 204, 113, 0.2); padding: 10px; border-radius: 6px;">
              <div style="font-size: 12px; opacity: 0.8;">Database</div>
              <div style="font-size: 20px; font-weight: bold;">${mismatch.dbValue}</div>
            </div>
            <div style="background: rgba(231, 76, 60, 0.2); padding: 10px; border-radius: 6px;">
              <div style="font-size: 12px; opacity: 0.8;">Fark</div>
              <div style="font-size: 20px; font-weight: bold;">${mismatch.difference}</div>
            </div>
          </div>
        </div>
      `;
        }
    });

    resultsContainer.innerHTML = html;

    // Düzeltme butonunu aktif et
    if (fixAllBtn) {
        fixAllBtn.disabled = false;
    }
}

// Tüm uyumsuzlukları düzelt
async function fixAllDataMismatches() {
    if (currentUserRole !== 'admin') {
        alert('Bu işlemi sadece admin yapabilir!');
        return;
    }

    if (dataSyncMismatches.length === 0) {
        alert('Düzeltilecek uyumsuzluk bulunamadı!');
        return;
    }

    // ŞİFRE KONTROLÜ
    const enteredPassword = prompt('⚠️ GÜVENLİK KONTROLÜ\n\nBu işlem tüm verileri düzeltecek.\nDevam etmek için yetkilendirme şifresini girin:');

    if (enteredPassword === null) {
        // Kullanıcı iptal etti
        return;
    }

    if (enteredPassword !== '6262') {
        // Yanlış şifre denemesini logla
        const failedAttemptLog = {
            timestamp: new Date().toISOString(),
            user: currentUserName || 'Admin',
            action: 'data_sync_fix_failed',
            reason: 'wrong_password',
            attemptedPassword: enteredPassword // Güvenlik için kaydedilir
        };

        try {
            await db.ref('logs/dataSync/failedAttempts').push(failedAttemptLog);
        } catch (error) {
            console.error('Failed attempt log error:', error);
        }

        alert('❌ YANLIŞ ŞİFRE!\n\nYetkilendirme şifresi hatalı. İşlem iptal edildi.');
        showToast('❌ Yanlış şifre girdiniz!', 'error');
        return;
    }

    // Şifre doğru, devam et
    const confirmMsg = `${dataSyncMismatches.length} adet uyumsuzluk düzeltilecek.\n\n⚠️ Bu işlem:\n- Database verilerini referans alacak\n- Frontend'i database ile senkronize edecek\n- Tüm sayımları yeniden yükleyecek\n\nDevam etmek istiyor musunuz?`;

    if (!confirm(confirmMsg)) return;

    try {
        showToast('🔄 Veri düzeltme başlatılıyor...', 'info');

        let fixedCount = 0;

        for (const mismatch of dataSyncMismatches) {
            if (mismatch.type === 'count_mismatch') {
                // Liste verilerini database'den yeniden yükle
                const listName = mismatch.listName;

                // Database path mapping - onarim -> onarimTamamlandi
                const dbPath = listName === 'onarim' ? 'onarimTamamlandi' : listName;

                const snapshot = await db.ref(`servis/${dbPath}`).once('value');
                const dbData = snapshot.val();

                // Frontend'i güncelle - SADECE 15 HANELİ BARKODLARI AL
                if (dbData) {
                    // Önce sadece 15 haneli barkodları filtrele
                    const validBarcodes = Object.keys(dbData).filter(key => /^\d{15}$/.test(key));

                    userCodes[listName] = new Set(validBarcodes);
                    codeTimestamps[listName] = {};
                    codeUsers[listName] = {};

                    validBarcodes.forEach(code => {
                        const value = dbData[code];
                        if (typeof value === 'object' && value !== null) {
                            codeTimestamps[listName][code] = value.timestamp || value;
                            codeUsers[listName][code] = value.user || null;
                        } else {
                            codeTimestamps[listName][code] = value;
                            codeUsers[listName][code] = null;
                        }
                    });

                    updateLabelAndCount(listName);
                }

                fixedCount++;
            } else if (mismatch.type === 'dashboard_mismatch') {
                // Dashboard verilerini yeniden yükle
                await loadDashboardStats();
                fixedCount++;
            }
        }

        // UI'ı yenile
        renderList();

        // Log kaydet
        const logData = {
            timestamp: new Date().toISOString(),
            user: currentUserName || 'Admin',
            action: 'data_sync_fix',
            fixedCount: fixedCount,
            mismatches: dataSyncMismatches,
            authorizedWithPassword: true, // Şifre ile yetkilendirildi
            passwordUsed: '6262' // Hangi şifre kullanıldı
        };

        await db.ref('logs/dataSync').push(logData);

        showToast(`✅ ${fixedCount} adet uyumsuzluk başarıyla düzeltildi!`, 'success');

        // Yeniden kontrol et
        await performDataSyncCheck(false);
        displayDataSyncResults();

    } catch (error) {
        console.error('❌ Veri düzeltme hatası:', error);
        alert('Veri düzeltilirken bir hata oluştu!');
    }
}

// Manuel kontrol başlat
async function forceDataSyncCheck() {
    if (currentUserRole !== 'admin') return;

    const resultsContainer = document.getElementById('dataSyncResults');
    if (resultsContainer) {
        resultsContainer.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <div style="display: inline-block; width: 50px; height: 50px; border: 5px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <p style="margin-top: 20px;">Veriler kontrol ediliyor...</p>
      </div>
    `;
    }

    await performDataSyncCheck(true);
    displayDataSyncResults();
}

// ========================================
// SYSTEM LOGS FUNCTIONS
// ========================================

let currentLogsData = [];

function closeSystemLogsModal() {
    document.getElementById('systemLogsModal').style.display = 'none';
}

function clearLogsFilters() {
    document.getElementById('logsUserFilter').value = '';
    document.getElementById('logsImeiFilter').value = '';
    document.getElementById('logsListFilter').value = '';

    // Tarihleri sıfırla
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('logsEndDate').value = today;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    document.getElementById('logsStartDate').value = weekAgo.toISOString().split('T')[0];
}

// ... existing code ...
async function loadSystemLogs() {
    const startDate = document.getElementById('logsStartDate').value;
    const endDate = document.getElementById('logsEndDate').value;
    const userFilter = document.getElementById('logsUserFilter').value.toLowerCase();
    const imeiFilter = document.getElementById('logsImeiFilter').value.trim();
    const listFilter = document.getElementById('logsListFilter').value;

    if (!startDate || !endDate) {
        alert('Lütfen başlangıç ve bitiş tarihlerini seçin!');
        return;
    }

    const resultsContainer = document.getElementById('systemLogsResults');
    const statsContainer = document.getElementById('logsStats');
    const exportBtn = document.getElementById('exportLogsBtn');

    // Loading göster
    resultsContainer.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <div style="display: inline-block; width: 50px; height: 50px; border: 5px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p style="margin-top: 20px;">Loglar yükleniyor...</p>
    </div>
  `;

    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const startTimestamp = start.getTime();
        const endTimestamp = end.getTime();
        const logs = [];

        // ============================================================
        // SENARYO 1: PARÇA İSTEKLERİ SEÇİLDİYSE (partOrders tablosundan çek)
        // ============================================================
        if (listFilter === 'partOrders') {
            const partOrdersSnapshot = await db.ref('partOrders').once('value');
            const partOrdersData = partOrdersSnapshot.val();

            if (partOrdersData) {
                Object.values(partOrdersData).forEach(order => {
                    // Tarih kontrolü
                    if (order.timestamp < startTimestamp || order.timestamp > endTimestamp) return;

                    // Kullanıcı filtresi (Teknisyen)
                    if (userFilter && !order.technician.toLowerCase().includes(userFilter)) return;

                    // IMEI filtresi
                    if (imeiFilter && order.barcode !== imeiFilter) return;

                    // Parça isimlerini birleştir
                    const partsList = order.parts ? order.parts.map(p => p.name).join(', ') : 'Parça Yok';

                    logs.push({
                        imei: order.barcode,
                        from: 'Parça İsteği', // Nereden: Parça İsteği olarak görünsün
                        to: partsList,        // Nereye: İstenen parçalar görünsün
                        user: order.technician,
                        timestamp: order.timestampReadable,
                        timestampRaw: order.timestamp,
                        isPartOrder: true // Özel işaretleme
                    });
                });
            }
        }
        // ============================================================
        // SENARYO 2: NORMAL LOGLAR (history tablosundan çek)
        // ============================================================
        else {
            // Tüm IMEI geçmişlerini çek
            const historySnapshot = await db.ref('servis/history').once('value');
            const historyData = historySnapshot.val();

            if (historyData) {
                Object.entries(historyData).forEach(([imei, imeiHistory]) => {
                    // IMEI filtresi varsa kontrol et
                    if (imeiFilter && imei !== imeiFilter) return;

                    Object.values(imeiHistory).forEach(entry => {
                        // Tarih kontrolü
                        if (entry.timestampRaw < startTimestamp || entry.timestampRaw > endTimestamp) return;

                        // Kullanıcı filtresi
                        if (userFilter && !entry.user.toLowerCase().includes(userFilter)) return;

                        // Liste filtresi
                        if (listFilter && entry.to !== listFilter && entry.from !== listFilter) return;

                        logs.push({
                            imei: imei,
                            from: entry.from,
                            to: entry.to,
                            user: entry.user,
                            timestamp: entry.timestamp,
                            timestampRaw: entry.timestampRaw
                        });
                    });
                });
            }
        }

        // Tarihe göre sırala (en yeni en üstte)
        logs.sort((a, b) => b.timestampRaw - a.timestampRaw);

        currentLogsData = logs;

        if (logs.length === 0) {
            resultsContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.6);">
          <div style="font-size: 60px; margin-bottom: 20px;">🔍</div>
          <p>Seçilen filtrelere uygun log bulunamadı.</p>
        </div>
      `;
            statsContainer.style.display = 'none';
            exportBtn.disabled = true;
            return;
        }

        // İstatistikleri göster
        document.getElementById('logsTotalCount').textContent = logs.length;
        statsContainer.style.display = 'block';
        exportBtn.disabled = false;

        // Logları göster
        displayLogs(logs);

    } catch (error) {
        console.error('Loglar yüklenirken hata:', error);
        resultsContainer.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #e74c3c;">
        <div style="font-size: 60px; margin-bottom: 20px;">❌</div>
        <p>Loglar yüklenirken bir hata oluştu!</p>
      </div>
    `;
        statsContainer.style.display = 'none';
        exportBtn.disabled = true;
    }
}
// ... existing code ...

function displayLogs(logs) {
    const resultsContainer = document.getElementById('systemLogsResults');

    const listNames = {
        atanacak: '📋 Atanacak',
        parcaBekliyor: '⚙️ Parça Bekliyor',
        phonecheck: '📱 PhoneCheck',
        gokhan: '🧑‍🔧 Gökhan',
        enes: '🧑‍🔧 Enes',
        yusuf: '🧑‍🔧 Yusuf',
        samet: '🧑‍🔧 Samet',
        engin: '🧑‍🔧 Engin',
        ismail: '🧑‍🔧 İsmail',
        mehmet: '🧑‍🔧 Mehmet',
        onarim: '🔧 Onarım Tamamlandı',
        onCamDisServis: '🔨 Ön Cam Dış Servis',
        anakartDisServis: '🔨 Anakart Dış Servis',
        satisa: '💰 Satışa Gidecek',
        sahiniden: '🏪 Sahibinden',
        mediaMarkt: '🛒 Media Markt',
        SonKullanıcı: '👤 Son Kullanıcı',
        teslimEdilenler: '✅ Teslim Edilenler',
        'SİLİNDİ': '🗑️ Silindi',
        'TOPLU_SİLİNDİ': '🗑️ Toplu Silindi',
        'SENKRONİZASYON_SİLİNDİ': '🔄 Senkronizasyon Silindi',
        'Yeni Ekleme': '➕ Yeni Ekleme'
    };

    let html = '<div style="display: grid; gap: 10px;">';

    logs.forEach((log, index) => {
        const fromName = listNames[log.from] || log.from;
        const toName = listNames[log.to] || log.to;

        // Renk belirleme
        let borderColor = '#3498db';
        if (log.to.includes('SİLİNDİ')) borderColor = '#e74c3c';
        else if (log.to === 'teslimEdilenler') borderColor = '#2ecc71';
        else if (log.from === 'Yeni Ekleme') borderColor = '#9b59b6';

        html += `
      <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; border-left: 4px solid ${borderColor};">
        <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 15px; align-items: center;">
          <div style="font-family: monospace; font-size: 14px; color: #ffd700; font-weight: bold;">
            ${log.imei}
          </div>
          <div>
            <div style="font-size: 13px; margin-bottom: 5px;">
              <span style="opacity: 0.8;">${fromName}</span>
              <span style="margin: 0 8px;">→</span>
              <span style="font-weight: bold;">${toName}</span>
            </div>
            <div style="font-size: 12px; opacity: 0.7;">
              👤 ${log.user} • 🕒 ${log.timestamp}
            </div>
          </div>
          <div style="text-align: right; font-size: 11px; opacity: 0.5;">
            #${index + 1}
          </div>
        </div>
      </div>
    `;
    });

    html += '</div>';

    resultsContainer.innerHTML = html;
}

function exportLogsToExcel() {
    if (currentLogsData.length === 0) {
        alert('Dışa aktarılacak log bulunamadı!');
        return;
    }

    const listNames = {
        atanacak: 'Atanacak',
        parcaBekliyor: 'Parça Bekliyor',
        phonecheck: 'PhoneCheck',
        gokhan: 'Gökhan',
        enes: 'Enes',
        yusuf: 'Yusuf',
        samet: 'Samet',
        engin: 'Engin',
        ismail: 'İsmail',
        mehmet: 'Mehmet',
        onarim: 'Onarım Tamamlandı',
        onCamDisServis: 'Ön Cam Dış Servis',
        anakartDisServis: 'Anakart Dış Servis',
        satisa: 'Satışa Gidecek',
        sahiniden: 'Sahibinden',
        mediaMarkt: 'Media Markt',
        SonKullanıcı: 'Son Kullanıcı',
        teslimEdilenler: 'Teslim Edilenler',
        'SİLİNDİ': 'Silindi',
        'TOPLU_SİLİNDİ': 'Toplu Silindi',
        'SENKRONİZASYON_SİLİNDİ': 'Senkronizasyon Silindi',
        'Yeni Ekleme': 'Yeni Ekleme'
    };

    // Excel için veri hazırla
    const excelData = currentLogsData.map((log, index) => {
        return {
            'Sıra': index + 1,
            'IMEI': log.imei,
            'Nereden': listNames[log.from] || log.from,
            'Nereye': listNames[log.to] || log.to,
            'Kullanıcı': log.user,
            'Tarih': log.timestamp
        };
    });

    // Worksheet oluştur
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Kolon genişlikleri
    ws['!cols'] = [
        { wch: 8 },  // Sıra
        { wch: 18 }, // IMEI
        { wch: 25 }, // Nereden
        { wch: 25 }, // Nereye
        { wch: 15 }, // Kullanıcı
        { wch: 20 }  // Tarih
    ];

    // Workbook oluştur
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sistem Logları');

    // Dosya adı
    const startDate = document.getElementById('logsStartDate').value;
    const endDate = document.getElementById('logsEndDate').value;
    const fileName = `Sistem_Loglari_${startDate}_${endDate}.xlsx`;

    // İndir
    XLSX.writeFile(wb, fileName);

    showToast(`📊 ${currentLogsData.length} adet log Excel'e aktarıldı!`, 'success');
}

// ========================================
// PART ORDER SYSTEM - MULTI-IMEI SUPPORT
// ========================================

let currentPartOrderType = 'single'; // 'single' or 'multiple'

// Open part order type selection modal
function openPartOrderModal() {
    document.getElementById('partOrderTypeModal').style.display = 'flex';
}

// Close part order type selection modal
function closePartOrderTypeModal() {
    document.getElementById('partOrderTypeModal').style.display = 'none';
}

// Select part order type and open main form
function selectPartOrderType(type) {
    currentPartOrderType = type;
    closePartOrderTypeModal();

    // Open the main part order modal
    document.getElementById('partOrderModal').style.display = 'flex';

    // Configure inputs based on type
    const singleInput = document.getElementById('partOrderBarcode');
    const multipleInput = document.getElementById('partOrderBarcodeMultiple');
    const barcodeLabel = document.getElementById('barcodeLabel');
    const barcodeCount = document.getElementById('barcodeCount');

    if (type === 'single') {
        singleInput.style.display = 'block';
        multipleInput.style.display = 'none';
        barcodeCount.style.display = 'none';
        barcodeLabel.textContent = '15 Haneli Barkod:';
        singleInput.value = '';
    } else {
        singleInput.style.display = 'none';
        multipleInput.style.display = 'block';
        barcodeCount.style.display = 'block';
        barcodeLabel.textContent = 'Barkodlar (Çoklu):';
        multipleInput.value = '';
        updateBarcodeCount();

        // Add input listener for count update
        multipleInput.addEventListener('input', updateBarcodeCount);
    }

    // Clear all other fields
    document.getElementById('partOrderModel').value = '';
    document.getElementById('partOrderCustomer').value = '';
    document.getElementById('partOrderStatus').value = '';
    document.getElementById('partOrderService').value = '';
    document.getElementById('partOrderNote').value = '';
    document.getElementById('partOrderTechnicianDamage').value = '';
    document.getElementById('partOrderPart1').value = '';
    document.getElementById('partOrderPart2').value = '';
    document.getElementById('partOrderPart3').value = '';
    document.getElementById('partOrderPart4').value = '';
}

// Update barcode count for multiple input
function updateBarcodeCount() {
    const multipleInput = document.getElementById('partOrderBarcodeMultiple');
    const barcodeCount = document.getElementById('barcodeCount');

    if (!multipleInput || !barcodeCount) return;

    const barcodes = parseMultipleBarcodes(multipleInput.value);
    const validCount = barcodes.filter(b => b.length === 15).length;
    const invalidCount = barcodes.length - validCount;

    if (barcodes.length === 0) {
        barcodeCount.textContent = '';
    } else {
        barcodeCount.textContent = `✅ ${validCount} geçerli barkod${invalidCount > 0 ? ` | ❌ ${invalidCount} geçersiz` : ''}`;
        barcodeCount.style.color = invalidCount > 0 ? '#e74c3c' : '#2ecc71';
    }
}

// Parse multiple barcodes from textarea
function parseMultipleBarcodes(text) {
    if (!text || text.trim() === '') return [];

    // Split by newline, comma, or semicolon
    const barcodes = text
        .split(/[\n,;]+/)
        .map(b => b.trim())
        .filter(b => b.length > 0);

    return barcodes;
}

// Validate IMEI (15 digits)
function validateIMEI(imei) {
    return /^\d{15}$/.test(imei);
}

// Close part order modal
function closePartOrderModal() {
    document.getElementById('partOrderModal').style.display = 'none';
    currentPartOrderType = 'single';
}

// Submit part order
async function submitPartOrder() {
    try {
        // Get form values
        const model = document.getElementById('partOrderModel').value;
        const customer = document.getElementById('partOrderCustomer').value;
        const statusField = document.getElementById('partOrderStatus').value;
        const service = document.getElementById('partOrderService').value;
        const note = document.getElementById('partOrderNote').value;
        const technicianDamage = document.getElementById('partOrderTechnicianDamage').value;

        // Get parts
        const parts = [];
        for (let i = 1; i <= 4; i++) {
            const partValue = document.getElementById(`partOrderPart${i}`).value.trim();
            if (partValue) {
                parts.push({ name: partValue });
            }
        }

        // Validate common fields
        if (!model) {
            alert('Lütfen cihaz modelini seçin!');
            return;
        }
        /*
                if (parts.length === 0) {
                    alert('Lütfen en az bir parça girin!');
                    return;
                }
        */
        // Get barcodes based on type
        let barcodes = [];
        if (currentPartOrderType === 'single') {
            const barcode = document.getElementById('partOrderBarcode').value.trim();
            if (!barcode) {
                alert('Lütfen barkod girin!');
                return;
            }
            if (!validateIMEI(barcode)) {
                alert('Barkod 15 haneli olmalıdır!');
                return;
            }
            barcodes = [barcode];
        } else {
            const multipleText = document.getElementById('partOrderBarcodeMultiple').value;
            barcodes = parseMultipleBarcodes(multipleText);

            if (barcodes.length === 0) {
                alert('Lütfen en az bir barkod girin!');
                return;
            }

            // Validate all barcodes
            const invalidBarcodes = barcodes.filter(b => !validateIMEI(b));
            if (invalidBarcodes.length > 0) {
                alert(`Geçersiz barkodlar bulundu (15 haneli olmalı):\n${invalidBarcodes.join('\n')}`);
                return;
            }
        }

        // Get current user info
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) {
            alert('Kullanıcı oturumu bulunamadı!');
            return;
        }

        const technician = currentUser.email.split('@')[0];
        const timestamp = Date.now();
        const timestampReadable = new Date(timestamp).toLocaleString('tr-TR');

        // Generate group ID for multiple orders
        const groupId = currentPartOrderType === 'multiple' ? `group_${timestamp}_${Math.random().toString(36).substr(2, 9)}` : null;

        // Create orders for each barcode
        const orderPromises = barcodes.map(async (barcode) => {
            const orderData = {
                barcode: barcode,
                model: model,
                customer: customer,
                statusField: statusField,
                service: service,
                note: note,
                parts: parts,
                technician: technician,
                technicianDamage: technicianDamage,
                status: 'pending',
                timestamp: timestamp,
                timestampReadable: timestampReadable,
                isMultiOrder: currentPartOrderType === 'multiple',
                groupId: groupId,
                multiOrderCount: barcodes.length
            };

            // Save to database
            const newOrderRef = db.ref('partOrders').push();
            await newOrderRef.set(orderData);

            return { orderId: newOrderRef.key, ...orderData };
        });

        // Wait for all orders to be created
        await Promise.all(orderPromises);

        // Show success message
        if (currentPartOrderType === 'single') {
            showToast(`✅ Parça siparişi başarıyla oluşturuldu!`, 'success');
        } else {
            showToast(`✅ ${barcodes.length} adet parça siparişi başarıyla oluşturuldu!`, 'success');
        }

        // Close modal
        closePartOrderModal();

        // Reload warehouse panel if user is warehouse
        if (currentUserRole === 'warehouse') {
            loadWarehouseOrders();
        }

    } catch (error) {
        console.error('Parça siparişi oluşturulurken hata:', error);
        alert('Parça siparişi oluşturulurken bir hata oluştu!');
    }
}



// ========================================
// ZAMAN AŞIMI UYARI SİSTEMİ (TIMEOUT SYSTEM)
// ========================================

// ========================================
// GELİŞMİŞ ZAMAN AŞIMI KONTROLÜ
// ========================================
// ========================================
// ZAMAN AŞIMI UYARI SİSTEMİ (TAM ENTEGRASYON)
// ========================================

// ========================================
// ZAMAN AŞIMI UYARI SİSTEMİ (V3 - GÜÇLENDİRİLMİŞ VERSİYON)
// ========================================

const TIMEOUT_DURATION = 3 * 24 * 60 * 60 * 1000; // 3 Gün
let timeoutDevices = [];

// Sistemi Başlatan Tetikleyiciler
window.addEventListener('load', () => {
    // Sayfa tamamen yüklendikten 5 saniye sonra başlat
    setTimeout(() => {
        console.log('🚀 Zaman aşımı sistemi başlatılıyor (v3)...');
        checkTimeouts();
    }, 5000);

    // Her 15 dakikada bir kontrol et
    setInterval(checkTimeouts, 15 * 60 * 1000);
});

async function checkTimeouts() {
    // Verilerin yüklendiğinden emin ol
    if (typeof dataLoaded !== 'undefined' && !dataLoaded) {
        console.log('⏳ Veriler bekleniyor...');
        setTimeout(checkTimeouts, 3000);
        return;
    }

    console.log('⏰ Zaman aşımı kontrolü çalışıyor...');
    timeoutDevices = []; // Listeyi sıfırla

    try {
        // Yoksayılanlar listesini çek
        const ignoredSnapshot = await db.ref('timeoutIgnored').once('value');
        const ignoredList = ignoredSnapshot.val() || {};

        // Kontrol edilecek listeleri belirle (Satış, Teslim ve Geçmiş hariç hepsi)
        const excludeLists = ['SonKullanıcı', 'teslimEdilenler', 'eslesenler', 'adet', 'history', 'serviceReturns'];
        const targetLists = Object.keys(userCodes).filter(listName => !excludeLists.includes(listName));

        // PhoneCheck ve Onarım listelerini manuel olarak da garantiye al
        if (!targetLists.includes('phonecheck') && userCodes['phonecheck']) targetLists.push('phonecheck');
        if (!targetLists.includes('onarim') && userCodes['onarim']) targetLists.push('onarim');

        for (const listName of targetLists) {
            // Liste boşsa geç
            if (!userCodes[listName] || userCodes[listName].size === 0) continue;

            const barcodes = Array.from(userCodes[listName]);

            for (const barcode of barcodes) {
                if (ignoredList[barcode]) continue; // Yoksayılan cihazı atla

                let entryTimeRaw = null;
                let entryUser = 'Bilinmiyor';

                // 1. YÖNTEM: History (Geçmiş) Analizi
                // Zaman aşımı hesaplaması için DOĞRU mantık:
                // - Cihazın ilk giriş tarihini bul
                // - ANCAK eğer cihaz "Teslim Edilenler" veya "Son Kullanıcı"ya girdiyse, ondan SONRAKİ ilk girişi al
                const historySnapshot = await db.ref(`servis/history/${barcode}`).once('value');
                const history = historySnapshot.val();

                if (history) {
                    // Tüm kayıtları zamana göre sırala (en eskiden en yeniye)
                    const entries = Object.values(history).sort((a, b) => a.timestampRaw - b.timestampRaw);

                    // "Teslim Edilenler" veya "Son Kullanıcı"ya en son ne zaman girdiğini bul
                    let lastResetIndex = -1;
                    for (let i = entries.length - 1; i >= 0; i--) {
                        const to = (entries[i].to || '').toLowerCase();
                        if (to === 'teslimedilenler' || to === 'sonkullanıcı') {
                            lastResetIndex = i;
                            break;
                        }
                    }

                    // lastResetIndex'ten SONRA gelen ilk kaydı bul (reset listelerine giriş hariç)
                    let firstEntryAfterReset = null;
                    for (let i = lastResetIndex + 1; i < entries.length; i++) {
                        const to = (entries[i].to || '').toLowerCase();
                        // "Teslim Edilenler" ve "Son Kullanıcı" hariç herhangi bir listeye giriş
                        if (to !== 'teslimedilenler' && to !== 'sonkullanıcı' && entries[i].timestampRaw) {
                            firstEntryAfterReset = entries[i];
                            break;
                        }
                    }

                    if (firstEntryAfterReset) {
                        entryTimeRaw = firstEntryAfterReset.timestampRaw;
                        entryUser = firstEntryAfterReset.user || 'Bilinmiyor';
                    }
                }

                // 2. YÖNTEM (YEDEK): History'de bulamazsa listedeki görünen tarihi kullan
                // convertToTimestamp fonksiyonu script.js içinde zaten mevcut, onu kullanıyoruz
                if (!entryTimeRaw && codeTimestamps[listName] && codeTimestamps[listName][barcode]) {
                    const tsVal = codeTimestamps[listName][barcode];
                    // Eğer veri zaten sayı tipindeyse (timestamp) direkt al, değilse çevir
                    entryTimeRaw = (typeof tsVal === 'number') ? tsVal : convertToTimestamp(tsVal);
                    entryUser = codeUsers[listName][barcode] || 'Bilinmiyor';
                }

                // Süre hesabı ve Ekleme
                if (entryTimeRaw) {
                    const waitingTime = Date.now() - entryTimeRaw;
                    const daysWaiting = Math.floor(waitingTime / (24 * 60 * 60 * 1000));

                    if (waitingTime > TIMEOUT_DURATION) {
                        // Debug için konsola yaz (Sadece PhoneCheck ve Onarım için)
                        if (listName === 'phonecheck' || listName === 'onarim') {
                            console.log(`⚠️ Tespit: ${listName} - ${barcode} (${daysWaiting} gün)`);
                        }

                        timeoutDevices.push({
                            barcode: barcode,
                            listName: listName,
                            days: daysWaiting,
                            lastActionDate: new Date(entryTimeRaw).toLocaleDateString('tr-TR'),
                            user: entryUser
                        });
                    }
                }
            }
        }

        updateTimeoutWarningUI();

        // Modal açıksa listeyi anlık güncelle
        const modal = document.getElementById('timeoutModal');
        if (modal && modal.classList.contains('active')) {
            renderTimeoutList();
        }

    } catch (error) {
        console.error('❌ Zaman aşımı kontrolü hatası:', error);
    }
}

// Arayüz (UI) Güncelleme Fonksiyonları
function updateTimeoutWarningUI() {
    // ⚠️ Bildirim kaldırıldı - Sadece arka planda çalışıyor
    // Kullanıcılar artık stat-card'lara tıklayarak detayları görebilir
    // const warningBox = document.getElementById('timeoutWarning');
    // const countSpan = document.getElementById('timeoutCount');
    // Bildirim gösterme kodu kaldırıldı

    // Dashboard'u da güncelle
    updateTimeoutDashboard();

    // Timeout cihaz detaylarını hesapla (click için)
    calculateTimeoutDevices();
}

// ========================================
// TIMEOUT DASHBOARD GÜNCELLEME
// ========================================
async function updateTimeoutDashboard() {
    // Sadece admin ve semi-admin için
    if (currentUserRole !== 'admin' && currentUserRole !== 'semi-admin') return;

    // Kategorilere ayır
    const green = timeoutDevices.filter(d => d.days >= 3 && d.days < 7).length;
    const yellow = timeoutDevices.filter(d => d.days >= 7 && d.days < 14).length;
    const red = timeoutDevices.filter(d => d.days >= 14).length;

    // DOM elementlerini kontrol et ve güncelle
    const greenElement = document.getElementById('timeoutDashboardGreen');
    const yellowElement = document.getElementById('timeoutDashboardYellow');
    const redElement = document.getElementById('timeoutDashboardRed');

    if (greenElement) greenElement.textContent = green;
    if (yellowElement) yellowElement.textContent = yellow;
    if (redElement) redElement.textContent = red;

    // Database'e kaydet
    try {
        await db.ref('timeoutDashboardData').set({
            green: green,
            yellow: yellow,
            red: red,
            lastUpdated: Date.now(),
            timestamp: new Date().toLocaleString('tr-TR')
        });
        console.log(`📊 Timeout Dashboard güncellendi ve kaydedildi: Yeşil=${green}, Sarı=${yellow}, Kırmızı=${red}`);
    } catch (error) {
        console.error('❌ Timeout Dashboard kaydedilemedi:', error);
    }
}

// ========================================
// TIMEOUT DASHBOARD YÜKLEME (Sayfa açılışında)
// ========================================
async function loadTimeoutDashboard() {
    // Tüm kullanıcılar için (depocu hariç)
    if (currentUserRole === 'warehouse') return;

    try {
        // Dashboard sayılarını yükle
        const snapshot = await db.ref('timeoutDashboardData').once('value');
        const data = snapshot.val();

        if (data) {
            // Son kaydedilen verileri göster
            const greenElement = document.getElementById('timeoutDashboardGreen');
            const yellowElement = document.getElementById('timeoutDashboardYellow');
            const redElement = document.getElementById('timeoutDashboardRed');

            if (greenElement) greenElement.textContent = data.green || 0;
            if (yellowElement) yellowElement.textContent = data.yellow || 0;
            if (redElement) redElement.textContent = data.red || 0;

            console.log(`📊 Timeout Dashboard yüklendi (${data.timestamp}): Yeşil=${data.green}, Sarı=${data.yellow}, Kırmızı=${data.red}`);
        } else {
            console.log('📊 Timeout Dashboard verisi bulunamadı, varsayılan değerler gösteriliyor');
        }

        // Önceki tarama verilerini yükle (cihaz detayları)
        const detailsSnapshot = await db.ref('timeoutDeviceDetails').once('value');
        const detailsData = detailsSnapshot.val();

        if (detailsData) {
            // ÖNEMLİ: Eski kategorileme ile kaydedilmiş olabilir, yeni aralıklara göre yeniden kategorile
            // Tüm cihazları birleştir
            const allDevices = [
                ...(detailsData.green || []),
                ...(detailsData.yellow || []),
                ...(detailsData.red || [])
            ];

            // Yeni aralıklara göre yeniden kategorile
            cachedTimeoutDevices = {
                green: [],
                yellow: [],
                red: []
            };

            allDevices.forEach(device => {
                if (device.days >= 3 && device.days < 7) {
                    cachedTimeoutDevices.green.push(device);
                } else if (device.days >= 7 && device.days < 14) {
                    cachedTimeoutDevices.yellow.push(device);
                } else if (device.days >= 14) {
                    cachedTimeoutDevices.red.push(device);
                }
            });

            // Her kategoriyi gün sayısına göre sırala
            cachedTimeoutDevices.green.sort((a, b) => b.days - a.days);
            cachedTimeoutDevices.yellow.sort((a, b) => b.days - a.days);
            cachedTimeoutDevices.red.sort((a, b) => b.days - a.days);

            console.log(`📊 Timeout cihaz detayları yüklendi ve YENİ aralıklara göre kategorilendi: Yeşil=${cachedTimeoutDevices.green.length}, Sarı=${cachedTimeoutDevices.yellow.length}, Kırmızı=${cachedTimeoutDevices.red.length}`);
        } else {
            console.log('📊 Timeout cihaz detayları bulunamadı, boş başlatıldı');
        }
    } catch (error) {
        console.error('❌ Timeout Dashboard yüklenemedi:', error);
    }
}

// ========================================
// TIMEOUT DASHBOARD CLICK FUNCTIONALITY
// ========================================

// Global değişken: timeout cihaz detaylarını sakla
let cachedTimeoutDevices = {
    green: [],
    yellow: [],
    red: []
};

// Timeout cihazlarını hesapla ve kategorilere ayır
async function calculateTimeoutDevices() {
    // Tüm kullanıcılar için (depocu hariç)
    if (currentUserRole === 'warehouse') return;

    cachedTimeoutDevices = {
        green: [],
        yellow: [],
        red: []
    };

    try {
        // timeoutDevices array'inden kategorilere ayır
        if (timeoutDevices && timeoutDevices.length > 0) {
            timeoutDevices.forEach(device => {
                // Kategorilere ayır
                if (device.days >= 3 && device.days < 7) {
                    cachedTimeoutDevices.green.push(device);
                } else if (device.days >= 7 && device.days < 14) {
                    cachedTimeoutDevices.yellow.push(device);
                } else if (device.days >= 14) {
                    cachedTimeoutDevices.red.push(device);
                }
            });

            // Her kategoriyi gün sayısına göre sırala (en çok bekleyenden en aza)
            cachedTimeoutDevices.green.sort((a, b) => b.days - a.days);
            cachedTimeoutDevices.yellow.sort((a, b) => b.days - a.days);
            cachedTimeoutDevices.red.sort((a, b) => b.days - a.days);
        }

        // Database'e kaydet (önceki tarama verilerini sakla)
        await db.ref('timeoutDeviceDetails').set({
            green: cachedTimeoutDevices.green,
            yellow: cachedTimeoutDevices.yellow,
            red: cachedTimeoutDevices.red,
            lastUpdated: Date.now(),
            timestamp: new Date().toLocaleString('tr-TR')
        });

        console.log(`📊 Timeout cihazları hesaplandı ve kaydedildi: Yeşil=${cachedTimeoutDevices.green.length}, Sarı=${cachedTimeoutDevices.yellow.length}, Kırmızı=${cachedTimeoutDevices.red.length}`);
    } catch (error) {
        console.error('❌ Timeout cihazları hesaplanamadı:', error);
    }
}

// Timeout cihaz detaylarını göster
function showTimeoutDeviceDetails(category) {
    // Tüm kullanıcılar için (depocu hariç)
    if (currentUserRole === 'warehouse') return;

    const devices = cachedTimeoutDevices[category] || [];

    if (devices.length === 0) {
        showToast(`Bu kategoride bekleyen cihaz bulunmuyor.`, 'info');
        return;
    }

    renderTimeoutDeviceModal(devices, category);
}

// Timeout cihaz modalını render et
function renderTimeoutDeviceModal(devices, category) {
    // Kategori bilgileri
    const categoryInfo = {
        green: {
            title: '🟢 3-7 Gün Bekleyen Cihazlar',
            subtitle: 'Normal Süre',
            color: '#27ae60'
        },
        yellow: {
            title: '🟡 7-14 Gün Bekleyen Cihazlar',
            subtitle: 'Dikkat Gerekli',
            color: '#f39c12'
        },
        red: {
            title: '🔴 14+ Gün Bekleyen Cihazlar',
            subtitle: 'Acil Müdahale',
            color: '#e74c3c'
        }
    };

    const info = categoryInfo[category];

    // Liste adlarını Türkçe'ye çevir
    const listNames = {
        atanacak: '📋 Atanacak',
        parcaBekliyor: '⚙️ Parça Bekliyor',
        phonecheck: '📱 PhoneCheck',
        gokhan: '🧑‍🔧 Gökhan',
        enes: '🧑‍🔧 Enes',
        yusuf: '🧑‍🔧 Yusuf',
        samet: '🧑‍🔧 Samet',
        engin: '🧑‍🔧 Engin',
        ismail: '🧑‍🔧 İsmail',
        mehmet: '🧑‍🔧 Mehmet',
        onarim: '🔧 Onarım Tamamlandı',
        onCamDisServis: '🔨 Ön Cam Dış Servis',
        anakartDisServis: '🔨 Anakart Dış Servis',
        satisa: '💰 Satışa Gidecek',
        sahiniden: '🏪 Sahibinden',
        mediaMarkt: '🛒 Media Markt',
        SonKullanıcı: '👤 Son Kullanıcı'
    };

    // Modal HTML'i oluştur
    let devicesHTML = '';
    devices.forEach((device, index) => {
        const listDisplayName = listNames[device.listName] || device.listName;
        devicesHTML += `
            <tr style="border-left: 4px solid ${info.color};">
                <td style="padding: 12px; text-align: center; font-weight: 600;">${index + 1}</td>
                <td style="padding: 12px; font-family: monospace; font-weight: 600;">${device.barcode}</td>
                <td style="padding: 12px;">${listDisplayName}</td>
                <td style="padding: 12px; text-align: center; font-weight: 600; color: ${info.color};">${device.days} gün</td>
                <td style="padding: 12px; text-align: center;">${device.lastActionDate}</td>
                <td style="padding: 12px;">👤 ${device.user}</td>
            </tr>
        `;
    });

    const modalHTML = `
        <div class="timeout-device-modal-overlay" id="timeoutDeviceModalOverlay" onclick="closeTimeoutDeviceModal()">
            <div class="timeout-device-modal" onclick="event.stopPropagation()" style="border-top: 4px solid ${info.color};">
                <div class="timeout-device-modal-header" style="border-bottom: 2px solid ${info.color};">
                    <div>
                        <h2 style="margin: 0; color: ${info.color};">${info.title}</h2>
                        <p style="margin: 5px 0 0 0; opacity: 0.8; font-size: 14px;">${info.subtitle} • Toplam ${devices.length} cihaz</p>
                    </div>
                    <button class="timeout-device-modal-close" onclick="closeTimeoutDeviceModal()">✕</button>
                </div>
                <div class="timeout-device-modal-body">
                    <table class="timeout-device-table">
                        <thead>
                            <tr>
                                <th style="padding: 12px; text-align: center; width: 50px;">#</th>
                                <th style="padding: 12px; text-align: left;">Barkod</th>
                                <th style="padding: 12px; text-align: left;">Bulunduğu Liste</th>
                                <th style="padding: 12px; text-align: center; width: 100px;">Bekleyen Gün</th>
                                <th style="padding: 12px; text-align: center; width: 120px;">Son İşlem</th>
                                <th style="padding: 12px; text-align: left;">Transfer Eden Kullanıcı</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${devicesHTML}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Modal'ı body'ye ekle
    const existingModal = document.getElementById('timeoutDeviceModalOverlay');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Modal'ı göster
    setTimeout(() => {
        const modal = document.getElementById('timeoutDeviceModalOverlay');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('active');
        }
    }, 10);
}

// Timeout cihaz modalını kapat
function closeTimeoutDeviceModal() {
    const modal = document.getElementById('timeoutDeviceModalOverlay');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Timeout dashboard stat-card'larına click event listener'ları ekle
function initTimeoutDashboardClickHandlers() {
    // Tüm kullanıcılar için (depocu hariç)
    if (currentUserRole === 'warehouse') return;

    const greenCard = document.querySelector('.timeout-stat-card.green');
    const yellowCard = document.querySelector('.timeout-stat-card.yellow');
    const redCard = document.querySelector('.timeout-stat-card.red');

    if (greenCard) {
        greenCard.style.cursor = 'pointer';
        greenCard.onclick = () => showTimeoutDeviceDetails('green');
    }

    if (yellowCard) {
        yellowCard.style.cursor = 'pointer';
        yellowCard.onclick = () => showTimeoutDeviceDetails('yellow');
    }

    if (redCard) {
        redCard.style.cursor = 'pointer';
        redCard.onclick = () => showTimeoutDeviceDetails('red');
    }

    console.log('✅ Timeout Dashboard click handler\'ları başlatıldı');
}


function openTimeoutModal() {
    const modal = document.getElementById('timeoutModal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        renderTimeoutList();
    }
}

function closeTimeoutModal() {
    const modal = document.getElementById('timeoutModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function renderTimeoutList() {
    const tbody = document.getElementById('timeoutListBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const listNamesTR = {
        atanacak: '📋 Atanacak',
        phonecheck: '📱 PhoneCheck',
        onarim: '🔧 Onarım',
        mediaMarkt: '🛒 Media Markt',
        gokhan: '🧑‍🔧 Gökhan', enes: '🧑‍🔧 Enes', yusuf: '🧑‍🔧 Yusuf',
        samet: '🧑‍🔧 Samet', engin: '🧑‍🔧 Engin', ismail: '🧑‍🔧 İsmail', mehmet: '🧑‍🔧 Mehmet',
        onCamDisServis: '🔨 Ön Cam', anakartDisServis: '🔨 Anakart'
    };

    // Gün sayısına göre sırala (En çok bekleyen en üstte)
    timeoutDevices.sort((a, b) => b.days - a.days);

    timeoutDevices.forEach(device => {
        const tr = document.createElement('tr');
        // Liste ismini güzelleştir
        const displayName = listNamesTR[device.listName] || device.listName.charAt(0).toUpperCase() + device.listName.slice(1);

        tr.innerHTML = `
            <td><input type="checkbox" class="timeout-checkbox" value="${device.barcode}" data-list="${device.listName}"></td>
            <td style="font-family: monospace; font-weight: bold; color: #3498db;">${device.barcode}</td>
            <td>${displayName}</td>
            <td><span class="timeout-days-badge">${device.days} Gün</span></td>
            <td>${device.lastActionDate}</td>
            <td>👤 ${device.user}</td>
        `;
        tbody.appendChild(tr);
    });
}

function toggleAllTimeout(source) {
    const checkboxes = document.querySelectorAll('.timeout-checkbox');
    checkboxes.forEach(cb => cb.checked = source.checked);
}

// Seçilenleri Yoksay
async function ignoreSelectedTimeouts() {
    const selected = document.querySelectorAll('.timeout-checkbox:checked');
    if (selected.length === 0) {
        showToast('Lütfen en az bir cihaz seçin!', 'warning');
        return;
    }

    if (!confirm(`${selected.length} cihaz için zaman aşımı uyarısı kapatılacak. Onaylıyor musunuz?`)) return;

    try {
        const updates = {};
        selected.forEach(cb => {
            const barcode = cb.value;
            updates[`timeoutIgnored/${barcode}`] = {
                ignoredAt: Date.now(),
                user: currentUserName
            };
        });

        await db.ref().update(updates);
        showToast('Seçilen cihazlar yoksayıldı.', 'success');
        checkTimeouts(); // Listeyi yenile

    } catch (error) {
        console.error('İşlem hatası:', error);
        showToast('Hata oluştu.', 'error');
    }
}

// Seçilenleri Transfer Et
async function transferSelectedToDelivered() {
    const selected = document.querySelectorAll('.timeout-checkbox:checked');
    if (selected.length === 0) {
        showToast('Lütfen en az bir cihaz seçin!', 'warning');
        return;
    }

    if (!confirm(`${selected.length} cihaz "Teslim Edilenler" listesine transfer edilecek. Onaylıyor musunuz?`)) return;

    try {
        let successCount = 0;
        for (const cb of selected) {
            const barcode = cb.value;
            const currentList = cb.dataset.list;

            // 1. Mevcut listeden sil
            const dbPathFrom = currentList === 'onarim' ? 'onarimTamamlandi' : currentList;
            await db.ref(`servis/${dbPathFrom}/${barcode}`).remove();

            // Local setlerden temizle
            if (userCodes[currentList]) userCodes[currentList].delete(barcode);

            // 2. Teslim Edilenlere ekle
            const timestamp = getTimestamp();
            await db.ref(`servis/teslimEdilenler/${barcode}`).set({
                ts: timestamp,
                user: currentUserName
            });

            // 3. Geçmişe kaydet
            if (typeof saveBarcodeHistory === 'function') {
                saveBarcodeHistory(barcode, currentList, 'teslimEdilenler', `${currentUserName} (Zaman Aşımı Transfer)`);
            }

            // 4. Teslim sayacını artır
            if (typeof incrementDeliveredCount === 'function') incrementDeliveredCount();

            successCount++;
        }

        showToast(`${successCount} cihaz transfer edildi.`, 'success');

        // UI Güncellemeleri
        checkTimeouts();
        if (typeof renderList === 'function') renderList();
        if (typeof updateLabelAndCount === 'function') {
            const listsToUpdate = new Set(Array.from(selected).map(cb => cb.dataset.list));
            listsToUpdate.forEach(l => updateLabelAndCount(l));
        }

    } catch (error) {
        console.error('Transfer hatası:', error);
        showToast('Transfer sırasında hata oluştu.', 'error');
    }
}
