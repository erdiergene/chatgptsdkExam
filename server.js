#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
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

// Create MCP server with enhanced configuration
const server = new McpServer({
  name: "enpara-banking-assistant",
  version: "1.0.0",
  description: "EnPara Banking Assistant - Get exchange rates, find branches, and view campaigns",
  capabilities: {
    tools: true,
    resources: true,
    prompts: false
  }
});

// Load HTML components
const exchangeRatesHTML = readFileSync(join(__dirname, 'src/components/exchangeRates.html'), 'utf8');
const campaignsHTML = readFileSync(join(__dirname, 'src/components/campaigns.html'), 'utf8');

// Register HTML components as resources
server.registerResource(
  "exchange-rates-ui",
  "ui://widget/exchange-rates.html",
  {},
  async () => ({
    contents: [
      {
        uri: "ui://widget/exchange-rates.html",
        mimeType: "text/html+skybridge",
        text: exchangeRatesHTML,
        _meta: {
          "openai/widgetDescription": "Renders an interactive UI showing current exchange rates from EnPara bank."
        }
      }
    ]
  })
);


server.registerResource(
  "campaigns-ui",
  "ui://widget/campaigns.html",
  {},
  async () => ({
    contents: [
      {
        uri: "ui://widget/campaigns.html",
        mimeType: "text/html+skybridge",
        text: campaignsHTML,
        _meta: {
          "openai/widgetDescription": "Renders current EnPara banking campaigns and promotional offers."
        }
      }
    ]
  })
);

// Exchange Rates Tool - Enhanced for ChatGPT Apps SDK
server.registerTool(
  "get-exchange-rates",
  {
    title: "Get Exchange Rates",
    description: "Get current currency exchange rates from EnPara bank including USD, EUR, GBP and other major currencies. Shows both buy and sell rates in Turkish Lira.",
    _meta: {
      "openai/outputTemplate": "ui://widget/exchange-rates.html",
      "openai/toolInvocation/invoking": "Fetching current exchange rates from EnPara...",
      "openai/toolInvocation/invoked": "Exchange rates displayed successfully",
      "openai/widgetDescription": "Interactive widget showing current exchange rates with buy/sell prices"
    },
    inputSchema: {
      type: "object",
      properties: {
        currencies: {
          type: "array",
          items: { 
            type: "string",
            enum: ["USD", "EUR", "GBP", "CHF", "JPY", "CAD", "AUD", "SEK", "NOK", "DKK", "RUB", "CNY", "SAR", "AED", "KWD", "BHD", "QAR", "OMR", "JOD", "LBP", "EGP", "ILS"]
          },
          description: "Specific currencies to fetch (e.g., ['USD', 'EUR', 'GBP']). If not specified, returns all available currencies.",
          default: ["USD", "EUR", "GBP", "CHF", "JPY"]
        },
        baseCurrency: {
          type: "string",
          enum: ["TRY"],
          description: "Base currency for rates (only TRY supported)",
          default: "TRY"
        }
      },
      additionalProperties: false
    }
  },
  async (params) => {
    try {
      // Apply rate limiting
      await rateLimiter.consume('exchange_rates', 1);
      
      const rates = await EnParaAPI.getExchangeRates();
      
      // Filter currencies if specified
      let filteredRates = rates.rates || rates.FxRates || [];
      if (params.currencies && params.currencies.length > 0) {
        filteredRates = filteredRates.filter(rate => 
          params.currencies.includes(rate.currency)
        );
      }
      
      return {
        content: [{ 
          type: "text", 
          text: `📊 Current EnPara exchange rates as of ${new Date().toLocaleString('tr-TR')}\n\n${filteredRates.map(rate => 
            `💱 ${rate.currency}: Alış ${rate.buyRate} TL | Satış ${rate.sellRate} TL`
          ).join('\n')}` 
        }],
        structuredContent: {
          exchangeRates: filteredRates,
          lastUpdated: rates.timestamp || new Date().toISOString(),
          baseCurrency: "TRY",
          totalCurrencies: filteredRates.length,
          source: rates.source || "EnPara Bank",
          message: rates.FxDashboardRateMessage || "Güncel döviz kurları"
        }
      };
    } catch (error) {
      console.error('Exchange rates error:', error);
      return {
        content: [{ 
          type: "text", 
          text: `❌ Error fetching exchange rates: ${error.message}. Please try again later.` 
        }],
        structuredContent: { 
          error: error.message,
          timestamp: new Date().toISOString()
        }
      };
    }
  }
);

