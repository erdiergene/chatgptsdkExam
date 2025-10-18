# ⚡ Quick Start Guide - EnPara ChatGPT MCP

## 🎯 5 Dakikada Başla

### 1. Paketleri Yükle
```bash
cd enBankChatGptMcp-main
npm install
```

### 2. Environment Ayarla
```bash
cp env.production .env
```

### 3. Çalıştır

**ChatGPT Apps SDK için (HTTP mode):**
```bash
npm start
```

**Cursor/Claude Desktop için (STDIO mode):**
```bash
npm run start:stdio
```

### 4. Test Et
```bash
# Health check
curl http://localhost:3000/health

# Döviz kurları
curl http://localhost:3000/exchange-rates

# Kampanyalar
curl http://localhost:3000/campaigns
```

---

## 🔧 Cursor/Claude Desktop Entegrasyonu

### Cursor Config

`~/.config/cursor/mcp.json`:
```json
{
  "mcpServers": {
    "enpara": {
      "command": "node",
      "args": ["mcp-server.js"],
      "cwd": "/Users/erdi/Desktop/enBankChatGptMcp-main"
    }
  }
}
```

### Claude Desktop Config

`~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "enpara-banking": {
      "command": "node",
      "args": ["mcp-server.js"],
      "cwd": "/Users/erdi/Desktop/enBankChatGptMcp-main"
    }
  }
}
```

### Test Cursor/Claude

Cursor veya Claude Desktop'ta şunu dene:
```
EnPara'dan USD ve EUR kurlarını göster
```

---

## 🌐 ChatGPT Apps SDK Entegrasyonu

### 1. Deploy Et

**Vercel:**
```bash
vercel --prod
```

**Railway:**
```bash
# GitHub'a push et, Railway otomatik deploy eder
git push origin main
```

### 2. ChatGPT'ye Ekle

1. ChatGPT Settings → Apps
2. Add App
3. URL: `https://your-app.vercel.app`
4. Kaydet

### 3. Test Et

ChatGPT'de:
```
EnPara'dan güncel döviz kurlarını göster
```

---

## 📊 Özellikler

### ✅ Tools (Araçlar)
- `get-exchange-rates` - Döviz kurları
- `get-banking-campaigns` - Kampanyalar

### ✅ Resources (Kaynaklar)
- `enpara://exchange-rates/latest` - JSON kurlar
- `enpara://exchange-rates/ui` - HTML widget
- `enpara://campaigns/latest` - JSON kampanyalar
- `enpara://campaigns/ui` - HTML widget

### ✅ Prompts (Hazır Sorgular)
- `check-exchange-rate` - Kur kontrol
- `compare-currencies` - Kur karşılaştır
- `find-campaigns` - Kampanya bul

---

## 🐛 Sorun Giderme

### "MCP write action is temporarily disabled" Hatası

✅ **Düzeltildi!** v1.1.0'da resources desteği eklendi.

Eğer hala alıyorsanız:
```bash
# Güncel versiyonu kontrol et
cat package.json | grep version

# Paketleri güncelle
npm install

# Yeniden başlat
npm start
```

### "Cannot find module" Hatası

```bash
# Tüm paketleri temiz yükle
rm -rf node_modules package-lock.json
npm install
```

### Port Çakışması

```bash
# Farklı port kullan
PORT=3001 npm start
```

---

## 📚 Daha Fazla Bilgi

- [UPGRADE_NOTES.md](./UPGRADE_NOTES.md) - Detaylı değişiklikler
- [README.md](./README.md) - Tam dokümantasyon
- [CHATGPT_APPS_INTEGRATION.md](./CHATGPT_APPS_INTEGRATION.md) - Entegrasyon rehberi

---

## 🎉 Başarılı Kurulum Kontrolü

Tüm endpoint'leri test et:

```bash
# Health check
curl http://localhost:3000/health
# Beklenen: {"status":"healthy",...}

# App config
curl http://localhost:3000/app.json
# Beklenen: {"name":"EnPara Banking Assistant",...}

# Exchange rates
curl http://localhost:3000/exchange-rates
# Beklenen: {"success":true,"rates":[...],...}

# Campaigns
curl http://localhost:3000/campaigns
# Beklenen: {"success":true,"campaigns":[...],...}
```

Hepsi çalışıyorsa: **🎊 Tebrikler! Kurulum başarılı!**

---

**İyi kullanımlar! 🚀**

