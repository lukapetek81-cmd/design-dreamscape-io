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
      userPaymentInfo: false, // We don't store payment info
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
    }
  },
  
  // Data sharing
  DATA_SHARING: {
    analytics: true,
    advertising: false,
    appFunctionality: true,
    accountManagement: true,
  },

  // Security practices
  SECURITY_PRACTICES: {
    dataEncryptedInTransit: true,
    dataEncryptedAtRest: true,
    userCanRequestDataDeletion: true,
    followsPlayFamiliesPolicy: true,
  }
};

// Content rating requirements
export const CONTENT_RATING = {
  targetAudience: 'Teen', // 13+ due to financial content
  contentDescriptors: [
    'simulated_gambling', // Trading simulations
    'digital_purchases', // Premium features
    'user_generated_content', // Community features
  ],
  interactiveElements: [
    'shares_info', // Data sharing
    'users_interact_online', // Community features
    'digital_purchases', // In-app purchases
  ]
};

// Required permissions and justifications
export const PERMISSIONS = {
  INTERNET: 'Required for real-time market data and trading functionality',
  ACCESS_NETWORK_STATE: 'Check network connectivity for offline mode',
  WAKE_LOCK: 'Keep screen on during active trading sessions',
  VIBRATE: 'Haptic feedback for mobile interactions',
  CAMERA: 'QR code scanning for quick setup (optional)',
  NOTIFICATIONS: 'Market alerts and price notifications',
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
    title: "Commodity Hub - Trading Analytics",
    shortDescription: "Professional commodity trading platform with real-time data and analytics",
    fullDescription: `
Commodity Hub is a comprehensive trading platform designed for serious commodity traders and investors. 

🚀 KEY FEATURES:
• Real-time market data for major commodities
• Advanced charting and technical analysis tools  
• Portfolio tracking and risk management
• Market news and expert insights
• Price comparison and correlation analysis
• Customizable watchlists and alerts

📊 TRADING TOOLS:
• Interactive price charts with multiple timeframes
• Technical indicators and drawing tools
• Market correlation analysis
• Economic calendar integration
• Risk calculator and position sizing

🎯 FOR PROFESSIONALS:
• Premium data feeds and advanced analytics
• IBKR integration for direct trading (coming soon)
• Institutional-grade security and encryption
• Comprehensive market screening tools

💼 PORTFOLIO MANAGEMENT:
• Track your commodity investments
• Performance analytics and reporting  
• Risk assessment and diversification tools
• Historical backtesting capabilities

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

Whether you're trading crude oil, gold, agricultural products, or other commodities, Commodity Hub provides the tools and insights you need to make informed decisions.

Download now and start your professional trading journey!

IMPORTANT: Trading commodities involves substantial risk of loss. This app provides information and tools but not investment advice. Always consult with qualified financial advisors.
    `,
    keywords: [
      "commodity trading",
      "trading platform", 
      "market data",
      "investment tools",
      "portfolio tracker",
      "trading analytics",
      "market analysis",
      "financial markets",
      "real-time data",
      "trading charts"
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