/**
 * Shawn Exchange System Constants
 */

export const SETTLEMENT_ACCOUNT = {
  accountNumber: "1963718221",
  bankName: "Access Bank",
  accountName: "Jesse Anietimfon Nicholas",
  description: "Official settlement account for all Naira payouts."
};

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  AWAITING_PAYMENT: 'awaiting_payment',
  PROCESSING: 'processing',
  PAID: 'paid',
  FAILED: 'failed'
};

export const TRANSACTION_TYPES = {
  SELL_CRYPTO: 'sell_crypto',
  SELL_GIFTCARD: 'sell_giftcard',
  BUY_CRYPTO: 'buy_crypto',
  BUY_GIFTCARD: 'buy_giftcard',
  WITHDRAWAL: 'withdrawal',
  DEPOSIT: 'deposit'
};

export const RATE_LOCK_TIME = 10 * 60; // 10 minutes in seconds

export const NIGERIAN_BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "Access Bank (Diamond)", code: "063" },
  { name: "ALAT by WEMA", code: "035A" },
  { name: "ASO Savings and Loans", code: "401" },
  { name: "Bowen Microfinance Bank", code: "50931" },
  { name: "Carbon", code: "565" },
  { name: "CEMCS Microfinance Bank", code: "50823" },
  { name: "Citibank Nigeria", code: "023" },
  { name: "Ecobank Nigeria", code: "050" },
  { name: "Ekondo Microfinance Bank", code: "562" },
  { name: "Eyowo", code: "50126" },
  { name: "Fidelity Bank", code: "070" },
  { name: "First Bank of Nigeria", code: "011" },
  { name: "First City Monument Bank", code: "214" },
  { name: "Globus Bank", code: "00103" },
  { name: "Guaranty Trust Bank", code: "058" },
  { name: "Hasal Microfinance Bank", code: "50383" },
  { name: "Heritage Bank", code: "030" },
  { name: "Jaiz Bank", code: "301" },
  { name: "Keystone Bank", code: "082" },
  { name: "Kuda Bank", code: "50211" },
  { name: "Lagos Building Investment Company PLC", code: "090271" },
  { name: "Mayfair Microfinance Bank", code: "50563" },
  { name: "Mint MFB", code: "50304" },
  { name: "Opay", code: "999992" },
  { name: "PalmPay", code: "999991" },
  { name: "Parallex Bank", code: "526" },
  { name: "Parkway - ReadyCash", code: "311" },
  { name: "Paycom", code: "305" },
  { name: "Polaris Bank", code: "076" },
  { name: "Providus Bank", code: "101" },
  { name: "Rubies MFB", code: "125" },
  { name: "Sparkle Microfinance Bank", code: "51310" },
  { name: "Stanbic IBTC Bank", code: "221" },
  { name: "Standard Chartered Bank", code: "068" },
  { name: "Sterling Bank", code: "232" },
  { name: "Suntrust Bank", code: "100" },
  { name: "TAJ Bank", code: "302" },
  { name: "TCF MFB", code: "51211" },
  { name: "Titan Bank", code: "102" },
  { name: "Union Bank of Nigeria", code: "032" },
  { name: "United Bank For Africa", code: "033" },
  { name: "Unity Bank", code: "215" },
  { name: "VFD Microfinance Bank Limited", code: "566" },
  { name: "Wema Bank", code: "035" },
  { name: "Zenith Bank", code: "057" }
];
