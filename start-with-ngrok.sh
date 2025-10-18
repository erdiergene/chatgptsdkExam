#!/bin/bash

# EnPara MCP Server + ngrok Starter Script
# Bu script server'ı başlatır ve ngrok tunnel'ı açar

set -e

# Renkler
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     EnPara MCP Server + ngrok Başlatılıyor...               ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Port kontrolü
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Port 3000 zaten kullanımda. Temizleniyor...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# ngrok kontrolü
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}❌ ngrok bulunamadı!${NC}"
    echo ""
    echo -e "${YELLOW}Kurulum:${NC}"
    echo "  brew install ngrok/ngrok/ngrok"
    echo ""
    echo "veya"
    echo ""
    echo "  https://ngrok.com/download"
    echo ""
    exit 1
fi

# ngrok auth token kontrolü
if ! ngrok config check &> /dev/null; then
    echo -e "${YELLOW}⚠️  ngrok auth token ayarlanmamış${NC}"
    echo ""
    echo "1. https://dashboard.ngrok.com/get-started/your-authtoken adresinden token alın"
    echo "2. Aşağıdaki komutu çalıştırın:"
    echo "   ngrok config add-authtoken YOUR_TOKEN"
    echo ""
    read -p "Token'ı şimdi girmek ister misiniz? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "ngrok auth token: " NGROK_TOKEN
        ngrok config add-authtoken "$NGROK_TOKEN"
        echo -e "${GREEN}✅ Token kaydedildi${NC}"
    else
        exit 1
    fi
fi

# Log dizini oluştur
mkdir -p logs

# Server'ı arka planda başlat
echo -e "${BLUE}🚀 Server başlatılıyor...${NC}"
npm start > logs/server.log 2>&1 &
SERVER_PID=$!
echo -e "${GREEN}✅ Server başlatıldı (PID: $SERVER_PID)${NC}"

# Server'ın başlamasını bekle
echo -e "${BLUE}⏳ Server'ın hazır olması bekleniyor...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server hazır!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Server başlatılamadı. Log'lara bakın: tail -f logs/server.log${NC}"
        kill $SERVER_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

# ngrok'u başlat
echo ""
echo -e "${BLUE}🌐 ngrok tunnel açılıyor...${NC}"

# ngrok'u arka planda başlat
ngrok http 3000 --log=stdout > logs/ngrok.log 2>&1 &
NGROK_PID=$!
echo -e "${GREEN}✅ ngrok başlatıldı (PID: $NGROK_PID)${NC}"

# ngrok'un başlamasını bekle
sleep 3

# ngrok URL'ini al
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$NGROK_URL" ]; then
    echo -e "${RED}❌ ngrok URL alınamadı${NC}"
    echo "Log'lara bakın: tail -f logs/ngrok.log"
    kill $SERVER_PID $NGROK_PID 2>/dev/null || true
    exit 1
fi

# PID'leri kaydet
echo $SERVER_PID > logs/server.pid
echo $NGROK_PID > logs/ngrok.pid
echo $NGROK_URL > logs/ngrok_url.txt

# Başarı mesajı
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ Başarıyla Başlatıldı!                        ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Local Server:${NC}  http://localhost:3000"
echo -e "${BLUE}🌐 Public URL:${NC}    $NGROK_URL"
echo -e "${BLUE}🔍 ngrok Web UI:${NC} http://localhost:4040"
echo ""
echo -e "${YELLOW}📋 Test Endpoint'leri:${NC}"
echo "   curl $NGROK_URL/health"
echo "   curl $NGROK_URL/exchange-rates"
echo "   curl $NGROK_URL/campaigns"
echo ""
echo -e "${YELLOW}🎯 ChatGPT'de Kullanım:${NC}"
echo "   1. ChatGPT Settings → Apps → Add App"
echo "   2. URL: $NGROK_URL"
echo "   3. Save"
echo ""
echo -e "${YELLOW}📝 Log'lar:${NC}"
echo "   Server:  tail -f logs/server.log"
echo "   ngrok:   tail -f logs/ngrok.log"
echo ""
echo -e "${YELLOW}🛑 Durdurmak için:${NC}"
echo "   ./stop-ngrok.sh"
echo "   veya"
echo "   kill $SERVER_PID $NGROK_PID"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop...${NC}"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Durduruluyor...${NC}"
    kill $SERVER_PID $NGROK_PID 2>/dev/null || true
    rm -f logs/server.pid logs/ngrok.pid
    echo -e "${GREEN}✅ Temizlendi${NC}"
    exit 0
}

trap cleanup INT TERM

# Log'ları takip et
tail -f logs/server.log logs/ngrok.log

