#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Import EnPara API services
import EnParaAPI from './src/services/enparaAPI.js';
import { turkishTerms } from './src/utils/localization.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Rate limiting configuration
const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'enpara_app',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

// Create MCP server with full capabilities
const mcpServer = new Server(
  {
  name: "enpara-banking-assistant",
  version: "1.0.0",
  },
  {
  capabilities: {
      tools: {},
      resources: {
        subscribe: true,
        listChanged: true
      },
      prompts: {}
    },
  }
);

// Load HTML components
const exchangeRatesHTML = readFileSync(join(__dirname, 'src/components/exchangeRates.html'), 'utf8');
const campaignsHTML = readFileSync(join(__dirname, 'src/components/campaigns.html'), 'utf8');

// Helper formatters used for resource summaries
const createExchangeRateTable = (rates) => {
  if (!rates || rates.length === 0) {
    return '❌ No exchange rates found for the requested currencies.';
  }
  const tableHeader = `| 💱 Currency | 📈 Alış (Buy) | 📉 Satış (Sell) | 📊 Spread | 💰 Profit/Loss |\n|-------------|---------------|----------------|-----------|---------------|\n`;
  const tableRows = rates.map(rate => {
    const currency = String(rate.currency || '').toUpperCase();
    const buyRate = parseFloat(rate.buyRate).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    const sellRate = parseFloat(rate.sellRate).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    const spread = (parseFloat(rate.sellRate) - parseFloat(rate.buyRate)).toFixed(4);
    const spreadPercent = ((parseFloat(spread) / parseFloat(rate.buyRate)) * 100).toFixed(2);
    const currencyFlags = {
      'USD': '🇺🇸', 'EUR': '🇪🇺', 'GBP': '🇬🇧', 'CHF': '🇨🇭', 'JPY': '🇯🇵',
      'CAD': '🇨🇦', 'AUD': '🇦🇺', 'SEK': '🇸🇪', 'NOK': '🇳🇴', 'DKK': '🇩🇰',
      'RUB': '🇷🇺', 'CNY': '🇨🇳', 'SAR': '🇸🇦', 'AED': '🇦🇪', 'KWD': '🇰🇼',
      'BHD': '🇧🇭', 'QAR': '🇶🇦', 'OMR': '🇴🇲', 'JOD': '🇯🇴', 'LBP': '🇱🇧',
      'EGP': '🇪🇬', 'ILS': '🇮🇱', 'TRY': '🇹🇷'
    };
    const flag = currencyFlags[currency] || '🏦';
    const profitLoss = parseFloat(spreadPercent) > 0 ? `+${spreadPercent}%` : `${spreadPercent}%`;
    return `| ${flag} **${currency}** | **${buyRate} TL** | **${sellRate} TL** | ${spread} TL | ${profitLoss} |`;
  }).join('\n');
  return tableHeader + tableRows;
};

const createCampaignTable = (campaigns) => {
  if (!campaigns || campaigns.length === 0) {
    return '❌ No active campaigns found at the moment.';
  }
  const tableHeader = `| # | 🎯 Campaign | 📝 Description | 📅 Valid Until | 🔗 Action |\n|--|------------|----------------|---------------|----------|\n`;
  const tableRows = campaigns.map((campaign, index) => {
    const title = campaign.title || 'Special Campaign';
    const description = campaign.description || 'No description available';
    const date = campaign.date || 'Ongoing';
    const link = campaign.link || 'https://www.enpara.com/kampanyalar';
    const shortDesc = description.length > 50 ? description.substring(0, 47) + '...' : description;
    return `| ${index + 1} | **${title}** | ${shortDesc} | ${date} | [View Details](${link}) |`;
  }).join('\n');
  return tableHeader + tableRows;
};

// ============================================================================
// RESOURCES - MCP Resources for data access
// ============================================================================

