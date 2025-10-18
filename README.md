# EnPara Banking Assistant - ChatGPT App

EnPara Banking Assistant for ChatGPT - Get real-time exchange rates and view campaigns

## Overview

This is a ChatGPT App built with the new Apps SDK that provides ChatGPT with access to EnPara banking information including exchange rates and banking campaigns. It uses the same API endpoints as the EnPara mobile application to ensure data consistency.

🚀 **Ready for ChatGPT Apps SDK Integration**

## Features

### 🏦 Banking Tools
- **Exchange Rates**: Get current currency exchange rates
- **Banking Campaigns**: View current promotions and offers

### 🌍 Turkish Localization
- Full Turkish language support
- Banking terminology in Turkish
- Localized date and currency formatting

### 📱 Mobile App Integration
- Uses identical API endpoints as EnPara mobile app
- Same data structures and response formats
- Consistent user experience

## Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn package manager
- A hosting platform (Vercel, Railway, Heroku, etc.)
- ChatGPT account with Apps SDK access

### Installation

1. **Clone and navigate to the project:**
   ```bash
   git clone https://github.com/enpara/enpara-chatgpt-app.git
   cd enpara-chatgpt-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.production .env
   # Edit .env with your configuration
   ```

4. **Test locally:**
   ```bash
   npm start
   # Visit http://localhost:3000/health to verify
   ```

5. **Deploy to production:**
   ```bash
   # For Vercel
   npm run deploy
   
   # For Railway/Heroku
   # Follow platform-specific deployment instructions
   ```

### Configuration

The server will start on `http://localhost:3000` by default. You can configure the following environment variables:

```env
# EnPara API Configuration
ENPARA_API_URL=https://api.enpara.com
ENPARA_API_TIMEOUT=10000

# Server Configuration
PORT=3000
NODE_ENV=development
```

## MCP Tools

### 1. Exchange Rates Tool
- **Tool Name**: `get-exchange-rates`
- **Description**: Get current currency exchange rates from EnPara
- **Parameters**: 
  - `currencies` (optional): Array of specific currencies
  - `baseCurrency` (optional): Base currency (default: TRY)


### 2. Banking Campaigns Tool
- **Tool Name**: `get-banking-campaigns`
- **Description**: View current EnPara banking campaigns and promotions
- **Parameters**:
  - `category` (optional): Campaign category filter
  - `active` (optional): Show only active campaigns

## API Endpoints

The server uses the same endpoints as the EnPara mobile application:

### Exchange Rates
- **Endpoint**: `Investment/Investment.ashx`
- **Service**: `GetFxDashboardRatePageData`
- **Service**: `GetAllInvestmentRates`


### Campaigns
- **Endpoint**: `Campaign/ENCampaign.ashx`
- **Service**: `GetCampaignListWithLimart`

### General Data
- **Endpoint**: `General/GeneralData.ashx`
- **Service**: `GetCityList`
- **Service**: `GetBankList`

## ChatGPT Apps SDK Integration

### 1. Deploy Your App

Deploy your app to a hosting platform (Vercel, Railway, Heroku, etc.) and get your app URL.

### 2. Configure ChatGPT

**For ChatGPT Web Interface:**
- Go to ChatGPT Settings
- Navigate to "Apps" or "Integrations" section
- Add your app URL: `https://your-app-name.vercel.app`

**For ChatGPT Desktop App:**
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

For detailed integration instructions, see [CHATGPT_APPS_INTEGRATION.md](./CHATGPT_APPS_INTEGRATION.md).

## Troubleshooting

**If ChatGPT can't connect to your app:**
1. **Check app is deployed**: Verify your app URL is accessible (e.g., `https://your-app-name.vercel.app/health`)
2. **Test app endpoints**: Visit your app URL in browser to verify it's running
3. **Check deployment logs**: Look for errors in your hosting platform's logs
4. **Verify CORS settings**: Ensure your app allows requests from ChatGPT domains

**Common Issues:**
- **App not accessible**: Check your deployment platform's status and logs
- **Rate limiting**: The app has built-in rate limiting (100 requests/minute)
- **Exchange rates not loading**: EnPara's website may be temporarily unavailable

**Debug Mode:**
Enable debug logging by setting `LOG_LEVEL=debug` in your environment variables.

## Development

### Project Structure
```
enpara-chatgpt-app/
├── server.js                 # Main MCP server
├── app.json                  # App configuration
├── package.json              # Dependencies
├── vercel.json              # Vercel deployment config
├── railway.json             # Railway deployment config
├── Procfile                 # Heroku deployment config
├── env.production           # Production environment template
├── src/
│   ├── services/
│   │   └── enparaAPI.js      # EnPara API integration
│   ├── components/
│   │   ├── exchangeRates.html
│   │   └── campaigns.html
│   └── utils/
│       └── localization.js   # Turkish localization
├── CHATGPT_APPS_INTEGRATION.md # Integration guide
└── README.md
```

### Adding New Tools

1. **Create the tool handler** in `server.js`
2. **Add API method** in `src/services/enparaAPI.js`
3. **Create HTML component** in `src/components/`
4. **Register the tool** with proper schema

### Testing

```bash
# Health check
curl http://localhost:3000/health

# Test MCP server
node server.js
```

## Deployment

### Option 1: AWS/Azure
```bash
# Build Docker image
docker build -t enpara-mcp .

# Run container
docker run -p 3000:3000 enpara-mcp
```

### Option 2: Vercel/Netlify
```bash
# Deploy to Vercel
vercel deploy

# Deploy to Netlify
netlify deploy --prod
```

### Option 3: Traditional Server
```bash
# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start server.js --name enpara-mcp
```

## Security

- **CORS**: Configured for cross-origin requests
- **Rate Limiting**: Built-in rate limiting for API calls
- **Input Validation**: Zod schema validation for all inputs
- **Error Handling**: Comprehensive error handling and logging

## Monitoring

- **Health Check**: `/health` endpoint for monitoring
- **Logging**: Structured logging with configurable levels
- **Metrics**: Optional metrics collection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue in the repository
- Contact the EnPara development team
- Check the documentation

## Changelog

### v1.0.0
- Initial ChatGPT Apps SDK integration
- Exchange rates tool with enhanced UI
- Campaigns tool with category filtering
- Enhanced security and rate limiting
- Production deployment configurations
- Comprehensive documentation
- Turkish localization
- Mobile app API integration
