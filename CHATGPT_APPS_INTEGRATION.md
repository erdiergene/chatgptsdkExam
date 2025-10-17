# EnPara Banking Assistant - ChatGPT Apps SDK Integration Guide

This guide will help you integrate the EnPara Banking Assistant with ChatGPT's new Apps SDK feature.

## Overview

The EnPara Banking Assistant is a ChatGPT App that provides real-time access to:
- 💱 **Exchange Rates**: Current currency exchange rates from EnPara Bank
- 🎉 **Banking Campaigns**: View current promotions and special offers

## Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- A hosting platform (Vercel, Railway, Heroku, etc.)
- ChatGPT account with Apps SDK access

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the environment template:
```bash
cp env.production .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=production
PORT=3000
ENPARA_API_URL=https://www.enpara.com
ENPARA_API_TIMEOUT=10000
```

### 3. Test Locally

```bash
npm start
```

Visit `http://localhost:3000/health` to verify the app is running.

### 4. Deploy to Production

Choose one of the deployment options below.

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Your app will be available at:** `https://your-app-name.vercel.app`

### Option 2: Railway

1. **Connect your GitHub repository to Railway**
2. **Railway will automatically detect the `railway.json` configuration**
3. **Deploy with one click**

### Option 3: Heroku

1. **Install Heroku CLI**
2. **Create a new app:**
   ```bash
   heroku create your-enpara-app
   ```

3. **Deploy:**
   ```bash
   git push heroku main
   ```

## ChatGPT Apps SDK Integration

### 1. Get Your App URL

After deployment, note your app's URL (e.g., `https://your-app-name.vercel.app`).

### 2. Configure ChatGPT

#### For ChatGPT Web Interface:
1. Go to ChatGPT Settings
2. Navigate to "Apps" or "Integrations" section
3. Add your app URL: `https://your-app-name.vercel.app`

#### For ChatGPT Desktop App:
Create `~/.config/chatgpt/mcp.json`:
```json
{
  "mcpServers": {
    "enpara-banking": {
      "url": "https://your-app-name.vercel.app"
    }
  }
}
```

### 3. Verify Integration

Test the integration by asking ChatGPT:

**Exchange Rates:**
- "What are EnPara's current exchange rates?"
- "Show me USD to TRY exchange rate"
- "Get current currency rates from EnPara"


**Banking Campaigns:**
- "What are EnPara's current banking campaigns?"
- "Show me credit card promotions"
- "What offers does EnPara have?"

## App Configuration

The app configuration is defined in `app.json`:

```json
{
  "name": "EnPara Banking Assistant",
  "description": "Get real-time exchange rates and view current banking campaigns from EnPara Bank in Turkey.",
  "version": "1.0.0",
  "tools": [
    {
      "name": "get-exchange-rates",
      "title": "Get Exchange Rates",
      "description": "Get current currency exchange rates from EnPara bank including USD, EUR, GBP and other major currencies."
    },
    {
      "name": "get-banking-campaigns",
      "title": "Get Banking Campaigns",
      "description": "View current EnPara banking campaigns, promotions, and special offers including credit cards, loans, savings accounts, and other financial products."
    }
  ]
}
```

## API Endpoints

### Health Check
- **GET** `/health` - App health status
- **GET** `/app.json` - App configuration metadata

### MCP Endpoints
- **POST** `/mcp` - Main MCP endpoint for ChatGPT integration
- **GET** `/mcp` - MCP server information

### Direct API Endpoints (for testing)
- **GET** `/exchange-rates` - Direct exchange rates access
- **GET** `/campaigns` - Direct campaigns access

## Security Features

- **Rate Limiting**: 100 requests per minute per IP
- **CORS Protection**: Configured for ChatGPT domains
- **Helmet Security**: Security headers and CSP
- **Input Validation**: Zod schema validation
- **Error Handling**: Comprehensive error handling

## Monitoring

### Health Check
Monitor your app's health:
```bash
curl https://your-app-name.vercel.app/health
```

### Logs
Check your deployment platform's logs for:
- Request/response logs
- Error messages
- Performance metrics

## Troubleshooting

### Common Issues

1. **App not connecting to ChatGPT:**
   - Verify your app URL is accessible
   - Check CORS configuration
   - Ensure the app is running in production mode

2. **Rate limiting errors:**
   - The app has built-in rate limiting (100 requests/minute)
   - Wait before making more requests

3. **Exchange rates not loading:**
   - EnPara's website may be temporarily unavailable
   - Check the app logs for specific error messages


### Debug Mode

Enable debug logging by setting:
```env
LOG_LEVEL=debug
```

### Testing Endpoints

Test individual endpoints:
```bash
# Health check
curl https://your-app-name.vercel.app/health

# Exchange rates
curl https://your-app-name.vercel.app/exchange-rates

# MCP endpoint
curl -X POST https://your-app-name.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{"method": "get-exchange-rates"}'
```

## Development

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Test endpoints
curl http://localhost:3000/health
```

### Adding New Tools

1. **Create the tool handler** in `server.js`
2. **Add API method** in `src/services/enparaAPI.js`
3. **Create HTML component** in `src/components/`
4. **Register the tool** with proper schema
5. **Update `app.json`** with new tool definition

### Code Structure

```
enpara-chatgpt-app/
├── server.js                 # Main MCP server
├── app.json                  # App configuration
├── package.json              # Dependencies
├── vercel.json              # Vercel deployment config
├── railway.json             # Railway deployment config
├── Procfile                 # Heroku deployment config
├── src/
│   ├── services/
│   │   └── enparaAPI.js     # EnPara API integration
│   ├── components/
│   │   ├── exchangeRates.html
│   │   └── campaigns.html
│   └── utils/
│       └── localization.js  # Turkish localization
└── README.md
```

## Support

For issues and questions:
- Create an issue in the repository
- Check the troubleshooting section above
- Review the ChatGPT Apps SDK documentation

## License

MIT License - see LICENSE file for details.

## Changelog

### v1.0.0
- Initial ChatGPT Apps SDK integration
- Exchange rates tool with enhanced UI
- Campaigns tool with category filtering
- Enhanced security and rate limiting
- Production deployment configurations
- Comprehensive documentation
