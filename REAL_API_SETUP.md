# Real EnPara API Setup Guide

## Overview
This guide shows you how to configure your MCP server to fetch real data from EnPara's APIs instead of using mock data.

## Current Configuration

Your MCP server is now configured to use the real EnPara API at:
- **Base URL**: `https://mobilemwios.enpara.com` (Production)
- **Base URL**: `https://mobilemwtest.enpara.com` (Test)
- **Endpoints**: Same as the mobile app uses

## API Endpoints Being Used

### 1. Exchange Rates
- **Endpoint**: `POST /Investment/Investment.ashx`
- **Service**: `GetFxDashboardRatePageData`
- **Purpose**: Get current foreign exchange rates

### 2. Branch/ATM Locations
- **Endpoint**: `POST /Atm/Atm.ashx`
- **Service**: `FindAtmList`
- **Purpose**: Find branches and ATMs by location

### 3. Banking Campaigns
- **Endpoint**: `POST /Campaign/ENCampaign.ashx`
- **Service**: `GetCampaignListWithLimart`
- **Purpose**: Get current banking campaigns

## Why API Calls Might Fail

The real EnPara API calls might fail for several reasons:

### 1. **Authentication Required**
- EnPara's APIs might require authentication tokens
- Some endpoints might need user session data
- API keys or special headers might be required

### 2. **Rate Limiting**
- EnPara might have rate limits on their API
- Too many requests might get blocked
- IP-based restrictions might apply

### 3. **CORS Issues**
- Browser security might block cross-origin requests
- EnPara might not allow requests from your domain

### 4. **API Changes**
- EnPara might have changed their API structure
- Endpoints might be deprecated or moved
- Request format might have changed

## How to Debug API Issues

### 1. Check Network Requests
```bash
# Test the API directly
curl -X POST https://mobilemwios.enpara.com/Investment/Investment.ashx \
  -H "Content-Type: application/json" \
  -d '{"serviceName": "GetFxDashboardRatePageData", "cleanFxRateToken": true}'
```

### 2. Check Server Logs
```bash
# Your server logs will show the exact error
npm start
# Look for error messages in the console
```

### 3. Test Individual Endpoints
```bash
# Test each endpoint individually
curl https://your-ngrok-url.ngrok-free.dev/exchange-rates
curl https://your-ngrok-url.ngrok-free.dev/branches
curl https://your-ngrok-url.ngrok-free.dev/campaigns
```

## Solutions for Real API Access

### Option 1: Use Mobile App Headers
Add the same headers that the mobile app uses:

```javascript
// In enparaAPI.js, update the headers:
headers: {
  'Content-Type': 'application/json',
  'User-Agent': 'EnPara-Mobile/1.0.0',
  'Accept': 'application/json',
  'X-Requested-With': 'XMLHttpRequest'
}
```

### Option 2: Add Authentication
If EnPara requires authentication:

```javascript
// Add authentication headers
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer YOUR_TOKEN_HERE',
  'X-API-Key': 'YOUR_API_KEY_HERE'
}
```

### Option 3: Use Proxy Server
Create a proxy server that handles authentication:

```javascript
// Create a proxy that adds required headers/tokens
const proxy = axios.create({
  baseURL: 'https://your-proxy-server.com',
  headers: {
    'Authorization': 'Bearer PROXY_TOKEN'
  }
});
```

### Option 4: Reverse Engineer Mobile App
1. Use a tool like Charles Proxy or Fiddler
2. Capture the mobile app's API requests
3. Copy the exact headers and request format
4. Update your MCP server to match

## Testing Real API

### 1. Start Your Server
```bash
cd /Users/omer/EnPara/EnParaMCP
npm start
```

### 2. Test with ngrok
```bash
# In another terminal
ngrok http 3000
```

### 3. Test Endpoints
```bash
# Test exchange rates
curl https://your-ngrok-url.ngrok-free.dev/exchange-rates

# Test branches
curl https://your-ngrok-url.ngrok-free.dev/branches

# Test campaigns
curl https://your-ngrok-url.ngrok-free.dev/campaigns
```

## Fallback Strategy

If real API calls fail, you can:

1. **Use Mock Data**: Keep the mock data as fallback
2. **Cache Real Data**: Store real data when it works
3. **Hybrid Approach**: Use real data when available, mock when not

## Next Steps

1. **Test the current setup** - Your server should now try to fetch real data
2. **Check the logs** - See what errors occur
3. **Debug the issues** - Use the debugging steps above
4. **Implement fixes** - Add authentication, headers, or other requirements
5. **Test again** - Verify real data is being fetched

## Support

If you need help debugging the API issues:
1. Check the server logs for specific error messages
2. Test the API endpoints directly with curl
3. Compare with the mobile app's requests
4. Contact EnPara's API support if needed
