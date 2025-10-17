#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import EnParaAPI from './src/services/enparaAPI.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create MCP server
const server = new Server(
  {
    name: "enpara-banking-assistant",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get-exchange-rates",
        description: "Get current currency exchange rates from EnPara bank including USD, EUR, GBP and other major currencies. Shows both buy and sell rates in Turkish Lira.",
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
            },
            baseCurrency: {
              type: "string",
              enum: ["TRY"],
              description: "Base currency for rates (only TRY supported)",
              default: "TRY"
            }
          },
        },
      },
      {
        name: "get-banking-campaigns",
        description: "View current EnPara banking campaigns, promotions, and special offers including credit cards, loans, savings accounts, and other financial products.",
        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: ["credit-card", "loan", "savings", "investment", "insurance", "all"],
              description: "Campaign category filter",
              default: "all"
            },
            active: {
              type: "boolean",
              description: "Show only active campaigns (default: true)",
              default: true
            }
          },
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
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

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("EnPara Banking MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});

