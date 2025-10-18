# ⚡ ngrok Hızlı Başlangıç

## 🎯 3 Adımda Başla

### 1️⃣ ngrok'u Yükle

```bash
brew install ngrok/ngrok/ngrok
```

### 2️⃣ Auth Token Ayarla

1. https://dashboard.ngrok.com/signup - Kayıt ol (ücretsiz)
2. https://dashboard.ngrok.com/get-started/your-authtoken - Token'ı kopyala
3. Token'ı ayarla:

```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```

### 3️⃣ Başlat!

```bash
npm run start:ngrok
```

---

## 📋 Çıktı Örneği

```
╔══════════════════════════════════════════════════════════════╗
║              ✅ Başarıyla Başlatıldı!                        ║
╚══════════════════════════════════════════════════════════════╝

📊 Local Server:  http://localhost:3000
🌐 Public URL:    https://abc123.ngrok-free.app
🔍 ngrok Web UI: http://localhost:4040

📋 Test Endpoint'leri:
   curl https://abc123.ngrok-free.app/health
   curl https://abc123.ngrok-free.app/exchange-rates
```

---

## 🎯 ChatGPT'de Kullan

1. **Public URL'i kopyala** (örn: `https://abc123.ngrok-free.app`)
2. **ChatGPT** → **Settings** → **Apps** → **Add App**
3. **URL'i yapıştır** ve **Save**
4. **Test et:** "EnPara'dan USD kuru nedir?"

---

## 🛑 Durdur

```bash
npm run stop:ngrok
```

veya `Ctrl+C`

---

## 🔍 Web UI

Tarayıcıda aç: http://localhost:4040

Burada görebilirsin:
- ChatGPT'nin yaptığı istekler
- Request/response detayları
- Timing bilgileri

---

## 💡 İpuçları

### Ücretsiz Plan Limitleri
- ✅ 1 online tunnel
- ✅ 40 bağlantı/dakika
- ✅ HTTPS otomatik
- ⚠️ URL her seferinde değişir

### Pro Plan ($8/ay)
- ✅ 3 online tunnel
- ✅ Custom subdomain (sabit URL)
- ✅ Daha fazla bağlantı

### Development Workflow

```bash
# 1. Local'de geliştir ve test et
npm start
curl http://localhost:3000/health

# 2. ngrok ile aç
npm run start:ngrok

# 3. ChatGPT'de test et

# 4. Bitince kapat
npm run stop:ngrok
```

---

## 🐛 Sorunlar?

### ngrok Bulunamadı
```bash
brew install ngrok/ngrok/ngrok
```

### Auth Token Hatası
```bash
ngrok config add-authtoken YOUR_TOKEN
```

### Port Zaten Kullanımda
```bash
npm run stop:ngrok
```

---

## 📚 Daha Fazla Bilgi

- **Detaylı Rehber:** [NGROK_SETUP.md](./NGROK_SETUP.md)
- **ngrok Docs:** https://ngrok.com/docs
- **Dashboard:** https://dashboard.ngrok.com

---

**🚀 Hadi başlayalım!**

```bash
brew install ngrok/ngrok/ngrok
ngrok config add-authtoken YOUR_TOKEN
npm run start:ngrok
```

