/**
 * Turkish Localization for EnPara Banking Terms
 * Based on the mobile app's Turkish banking terminology
 */

export const turkishTerms = {
  // Exchange Rates
  "exchange_rates": "Döviz Kurları",
  "buy_rate": "Alış Kuru",
  "sell_rate": "Satış Kuru",
  "last_updated": "Son Güncelleme",
  "currency": "Para Birimi",
  "rate": "Kur",
  "change": "Değişim",
  "percentage": "Yüzde",
  
  // Banking Services
  "banking_services": "Banka Hizmetleri",
  "branch_locations": "Şube Konumları",
  "atm_locations": "ATM Konumları",
  "find_nearest": "En Yakın",
  "search_locations": "Konum Ara",
  "all_locations": "Tüm Konumlar",
  
  // Campaigns
  "banking_campaigns": "Banka Kampanyaları",
  "current_campaigns": "Güncel Kampanyalar",
  "promotions": "Promosyonlar",
  "offers": "Teklifler",
  "valid_until": "Geçerlilik Tarihi",
  "campaign_details": "Kampanya Detayları",
  "terms_conditions": "Şartlar ve Koşullar",
  
  // General Banking
  "enpara": "EnPara",
  "bank": "Banka",
  "account": "Hesap",
  "balance": "Bakiye",
  "transaction": "İşlem",
  "transfer": "Transfer",
  "payment": "Ödeme",
  "investment": "Yatırım",
  "credit_card": "Kredi Kartı",
  "loan": "Kredi",
  "deposit": "Mevduat",
  
  // Location Types
  "branch": "Şube",
  "atm": "ATM",
  "both": "Hepsi",
  "headquarters": "Genel Müdürlük",
  "regional_office": "Bölge Müdürlüğü",
  
  // Services
  "services": "Hizmetler",
  "customer_service": "Müşteri Hizmetleri",
  "online_banking": "İnternet Bankacılığı",
  "mobile_banking": "Mobil Bankacılık",
  "phone_banking": "Telefon Bankacılığı",
  
  // Contact Information
  "contact": "İletişim",
  "phone": "Telefon",
  "address": "Adres",
  "working_hours": "Çalışma Saatleri",
  "email": "E-posta",
  "website": "Web Sitesi",
  
  // Time and Date
  "today": "Bugün",
  "yesterday": "Dün",
  "this_week": "Bu Hafta",
  "this_month": "Bu Ay",
  "this_year": "Bu Yıl",
  
  // Status
  "active": "Aktif",
  "inactive": "Pasif",
  "available": "Mevcut",
  "unavailable": "Mevcut Değil",
  "open": "Açık",
  "closed": "Kapalı",
  
  // Actions
  "search": "Ara",
  "filter": "Filtrele",
  "sort": "Sırala",
  "view": "Görüntüle",
  "details": "Detaylar",
  "more": "Daha Fazla",
  "less": "Daha Az",
  
  // Error Messages
  "error": "Hata",
  "error_occurred": "Bir hata oluştu",
  "try_again": "Tekrar Deneyin",
  "no_data": "Veri Bulunamadı",
  "connection_error": "Bağlantı Hatası",
  "service_unavailable": "Hizmet Kullanılamıyor"
};

/**
 * Format currency for Turkish locale
 */
export function formatCurrency(amount, currency = 'TRY') {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(amount);
}

/**
 * Format date for Turkish locale
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Intl.DateTimeFormat('tr-TR', { ...defaultOptions, ...options }).format(new Date(date));
}

/**
 * Format percentage for Turkish locale
 */
export function formatPercentage(value, decimals = 2) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
}

/**
 * Get Turkish term for English key
 */
export function getTurkishTerm(englishKey) {
  return turkishTerms[englishKey] || englishKey;
}

/**
 * Translate common banking phrases
 */
export const commonPhrases = {
  "welcome_to_enpara": "EnPara'ya Hoş Geldiniz",
  "current_rates": "Güncel Kurlar",
  "find_branch": "Şube Bul",
  "find_atm": "ATM Bul",
  "view_campaigns": "Kampanyaları Görüntüle",
  "banking_services": "Banka Hizmetleri",
  "customer_support": "Müşteri Desteği",
  "online_services": "Online Hizmetler",
  "mobile_app": "Mobil Uygulama",
  "internet_banking": "İnternet Bankacılığı"
};
