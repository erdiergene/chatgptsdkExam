# 🌐 Ngrok ile EnPara Banking Assistant'ı İnternete Açma

## ✅ Ngrok Kuruldu!

Ngrok başarıyla kuruldu ve kullanıma hazır!
- **Versiyon:** 3.30.0
- **Konum:** `~/bin/ngrok`

---

## 🚀 Sunucuyu İnternete Açma

### Adım 1: İki Terminal Penceresi Açın

#### Terminal 1: EnPara Sunucusu
```bash
cd /Users/erdi/Desktop/enBankChatGptMcp-main
npm start
```

**Beklenen çıktı:**
```
🚀 EnPara ChatGPT App running on port 3000
📊 Health check: http://localhost:3000/health
🏦 EnPara banking services available via MCP
```

#### Terminal 2: Ngrok Tunnel
```bash
export PATH="$HOME/bin:$PATH"
ngrok http 3000
```

**Beklenen çıktı:**
```
ngrok                                                                           
                                                                                
Session Status                online                                            
Account                       [Your Account] (Plan: Free)                      
Version                       3.30.0                                            
Region                        United States (us)                                
Latency                       -                                                 
Web Interface                 http://127.0.0.1:4040                            
Forwarding                    https://xxxx-xx-xx-xxx-xxx.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90       
                              0       0       0.00    0.00    0.00    0.00      
```

### Adım 2: Public URL'nizi Kopyalayın

Ngrok size şöyle bir URL verecek:
```
https://xxxx-xx-xx-xxx-xxx.ngrok-free.app
```

Bu URL'yi not edin! 📝

---

## 🤖 ChatGPT ile Kullanım

### Seçenek 1: Yerel (OAuth'sız) - Önerilen ✅

Önceden ayarladığımız gibi:
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

**Bu yöntemde ngrok gerekmez!**

### Seçenek 2: İnternet Üzerinden (Ngrok ile)

Ngrok URL'nizi ChatGPT'ye ekleyin:

```bash
cat > ~/.config/chatgpt/mcp.json << 'EOF'
{
  "mcpServers": {
    "enpara-banking-remote": {
      "url": "https://xxxx-xx-xx-xxx-xxx.ngrok-free.app"
    }
  }
}
EOF
```

**Not:** `xxxx-xx-xx-xxx-xxx.ngrok-free.app` kısmını kendi ngrok URL'nizle değiştirin!

---

## 🧪 Test Etme

### 1. Yerel Test
```bash
# Terminal'den test
curl http://localhost:3000/health

# Beklenen yanıt
{"status":"healthy","service":"EnPara ChatGPT App"...}
```

### 2. Ngrok Test
```bash
# Ngrok URL'niz ile test
curl https://xxxx-xx-xx-xxx-xxx.ngrok-free.app/health

# Beklenen yanıt
{"status":"healthy","service":"EnPara ChatGPT App"...}
```

### 3. ChatGPT'de Test
```
EnPara'dan güncel USD/TRY kurunu göster
```

---

## 📊 Ngrok Dashboard

Ngrok çalışırken:
- **Web Interface:** http://localhost:4040
- **Canlı istekleri izleyin**
- **Request/response detaylarını görün**
- **Traffic analytics**

---

## ⚙️ Ngrok Konfigürasyonu (Opsiyonel)

### Auth Token Ekleme (Uzun süreli kullanım için)