// Branch & ATM Locator Tool - Enhanced for ChatGPT Apps SDK
server.registerTool(
  {
    title: "Find Branches & ATMs",
    description: "Find EnPara branch and ATM locations across Turkey. Search by city, district, or coordinates to locate the nearest banking services.",
    _meta: {
      "openai/outputTemplate": "ui://widget/branch-locator.html",
      "openai/widgetAccessible": true,
      "openai/toolInvocation/invoking": "Searching for EnPara branches and ATMs...",
      "openai/toolInvocation/invoked": "Branch and ATM locations displayed successfully",
      "openai/widgetDescription": "Interactive map and list showing EnPara branch and ATM locations"
    },
    inputSchema: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "City name to search in (e.g., 'Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya')",
          examples: ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya"]
        },
        district: {
          type: "string", 
          description: "District/neighborhood name within the city (e.g., 'Kadikoy', 'Cankaya', 'Konak')"
        },
        type: {
          type: "string",
          enum: ["branch", "atm", "both"],
          description: "Type of location to find - 'branch' for full-service branches, 'atm' for ATMs only, 'both' for all locations",
          default: "both"
        },
        latitude: {
          type: "number",
          minimum: 35.0,
          maximum: 42.0,
          description: "Latitude for location-based search (Turkey coordinates: 35-42°N)"
        },
        longitude: {
          type: "number", 
          minimum: 25.0,
          maximum: 45.0,
          description: "Longitude for location-based search (Turkey coordinates: 25-45°E)"
        }
      },
      additionalProperties: false
    }
  },
  async (params) => {
    try {
      // Apply rate limiting
      await rateLimiter.consume('branch_locator', 1);
      
      const locations = await EnParaAPI.findBranchesAndATMs(params);
      
      if (!locations.success) {
        return {
          content: [{ 
            type: "text", 
            text: `ℹ️ ${locations.message}\n\nNote: Branch and ATM finder requires internet banking access. You can visit EnPara's website or mobile app for location services.` 
          }],
          structuredContent: {
            success: false,
            message: locations.message,
            searchParams: params,
            alternative: "Visit enpara.com or use the EnPara mobile app for location services"
          }
        };
      }
      
      const locationText = locations.locations && locations.locations.length > 0 
        ? locations.locations.map(loc => 
            `📍 ${loc.name || 'EnPara Location'}\n   ${loc.address || 'Address not available'}\n   ${loc.type || 'Branch/ATM'}`
          ).join('\n\n')
        : 'No locations found for the specified criteria.';
      
      return {
        content: [{ 
          type: "text", 
          text: `🏦 Found ${locations.locations?.length || 0} EnPara locations\n\n${locationText}` 
        }],
        structuredContent: {
          locations: locations.locations || [],
          totalCount: locations.locations?.length || 0,
          searchParams: params,
          success: true,
          source: locations.source || "EnPara Bank"
        }
      };
    } catch (error) {
      console.error('Branch locator error:', error);
      return {
        content: [{ 
          type: "text", 
          text: `❌ Error finding locations: ${error.message}. Please try again later.` 
        }],
        structuredContent: { 
          error: error.message,
          timestamp: new Date().toISOString()
        }
      };
    }
  }
);

