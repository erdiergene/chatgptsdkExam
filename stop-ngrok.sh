#!/bin/bash

# EnPara MCP Server + ngrok Durdurma Script'i

# Renkler
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🛑 EnPara MCP Server + ngrok durduruluyor...${NC}"
echo ""

# PID dosyalarından process'leri durdur
if [ -f logs/server.pid ]; then
    SERVER_PID=$(cat logs/server.pid)
    if ps -p $SERVER_PID > /dev/null 2>&1; then
        kill $SERVER_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Server durduruldu (PID: $SERVER_PID)${NC}"
    fi
    rm -f logs/server.pid
fi

if [ -f logs/ngrok.pid ]; then
    NGROK_PID=$(cat logs/ngrok.pid)
    if ps -p $NGROK_PID > /dev/null 2>&1; then
        kill $NGROK_PID 2>/dev/null || true
        echo -e "${GREEN}✅ ngrok durduruldu (PID: $NGROK_PID)${NC}"
    fi
    rm -f logs/ngrok.pid
fi

# Port 3000'i temizle
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}✅ Port 3000 temizlendi${NC}"
fi

# ngrok process'lerini temizle
pkill -f "ngrok http" 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ Tüm servisler durduruldu${NC}"