1. **Ngrok hesabı oluşturun:** https://dashboard.ngrok.com/signup
2. **Auth token alın:** https://dashboard.ngrok.com/get-started/your-authtoken
3. **Token'ı kaydedin:**
   ```bash
   ~/bin/ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

### Özel Domain (Ücretli)
```bash
ngrok http 3000 --domain=enpara.ngrok.io
```

### Sabit URL (Ücretsiz - 2 saat)
```bash
ngrok http 3000 --region=eu
```

---

## 🔒 Güvenlik Notları

### Ngrok Free Plan Limitleri:
- ✅ 1 online ngrok process
- ✅ 40 bağlantı/dakika
- ✅ HTTPS encryption
- ❌ Sabit domain yok (her başlatmada yeni URL)
- ❌ IP kısıtlaması yok

### Güvenlik İçin:
```bash
# EnPara sunucusunda zaten rate limiting var
# Rate limit: 100 requests/minute
# CORS protection aktif
# Helmet security headers aktif
```

---

## 🎯 Hangi Yöntemi Seçmeliyim?

### Yerel Kullanım (Önerilen) ✅
```
✅ OAuth gerektirmiyor
✅ Hızlı ve güvenli
✅ Internet bağlantısı gerekmiyor
✅ Sabit konfigürasyon
❌ Sadece kendi bilgisayarınızda çalışır
```

**Kullanım:** ChatGPT Desktop App + command-based MCP

### Ngrok ile Uzaktan Erişim 🌐
```
✅ Her yerden erişim
✅ Başkalarıyla paylaşabilirsiniz
✅ Mobil cihazlardan erişim
❌ Internet bağlantısı gerekli
❌ URL her başlatmada değişir (free plan)
❌ OAuth gerektirebilir
```

**Kullanım:** Herhangi bir cihazdan + URL-based MCP

---

## 📝 Hızlı Komutlar

### Ngrok Başlat
```bash
export PATH="$HOME/bin:$PATH"
ngrok http 3000
```

### Ngrok Durdur
```bash
# Terminal'de Ctrl + C
# veya
killall ngrok
```

### Ngrok Durumu
```bash
curl http://localhost:4040/api/tunnels
```

### EnPara Sunucusu Durumu
```bash
curl http://localhost:3000/health
```

---

## 🔄 Otomatik Başlatma (Opsiyonel)

### 1. Launch Agent ile (macOS)

Dosya oluşturun: `~/Library/LaunchAgents/com.enpara.mcp.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.enpara.mcp</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/Users/erdi/Desktop/enBankChatGptMcp-main/server.js</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/enpara-mcp.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/enpara-mcp-error.log</string>
</dict>
</plist>
```

Yükle:
```bash
launchctl load ~/Library/LaunchAgents/com.enpara.mcp.plist
```

### 2. Screen ile (Her macOS/Linux)

```bash
# Screen session başlat
screen -S enpara

# Sunucuyu çalıştır
cd /Users/erdi/Desktop/enBankChatGptMcp-main
npm start

# Detach: Ctrl + A, sonra D
# Attach: screen -r enpara
```

---

## 🆘 Sorun Giderme

### Ngrok "command not found"
```bash
export PATH="$HOME/bin:$PATH"
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Port 3000 kullanımda
```bash
lsof -i :3000
kill -9 <PID>
```

### Ngrok "ERR_NGROK_108"
```bash
# Auth token gerekli
ngrok config add-authtoken YOUR_TOKEN
```

### ChatGPT bağlanamıyor
1. Sunucu çalışıyor mu? → `curl http://localhost:3000/health`
2. Ngrok çalışıyor mu? → `curl http://localhost:4040`
3. URL doğru mu? → Ngrok terminalinde kontrol edin

---

## 📞 Özet: Hızlı Başlangıç

```bash
# Terminal 1: EnPara Sunucusu
cd /Users/erdi/Desktop/enBankChatGptMcp-main
npm start

# Terminal 2: Ngrok (opsiyonel)
export PATH="$HOME/bin:$PATH"
ngrok http 3000

# Not: Yerel kullanım için ngrok gerekmez!
# ChatGPT Desktop App + command-based MCP kullanın
```

---

## ✅ Kontrol Listesi

- [x] ✅ Ngrok kuruldu (v3.30.0)
- [x] ✅ EnPara sunucusu çalışıyor (port 3000)
- [ ] ⏳ Ngrok tunnel başlatıldı (isteğe bağlı)
- [ ] ⏳ Public URL not alındı
- [ ] ⏳ ChatGPT'de test edildi

---

**🎉 Artık sunucunuz hem yerel hem de uzaktan erişime hazır!**

Yerel kullanım için command-based MCP, uzaktan erişim için ngrok URL'sini kullanın!

