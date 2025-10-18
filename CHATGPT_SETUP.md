# ChatGPT ile ngrok Entegrasyonu

## 🎯 Durum

✅ Server çalışıyor: `http://localhost:3000`
✅ ngrok çalışıyor: `https://verbally-shaven-evan.ngrok-free.dev`
🔴 Sorun: ngrok "Visit Site" sayfası ChatGPT'yi engelliyor

## ✅ ÇÖZÜM: İki Yöntem

### Yöntem 1: Tarayıcıda Bypass (Hızlı)

1. **Tarayıcıda aç:**
   ```
   https://verbally-shaven-evan.ngrok-free.dev
   ```

2. **"Visit Site" butonuna tıkla**

3. **JSON çıktısını göreceksin:**
   ```json
   {
     "name": "EnPara Banking Assistant",
     "description": "Get real-time exchange rates...",
     ...
   }
   ```

4. **ChatGPT'ye ekle:**
   - ChatGPT → Settings → Apps → Add App
   - URL: `https://verbally-shaven-evan.ngrok-free.dev`
   - Save

5. **Test et:**
   ```
   EnPara'dan güncel USD ve EUR kurlarını göster
   ```

### Yöntem 2: Static Domain (Kalıcı)

Eğer Yöntem 1 çalışmazsa:

1. **ngrok Dashboard'a git:**
   https://dashboard.ngrok.com/cloud-edge/domains

2. **"Create Domain" tıkla**

3. **Ücretsiz domain al:**
   - Örnek: `enpara-banking.ngrok-free.app`

4. **Domain'i bana söyle, ben ngrok'u yeniden başlatayım**

## 🧪 Test Komutları

ChatGPT'ye ekledikten sonra dene:

```
EnPara'dan USD kuru nedir?
```

```
EnPara'da hangi kampanyalar var?
```

```
Dolar ve Euro kurlarını karşılaştır
```

## 🔍 Debug

ngrok Web UI'da request'leri izle:
```
http://localhost:4040
```

## 📊 Mevcut Durum

- **Public URL:** https://verbally-shaven-evan.ngrok-free.dev
- **Server:** Çalışıyor (port 3000)
- **ngrok:** Çalışıyor
- **Capabilities:** 2 Tools, 4 Resources, 3 Prompts

## 🎯 Sonraki Adım

Önce **Yöntem 1**'i dene. Çalışmazsa **Yöntem 2**'ye geç.
