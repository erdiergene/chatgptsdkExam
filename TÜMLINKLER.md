# 🔗 Tüm Erişim Linkleri - EnPara Banking Assistant

## 📊 Sistem Durumu: ✅ Tüm Sistemler Çalışıyor!

---

## 🏠 Yerel (Localhost) URL'ler

### Ana Endpoint'ler:
```
✅ Root:              http://localhost:3000
✅ Health Check:      http://localhost:3000/health
✅ App Config:        http://localhost:3000/app.json
✅ MCP Endpoint:      http://localhost:3000/mcp
```

### API Endpoint'leri:
```
✅ Exchange Rates:    http://localhost:3000/exchange-rates
✅ Campaigns:         http://localhost:3000/campaigns
✅ Branches:          http://localhost:3000/branches
```

### Dashboard:
```
✅ Ngrok Dashboard:   http://localhost:4040
```

---

## 🌐 Ngrok Public URL'ler (Bypass ile Mobil Uyumlu)

**Base URL:**
```
https://verbally-shaven-evan.ngrok-free.dev
```

### Ana Endpoint'ler (Mobil İçin Query Parameter Ekli):
```
✅ Health Check:
https://verbally-shaven-evan.ngrok-free.dev/health?ngrok-skip-browser-warning=true

✅ MCP Endpoint:
https://verbally-shaven-evan.ngrok-free.dev/mcp?ngrok-skip-browser-warning=true

✅ App Config:
https://verbally-shaven-evan.ngrok-free.dev/app.json?ngrok-skip-browser-warning=true
```

### API Endpoint'leri (Mobil İçin):
```
✅ Exchange Rates:
https://verbally-shaven-evan.ngrok-free.dev/exchange-rates?ngrok-skip-browser-warning=true

✅ Campaigns:
https://verbally-shaven-evan.ngrok-free.dev/campaigns?ngrok-skip-browser-warning=true

✅ Branches:
https://verbally-shaven-evan.ngrok-free.dev/branches?ngrok-skip-browser-warning=true
```

---

## 📱 LocalTunnel Public URL'ler (Mobil Uyumlu - Warning Yok!)

**Base URL:**
```
https://enpara-banking.loca.lt
```

### Ana Endpoint'ler:
```
✅ Health Check:      https://enpara-banking.loca.lt/health
✅ MCP Endpoint:      https://enpara-banking.loca.lt/mcp
✅ App Config:        https://enpara-banking.loca.lt/app.json
```

### API Endpoint'leri:
```
✅ Exchange Rates:    https://enpara-banking.loca.lt/exchange-rates
✅ Campaigns:         https://enpara-banking.loca.lt/campaigns
✅ Branches:          https://enpara-banking.loca.lt/branches
```

---

## 🤖 ChatGPT MCP Konfigürasyonları

### Yöntem 1: Yerel (Command-based) - Önerilen ⭐

**Dosya:** `~/.config/chatgpt/mcp.json`

```json
{
  "mcpServers": {
    "enpara-banking": {
      "command": "node",
      "args": ["/Users/erdi/Desktop/enBankChatGptMcp-main/mcp-server.js"]
    }
  }
}
```

**Avantajları:**
- ✅ OAuth gerektirmiyor
- ✅ En hızlı
- ✅ En güvenli
- ✅ Ngrok/LocalTunnel gerekmez

---

### Yöntem 2: Ngrok (URL-based)

```json
{
  "mcpServers": {
    "enpara-banking-ngrok": {
      "url": "https://verbally-shaven-evan.ngrok-free.dev"
    }
  }
}
```

**Avantajları:**
- ✅ Uzaktan erişim
- ✅ Her cihazdan kullanım
- ⚠️ Mobil için bypass parameter gerekebilir
- ⚠️ OAuth gerektirebilir

---

### Yöntem 3: LocalTunnel (URL-based, Mobil Uyumlu)

```json
{
  "mcpServers": {
    "enpara-banking-lt": {
      "url": "https://enpara-banking.loca.lt"
    }
  }
}
```

**Avantajları:**
- ✅ Uzaktan erişim
- ✅ Mobil uyumlu
- ✅ Warning page yok
- ⚠️ OAuth gerektirebilir

---

## 🧪 Test Komutları

### Yerel Test:
```bash
# Health Check
curl http://localhost:3000/health

# Exchange Rates
curl http://localhost:3000/exchange-rates

# MCP Tools List
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'

# MCP Get Exchange Rates
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "get-exchange-rates",
      "arguments": {"currencies": ["USD", "EUR"]}
    },
    "id": 2
  }'
```

### Ngrok Test (Mobil Uyumlu):
```bash
# Health Check
curl "https://verbally-shaven-evan.ngrok-free.dev/health?ngrok-skip-browser-warning=true"

# Exchange Rates
curl "https://verbally-shaven-evan.ngrok-free.dev/exchange-rates?ngrok-skip-browser-warning=true"

# MCP Tools List
curl -X POST "https://verbally-shaven-evan.ngrok-free.dev/mcp?ngrok-skip-browser-warning=true" \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'

# MCP Get Exchange Rates
curl -X POST "https://verbally-shaven-evan.ngrok-free.dev/mcp?ngrok-skip-browser-warning=true" \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "get-exchange-rates",
      "arguments": {"currencies": ["USD", "EUR"]}
    },
    "id": 2
  }'
```

