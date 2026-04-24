/**
 * Play Store compliance utilities and validations
 */

// Data safety and privacy compliance
export const PRIVACY_SETTINGS = {
  // Required disclosures for Play Store
  DATA_COLLECTION: {
    personalInfo: {
      name: true,
      email: true,
      userIds: true,
    },
    financialInfo: {
      userPaymentInfo: false, // Payments handled by Google Play Billing / RevenueCat
      purchaseHistory: true,
    },
    appActivity: {
      appInteractions: true,
      searchHistory: false,
      installedApps: false,
    },
    webBrowsing: {
      webBrowsingHistory: false,
    },
    location: {
      approximateLocation: false,
      preciseLocation: false,
    },
    deviceIdentifiers: {
      deviceId: true,
    },
    // App ships without ads — no advertising IDs collected or shared.
    advertisingData: {
      advertisingId: false,
      adMeasurement: false,
      adTargeting: false,
    },
  },
  
  // Data sharing
  DATA_SHARING: {
    analytics: true,
    advertising: false, // No AdMob, AdSense, or third-party ad networks
    appFunctionality: true,
    accountManagement: true,
  },

  // Security practices
  SECURITY_PRACTICES: {
    dataEncryptedInTransit: true,
    dataEncryptedAtRest: true,
    userCanRequestDataDeletion: true,
    dataDeletionUrl: 'https://commodity-hub.lovable.app/delete-account',
    followsPlayFamiliesPolicy: true,
  }
};

// Content rating requirements
export const CONTENT_RATING = {
  targetAudience: 'Everyone', // Read-only price data, no trading, no UGC
  contentDescriptors: [
    'digital_purchases', // Premium subscription
  ],
  interactiveElements: [
    'shares_info', // Account email for auth
    'digital_purchases', // In-app subscription
  ]
};

// Required permissions and justifications
export const PERMISSIONS = {
  INTERNET: 'Required to fetch live commodity prices and market data',
};

// Validate app compliance before release
export const validatePlayStoreCompliance = (): {
  isCompliant: boolean;
  issues: string[];
  warnings: string[];
} => {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check required legal pages
  const hasPrivacyPolicy = window.location.pathname === '/privacy-policy' || 
    document.querySelector('a[href="/privacy-policy"]');
  const hasTermsOfService = window.location.pathname === '/terms-of-service' || 
    document.querySelector('a[href="/terms-of-service"]');

  if (!hasPrivacyPolicy) {
    issues.push('Privacy Policy page is required');
  }

  if (!hasTermsOfService) {
    issues.push('Terms of Service page is required');
  }

  // Check app icon requirements
  const iconExists = document.querySelector('link[rel="icon"]');
  if (!iconExists) {
    issues.push('App icon is required');
  }

  // Check manifest.json
  try {
    fetch('/manifest.json')
      .then(response => response.json())
      .then(manifest => {
        if (!manifest.name || manifest.name.length === 0) {
          issues.push('App name is required in manifest');
        }
        if (!manifest.description || manifest.description.length < 50) {
          warnings.push('App description should be at least 50 characters');  
        }
        if (!manifest.icons || manifest.icons.length === 0) {
          issues.push('App icons are required in manifest');
        }
      })
      .catch(() => {
        issues.push('Manifest.json is required');
      });
  } catch (error) {
    issues.push('Failed to validate manifest.json');
  }

  // Check for financial disclaimers
  const hasFinancialDisclaimer = document.querySelector('[data-testid="financial-disclaimer"]') ||
    document.body.textContent?.includes('investment risk') ||
    document.body.textContent?.includes('not financial advice');

  if (!hasFinancialDisclaimer) {
    warnings.push('Consider adding financial/investment disclaimers');
  }

  // Check for error boundaries
  const hasErrorBoundary = document.querySelector('[data-error-boundary]');
  if (!hasErrorBoundary) {
    warnings.push('Consider implementing error boundaries for better crash handling');
  }

  return {
    isCompliant: issues.length === 0,
    issues,
    warnings
  };
};

// Generate Play Store listing metadata
export const generatePlayStoreMetadata = () => {
  return {
    title: "Commodity Hub - Live Prices & Insights",
    shortDescription: "Live commodity prices, charts, and market insights across energy, metals, grains & more",
    fullDescription: `
Commodity Hub is the easiest way to follow live commodity prices and market insights — built for everyone from curious beginners to market professionals.

🚀 KEY FEATURES:
• Real-time market data for major commodities
• Advanced charting and technical analysis tools  
• Manual portfolio and watchlists
• Market news and expert insights
• Price comparison and correlation analysis
• Customizable watchlists and alerts

📊 ANALYTICS TOOLS:
• Interactive price charts with multiple timeframes
• Market correlation analysis
• Economic calendar integration
• Market sentiment tracker

🎯 PREMIUM TIER:
• 60+ specialty commodities (regional crudes, rare metals, specialty softs)
• Advanced data feeds and analytics
• Ad-free experience

💼 WATCHLISTS & PORTFOLIO:
• Track favorite commodities in custom watchlists
• Manual portfolio for personal price tracking
• Performance overview at a glance

⚡ REAL-TIME UPDATES:
• Live market data and price alerts
• Breaking news and market analysis
• Economic indicator releases
• Earnings and supply reports

🔒 SECURITY & PRIVACY:
• Bank-level encryption and security
• Secure cloud infrastructure
• No sharing of personal trading data
• GDPR and privacy compliant

Whether you follow crude oil, gold, agricultural products, or specialty metals, Commodity Hub gives you the prices and insights you need at a glance.

Download now and start tracking the world's commodity markets!

IMPORTANT: Commodity Hub is a market data and information app. It does not provide investment advice and does not allow trade execution. Always consult a qualified financial advisor before making investment decisions.
    `,
    keywords: [
      "commodity prices",
      "price tracker",
      "market data",
      "investment tools",
      "watchlist",
      "commodity analytics",
      "market analysis",
      "financial markets",
      "real-time data",
      "price charts"
    ],
    category: "Finance",
    contentRating: "Teen",
    website: "https://commodity-hub.lovableproject.com",
    email: "support@commodityhub.com",
    privacyPolicy: "https://commodity-hub.lovableproject.com/privacy-policy"
  };
};

// Pre-launch checklist
export const PRE_LAUNCH_CHECKLIST = [
  "✅ Privacy Policy and Terms of Service implemented",
  "✅ App icons created for all required sizes", 
  "✅ Screenshots prepared (phone + tablet)",
  "✅ App description optimized with keywords",
  "✅ Content rating questionnaire completed",
  "✅ Target SDK version updated to latest",
  "✅ Permissions minimized and justified",
  "✅ App bundle optimized and tested",
  "✅ Crash reporting implemented",
  "✅ Analytics and performance monitoring setup",
  "✅ Security review completed",
  "✅ Beta testing with real users",
  "⚠️ Google Play Console account setup",
  "⚠️ App signing key generated and secured",
  "⚠️ Store listing assets prepared",
  "⚠️ Developer program policies reviewed"
];