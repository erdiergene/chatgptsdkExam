# 🏦 EnPara Banking Assistant - Kurulum Rehberi

Bu rehber, EnPara Banking Assistant'ı nasıl ayağa kaldıracağınızı ve ChatGPT ile nasıl entegre edeceğinizi adım adım açıklar.

## 📋 İçindekiler
1. [Gereksinimler](#gereksinimler)
2. [Yerel Kurulum](#yerel-kurulum)
3. [ChatGPT Entegrasyonu](#chatgpt-entegrasyonu)
4. [Production Deployment](#production-deployment)
5. [Test ve Kullanım](#test-ve-kullanım)
6. [Sorun Giderme](#sorun-giderme)

---

## 🔧 Gereksinimler

- **Node.js**: 18.0.0 veya üzeri
- **npm**: 8.0.0 veya üzeri
- **ChatGPT**: Apps SDK erişimi (opsiyonel, yerel test için gerekli değil)

### Node.js Versiyonunu Kontrol Edin
```bash
node --version  # v18.0.0 veya üzeri olmalı
npm --version   # v8.0.0 veya üzeri olmalı
```

---

## 🚀 Yerel Kurulum

### Adım 1: Projeyi Hazırlayın
```bash
# Proje dizinine gidin
cd /Users/erdi/Desktop/enBankChatGptMcp-main
```

### Adım 2: Bağımlılıkları Yükleyin
```bash
npm install
```

### Adım 3: Environment Dosyasını Oluşturun
```bash
# Production template'ini kopyalayın
cp env.production .env

# İsterseniz .env dosyasını düzenleyebilirsiniz
nano .env
```

**.env dosyası içeriği:**
```env
# EnPara API Configuration
ENPARA_API_URL=https://www.enpara.com
ENPARA_API_TIMEOUT=10000

# Server Configuration
PORT=3000
NODE_ENV=development

# MCP Server Configuration
MCP_SERVER_NAME=enpara-banking-server
MCP_SERVER_VERSION=1.0.0

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json

# Security Configuration
CORS_ORIGIN=*
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### Adım 4: Sunucuyu Başlatın
```bash
# Production mode
npm start

# Development mode (auto-reload)
npm run dev
```

### Adım 5: Sunucunun Çalıştığını Doğrulayın
Tarayıcınızda veya terminal'de şu URL'leri test edin:

```bash
# Health check
curl http://localhost:3000/health

# Ana endpoint
curl http://localhost:3000/

# MCP endpoint
curl http://localhost:3000/mcp

# Exchange rates
curl http://localhost:3000/exchange-rates

# Campaigns
curl http://localhost:3000/campaigns
```

**Başarılı bir health check yanıtı:**
```json
{
  "status": "healthy",
  "service": "EnPara ChatGPT App",
  "version": "1.0.0",
  "timestamp": "2025-10-17T19:06:14.970Z",
  "capabilities": {
    "tools": ["get-exchange-rates", "get-banking-campaigns"],
    "resources": ["exchange-rates-ui", "campaigns-ui"]
  }
}
```

---

## 🤖 ChatGPT Entegrasyonu

Bu proje [OpenAI Apps SDK](https://developers.openai.com/apps-sdk/) standardına uygun olarak geliştirilmiştir.

### Yöntem 1: ChatGPT Desktop App (Önerilen)

1. **MCP Konfigürasyon Dosyası Oluşturun:**

```bash
# Dizini oluşturun (yoksa)
mkdir -p ~/.config/chatgpt

# Konfigürasyon dosyasını oluşturun
nano ~/.config/chatgpt/mcp.json
```

2. **Aşağıdaki içeriği ekleyin:**

```json
{
  "mcpServers": {
    "enpara-banking": {
      "url": "http://localhost:3000"
    }
  }
}
```

3. **ChatGPT Desktop App'i yeniden başlatın**

### Yöntem 2: ChatGPT Web Interface

1. ChatGPT ayarlarına gidin
2. "Apps" veya "Integrations" bölümünü bulun
3. Yeni app ekleyin: `http://localhost:3000`

### Yöntem 3: Production Deployment (İnternet Üzerinden)

Sunucunuzu internete açtıktan sonra (Vercel, Railway, Heroku vb.):

```json
{
  "mcpServers": {
    "enpara-banking": {
      "url": "https://your-app-name.vercel.app"
    }
  }
}
```

---

## 🌐 Production Deployment

### Seçenek 1: Vercel (Önerilen - Ücretsiz)

```bash
# Vercel CLI'yi yükleyin
npm install -g vercel

# Deploy edin
vercel --prod

# URL'nizi not edin: https://your-app-name.vercel.app
```

### Seçenek 2: Railway (Ücretsiz)

1. [Railway.app](https://railway.app)'e gidin
2. GitHub repo'nuzu bağlayın
3. Otomatik deploy edilecek
4. URL'nizi not edin

### Seçenek 3: Heroku

```bash
# Heroku CLI'yi yükleyin
brew install heroku/brew/heroku

# Login olun
heroku login

# App oluşturun
heroku create your-enpara-app

# Deploy edin
git push heroku main

# URL'nizi not edin: https://your-enpara-app.herokuapp.com
```

### Seçenek 4: Docker

```bash
# Docker image oluşturun
docker build -t enpara-mcp .

# Container'ı çalıştırın
docker run -p 3000:3000 -d enpara-mcp

# Docker Compose ile (önerilen)
docker-compose up -d
```

---

## 🧪 Test ve Kullanım

### ChatGPT'de Test Edin

Entegrasyon tamamlandıktan sonra ChatGPT'de şunları deneyin:

**Döviz Kurları:**
```
EnPara'nın güncel döviz kurlarını göster
USD/TRY kuru nedir?
Bugünkü Euro kuru ne kadar?
```

**Kampanyalar:**
```
EnPara'nın güncel kampanyalarını göster
Kredi kartı kampanyaları neler?
Hangi bankacılık kampanyaları var?
```

### Terminal'den Test Edin

```bash
# MCP protokolü ile exchange rates
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "get-exchange-rates",
      "arguments": {
        "currencies": ["USD", "EUR", "GBP"]
      }
    },
    "id": 1
  }'

# MCP protokolü ile campaigns
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "get-banking-campaigns",
      "arguments": {
        "category": "all"
      }
    },
    "id": 2
  }'
```

---

## 🔧 Sorun Giderme

### Sunucu Başlamıyor

**Problem:** `npm start` çalışmıyor

**Çözüm:**
```bash
# Port kullanımda olabilir
lsof -i :3000
kill -9 <PID>

# Node modüllerini yeniden yükleyin
rm -rf node_modules package-lock.json
npm install
```

### ChatGPT Bağlanamıyor

**Problem:** ChatGPT app'e erişemiyor

**Çözüm:**
1. Sunucunun çalıştığını doğrulayın: `curl http://localhost:3000/health`
2. MCP config dosyasının doğru konumda olduğunu kontrol edin
3. ChatGPT Desktop App'i yeniden başlatın
4. URL'nin doğru olduğunu kontrol edin (http:// veya https://)

### CORS Hatası

**Problem:** CORS policy hatası

**Çözüm:**
`.env` dosyasında:
```env
CORS_ORIGIN=*
NODE_ENV=development
```

### API Yanıt Vermiyor

**Problem:** EnPara API'den veri gelmiyor

**Çözüm:**
1. İnternet bağlantınızı kontrol edin
2. EnPara.com'un erişilebilir olduğunu doğrulayın
3. Logs'u kontrol edin: `console.log` çıktılarına bakın

### Rate Limiting

**Problem:** "Too many requests" hatası

**Çözüm:**
`.env` dosyasında limitleri artırın:
```env
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=200
```

---

## 📚 Ek Kaynaklar

- **OpenAI Apps SDK:** https://developers.openai.com/apps-sdk/
- **MCP Protocol:** Model Context Protocol standardı
- **EnPara Website:** https://www.enpara.com
- **Proje README:** [README.md](./README.md)
- **ChatGPT Integration:** [CHATGPT_APPS_INTEGRATION.md](./CHATGPT_APPS_INTEGRATION.md)

---

## 🎯 Özellikler

### Mevcut Özellikler
- ✅ Döviz kurları (25+ para birimi)
- ✅ Bankacılık kampanyaları
- ✅ Türkçe lokalizasyon
- ✅ Rate limiting
- ✅ CORS koruması
- ✅ Health check endpoint
- ✅ MCP protokol desteği

### Planlanan Özellikler
- 🔄 Şube ve ATM lokasyonu
- 🔄 Gerçek zamanlı bildirimler
- 🔄 Kullanıcı kimlik doğrulama
- 🔄 Kişiselleştirilmiş öneriler

---

## 📞 Destek

Sorun yaşarsanız:
1. Bu rehberi tekrar gözden geçirin
2. [GitHub Issues](https://github.com/enpara/enpara-chatgpt-app/issues) açın
3. Logs'u kontrol edin
4. OpenAI Apps SDK dokümantasyonuna bakın

---

## ✅ Başarı Kontrol Listesi

- [ ] Node.js 18+ yüklü
- [ ] npm install tamamlandı
- [ ] .env dosyası oluşturuldu
- [ ] `npm start` çalışıyor
- [ ] http://localhost:3000/health yanıt veriyor
- [ ] ChatGPT MCP config oluşturuldu
- [ ] ChatGPT'de test edildi
- [ ] Production'a deploy edildi (opsiyonel)

---

**🎉 Tebrikler! EnPara Banking Assistant başarıyla kuruldu!**

Artık ChatGPT üzerinden EnPara bankacılık hizmetlerine erişebilirsiniz.

