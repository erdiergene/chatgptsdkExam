#!/bin/bash

# EnPara MCP Server Setup Script
echo "🚀 Setting up EnPara MCP Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18.0.0 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18.0.0 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "✅ .env file created. Please edit it with your configuration."
else
    echo "✅ .env file already exists."
fi

# Create logs directory
mkdir -p logs

# Set executable permissions
chmod +x setup.sh

echo ""
echo "🎉 EnPara MCP Server setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start the server: npm start"
echo "3. Or for development: npm run dev"
echo ""
echo "Server will be available at: http://localhost:3000"
echo "Health check: http://localhost:3000/health"
echo ""
echo "For ChatGPT integration:"
echo "1. Install localtunnel: npm install -g localtunnel"
echo "2. Start your server: npm start"
echo "3. In another terminal: lt --port 3000"
echo "4. Use the tunnel URL in ChatGPT settings"
echo ""
echo "Alternative with ngrok:"
echo "1. Sign up at https://dashboard.ngrok.com/signup"
echo "2. Get authtoken: https://dashboard.ngrok.com/get-started/your-authtoken"
echo "3. Add authtoken: ngrok config add-authtoken YOUR_TOKEN"
echo "4. Start tunnel: npx ngrok http 3000"
