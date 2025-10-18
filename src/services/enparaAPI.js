import axios from 'axios';
import crypto from 'crypto';
import { load } from 'cheerio';
import NodeCache from 'node-cache';
import http from 'http';
import https from 'https';

/**
 * EnPara API Service
 * Uses the same endpoints as the EnPara mobile application
 * Enhanced with Cheerio parsing, caching, and retry logic
 */
class EnParaAPI {
  constructor() {
    this.baseURL = process.env.ENPARA_API_URL || 'https://www.enpara.com';
    this.timeout = 10000; // 10 seconds
    
    // Initialize cache (5 minutes TTL)
    this.cache = new NodeCache({ 
      stdTTL: 300,
      checkperiod: 60,
      useClones: false
    });
    
    // Create axios instance with connection pooling
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'EnPara-Mobile/1.0.0',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br'
      },
      httpAgent: new http.Agent({ 
        keepAlive: true,
        maxSockets: 50,
        maxFreeSockets: 10,
        timeout: 60000
      }),
      httpsAgent: new https.Agent({ 
        keepAlive: true,
        maxSockets: 50,
        maxFreeSockets: 10,
        timeout: 60000
      })
    });
  }

  /**
   * Retry logic with exponential backoff
   */
  async fetchWithRetry(fn, maxRetries = 3, baseDelay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        
        const delay = baseDelay * Math.pow(2, i);
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Get current exchange rates using public web endpoints
   * Enhanced with caching and retry logic
   */
  async getExchangeRates() {
    // Check cache first
    const cached = this.cache.get('exchange_rates');
    if (cached) {
      console.log('Returning cached exchange rates');
      return cached;
    }

    // Fetch with retry logic
    return this.fetchWithRetry(async () => {
      try {
        console.log('Fetching exchange rates from /hesaplar/doviz-ve-altin-kurlari...');
        const response = await this.client.get('/hesaplar/doviz-ve-altin-kurlari');
        
        // Parse HTML response with Cheerio
        const rates = this.parseExchangeRatesWithCheerio(response.data);
        
        if (rates.length > 0 && this.validateExchangeRates(rates)) {
          console.log(`Successfully parsed ${rates.length} exchange rates`);
          
          const result = {
            success: true,
            rates: rates,
            source: 'enpara.com/hesaplar/doviz-ve-altin-kurlari',
            lastUpdated: new Date().toISOString(),
            cached: false
          };
          
          // Cache the result
          this.cache.set('exchange_rates', result);
          
          return result;
        } else {
          throw new Error('Failed to parse valid exchange rates');
        }
      } catch (error) {
        console.error('Exchange rates fetch failed:', error.message);
        throw error;
      }
    });

    // Try other possible endpoints
    const endpoints = [
      { url: '/oranlar-ve-kurlar', method: 'GET' },
      { url: '/doviz-kurlari', method: 'GET' },
      { url: '/doviz', method: 'GET' },
      { url: '/kur', method: 'GET' },
      { url: '/api/doviz-kurlari', method: 'GET' },
      { url: '/api/doviz', method: 'GET' },
      { url: '/api/kur', method: 'GET' }
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Attempting ${endpoint.method} ${endpoint.url} for exchange rates...`);
        const response = endpoint.method === 'GET' 
          ? await this.client.get(endpoint.url)
          : await this.client.post(endpoint.url, endpoint.data || {});
        
        console.log(`${endpoint.url} response:`, response.data);
        
        // If it's HTML content, try to parse it
        if (typeof response.data === 'string' && response.data.includes('<html')) {
          const rates = this.parseExchangeRatesFromHTML(response.data);
          if (rates.length > 0) {
            return {
              success: true,
              rates: rates,
              source: `enpara.com${endpoint.url}`
            };
          }
        }
        
        return response.data;
      } catch (error) {
        console.log(`${endpoint.url} failed:`, error.message);
        continue;
      }
    }

    // If all public endpoints fail, try the mobile endpoint as fallback
    try {
      console.log('Attempting mobile app endpoint as fallback...');
      const requestData = {
        serviceName: "GetFxDashboardRatePageData",
        cleanFxRateToken: true
      };

      const response = await this.client.post('/Investment/Investment.ashx', requestData);
      console.log('Mobile app endpoint response:', response.data);
      return response.data;
    } catch (error) {
      console.error('All exchange rate endpoints failed:', error.message);
      throw new Error('EnPara exchange rates are currently unavailable. Please try again later.');
    }
  }

  /**
   * Validate exchange rates to ensure they are realistic
   */
  validateExchangeRates(rates) {
    if (!rates || rates.length === 0) return false;
    
    // Check for unrealistic rates (like the 114,158,997 ILS rate)
    for (const rate of rates) {
      const buyRate = parseFloat(rate.buyRate);
      const sellRate = parseFloat(rate.sellRate);
      
      // Check for unrealistic values
      if (buyRate > 1000 || sellRate > 1000 || buyRate < 0.001 || sellRate < 0.001) {
        console.log(`Invalid rate detected: ${rate.currency} - Buy: ${rate.buyRate}, Sell: ${rate.sellRate}`);
        return false;
      }
      
      // Check for missing currency codes
      if (!rate.currency || rate.currency.length < 3) {
        console.log(`Invalid currency code: ${rate.currency}`);
        return false;
      }
    }
    
    return true;
  }


  /**
   * Parse exchange rates from HTML using Cheerio (modern approach)
   */
  parseExchangeRatesWithCheerio(htmlContent) {
    const rates = [];
    
    try {
      const $ = load(htmlContent);
      
      // Find all exchange rate table items
      $('.enpara-gold-exchange-rates__table-item').each((index, element) => {
        const $item = $(element);
        
        // Extract currency code from class name
        const classes = $item.attr('class') || '';
        const currencyMatch = classes.match(/\b(USD|EUR|GBP|CHF|JPY|CAD|AUD|SEK|NOK|DKK|RUB|CNY|SAR|AED|KWD|BHD|QAR|OMR|JOD|LBP|EGP|ILS|XAU)\b/i);
        
        if (currencyMatch) {
          const currency = currencyMatch[1].toUpperCase();
          
          // Extract all span values
          const spans = [];
          $item.find('span').each((i, span) => {
            const text = $(span).text().trim();
            if (text) spans.push(text);
          });
          
          // Structure: [Currency Name, Buy Rate, Sell Rate]
          if (spans.length >= 3) {
            const buyRateText = spans[1].replace(/[^\d,.]/g, '').replace(',', '.');
            const sellRateText = spans[2].replace(/[^\d,.]/g, '').replace(',', '.');
            
            const buyRate = parseFloat(buyRateText);
            const sellRate = parseFloat(sellRateText);
            
            // Validate rates
            if (buyRate > 0 && sellRate > 0 && sellRate >= buyRate) {
              rates.push({
                currency: currency,
                buyRate: buyRateText,
                sellRate: sellRateText,
                type: 'exchange_rate',
                source: 'enpara_website'
              });
            }
          }
        }
      });

      if (rates.length > 0) {
        console.log(`Cheerio parsed ${rates.length} exchange rates successfully`);
        return rates;
      }

      // Fallback: Try alternative selectors
      console.log('Trying alternative selectors...');
      
      $('[class*="exchange-rate"], [class*="currency-item"], [class*="rate-item"]').each((index, element) => {
        const $item = $(element);
        const text = $item.text();
        
        // Look for currency patterns
        const currencyMatch = text.match(/\b(USD|EUR|GBP|CHF|JPY|CAD|AUD|SEK|NOK|DKK|RUB|CNY|SAR|AED|KWD|BHD|QAR|OMR|JOD|LBP|EGP|ILS|XAU)\b/i);
        if (currencyMatch) {
          const currency = currencyMatch[1].toUpperCase();
          
          // Extract numbers
          const numbers = text.match(/\d+[,.]\d+/g);
          if (numbers && numbers.length >= 2) {
            const buyRate = numbers[0].replace(',', '.');
            const sellRate = numbers[1].replace(',', '.');
            
            const buyNum = parseFloat(buyRate);
            const sellNum = parseFloat(sellRate);
            
            if (buyNum > 0 && sellNum > 0 && sellNum >= buyNum) {
              rates.push({
                currency: currency,
                buyRate: buyRate,
                sellRate: sellRate,
                type: 'exchange_rate',
                source: 'cheerio_fallback'
              });
            }
          }
        }
      });

      if (rates.length === 0) {
        console.log('No valid exchange rate data found with Cheerio');
      }
      
      return rates;
      
    } catch (error) {
      console.error('Error parsing exchange rates with Cheerio:', error);
      return [];
    }
  }

  /**
   * Get all investment rates using mobile app endpoint
   * Uses: Investment/Investment.ashx -> GetAllInvestmentRates
   */
  async getAllInvestmentRates() {
    try {
      const response = await this.client.post('/Investment/Investment.ashx', {
        serviceName: "GetAllInvestmentRates",
        cleanFxRateToken: true
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching investment rates:', error.message);
      throw new Error('Failed to fetch investment rates from EnPara API');
    }
  }


  /**
   * Get banking campaigns using public web endpoints
   * Enhanced with caching and retry logic
   */
  async getCampaigns() {
    // Check cache first
    const cached = this.cache.get('campaigns');
    if (cached) {
      console.log('Returning cached campaigns');
      return cached;
    }

    // Fetch with retry logic
    return this.fetchWithRetry(async () => {
      try {
        console.log('Fetching campaigns from /kampanyalar...');
        const response = await this.client.get('/kampanyalar');
        
        // Parse HTML response with Cheerio
        const campaigns = this.parseCampaignsWithCheerio(response.data);
        
        console.log(`Successfully parsed ${campaigns.length} campaigns`);
        
        const result = {
          success: true,
          campaigns: campaigns,
          source: 'enpara.com/kampanyalar',
          lastUpdated: new Date().toISOString(),
          cached: false
        };
        
        // Cache the result
        this.cache.set('campaigns', result);
        
        return result;
      } catch (error) {
        console.error('Campaigns fetch failed:', error.message);
        throw new Error('Failed to fetch campaigns from EnPara API');
      }
    });
  }

  /**
   * Parse campaign data from HTML using Cheerio (modern approach)
   */
  parseCampaignsWithCheerio(htmlContent) {
    const campaigns = [];
    
    try {
      const $ = load(htmlContent);
      
      // Extract highlight campaign first
      const $highlight = $('.enpara-campaigns__highlight-campaign');
      if ($highlight.length > 0) {
        const title = $highlight.find('.enpara-campaigns__highlight-campaign-title a').text().trim();
        const link = $highlight.find('.enpara-campaigns__highlight-campaign-title a').attr('href') || '';
        const description = $highlight.find('.enpara-campaigns__highlight-campaign-paragraphy').text().trim();
        const date = $highlight.find('.enpara-campaigns__campaign-date').text().trim();
        
        if (title) {
          campaigns.push({
            title: title,
            description: description,
            date: date,
            link: link.startsWith('http') ? link : `https://www.enpara.com${link}`,
            type: 'highlight',
            isHighlight: true
          });
        }
      }
      
      // Extract regular campaign items
      $('.enpara-campaigns__campaign-item').each((index, element) => {
        const $item = $(element);
        
        const title = $item.attr('title') || $item.find('.enpara-campaigns__campaign-title').text().trim();
        const link = $item.attr('href') || '';
        const description = $item.find('.enpara-campaigns__campaign-title').text().trim();
        const date = $item.find('.enpara-campaigns__campaign-date').text().trim();
        
        if (title) {
          campaigns.push({
            title: title,
            description: description || title,
            date: date,
            link: link.startsWith('http') ? link : `https://www.enpara.com${link}`,
            type: 'campaign'
          });
        }
      });

      // Fallback: Try alternative selectors
      if (campaigns.length === 0) {
        console.log('Trying alternative campaign selectors...');
        
        $('[class*="campaign-item"], [class*="campaign-card"]').each((index, element) => {
          const $item = $(element);
          const title = $item.find('[class*="title"]').first().text().trim();
          const link = $item.find('a').first().attr('href') || '';
          const description = $item.find('[class*="description"], [class*="text"]').first().text().trim();
          const date = $item.find('[class*="date"]').first().text().trim();
          
          if (title) {
            campaigns.push({
              title: title,
              description: description || title,
              date: date,
              link: link.startsWith('http') ? link : `https://www.enpara.com${link}`,
              type: 'campaign'
            });
          }
        });
      }

      console.log(`Cheerio parsed ${campaigns.length} campaigns successfully`);
      
    } catch (error) {
      console.error('Error parsing campaigns with Cheerio:', error);
    }
    
    return campaigns;
  }

  /**
   * Get dashboard campaigns using mobile app endpoint
   * Uses: Dashboard/Dashboard.ashx -> GetDashboardCampaigns
   */
  async getDashboardCampaigns() {
    try {
      const response = await this.client.post('/Dashboard/Dashboard.ashx', {
        serviceName: "GetDashboardCampaigns",
        deviceType: 1, // iOS device type
        customerUserCode: null,
        customerUserOID: null
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard campaigns:', error.message);
      throw new Error('Failed to fetch dashboard campaigns from EnPara API');
    }
  }

  /**
   * Get city list using mobile app endpoint
   * Uses: General/GeneralData.ashx -> GetCityList
   */
  async getCityList() {
    try {
      const response = await this.client.post('/General/GeneralData.ashx', {
        serviceName: "GetCityList"
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching city list:', error.message);
      throw new Error('Failed to fetch city list from EnPara API');
    }
  }

  /**
   * Get bank list using mobile app endpoint
   * Uses: General/GeneralData.ashx -> GetBankList
   */
  async getBankList() {
    try {
      const response = await this.client.post('/General/GeneralData.ashx', {
        serviceName: "GetBankList"
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching bank list:', error.message);
      throw new Error('Failed to fetch bank list from EnPara API');
    }
  }

  /**
   * Get branch list by city using mobile app endpoint
   * Uses: General/GeneralData.ashx -> GetBranchListByCity
   */
  async getBranchListByCity(bankCode, cityCode) {
    try {
      const response = await this.client.post('/General/GeneralData.ashx', {
        serviceName: "GetBranchListByCity",
        bankCode: bankCode,
        cityCode: cityCode
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching branch list:', error.message);
      throw new Error('Failed to fetch branch list from EnPara API');
    }
  }

  /**
   * Health check for API connectivity
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/health', { timeout: 5000 });
      return { status: 'healthy', response: response.data };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  /**
   * Generate UUID like mobile app
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Generate request integrity token like mobile app
   * Simplified version of the mobile app's hash generation
   */
  generateRequestToken(params, correlationId) {
    try {
      const jsonString = JSON.stringify(params);
      const saltedJsonString = `+${jsonString}&<${correlationId}>!`;
      const hash = crypto.createHash('sha256').update(saltedJsonString).digest('base64');
      return hash;
    } catch (error) {
      console.error('Error generating request token:', error);
      return 'fallback-token';
    }
  }
}

export default new EnParaAPI();