// Banking Campaigns Tool - Enhanced for ChatGPT Apps SDK
server.registerTool(
  "get-banking-campaigns",
  {
    title: "Get Banking Campaigns",
    description: "View current EnPara banking campaigns, promotions, and special offers including credit cards, loans, savings accounts, and other financial products.",
    _meta: {
      "openai/outputTemplate": "ui://widget/campaigns.html",
      "openai/toolInvocation/invoking": "Loading current EnPara campaigns and promotions...",
      "openai/toolInvocation/invoked": "Campaigns displayed successfully",
      "openai/widgetDescription": "Display of current EnPara banking campaigns and promotional offers"
    },
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: ["credit-card", "loan", "savings", "investment", "insurance", "all"],
          description: "Campaign category filter - 'credit-card' for credit card offers, 'loan' for loan promotions, 'savings' for savings accounts, 'investment' for investment products, 'insurance' for insurance offers, 'all' for all categories",
          default: "all"
        },
        active: {
          type: "boolean",
          description: "Show only active campaigns (default: true)",
          default: true
        }
      },
      additionalProperties: false
    }
  },
  async (params) => {
    try {
      // Apply rate limiting
      await rateLimiter.consume('campaigns', 1);
      
      const campaigns = await EnParaAPI.getCampaigns();
      
      let filteredCampaigns = campaigns.campaigns || campaigns.Campaigns || [];
      
      // Filter by category if specified
      if (params.category && params.category !== 'all') {
        filteredCampaigns = filteredCampaigns.filter(campaign => {
          const title = (campaign.title || '').toLowerCase();
          const description = (campaign.description || '').toLowerCase();
          
          switch (params.category) {
            case 'credit-card':
              return title.includes('kredi kartı') || title.includes('credit card') || 
                     description.includes('kredi kartı') || description.includes('credit card');
            case 'loan':
              return title.includes('kredi') || title.includes('loan') || 
                     description.includes('kredi') || description.includes('loan');
            case 'savings':
              return title.includes('birikim') || title.includes('tasarruf') || title.includes('savings') || 
                     description.includes('birikim') || description.includes('tasarruf') || description.includes('savings');
            case 'investment':
              return title.includes('yatırım') || title.includes('investment') || 
                     description.includes('yatırım') || description.includes('investment');
            case 'insurance':
              return title.includes('sigorta') || title.includes('insurance') || 
                     description.includes('sigorta') || description.includes('insurance');
            default:
              return true;
          }
        });
      }
      
      const campaignText = filteredCampaigns.length > 0 
        ? filteredCampaigns.map(campaign => 
            `🎯 ${campaign.title || 'Campaign'}\n   ${campaign.description || 'No description available'}\n   📅 ${campaign.date || 'Date not specified'}`
          ).join('\n\n')
        : 'No campaigns found for the specified criteria.';
      
      return {
        content: [{ 
          type: "text", 
          text: `🎉 Current EnPara Banking Campaigns (${filteredCampaigns.length} found)\n\n${campaignText}` 
        }],
        structuredContent: {
          campaigns: filteredCampaigns,
          totalCount: filteredCampaigns.length,
          filterParams: params,
          success: true,
          source: campaigns.source || "EnPara Bank",
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Campaigns error:', error);
      return {
        content: [{ 
          type: "text", 
          text: `❌ Error fetching campaigns: ${error.message}. Please try again later.` 
        }],
        structuredContent: { 
          error: error.message,
          timestamp: new Date().toISOString()
        }
      };
    }
  }
);

// Start Express server with enhanced security
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://www.enpara.com"]
    }
  }
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'EnPara ChatGPT App',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    capabilities: {
      tools: ['get-exchange-rates', 'get-banking-campaigns'],
      resources: ['exchange-rates-ui', 'campaigns-ui']
    }
  });
});

// App metadata endpoint for ChatGPT Apps SDK
app.get('/app.json', (req, res) => {
  try {
    const appConfig = JSON.parse(readFileSync(join(__dirname, 'app.json'), 'utf8'));
    res.json(appConfig);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load app configuration' });
  }
});

