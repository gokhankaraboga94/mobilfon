const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS ayarları
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        status: 'Server is running', 
        endpoints: ['/api/mobilfon/search/:barcode'] 
    });
});

// Mobilfon veri çekme endpoint'i
app.get('/api/mobilfon/search/:barcode', async (req, res) => {
    const barcode = req.params.barcode;
    
    // Barkod validasyonu
    if (!barcode || barcode.length !== 15 || !/^\d+$/.test(barcode)) {
        return res.status(400).json({ 
            error: 'Geçersiz barkod formatı',
            message: 'Barkod 15 haneli sayısal değer olmalıdır' 
        });
    }

    let browser = null;
    let page = null;
    
    try {
        console.log(`🔍 Barkod aranıyor: ${barcode}`);
        
        // Puppeteer browser başlat (DEBUG MODE)
        browser = await puppeteer.launch({
            headless: false, // Tarayıcıyı görmek için false
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--start-maximized'
            ],
            ignoreHTTPSErrors: true,
            defaultViewport: null
        });

        page = await browser.newPage();
        
        // User agent ayarla
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log('📄 Login sayfasına gidiliyor...');
        
        // Login sayfasına git
        await page.goto('https://bayi.mobilfon.com/mobilfon_framework/admin/qc_list', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Login formunu bekle
        await page.waitForTimeout(2000);

        console.log('🔐 Login bilgileri giriliyor...');
        
        // Farklı selector kombinasyonları dene
        const emailSelectors = [
            'input[type="email"]',
            'input[name="email"]',
            'input#email',
            'input[placeholder*="email" i]',
            'input[placeholder*="e-posta" i]'
        ];
        
        const passwordSelectors = [
            'input[type="password"]',
            'input[name="password"]',
            'input#password',
            'input[placeholder*="password" i]',
            'input[placeholder*="şifre" i]'
        ];

        // Email input'u bul ve doldur
        let emailFilled = false;
        for (const selector of emailSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 3000 });
                await page.type(selector, 'gokhan.karaboga@mobilfon.com', { delay: 50 });
                emailFilled = true;
                console.log(`✅ Email girildi (selector: ${selector})`);
                break;
            } catch (e) {
                continue;
            }
        }

        if (!emailFilled) {
            throw new Error('Email input bulunamadı');
        }

        // Password input'u bul ve doldur
        let passwordFilled = false;
        for (const selector of passwordSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 3000 });
                await page.type(selector, 'Gkhn@2025!', { delay: 50 });
                passwordFilled = true;
                console.log(`✅ Şifre girildi (selector: ${selector})`);
                break;
            } catch (e) {
                continue;
            }
        }

        if (!passwordFilled) {
            throw new Error('Password input bulunamadı');
        }

        // Login butonunu bul
        const loginButtonSelectors = [
            'button[type="submit"]',
            'input[type="submit"]',
            'button.btn-primary',
            'button:contains("Giriş")',
            'input[value*="Giriş" i]'
        ];

        let loginClicked = false;
        for (const selector of loginButtonSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 2000 });
                await page.click(selector);
                loginClicked = true;
                console.log(`✅ Login butonuna tıklandı (selector: ${selector})`);
                break;
            } catch (e) {
                continue;
            }
        }

        if (!loginClicked) {
            // Enter'a bas
            await page.keyboard.press('Enter');
            console.log('✅ Enter tuşuna basıldı');
        }

        console.log('⏳ Login sonrası sayfa yükleniyor...');
        
        // Login sonrası bekle
        await page.waitForTimeout(3000);

        // QC list sayfasına git
        const currentUrl = page.url();
        console.log(`📍 Mevcut URL: ${currentUrl}`);
        
        if (!currentUrl.includes('qc_list')) {
            console.log('🔄 QC list sayfasına yönlendiriliyor...');
            await page.goto('https://bayi.mobilfon.com/mobilfon_framework/admin/qc_list', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });
        }

        await page.waitForTimeout(2000);

        console.log('🔍 Barkod arama yapılıyor...');
        
        // Arama input'ları
        const searchSelectors = [
            'input.form-control.form-control-sm',
            'input[type="search"]',
            'input[placeholder*="Ara" i]',
            'input.search',
            '#search'
        ];

        let searchFilled = false;
        for (const selector of searchSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 3000 });
                await page.type(selector, barcode, { delay: 100 });
                searchFilled = true;
                console.log(`✅ Barkod girildi (selector: ${selector})`);
                break;
            } catch (e) {
                continue;
            }
        }

        if (!searchFilled) {
            throw new Error('Arama input bulunamadı');
        }

        // Enter'a bas
        await page.keyboard.press('Enter');
        
        console.log('⏳ Arama sonuçları yükleniyor...');
        console.log('⏰ 30 saniye bekleniyor (sonuçların tam yüklenmesi için)...');
        await page.waitForTimeout(30000); // 30 saniye bekle

        // Screenshot al (debug için)
        await page.screenshot({ path: 'debug-after-search.png', fullPage: true });
        console.log('📸 Screenshot alındı: debug-after-search.png');

        // Sayfadaki tüm linkleri kontrol et
        const pageContent = await page.content();
        console.log('📄 Sayfa içeriği kontrol ediliyor...');

        // Farklı buton selector'ları dene
        const buttonSelectors = [
            'a.btn.btn-primary',
            'button.btn.btn-primary',
            'a:contains("Kalite")',
            'a:contains("QC")',
            'a:contains("Detay")',
            'a[href*="qc"]',
            'a.btn',
            'button.btn'
        ];

        let buttonFound = false;
        let buttonElement = null;

        for (const selector of buttonSelectors) {
            try {
                // Selector'ı bekle - SÜRE ARTTIRILDI
                await page.waitForSelector(selector, { timeout: 10000, visible: true });
                
                // Tüm elementleri al
                const elements = await page.$$(selector);
                
                if (elements.length > 0) {
                    console.log(`✅ ${elements.length} adet '${selector}' bulundu`);
                    
                    // "Kalite Kontrol Yap" text'i içeren elementi bul
                    for (const el of elements) {
                        const buttonText = await page.evaluate(element => element.textContent, el);
                        console.log(`📝 Buton metni: "${buttonText.trim()}"`);
                        
                        if (buttonText.toLowerCase().includes('kalite') || 
                            buttonText.toLowerCase().includes('kontrol') ||
                            buttonText.toLowerCase().includes('qc')) {
                            buttonElement = el;
                            buttonFound = true;
                            console.log(`✅ Doğru buton bulundu: "${buttonText.trim()}"`);
                            break;
                        }
                    }
                    
                    if (buttonFound) break;
                }
            } catch (e) {
                console.log(`⚠️ '${selector}' bulunamadı, devam ediliyor...`);
                continue;
            }
        }

        if (!buttonFound) {
            // Tablo veya liste var mı kontrol et
            const hasResults = await page.evaluate(() => {
                const tables = document.querySelectorAll('table');
                const rows = document.querySelectorAll('tr');
                return tables.length > 0 || rows.length > 5;
            });

            if (hasResults) {
                console.log('⚠️ Sonuç bulundu ama buton yok - Alternatif yöntem deneniyor');
                
                // Direkt parça bilgilerini çekmeyi dene
                const partsData = await page.evaluate(() => {
                    const results = { parts: [], found: false };
                    
                    // "Kullanılan Parçalar" text'ini ara
                    const allText = document.body.innerText;
                    if (allText.includes('parça') || allText.includes('Parça')) {
                        results.found = true;
                        
                        // Tüm table row'ları kontrol et
                        const rows = Array.from(document.querySelectorAll('tr, li'));
                        rows.forEach(row => {
                            const text = row.textContent.trim();
                            if (text && text.length > 0 && text.length < 100) {
                                results.parts.push(text);
                            }
                        });
                    }
                    
                    return results;
                });

                if (partsData.found && partsData.parts.length > 0) {
                    await browser.close();
                    return res.json({
                        success: true,
                        barcode: barcode,
                        mobilfonData: {
                            parts: partsData.parts.slice(0, 10), // İlk 10 sonuç
                            partsCount: partsData.parts.length,
                            fetchedAt: new Date().toLocaleString('tr-TR'),
                            method: 'Alternative scraping'
                        }
                    });
                }
            }

            throw new Error('Kalite kontrol butonu bulunamadı - Barkod sistemde olmayabilir veya sayfa yapısı değişmiş');
        }

        console.log('🖱️ Kalite kontrol butonuna tıklanıyor...');
        
        // Butonu scroll ile görünür hale getir
        await page.evaluate((element) => {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, buttonElement);
        
        await page.waitForTimeout(2000);
        
        // Butonun href'ini al (link ise)
        const buttonHref = await page.evaluate(el => el.href, buttonElement);
        console.log('🔗 Buton href:', buttonHref);
        
        // Eğer href varsa direkt o sayfaya git
        if (buttonHref) {
            console.log('🔄 Direkt link kullanılarak sayfaya gidiliyor...');
            await page.goto(buttonHref, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });
        } else {
            // Href yoksa butona tıkla
            console.log('🖱️ Butona tıklanıyor...');
            
            // Yeni pencere açılırsa yakalayalım
            const [newTarget] = await Promise.all([
                new Promise(resolve => {
                    browser.once('targetcreated', target => resolve(target));
                    setTimeout(() => resolve(null), 5000); // 5 saniye timeout
                }),
                buttonElement.click().catch(err => {
                    console.log('⚠️ Click hatası:', err.message);
                })
            ]);
            
            if (newTarget) {
                console.log('📄 Yeni pencere açıldı');
                const newPage = await newTarget.page();
                await newPage.waitForTimeout(3000);
                // Yeni sayfayı kullan
                await page.close();
                page = newPage;
            }
        }
        
        // Ekstra bekle
        await page.waitForTimeout(5000);
        
        console.log('📊 Parça bilgileri çekiliyor...');
        
        // İkinci screenshot (parça sayfası)
        await page.screenshot({ path: 'debug-parts-page.png', fullPage: true });
        console.log('📸 Parça sayfası screenshot alındı: debug-parts-page.png');
        
        // Parça bilgilerini çek
        const partsData = await page.evaluate(() => {
            const results = {
                parts: [],
                technician: '',
                date: '',
                status: ''
            };
            
            // "Parçalar" başlığını ara
            const headers = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, strong, b'));
            const partsHeader = headers.find(h => 
                h.textContent.toLowerCase().includes('parça') ||
                h.textContent.toLowerCase().includes('kullanılan')
            );
            
            if (partsHeader) {
                let container = partsHeader.nextElementSibling;
                
                // Container'ı bul
                while (container && !['UL', 'TABLE', 'DIV'].includes(container.tagName)) {
                    container = container.nextElementSibling;
                }
                
                if (container) {
                    // List items veya table rows
                    const items = container.querySelectorAll('li, tr, .part-item, .row');
                    
                    items.forEach(item => {
                        const text = item.textContent.trim();
                        if (text && text.length > 0 && text.length < 200) {
                            results.parts.push(text);
                        }
                    });
                    
                    // Eğer bulunamadıysa, tüm text içeriğini al
                    if (results.parts.length === 0) {
                        const text = container.textContent.trim();
                        const lines = text.split('\n')
                            .map(l => l.trim())
                            .filter(l => l.length > 0 && l.length < 200);
                        results.parts = lines;
                    }
                }
            }
            
            // Teknisyen bilgisi
            const allText = document.body.innerText;
            const techMatch = allText.match(/teknisyen[:\s]+([^\n]+)/i);
            if (techMatch) {
                results.technician = techMatch[1].trim();
            }
            
            return results;
        });

        await browser.close();
        browser = null;

        console.log('✅ Veri başarıyla çekildi');
        console.log('📦 Parça sayısı:', partsData.parts.length);

        // Sonuçları döndür
        res.json({
            success: true,
            barcode: barcode,
            mobilfonData: {
                parts: partsData.parts,
                technician: partsData.technician,
                partsCount: partsData.parts.length,
                fetchedAt: new Date().toLocaleString('tr-TR')
            }
        });

    } catch (error) {
        console.error('❌ Hata oluştu:', error.message);
        
        if (browser) {
            await browser.close().catch(() => {});
        }
        
        res.status(500).json({
            success: false,
            error: 'Veri çekilirken hata oluştu',
            message: error.message,
            barcode: barcode,
            hint: 'Barkod Mobilfon sisteminde olmayabilir veya sayfa yapısı değişmiş olabilir'
        });
    }
});

// Hata yakalama middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: err.message 
    });
});

// Server'ı başlat
app.listen(PORT, () => {
    console.log(`🚀 Mobilfon Scraper API çalışıyor: http://localhost:${PORT}`);
    console.log(`📡 Endpoint: http://localhost:${PORT}/api/mobilfon/search/:barcode`);
    console.log(`💡 Örnek: http://localhost:${PORT}/api/mobilfon/search/123456789012345`);
    console.log(`🔍 DEBUG MODE: Tarayıcı görünür olacak`);
    console.log(`⏰ Bekleme süresi: 30 saniye`);
});