mcpServer.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "enpara://exchange-rates/latest",
        name: "Latest Exchange Rates",
        description: "Current exchange rates from EnPara Bank",
        mimeType: "application/json"
      },
      {
        uri: "enpara://exchange-rates/summary",
        name: "Exchange Rates Summary",
        description: "Human-readable summary table for exchange rates (markdown)",
        mimeType: "text/markdown"
      },
      {
        uri: "enpara://exchange-rates/ui",
        name: "Exchange Rates UI",
        description: "Interactive UI widget for exchange rates",
        mimeType: "text/html"
      },
      {
        uri: "enpara://campaigns/latest",
        name: "Latest Campaigns",
        description: "Current banking campaigns and promotions",
        mimeType: "application/json"
      },
      {
        uri: "enpara://campaigns/summary",
        name: "Campaigns Summary",
        description: "Human-readable summary table for campaigns (markdown)",
        mimeType: "text/markdown"
      },
      {
        uri: "enpara://campaigns/ui",
        name: "Campaigns UI",
        description: "Interactive UI widget for campaigns",
        mimeType: "text/html"
      }
    ]
  };
});

mcpServer.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  try {
    if (uri === "enpara://exchange-rates/latest") {
      const rates = await EnParaAPI.getExchangeRates();
      return {
        contents: [
          {
            uri: uri,
            mimeType: "application/json",
            text: JSON.stringify(rates, null, 2)
          }
        ]
      };
    }

    if (uri === "enpara://exchange-rates/ui") {
      return {
        contents: [
          {
            uri: uri,
            mimeType: "text/html",
            text: exchangeRatesHTML
          }
        ]
      };
    }

    if (uri === "enpara://exchange-rates/summary") {
      const rates = await EnParaAPI.getExchangeRates();
      const list = rates.rates || rates.FxRates || [];
      const header = `🏛️ **EnPara Bank Exchange Rates**\n`;
      const info = `📅 **Last Updated:** ${new Date().toLocaleString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}\n`;
      const base = `💱 **Base Currency:** TRY (Turkish Lira)\n`;
      const count = `📊 **Available Currencies:** ${list.length}\n`;
      const separator = `\n${'='.repeat(60)}\n\n`;
      const table = createExchangeRateTable(list);
      const text = `${header}${info}${base}${count}${separator}${table}`;
      return {
        contents: [
          { uri, mimeType: "text/markdown", text }
        ]
      };
    }

    if (uri === "enpara://campaigns/latest") {
      const campaigns = await EnParaAPI.getCampaigns();
      return {
    contents: [
      {
            uri: uri,
            mimeType: "application/json",
            text: JSON.stringify(campaigns, null, 2)
          }
        ]
      };
    }

    if (uri === "enpara://campaigns/ui") {
      return {
        contents: [
          {
            uri: uri,
            mimeType: "text/html",
            text: campaignsHTML
          }
        ]
      };
    }

    if (uri === "enpara://campaigns/summary") {
      const campaigns = await EnParaAPI.getCampaigns();
      const campaignList = campaigns.campaigns || campaigns.Campaigns || [];
      const header = `🎉 **EnPara Banking Campaigns**\n`;
      const count = `📊 **Active Campaigns:** ${campaignList.length}\n`;
      const separator = `\n${'='.repeat(60)}\n\n`;
      const table = createCampaignTable(campaignList);
      const text = `${header}${count}${separator}${table}`;
      return {
        contents: [
          { uri, mimeType: "text/markdown", text }
        ]
      };
    }

    throw new Error(`Unknown resource URI: ${uri}`);
  } catch (error) {
    throw new Error(`Failed to read resource ${uri}: ${error.message}`);
  }
});

// ============================================================================
// TOOLS - MCP Tools for actions
// ============================================================================

mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: [] };
});

mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    await rateLimiter.consume('tool_call', 1);

    if (name === "get-exchange-rates") {
              const rates = await EnParaAPI.getExchangeRates();
              let filteredRates = rates.rates || rates.FxRates || [];
              
              // Filter by requested currencies if specified
      if (args?.currencies && args.currencies.length > 0) {
                filteredRates = filteredRates.filter(rate => 
                  args.currencies.includes(rate.currency)
                );
              }
              
              // Create a beautiful table format for exchange rates
              const createExchangeRateTable = (rates) => {
                if (rates.length === 0) {
                  return '❌ No exchange rates found for the requested currencies.';
                }

                // Table header
                const tableHeader = `| 💱 Currency | 📈 Alış (Buy) | 📉 Satış (Sell) | 📊 Spread | 💰 Profit/Loss |\n|-------------|---------------|----------------|-----------|---------------|\n`;
                
                // Table rows
                const tableRows = rates.map(rate => {
                  const currency = rate.currency.toUpperCase();
                  const buyRate = parseFloat(rate.buyRate).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
                  const sellRate = parseFloat(rate.sellRate).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
                  const spread = (parseFloat(rate.sellRate) - parseFloat(rate.buyRate)).toFixed(4);
                  const spreadPercent = ((parseFloat(spread) / parseFloat(rate.buyRate)) * 100).toFixed(2);
                  
                  // Add currency flag emoji
                  const currencyFlags = {
                    'USD': '🇺🇸', 'EUR': '🇪🇺', 'GBP': '🇬🇧', 'CHF': '🇨🇭', 'JPY': '🇯🇵',
                    'CAD': '🇨🇦', 'AUD': '🇦🇺', 'SEK': '🇸🇪', 'NOK': '🇳🇴', 'DKK': '🇩🇰',
                    'RUB': '🇷🇺', 'CNY': '🇨🇳', 'SAR': '🇸🇦', 'AED': '🇦🇪', 'KWD': '🇰🇼',
                    'BHD': '🇧🇭', 'QAR': '🇶🇦', 'OMR': '🇴🇲', 'JOD': '🇯🇴', 'LBP': '🇱🇧',
                    'EGP': '🇪🇬', 'ILS': '🇮🇱', 'TRY': '🇹🇷'
                  };
                  
                  const flag = currencyFlags[currency] || '🏦';
                  const profitLoss = spreadPercent > 0 ? `+${spreadPercent}%` : `${spreadPercent}%`;
                  
                  return `| ${flag} **${currency}** | **${buyRate} TL** | **${sellRate} TL** | ${spread} TL | ${profitLoss} |`;
                }).join('\n');
                
                return tableHeader + tableRows;
              };
              
              const rateTable = createExchangeRateTable(filteredRates);
              
              // Enhanced header with more visual elements
              const header = `🏛️ **EnPara Bank Exchange Rates**\n`;
              const info = `📅 **Last Updated:** ${new Date().toLocaleString('tr-TR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}\n`;
              const base = `💱 **Base Currency:** TRY (Turkish Lira)\n`;
              const count = `📊 **Available Currencies:** ${filteredRates.length}\n`;
              const separator = `\n${'='.repeat(60)}\n\n`;
              
              // Add helpful links and additional info
              const footer = `\n\n🔗 **Useful Links:**\n` +
                `• [EnPara Official Website](https://www.enpara.com)\n` +
                `• [📱 iOS App Store](https://apps.apple.com/tr/app/enpara-bank-cep-şube/id6711348553)\n` +
                `• [🤖 Google Play Store](https://play.google.com/store/apps/details?id=com.enparabank.retail)\n` +
                `• [💱 Exchange Rates Page](https://www.enpara.com/hesaplar/doviz-ve-altin-kurlari)\n\n` +
                `💡 **Tips:**\n` +
                `• Rates are updated in real-time from EnPara Bank\n` +
                `• Spread shows the difference between buy and sell rates\n` +
                `• Profit/Loss percentage indicates trading margin\n` +
                `• Use these rates for currency exchange planning`;
              
      return {
        content: [
          {
            type: "text",
            text: `${header}${info}${base}${count}${separator}${rateTable}${footer}`,
          },
        ],
      };
      
    } else if (name === "get-banking-campaigns") {
      const campaigns = await EnParaAPI.getCampaigns();
              const campaignList = campaigns.campaigns || campaigns.Campaigns || [];
              
              const createCampaignTable = (campaigns) => {
                if (!campaigns || campaigns.length === 0) {
                  return '❌ No active campaigns found at the moment.';
                }

                // Table header
                const tableHeader = `| # | 🎯 Campaign | 📝 Description | 📅 Valid Until | 🔗 Action |\n|--|------------|----------------|---------------|----------|\n`;
                
                // Table rows
                const tableRows = campaigns.map((campaign, index) => {
                  const title = campaign.title || 'Special Campaign';
                  const description = campaign.description || 'No description available';
                  const date = campaign.date || 'Ongoing';
                  const link = campaign.link || 'https://www.enpara.com/kampanyalar';
                  
                  // Truncate long descriptions
                  const shortDesc = description.length > 50 ? description.substring(0, 47) + '...' : description;
                  
                  return `| ${index + 1} | **${title}** | ${shortDesc} | ${date} | [View Details](${link}) |`;
                }).join('\n');
                
                return tableHeader + tableRows;
              };
              
              const campaignTable = createCampaignTable(campaignList);
              
              const campaignHeader = `🎉 **EnPara Banking Campaigns**\n`;
              const campaignCount = `📊 **Active Campaigns:** ${campaignList.length}\n`;
              const campaignSeparator = `\n${'='.repeat(60)}\n\n`;
              
              const campaignFooter = `\n\n🔗 **Useful Links:**\n` +
                `• [📱 iOS App Store](https://apps.apple.com/tr/app/enpara-bank-cep-şube/id6711348553)\n` +
                `• [🤖 Google Play Store](https://play.google.com/store/apps/details?id=com.enparabank.retail)\n` +
                `• [🎯 All Campaigns](https://www.enpara.com/kampanyalar)\n` +
                `• [💳 Credit Cards](https://www.enpara.com/kredi-karti)\n` +
                `• [💰 Loans](https://www.enpara.com/kredi)\n\n` +
                `💡 **Tips:**\n` +
                `• Campaigns are updated regularly\n` +
                `• Terms and conditions apply to all offers\n` +
                `• Contact EnPara for detailed information\n` +
                `• Some campaigns may have limited availability`;
              
      return {
        content: [
          {
            type: "text",
            text: `${campaignHeader}${campaignCount}${campaignSeparator}${campaignTable}${campaignFooter}`,
          },
        ],
      };
      
    } else {
              throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `❌ **Service Temporarily Unavailable**\n\n🔧 ${error.message}\n\n💡 *Please try again in a few moments. If the issue persists, EnPara's services may be temporarily down.*`,
        },
      ],
      isError: true,
    };
  }
});

