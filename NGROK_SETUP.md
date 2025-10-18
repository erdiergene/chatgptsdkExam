# 🌐 ngrok Entegrasyonu - EnPara MCP Server

## 📖 İçindekiler
- [ngrok Nedir?](#ngrok-nedir)
- [Kurulum](#kurulum)
- [Hızlı Başlangıç](#hızlı-başlangıç)
- [Kullanım](#kullanım)
- [ChatGPT Entegrasyonu](#chatgpt-entegrasyonu)
- [Sorun Giderme](#sorun-giderme)

---

## 🎯 ngrok Nedir?

**ngrok**, local sunucunuzu internet üzerinden erişilebilir hale getiren bir tunnel servisidir.

### Kullanım Senaryoları:
- ✅ Local development'ı ChatGPT'de test etme
- ✅ Webhook'ları test etme
- ✅ Mobil cihazlardan erişim
- ✅ Demo gösterimi
- ✅ Geçici public URL

### Avantajları:
- 🚀 Anında HTTPS
- 🔒 Güvenli tunnel
- 🔍 Request inspection (Web UI)
- 📊 Traffic analytics
- 🌍 Global edge network

---

## 📦 Kurulum

### 1. ngrok'u Yükle

**macOS (Homebrew):**
```bash
brew install ngrok/ngrok/ngrok
```

**Linux:**
```bash
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
  sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && \
  echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | \
  sudo tee /etc/apt/sources.list.d/ngrok.list && \
  sudo apt update && sudo apt install ngrok
```

**Windows (Chocolatey):**
```powershell
choco install ngrok
```

**Manuel İndirme:**
https://ngrok.com/download

### 2. Auth Token Al

1. https://dashboard.ngrok.com/signup adresinden kayıt ol
2. https://dashboard.ngrok.com/get-started/your-authtoken adresinden token'ı kopyala
3. Token'ı yapılandır:

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### 3. Kurulumu Doğrula

```bash
ngrok version
# ngrok version 3.x.x
```

---

## ⚡ Hızlı Başlangıç

### Otomatik Başlatma (Önerilen)

```bash
./start-with-ngrok.sh
```

Bu script:
1. ✅ Port kontrolü yapar
2. ✅ Server'ı başlatır
3. ✅ ngrok tunnel'ı açar
4. ✅ Public URL'i gösterir
5. ✅ Log'ları takip eder

### Manuel Başlatma

**Terminal 1 - Server:**
```bash
npm start
```

**Terminal 2 - ngrok:**
```bash
ngrok http 3000
```

### Durdurma

```bash
./stop-ngrok.sh
```

veya `Ctrl+C` ile durdurun.

---

## 🚀 Kullanım

### Başlatma

```bash
./start-with-ngrok.sh
```

**Çıktı:**
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
   curl https://abc123.ngrok-free.app/campaigns
```

### Test Etme

```bash
# Health check
curl https://YOUR-NGROK-URL.ngrok-free.app/health

# Döviz kurları
curl https://YOUR-NGROK-URL.ngrok-free.app/exchange-rates

# Kampanyalar
curl https://YOUR-NGROK-URL.ngrok-free.app/campaigns
```

### ngrok Web UI

Tarayıcıda aç: http://localhost:4040

**Özellikler:**
- 📊 Real-time request inspection
- 🔍 Request/response details
- 🔄 Replay requests
- 📈 Traffic statistics

---

## 🎯 ChatGPT Entegrasyonu

### 1. ngrok URL'ini Al

```bash
./start-with-ngrok.sh
# Public URL'i kopyala: https://abc123.ngrok-free.app
```

### 2. ChatGPT'ye Ekle

1. **ChatGPT'i aç**
2. **Settings** → **Apps** → **Add App**
3. **URL gir:** `https://abc123.ngrok-free.app`
4. **Save**

### 3. Test Et

ChatGPT'de sor:
```
EnPara'dan güncel USD ve EUR kurlarını göster
```

### 4. Doğrulama

ngrok Web UI'da (http://localhost:4040) request'leri görebilirsin:
- ChatGPT'nin yaptığı istekler
- Request/response detayları
- Timing bilgileri

---

## 🔧 Gelişmiş Kullanım

### Custom Subdomain (ngrok Pro)

**ngrok-config.yml:**
```yaml
tunnels:
  enpara-mcp:
    proto: http
    addr: 3000
    subdomain: enpara-mcp
    bind_tls: true
```

**Başlatma:**
```bash
ngrok start enpara-mcp
```

**URL:** `https://enpara-mcp.ngrok-free.app`

### Custom Domain (ngrok Pro)

```yaml
tunnels:
  enpara-mcp:
    proto: http
    addr: 3000
    hostname: enpara.your-domain.com
    bind_tls: true
```

### Multiple Tunnels

```bash
# Terminal 1 - Development
ngrok http 3000

# Terminal 2 - Staging
ngrok http 3001
```

### Basic Auth

```bash
ngrok http 3000 --basic-auth="username:password"
```

### IP Whitelisting (ngrok Pro)

```yaml
tunnels:
  enpara-mcp:
    proto: http
    addr: 3000
    ip_restriction:
      allow_cidrs:
        - 1.2.3.4/32
        - 5.6.7.8/32
```

---

## 📊 Monitoring

### ngrok Dashboard

https://dashboard.ngrok.com/

**Özellikler:**
- 📈 Usage statistics
- 🔍 Active tunnels
- 📊 Request logs
- ⚙️ Configuration

### Local Web UI

http://localhost:4040

**Özellikler:**
- Real-time requests
- Request replay
- Response inspection
- Traffic filtering

### Log Dosyaları

```bash
# Server logs
tail -f logs/server.log

# ngrok logs
tail -f logs/ngrok.log

# Her ikisi birden
tail -f logs/server.log logs/ngrok.log
```

---

## 🐛 Sorun Giderme

### ngrok Bulunamadı

**Hata:**
```
command not found: ngrok
```

**Çözüm:**
```bash
# macOS
brew install ngrok/ngrok/ngrok

# Linux
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
  sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
```

### Auth Token Hatası

**Hata:**
```
ERROR:  authentication failed
```

**Çözüm:**
```bash
# Token'ı ekle
ngrok config add-authtoken YOUR_TOKEN

# Doğrula
ngrok config check
```

### Port Zaten Kullanımda

**Hata:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Çözüm:**
```bash
# Port'u temizle
lsof -ti:3000 | xargs kill -9

# Veya stop script'i kullan
./stop-ngrok.sh
```

### Tunnel Bağlanamıyor

**Hata:**
```
ERROR:  failed to reconnect session
```

**Çözüm:**
1. İnternet bağlantısını kontrol et
2. ngrok'u yeniden başlat:
   ```bash
   ./stop-ngrok.sh
   ./start-with-ngrok.sh
   ```

### ChatGPT Bağlanamıyor

**Kontrol Listesi:**
1. ✅ Server çalışıyor mu?
   ```bash
   curl http://localhost:3000/health
   ```

2. ✅ ngrok tunnel açık mı?
   ```bash
   curl http://localhost:4040/api/tunnels
   ```

3. ✅ Public URL erişilebilir mi?
   ```bash
   curl https://YOUR-URL.ngrok-free.app/health
   ```

4. ✅ CORS ayarları doğru mu?
   - `server.js`'de ChatGPT domain'leri allowed

---

## 💡 Best Practices

### 1. Güvenlik

```bash
# Basic auth ekle
ngrok http 3000 --basic-auth="user:pass"

# IP restriction (Pro)
# ngrok-config.yml'de tanımla
```

### 2. Monitoring

```bash
# Log'ları takip et
tail -f logs/server.log logs/ngrok.log

# ngrok Web UI'ı kullan
open http://localhost:4040
```

### 3. Development Workflow

```bash
# 1. Local'de geliştir
npm run dev

# 2. Test et
curl http://localhost:3000/health

# 3. ngrok ile aç
./start-with-ngrok.sh

# 4. ChatGPT'de test et

# 5. Bitince kapat
./stop-ngrok.sh
```

### 4. Production

⚠️ **ngrok production için önerilmez!**

Production için:
- ✅ Vercel
- ✅ Railway
- ✅ Heroku
- ✅ AWS/Azure/GCP

ngrok sadece:
- Development
- Testing
- Demo
- Geçici erişim

---

## 📚 Kaynaklar

### Dokümantasyon
- [ngrok Docs](https://ngrok.com/docs)
- [ngrok API](https://ngrok.com/docs/api)
- [ngrok Agent](https://ngrok.com/docs/agent)

### Fiyatlandırma
- **Free:** 1 online ngrok process, 40 connections/min
- **Personal ($8/mo):** 3 processes, custom domains
- **Pro ($20/mo):** 10 processes, IP whitelisting
- **Business:** Custom pricing

### Alternatifler
- [localtunnel](https://localtunnel.github.io/www/)
- [serveo](https://serveo.net/)
- [localhost.run](https://localhost.run/)
- [Cloudflare Tunnel](https://www.cloudflare.com/products/tunnel/)

---

## 🎯 Özet

### Hızlı Komutlar

```bash
# Başlat
./start-with-ngrok.sh

# Durdur
./stop-ngrok.sh

# Log'ları izle
tail -f logs/*.log

# Web UI
open http://localhost:4040
```

### URL'ler

- **Local:** http://localhost:3000
- **Public:** https://YOUR-ID.ngrok-free.app
- **Web UI:** http://localhost:4040
- **Dashboard:** https://dashboard.ngrok.com

### Dosyalar

- `start-with-ngrok.sh` - Başlatma script'i
- `stop-ngrok.sh` - Durdurma script'i
- `ngrok-config.yml` - ngrok yapılandırması
- `logs/server.log` - Server log'ları
- `logs/ngrok.log` - ngrok log'ları

---

**🎉 ngrok entegrasyonu hazır!**

Sorular için: https://ngrok.com/docs

