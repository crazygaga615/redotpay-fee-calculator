# RedotPay Fee & Issuance Calculator (CLI & Node.js Library)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)

A lightweight, zero-dependency Node.js CLI tool and library to estimate RedotPay card issuance costs, checkout discounts, crypto deposit buffers, and cross-border payment fees.

---

## Features

- **Accurate Issuance Pricing**: Calculates checkout discounts for both Virtual and Physical crypto cards.
- **Transaction Cost Modeling**: Estimates standard 1.2% international transaction charges and non-USD currency conversion spreads.
- **Gas & Deposit Buffer**: Calculates recommended USDT/USDC margin for blockchain deposit gas fees.
- **Zero External Dependencies**: Runs instantly on standard Node.js installations without `npm install` bloat.

---

## Quick Start (CLI)

### 1. Installation

Clone this repository and run directly:

```bash
git clone https://github.com/<your-username>/redotpay-fee-calculator.git
cd redotpay-fee-calculator
```

### 2. Basic Usage

**Estimate Virtual Card Issuance (with discount code):**
```bash
node index.js --type virtual --code PCT02
```

**Estimate Physical Card Issuance (with discount code):**
```bash
node index.js --type physical --code PCT20
```

**Estimate Transaction & Cross-Border Spread for $150 EUR spend:**
```bash
node index.js --spend 150 --currency EUR
```

**Run Built-in Assertions:**
```bash
npm test
```

---

## Fee & Promo Code Benchmarks

| Parameter | Standard Price | Discounted Price | Applied Promo Code | User Stage | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Virtual Card** | $10.00 USD | **$8.00 USD** | `PCT02` | Card Checkout | Instant issuance in App |
| **Physical Card** | $100.00 USD | **$80.00 USD** | `PCT20` | Card Checkout | Worldwide postal delivery |
| **Sign-up Reward** | $0.00 | **$5.00 Bonus** | `w9tpz` | Account Registration | Credited after KYC completion |
| **Intl Tx Fee** | 1.20% | N/A | Default | Point-of-Sale | Standard card processing fee |

> *Note: The US$5 registration reward (`w9tpz`) is a welcome spending credit; official policy prohibits using this reward to pay for card issuance fees.*

---

## Programmatic Usage (Node.js API)

You can also import this module into your own JavaScript / TypeScript scripts:

```javascript
const { calculateIssuance, calculateTransaction } = require('./index.js');

// 1. Calculate Virtual Card Issuance
const virtualOrder = calculateIssuance('virtual', 'PCT02');
console.log(virtualOrder);
// Output: { cardType: 'virtual', basePriceUSD: 10, discountUSD: 2, finalPriceUSD: 8, ... }

// 2. Estimate $200 overseas SaaS subscription
const txEstimate = calculateTransaction(200, 'USD');
console.log(txEstimate);
// Output: { spendAmountUSD: 200, internationalTransactionFeeUSD: 2.4, totalEstimatedCryptoRequiredUSD: 203.4, ... }
```

---

## Documentation & Reference Sources

For in-depth country eligibility guides, step-by-step KYC verification checklists, and official policy updates, please refer to:

- [RedotPay Promo Code & Card Setup Guide](https://www.redotpayguide.com/en/redotpay-promo-code/)
- [Global Country Availability & Payment Matrix](https://www.redotpayguide.com/en/countries/)
- [Independent Knowledge Base](https://www.redotpayguide.com/en/)

---

## Disclaimer

This is an independent open-source developer utility and community documentation project. It is not affiliated with, endorsed by, or sponsored by RedotPay or its parent entity. All product names, logos, and brands are property of their respective owners.

---

## License

This project is licensed under the [MIT License](LICENSE).
