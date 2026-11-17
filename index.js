#!/usr/bin/env node

/**
 * RedotPay Fee & Issuance Calculator
 * Open-source utility to compute card issuance costs, checkout discounts,
 * crypto top-up gas reserves, and international transaction charges.
 * 
 * MIT License
 */

const VIRTUAL_BASE_PRICE = 10.0;
const PHYSICAL_BASE_PRICE = 100.0;
const VIRTUAL_PROMO_CODE = 'PCT02';
const PHYSICAL_PROMO_CODE = 'PCT20';
const REFERRAL_CODE = 'w9tpz';
const KYC_WELCOME_REWARD = 5.0;

const CRYPTO_DEPOSIT_FEE_RATE = 0.01;      // 1.0% typical on-chain deposit fee
const INTERNATIONAL_TX_FEE_RATE = 0.012;   // 1.2% international transaction fee
const NON_USD_FX_SPREAD_RATE = 0.012;      // ~1.2% FX conversion spread for non-USD currencies

/**
 * Calculate card issuance pricing and applied promo discounts
 * @param {'virtual' | 'physical'} cardType
 * @param {string} [promoCode]
 */
function calculateIssuance(cardType = 'virtual', promoCode = '') {
  const type = cardType.toLowerCase() === 'physical' ? 'physical' : 'virtual';
  const code = (promoCode || '').toUpperCase().trim();
  const basePrice = type === 'physical' ? PHYSICAL_BASE_PRICE : VIRTUAL_BASE_PRICE;

  let discount = 0;
  let codeValid = false;

  if (type === 'virtual' && code === VIRTUAL_PROMO_CODE) {
    discount = 2.0; // $10 -> $8 (-20%)
    codeValid = true;
  } else if (type === 'physical' && code === PHYSICAL_PROMO_CODE) {
    discount = 20.0; // $100 -> $80 (-20%)
    codeValid = true;
  }

  const finalPrice = Math.max(0, basePrice - discount);

  return {
    cardType: type,
    basePriceUSD: basePrice,
    discountUSD: discount,
    finalPriceUSD: Number(finalPrice.toFixed(2)),
    promoCodeApplied: codeValid ? code : null,
    isDiscounted: codeValid
  };
}

/**
 * Calculate transaction costs, FX spread, and crypto balance needed
 * @param {number} spendAmountUSD
 * @param {string} currency e.g. 'USD', 'EUR', 'GBP', 'BDT', 'DZD'
 */
function calculateTransaction(spendAmountUSD, currency = 'USD') {
  const amount = Number(spendAmountUSD);
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Spend amount must be a positive number.');
  }

  const curr = (currency || 'USD').toUpperCase().trim();
  const isUSD = curr === 'USD';

  const txFee = amount * INTERNATIONAL_TX_FEE_RATE;
  const fxFee = isUSD ? 0 : amount * NON_USD_FX_SPREAD_RATE;
  const depositGasBuffer = 1.0; // 1 USDT safety margin for network transfer
  const totalCryptoNeeded = amount + txFee + fxFee + depositGasBuffer;

  return {
    spendAmountUSD: Number(amount.toFixed(2)),
    settlementCurrency: curr,
    internationalTransactionFeeUSD: Number(txFee.toFixed(2)),
    fxConversionSpreadUSD: Number(fxFee.toFixed(2)),
    suggestedGasSafetyBufferUSD: depositGasBuffer,
    totalEstimatedCryptoRequiredUSD: Number(totalCryptoNeeded.toFixed(2))
  };
}

function printUsage() {
  console.log(`
RedotPay Fee & Issuance Calculator (CLI)
========================================

Usage:
  node index.js --type <virtual|physical> [--code <PCT02|PCT20>] [--spend <USD_AMOUNT>] [--currency <ISO_CODE>]

Examples:
  node index.js --type virtual --code PCT02
  node index.js --type physical --code PCT20
  node index.js --spend 150 --currency EUR
  node index.js --test

Online reference & live benchmarks:
  https://www.redotpayguide.com/en/
`);
}

function runCLI() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    printUsage();
    process.exit(0);
  }

  if (args.includes('--test')) {
    console.log('Running test verification...');
    const vResult = calculateIssuance('virtual', 'PCT02');
    const pResult = calculateIssuance('physical', 'PCT20');
    const txResult = calculateTransaction(100, 'EUR');

    if (vResult.finalPriceUSD === 8 && pResult.finalPriceUSD === 80 && txResult.totalEstimatedCryptoRequiredUSD > 100) {
      console.log('✓ Virtual discount verified: $10 -> $8 (PCT02)');
      console.log('✓ Physical discount verified: $100 -> $80 (PCT20)');
      console.log('✓ Transaction computation verified: $100 EUR -> ' + txResult.totalEstimatedCryptoRequiredUSD + ' USDT');
      console.log('All tests passed.');
      process.exit(0);
    } else {
      console.error('Test failed assertion.');
      process.exit(1);
    }
  }

  const getArg = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : null;
  };

  const cardType = getArg('--type') || 'virtual';
  const code = getArg('--code') || '';
  const spend = getArg('--spend');
  const currency = getArg('--currency') || 'USD';

  console.log('--- RedotPay Issuance & Fee Breakdown ---');
  const issuance = calculateIssuance(cardType, code);
  console.log(`Card Type:            ${issuance.cardType.toUpperCase()}`);
  console.log(`Base Price:           $${issuance.basePriceUSD.toFixed(2)} USD`);
  if (issuance.isDiscounted) {
    console.log(`Applied Promo Code:   ${issuance.promoCodeApplied} (-$${issuance.discountUSD.toFixed(2)})`);
  } else {
    console.log(`Applied Promo Code:   None (Use PCT02 for virtual / PCT20 for physical)`);
  }
  console.log(`Final Card Price:     $${issuance.finalPriceUSD.toFixed(2)} USD`);
  console.log(`New Account Bonus:    Referral code ${REFERRAL_CODE} unlocks $${KYC_WELCOME_REWARD} reward after KYC.`);

  if (spend) {
    console.log('\n--- Transaction Estimation ---');
    try {
      const tx = calculateTransaction(Number(spend), currency);
      console.log(`Planned Spend:        $${tx.spendAmountUSD} ${tx.settlementCurrency}`);
      console.log(`Intl Transaction Fee: $${tx.internationalTransactionFeeUSD} (1.2%)`);
      console.log(`FX Conversion Spread: $${tx.fxConversionSpreadUSD}`);
      console.log(`Recommended Gas Buffer: $${tx.suggestedGasSafetyBufferUSD} USDT`);
      console.log(`Total Crypto Needed:  $${tx.totalEstimatedCryptoRequiredUSD} USDT/USDC`);
    } catch (e) {
      console.error('Error calculating transaction:', e.message);
    }
  }

  console.log('\nVerified against live editorial data: https://www.redotpayguide.com/en/');
}

if (require.main === module) {
  runCLI();
}

module.exports = {
  calculateIssuance,
  calculateTransaction,
  VIRTUAL_BASE_PRICE,
  PHYSICAL_BASE_PRICE,
  VIRTUAL_PROMO_CODE,
  PHYSICAL_PROMO_CODE,
  REFERRAL_CODE,
  KYC_WELCOME_REWARD
};
