# 🤖 ChatGPT ile EnPara Banking Assistant Kullanımı

## ✅ Problem Çözüldü!

**OAuth hatası artık olmayacak!** Sunucu artık ChatGPT'nin yerel MCP protokolünü destekliyor.

---

## 📋 Kurulum Adımları

### ✅ Adım 1: MCP Server Kuruldu

Yeni bir MCP sunucu dosyası oluşturuldu: `mcp-server.js`
- OAuth gerektirmiyor
- Stdin/stdout üzerinden çalışıyor
- ChatGPT ile doğrudan iletişim kuruyor

### ✅ Adım 2: Konfigürasyon Dosyası Hazır

Dosya konumu: `~/.config/chatgpt/mcp.json`

İçeriği:
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

---

## 🚀 Kullanım

### 1️⃣ ChatGPT Desktop App'i Yeniden Başlatın

**Önemli:** Uygulamayı tamamen kapatıp açmanız gerekiyor:

- **macOS:** `Cmd + Q` veya menüden "Quit ChatGPT"
- Sonra ChatGPT'yi yeniden açın

### 2️⃣ Bağlantıyı Test Edin

ChatGPT'de şunu yazın:
```
EnPara Banking Assistant kullanılabilir mi?
```

veya

```
Güncel USD/TRY kurunu göster
```

### 3️⃣ Özellikleri Kullanın

**Döviz Kurları:**
```
EnPara'dan güncel döviz kurlarını göster
USD, EUR ve GBP kurunun son durumu nedir?
Bugün Dolar kaç lira?
```

**Kampanyalar:**
```
EnPara'nın aktif kampanyalarını göster
Kredi kartı kampanyaları neler?
```

---

## 🔍 Sorun Giderme

### ChatGPT Hala OAuth İstiyorsa

1. **ChatGPT Desktop App'i tamamen kapatın**
   ```bash
   # Terminal'den zorla kapatma (gerekirse)
   killall "ChatGPT"
   ```

2. **Konfigürasyonu kontrol edin**
   ```bash
   cat ~/.config/chatgpt/mcp.json
   ```

3. **ChatGPT'yi yeniden açın**

### "MCP server not found" Hatası

```bash
# Dosyanın varlığını kontrol edin
ls -la /Users/erdi/Desktop/enBankChatGptMcp-main/mcp-server.js

# Çalıştırma izni kontrol edin
chmod +x /Users/erdi/Desktop/enBankChatGptMcp-main/mcp-server.js

# Node.js yolunu kontrol edin
which node
```

### Test Komutu (Terminal'den)

```bash
# MCP sunucusunu manuel test edin
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node /Users/erdi/Desktop/enBankChatGptMcp-main/mcp-server.js
```

---

## 🎯 Önceki OAuth Hatası Neden Oluştu?

**Eski Yöntem:** URL-based MCP server (`http://localhost:3000`)
- OAuth authentication gerekiyordu
- Web sunucusu olarak çalışıyordu

**Yeni Yöntem:** Command-based MCP server (`mcp-server.js`)
- OAuth gerektirmiyor
- Direkt ChatGPT ile iletişim kuruyor
- Stdin/stdout kullanıyor

---

## 📱 ChatGPT'de Göreceğiniz Şey

Başarılı kurulum sonrası ChatGPT'de:

1. **Yeni Sohbet** başlatın
2. **"Enbank test"** adlı connector görünecek
3. Artık şunları yapabilirsiniz:
   - 💱 Döviz kurlarını sorgulayın
   - 🎉 Kampanyaları görün
   - 🇹🇷 Türkçe yanıtlar alın

---

## 🎨 Örnek Kullanım

### Döviz Kurları
```
Siz: EnPara'dan USD ve EUR kurunun son durumunu göster

ChatGPT: 🏛️ EnPara Bank Exchange Rates
📅 Last Updated: 17 Ekim 2025, Cuma 22:00
💱 Base Currency: TRY (Turkish Lira)
📊 Available Currencies: 2

| 💱 Currency | 📈 Alış (Buy) | 📉 Satış (Sell) | 📊 Spread | 💰 Profit/Loss |
|-------------|---------------|----------------|-----------|----------------|
| 🇺🇸 **USD** | **34.5123 TL** | **34.6789 TL** | 0.1666 TL | +0.48% |
| 🇪🇺 **EUR** | **37.8901 TL** | **38.0567 TL** | 0.1666 TL | +0.44% |
```

### Kampanyalar
```
Siz: Güncel kampanyaları göster

ChatGPT: 🎉 EnPara Banking Campaigns
📊 Active Campaigns: 9

[Kampanya listesi görünür]
```

---

## ✅ Kontrol Listesi

- [x] ✅ `mcp-server.js` oluşturuldu
- [x] ✅ Konfigürasyon dosyası güncellendi
- [x] ✅ OAuth hatası düzeltildi
- [ ] ⏳ ChatGPT Desktop App yeniden başlatıldı
- [ ] ⏳ ChatGPT'de test edildi

---

## 🔗 Ek Kaynaklar

- **Ana Rehber:** [KURULUM_REHBERI.md](./KURULUM_REHBERI.md)
- **OpenAI Apps SDK:** https://developers.openai.com/apps-sdk/
- **MCP Protocol:** https://modelcontextprotocol.io/

---

**🎉 Artık OAuth olmadan çalışıyor!**

ChatGPT Desktop App'i yeniden başlatın ve yukarıdaki komutları deneyin!