### LocalTunnel Test:
```bash
# Health Check
curl https://enpara-banking.loca.lt/health

# Exchange Rates
curl https://enpara-banking.loca.lt/exchange-rates

# MCP Tools List
curl -X POST https://enpara-banking.loca.lt/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

---

## 📱 Mobil Tarayıcıdan Test

### Direkt Tarayıcıda Açın:

**Ngrok (Bypass ile):**
```
https://verbally-shaven-evan.ngrok-free.dev/health?ngrok-skip-browser-warning=true
```

**LocalTunnel (Warning yok):**
```
https://enpara-banking.loca.lt/health
```

---

## 🎯 Hızlı Referans

| Kullanım | URL | Özellik |
|----------|-----|---------|
| **Yerel Test** | `http://localhost:3000` | En hızlı, en güvenli |
| **Ngrok (PC)** | `https://verbally-shaven-evan.ngrok-free.dev` | Her yerden erişim |
| **Ngrok (Mobil)** | `...?ngrok-skip-browser-warning=true` | Mobil bypass |
| **LocalTunnel** | `https://enpara-banking.loca.lt` | Mobil uyumlu |
| **ChatGPT Desktop** | Command-based MCP | OAuth yok |

---

## 🔐 MCP Endpoint Detayları

### Tools List (Kullanılabilir Araçlar):
```bash
POST /mcp
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "id": 1
}
```

**Response:**
- `get-exchange-rates` - Döviz kurlarını çeker
- `get-banking-campaigns` - Kampanyaları çeker

### Tool Call (Araç Çağrısı):
```bash
POST /mcp
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-exchange-rates",
    "arguments": {
      "currencies": ["USD", "EUR", "GBP"],
      "baseCurrency": "TRY"
    }
  },
  "id": 2
}
```

---

## 📊 Canlı Test Sonuçları

### ✅ Test Edilen URL'ler (17 Ekim 2025, 23:35):

```
✅ http://localhost:3000/health
   Status: healthy ✓

✅ https://verbally-shaven-evan.ngrok-free.dev/health?ngrok-skip-browser-warning=true
   Status: healthy ✓

✅ https://verbally-shaven-evan.ngrok-free.dev/mcp?ngrok-skip-browser-warning=true
   Tools: get-exchange-rates, get-banking-campaigns ✓

✅ https://enpara-banking.loca.lt/health
   Status: healthy ✓

✅ MCP Exchange Rates Call
   Response: USD 40.95 TL, EUR 47.51 TL ✓
```

---

## 🚀 Hızlı Başlangıç Komutları

### Sunucuları Başlat:
```bash
# Terminal 1: EnPara Server
cd /Users/erdi/Desktop/enBankChatGptMcp-main
npm start

# Terminal 2: Ngrok (opsiyonel)
export PATH="$HOME/bin:$PATH"
ngrok http 3000

# Terminal 3: LocalTunnel (opsiyonel)
lt --port 3000 --subdomain enpara-banking
```

### Durumu Kontrol Et:
```bash
# Yerel
curl http://localhost:3000/health

# Ngrok
curl "https://verbally-shaven-evan.ngrok-free.dev/health?ngrok-skip-browser-warning=true"

# LocalTunnel
curl https://enpara-banking.loca.lt/health

# Ngrok Dashboard
open http://localhost:4040
```

---

## 🌐 QR Kod İçin URL'ler (Mobil Test)

Mobil cihazınızdan hızlı erişim için QR kod oluşturabilirsiniz:

**Ngrok Health Check:**
```
https://verbally-shaven-evan.ngrok-free.dev/health?ngrok-skip-browser-warning=true
```

**LocalTunnel Health Check:**
```
https://enpara-banking.loca.lt/health
```

**QR Kod Oluştur:**
```bash
# qrencode kurulu ise
echo "https://enpara-banking.loca.lt/health" | qrencode -t UTF8
```

---

## 📚 Dökümantasyon Linkleri

- **Ana Rehber:** [KURULUM_REHBERI.md](./KURULUM_REHBERI.md)
- **ChatGPT Kurulum:** [CHATGPT_KURULUM.md](./CHATGPT_KURULUM.md)
- **Ngrok Rehberi:** [NGROK_KURULUM.md](./NGROK_KURULUM.md)
- **Mobil Erişim:** [MOBIL_ERISIM.md](./MOBIL_ERISIM.md)
- **Kurulum Özeti:** [KURULUM_TAMAMLANDI.md](./KURULUM_TAMAMLANDI.md)
- **Bu Dosya:** [TÜMLINKLER.md](./TÜMLINKLER.md)

---

## 🎯 Öneriler

### Yerel Geliştirme İçin:
✅ `http://localhost:3000` + Command-based MCP

### Mobil Test İçin:
✅ `https://enpara-banking.loca.lt` (LocalTunnel)

### Uzaktan Demo İçin:
✅ `https://verbally-shaven-evan.ngrok-free.dev?ngrok-skip-browser-warning=true` (Ngrok)

### Production İçin:
✅ Vercel/Railway/Heroku deploy

---

**Son Güncelleme:** 17 Ekim 2025, 23:36  
**Durum:** ✅ Tüm Sistemler Operasyonel