// ============================================================================
// PROMPTS - MCP Prompts for common queries
// ============================================================================

mcpServer.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "check-exchange-rate",
        description: "Check current exchange rate for a specific currency",
        arguments: [
          {
            name: "currency",
            description: "Currency code (e.g., USD, EUR, GBP)",
            required: true
          }
        ]
      },
      {
        name: "compare-currencies",
        description: "Compare exchange rates between multiple currencies",
        arguments: [
          {
            name: "currencies",
            description: "Comma-separated currency codes (e.g., USD,EUR,GBP)",
            required: true
          }
        ]
      },
      {
        name: "find-campaigns",
        description: "Find banking campaigns by category",
        arguments: [
          {
            name: "category",
            description: "Campaign category (credit-card, loan, savings, etc.)",
            required: false
          }
        ]
      }
    ]
  };
});

mcpServer.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "check-exchange-rate") {
    const currency = args?.currency || "USD";
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `What is the current exchange rate for ${currency} to TRY at EnPara Bank?`
          }
        }
      ]
    };
  }

  if (name === "compare-currencies") {
    const currencies = args?.currencies || "USD,EUR,GBP";
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Compare the exchange rates for ${currencies} at EnPara Bank and show me which one has the best rate.`
          }
        }
      ]
    };
  }

  if (name === "find-campaigns") {
    const category = args?.category || "all";
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Show me current EnPara banking campaigns${category !== 'all' ? ` in the ${category} category` : ''}.`
          }
        }
      ]
    };
  }

  throw new Error(`Unknown prompt: ${name}`);
});

// ============================================================================
// EXPRESS SERVER - HTTP endpoints for ChatGPT Apps SDK
// ============================================================================

const app = express();

// Store active SSE transports by session ID for routing POST messages
const transports = {};

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      // Allow ChatGPT to establish SSE/fetch to this server from its origins
      connectSrc: ["'self'", "https:", "wss:"]
    }
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://chat.openai.com', 'https://chatgpt.com'] 
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting middleware
const rateLimitMiddleware = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip, 1);
    next();
  } catch (rejRes) {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 1
    });
  }
};

app.use(rateLimitMiddleware);

