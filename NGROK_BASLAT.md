# 🚀 ngrok ile Hızlı Başlangıç

## ✅ Durum: ngrok Yüklendi! (v3.30.0)

---

## 🔑 1. Auth Token Ayarla (Tek Seferlik)

### Adımlar:

1. **Kayıt Ol:** https://dashboard.ngrok.com/signup
   - Google hesabınla giriş yapabilirsin (30 saniye)
   
2. **Token Al:** https://dashboard.ngrok.com/get-started/your-authtoken
   - Sayfadaki token'ı kopyala
   
3. **Token'ı Ayarla:**
   ```bash
   ngrok config add-authtoken YOUR_TOKEN_HERE
   ```

**Örnek:**
```bash
ngrok config add-authtoken 2abc123def456ghi789jkl
```

✅ Bu işlemi sadece bir kez yapman yeterli!

---

## 🚀 2. Başlat

Token'ı ayarladıktan sonra:

```bash
npm run start:ngrok
```

veya

```bash
./start-with-ngrok.sh
```

---

## 📊 3. Ne Olacak?

Script çalıştığında:

```
╔══════════════════════════════════════════════════════════════╗
║              ✅ Başarıyla Başlatıldı!                        ║
╚══════════════════════════════════════════════════════════════╝

📊 Local Server:  http://localhost:3000
🌐 Public URL:    https://abc123.ngrok-free.app  ← BU URL'İ KOPYALA
🔍 ngrok Web UI: http://localhost:4040
```

---

## 🎯 4. ChatGPT'ye Ekle

1. **Public URL'i kopyala** (örn: `https://abc123.ngrok-free.app`)
2. **ChatGPT'i aç**
3. **Settings** → **Apps** → **Add App**
4. **URL'i yapıştır** ve **Save**

---

## 🧪 5. Test Et

ChatGPT'de sor:

```
EnPara'dan güncel USD ve EUR kurlarını göster
```

veya

```
EnPara'da hangi kampanyalar var?
```

---

## 🔍 6. Request'leri İzle

Tarayıcıda aç: http://localhost:4040

Burada görebilirsin:
- ChatGPT'nin yaptığı istekler
- Request/response detayları
- Timing bilgileri
- Hata mesajları

---

## 🛑 7. Durdur

```bash
npm run stop:ngrok
```

veya `Ctrl+C`

---

## 💡 İpuçları

### ✅ Ücretsiz Plan
- 1 online tunnel
- 40 bağlantı/dakika
- HTTPS otomatik
- URL her seferinde değişir

### 🔄 URL Değişirse
ngrok'u her başlattığında yeni URL alırsın.
ChatGPT'de URL'i güncellemelisin.

### 🎯 Sabit URL İstersen
ngrok Pro ($8/ay) ile custom subdomain alabilirsin.

### 🐛 Sorun Olursa
```bash
# Log'lara bak
tail -f logs/server.log
tail -f logs/ngrok.log

# Port'u temizle
npm run stop:ngrok

# Yeniden başlat
npm run start:ngrok
```

---

## 📚 Daha Fazla Bilgi

- **Detaylı Rehber:** [NGROK_SETUP.md](./NGROK_SETUP.md)
- **Hızlı Başlangıç:** [NGROK_QUICKSTART.md](./NGROK_QUICKSTART.md)
- **ngrok Docs:** https://ngrok.com/docs

---

## 🎉 Özet

```bash
# 1. Token ayarla (tek seferlik)
ngrok config add-authtoken YOUR_TOKEN

# 2. Başlat
npm run start:ngrok

# 3. Public URL'i kopyala
# Çıktıda gösterilir: https://abc123.ngrok-free.app

# 4. ChatGPT'ye ekle
# Settings → Apps → Add App → URL'i yapıştır

# 5. Test et
# "EnPara'dan döviz kurları" diye sor

# 6. Durdur
npm run stop:ngrok
```

---

**🚀 Hadi başlayalım!**

Token almak için: https://dashboard.ngrok.com/signup