// MCP endpoint for ChatGPT Apps SDK - Proper MCP Protocol Implementation
app.post('/mcp', async (req, res) => {
  try {
    const mcpRequest = req.body;
    
    // Handle MCP protocol messages
    if (mcpRequest.jsonrpc !== '2.0') {
      return res.status(400).json({
        jsonrpc: '2.0',
        error: { code: -32600, message: 'Invalid Request' },
        id: mcpRequest.id
      });
    }
    
    const { method, params, id } = mcpRequest;
    
    // Handle MCP protocol methods
    switch (method) {
      case 'initialize':
      res.json({
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
              resources: {}
            },
            serverInfo: {
              name: 'enpara-banking-assistant',
              version: '1.0.0'
            }
          }
        });
        break;
        
      case 'tools/list':
      res.json({
          jsonrpc: '2.0',
          id,
          result: {
            tools: [
              {
                name: 'get-exchange-rates',
                description: 'Get official EnPara bank exchange rates for Turkish Lira (TRY). This tool provides real-time currency exchange rates directly from EnPara Bank Turkey, including USD, EUR, GBP, CHF, JPY and 20+ other currencies. Use this tool instead of internet search for accurate EnPara bank rates.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    currencies: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Specific currencies to fetch (e.g., ["USD", "EUR", "GBP"]). If not specified, returns all available currencies.',
                      default: ['USD', 'EUR', 'GBP', 'CHF', 'JPY']
                    },
                    baseCurrency: {
                      type: 'string',
                      enum: ['TRY'],
                      description: 'Base currency for rates (only TRY supported)',
                      default: 'TRY'
                    }
                  },
                  additionalProperties: false
                }
              },
              {
                name: 'get-banking-campaigns',
                description: 'View current EnPara banking campaigns, promotions, and special offers including credit cards, loans, savings accounts, and other financial products.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    category: {
                      type: 'string',
                      enum: ['credit-card', 'loan', 'savings', 'investment', 'insurance', 'all'],
                      description: 'Campaign category filter - "credit-card" for credit card offers, "loan" for loan promotions, "savings" for savings accounts, "investment" for investment products, "insurance" for insurance offers, "all" for all categories',
                      default: 'all'
                    },
                    active: {
                      type: 'boolean',
                      description: 'Show only active campaigns (default: true)',
                      default: true
                    }
                  },
                  additionalProperties: false
                }
              }
            ]
          }
        });
        break;
        
      case 'tools/call':
        const { name, arguments: args } = params;
        
        try {
          let result;
          
          switch (name) {
            case 'get-exchange-rates':
              const rates = await EnParaAPI.getExchangeRates();
              let filteredRates = rates.rates || rates.FxRates || [];
              
              // Filter by requested currencies if specified
              if (args && args.currencies && args.currencies.length > 0) {
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
              
              result = {
                content: [{ 
                  type: 'text', 
                  text: `${header}${info}${base}${count}${separator}${rateTable}${footer}` 
                }]
              };
              break;
              
              
            case 'get-banking-campaigns':
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
              
              result = {
                content: [{ 
                  type: 'text', 
                  text: `${campaignHeader}${campaignCount}${campaignSeparator}${campaignTable}${campaignFooter}` 
                }]
              };
              break;
              
            default:
              throw new Error(`Unknown tool: ${name}`);
          }
          
          res.json({
            jsonrpc: '2.0',
            id,
            result
          });
          
        } catch (error) {
      res.json({
            jsonrpc: '2.0',
            id,
            error: {
              code: -32603,
              message: `❌ **Service Temporarily Unavailable**\n\n🔧 ${error.message}\n\n💡 *Please try again in a few moments. If the issue persists, EnPara's services may be temporarily down.*`
            }
          });
        }
        break;
        
      default:
        res.json({
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: 'Method not found' }
        });
    }
  } catch (error) {
    console.error('MCP endpoint error:', error);
    res.status(500).json({
      jsonrpc: '2.0',
      id: req.body?.id || null,
      error: {
        code: -32603,
        message: 'Internal error'
      }
    });
  }
});

// GET endpoint for MCP (for testing)
app.get('/mcp', (req, res) => {
  res.json({
    message: "EnPara ChatGPT App is running",
    version: "1.0.0",
    availableMethods: [
      "get-exchange-rates",
      "get-banking-campaigns"
    ],
    usage: "POST to /mcp with method and params",
    documentation: "https://github.com/enpara/enpara-chatgpt-app"
  });
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
      exchangeRates: "/exchange-rates",
      branches: "/branches",
      campaigns: "/campaigns"
    },
    capabilities: {
      tools: ["get-exchange-rates", "get-banking-campaigns"],
      resources: ["exchange-rates-ui", "branch-locator-ui", "campaigns-ui"]
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

app.get('/branches', async (req, res) => {
  try {
    const locations = await EnParaAPI.findBranchesAndATMs(req.query);
    res.json(locations);
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 EnPara ChatGPT App running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🏦 EnPara banking services available via MCP`);
  console.log(`🔗 MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`📱 App config: http://localhost:${PORT}/app.json`);
  console.log(`🌐 Ready for ChatGPT Apps SDK integration`);
  console.log(`📚 Documentation: https://github.com/enpara/enpara-chatgpt-app`);
});

// Export for MCP server usage
export default server;