// Fast CORS preflight for critical endpoints
app.options('/mcp', (req, res) => res.sendStatus(204));
app.options('/mcp/messages', (req, res) => res.sendStatus(204));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy', 
    service: 'EnPara ChatGPT App',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    capabilities: {
      tools: ['get-exchange-rates', 'get-banking-campaigns'],
      resources: ['exchange-rates', 'campaigns'],
      prompts: ['check-exchange-rate', 'compare-currencies', 'find-campaigns']
    }
  });
});

// App metadata endpoint for ChatGPT Apps SDK
app.get('/app.json', (req, res) => {
  try {
    const appConfig = JSON.parse(readFileSync(join(__dirname, 'app.json'), 'utf8'));
    res.set('Cache-Control', 'no-store');
    res.json(appConfig);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load app configuration' });
  }
});

// MCP endpoint for ChatGPT Apps SDK (OpenAI standard)
app.get('/mcp', async (req, res) => {
  console.log('MCP connection established');
  
  // Establish SSE transport and advertise POST endpoint with sessionId query param (handled by SDK)
  const transport = new SSEServerTransport('/mcp/messages', res);
  const sessionId = transport.sessionId;
  transports[sessionId] = transport;
  transport.onclose = () => {
    delete transports[sessionId];
  };
  await mcpServer.connect(transport);
});

// JSON-RPC messages will be POSTed here with ?sessionId=...
app.post('/mcp/messages', async (req, res) => {
  const sessionId = req.query.sessionId;
  if (!sessionId) {
    res.status(400).send('Missing sessionId parameter');
    return;
  }
  const transport = transports[sessionId];
  if (!transport) {
    res.status(404).send('Session not found');
    return;
  }
  try {
    await transport.handlePostMessage(req, res, req.body);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).send('Error handling request');
    }
  }
});

// Legacy /mcp/sse endpoint (redirect to /mcp)
app.get('/mcp/sse', async (req, res) => {
  console.log('SSE connection established (legacy endpoint)');
  
  const transport = new SSEServerTransport('/mcp/messages', res);
  const sessionId = transport.sessionId;
  transports[sessionId] = transport;
  transport.onclose = () => {
    delete transports[sessionId];
  };
  await mcpServer.connect(transport);
});

app.post('/mcp/message', async (req, res) => {
  res.status(200).end();
});

// Middleware to bypass ngrok warning page
app.use((req, res, next) => {
  // Add header to skip ngrok browser warning
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: "EnPara Banking Assistant",
    description: "Get real-time exchange rates, find branches and ATMs, and view current banking campaigns from EnPara Bank in Turkey.",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      appConfig: "/app.json",
      mcp: "/mcp",
      mcpSSE: "/mcp/sse",
      exchangeRates: "/exchange-rates",
      campaigns: "/campaigns"
    },
    capabilities: {
      tools: ["get-exchange-rates", "get-banking-campaigns"],
      resources: ["exchange-rates", "campaigns"],
      prompts: ["check-exchange-rate", "compare-currencies", "find-campaigns"]
    }
  });
});

// Direct API endpoints for testing
app.get('/exchange-rates', async (req, res) => {
  try {
    const rates = await EnParaAPI.getExchangeRates();
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await EnParaAPI.getCampaigns();
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static files
app.use('/public', express.static(join(__dirname, 'public')));

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = process.env.PORT || 3000;
const MODE = process.env.MCP_MODE || 'http'; // 'http' or 'stdio'

if (MODE === 'stdio') {
  // STDIO mode for local MCP clients (Cursor, Claude Desktop)
  console.error('Starting MCP server in STDIO mode...');
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
  console.error('EnPara Banking MCP Server running on stdio');
} else {
  // HTTP mode for ChatGPT Apps SDK
app.listen(PORT, () => {
  console.log(`🚀 EnPara ChatGPT App running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🏦 EnPara banking services available via MCP`);
  console.log(`🔗 MCP SSE endpoint: http://localhost:${PORT}/mcp`);
  console.log(`📮 MCP POST endpoint: http://localhost:${PORT}/mcp/messages`);
  console.log(`📱 App config: http://localhost:${PORT}/app.json`);
  console.log(`🌐 Ready for ChatGPT Apps SDK integration`);
  console.log(`📚 Documentation: https://github.com/enpara/enpara-chatgpt-app`);
});
}

// Export for MCP server usage
export default mcpServer;
