import axios from 'axios';
import crypto from 'crypto';

/**
 * EnPara API Service
 * Uses the same endpoints as the EnPara mobile application
 */
class EnParaAPI {
  constructor() {
    this.baseURL = process.env.ENPARA_API_URL || 'https://www.enpara.com';
    this.timeout = 10000; // 10 seconds
    
    // Create axios instance with default config
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
      }
    });
  }

  /**
   * Get current exchange rates using public web endpoints
   * Tries multiple possible endpoints for public access
   */
  async getExchangeRates() {
    // Try the correct exchange rates page first
    try {
      console.log('Attempting /hesaplar/doviz-ve-altin-kurlari endpoint for exchange rates...');
      const response = await this.client.get('/hesaplar/doviz-ve-altin-kurlari');
      
      // Parse HTML response to extract exchange rate data
      const htmlContent = response.data;
      const rates = this.parseExchangeRatesFromHTML(htmlContent);
      
      if (rates.length > 0 && this.validateExchangeRates(rates)) {
        console.log(`Successfully parsed ${rates.length} exchange rates from HTML`);
        return {
          success: true,
          rates: rates,
          source: 'enpara.com/hesaplar/doviz-ve-altin-kurlari',
          lastUpdated: new Date().toISOString()
        };
      } else {
        console.log('Parsed rates failed validation');
        throw new Error('Failed to parse valid exchange rates from EnPara website');
      }
    } catch (error) {
      console.log('/hesaplar/doviz-ve-altin-kurlari failed:', error.message);
    }

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
   * Parse exchange rates from HTML response
   */
  parseExchangeRatesFromHTML(htmlContent) {
    const rates = [];
    
    try {
      // Look for the specific EnPara exchange rates table structure
      // Pattern: <div class="enpara-gold-exchange-rates__table-item USD">
      const tableItemPattern = /<div[^>]*class="[^"]*enpara-gold-exchange-rates__table-item[^"]*"[^>]*>[\s\S]*?<\/div>/gi;
      let tableItemMatch;
      
      while ((tableItemMatch = tableItemPattern.exec(htmlContent)) !== null) {
        const itemContent = tableItemMatch[0];
        
        // Extract currency code from the class name or content
        let currency = null;
        const classMatch = itemContent.match(/class="[^"]*enpara-gold-exchange-rates__table-item\s+([A-Z]+)/);
        if (classMatch) {
          currency = classMatch[1];
        } else {
          // Fallback: look for currency in the content
          const currencyMatch = itemContent.match(/\b(USD|EUR|GBP|CHF|JPY|CAD|AUD|SEK|NOK|DKK|RUB|CNY|SAR|AED|KWD|BHD|QAR|OMR|JOD|LBP|EGP|ILS|XAU)\b/i);
          if (currencyMatch) {
            currency = currencyMatch[1].toUpperCase();
          }
        }
        
        if (currency) {
          // Extract buy and sell rates from spans
          const spanPattern = /<span[^>]*>([^<]*)<\/span>/g;
          const spans = [];
          let spanMatch;
          
          while ((spanMatch = spanPattern.exec(itemContent)) !== null) {
            spans.push(spanMatch[1].trim());
          }
          
          // The structure is: [Currency Name, Buy Rate, Sell Rate]
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
      }

      // If we found rates, return them
      if (rates.length > 0) {
        console.log(`Found ${rates.length} exchange rates in HTML`);
        return rates;
      }

      // Fallback: Look for any currency patterns in the HTML
      console.log('No structured exchange rate data found, trying fallback patterns...');
      
      // Look for currency codes followed by rates
      const fallbackPattern = /(USD|EUR|GBP|CHF|JPY|CAD|AUD|SEK|NOK|DKK|RUB|CNY|SAR|AED|KWD|BHD|QAR|OMR|JOD|LBP|EGP|ILS|XAU)[^>]*>[\s\S]*?(\d+[,.]?\d*)[^>]*>[\s\S]*?(\d+[,.]?\d*)/gi;
      let fallbackMatch;
      
      while ((fallbackMatch = fallbackPattern.exec(htmlContent)) !== null) {
        const currency = fallbackMatch[1].toUpperCase();
        const buyRate = fallbackMatch[2].replace(',', '.');
        const sellRate = fallbackMatch[3].replace(',', '.');
        
        const buyNum = parseFloat(buyRate);
        const sellNum = parseFloat(sellRate);
        
        if (buyNum > 0 && sellNum > 0 && sellNum >= buyNum) {
          rates.push({
            currency: currency,
            buyRate: buyRate,
            sellRate: sellRate,
            type: 'exchange_rate',
            source: 'fallback_parsing'
          });
        }
      }

      // If no structured data found, return empty array
      if (rates.length === 0) {
        console.log('No valid exchange rate data found in HTML');
      }
      
      return rates;
      
    } catch (error) {
      console.error('Error parsing exchange rates from HTML:', error);
    }
    
    return rates;
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
   * Tries multiple possible endpoints for public access
   */
  async getCampaigns() {
    try {
      console.log('Attempting /kampanyalar endpoint for campaigns...');
      const response = await this.client.get('/kampanyalar');
      
      // Parse HTML response to extract campaign data
      const htmlContent = response.data;
      const campaigns = this.parseCampaignsFromHTML(htmlContent);
      
      console.log(`Successfully parsed ${campaigns.length} campaigns from HTML`);
      return {
        success: true,
        campaigns: campaigns,
        source: 'enpara.com/kampanyalar'
      };
    } catch (error) {
      console.error('Error fetching campaigns from /kampanyalar:', error.message);
      throw new Error('Failed to fetch campaigns from EnPara API');
    }
  }

  /**
   * Parse campaign data from HTML response
   */
  parseCampaignsFromHTML(htmlContent) {
    const campaigns = [];
    
    try {
      // Extract campaign items using regex patterns
      const campaignItemRegex = /<a[^>]*class="enpara-campaigns__campaign-item"[^>]*href="([^"]*)"[^>]*title="([^"]*)"[^>]*>[\s\S]*?<div class="enpara-campaigns__campaign-title">([^<]*)<\/div>[\s\S]*?<div class="enpara-campaigns__campaign-date">([^<]*)<\/div>/g;
      
      let match;
      while ((match = campaignItemRegex.exec(htmlContent)) !== null) {
        const [, link, title, description, date] = match;
        campaigns.push({
          title: title.trim(),
          description: description.trim(),
          date: date.trim(),
          link: link.trim(),
          type: 'campaign'
        });
      }

      // Also extract the highlight campaign
      const highlightRegex = /<div class="enpara-campaigns__highlight-campaign-title">[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>[\s\S]*?<div class="enpara-campaigns__highlight-campaign-paragraphy"[^>]*>([\s\S]*?)<\/div>[\s\S]*?<div class="enpara-campaigns__campaign-date"[^>]*>([^<]*)<\/div>/;
      const highlightMatch = highlightRegex.exec(htmlContent);
      
      if (highlightMatch) {
        const [, link, title, description, date] = highlightMatch;
        campaigns.unshift({
          title: title.trim(),
          description: description.replace(/<br\s*\/?>/g, ' ').trim(),
          date: date.trim(),
          link: link.trim(),
          type: 'highlight',
          isHighlight: true
        });
      }

    } catch (error) {
      console.error('Error parsing campaigns from HTML:', error);
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
