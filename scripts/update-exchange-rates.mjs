/**
 * 환율 데이터 업데이트 스크립트
 *
 * open.er-api.com (무료, API 키 불필요) 에서 KRW 기준 환율을 가져와
 * public/data/exchange-rates.json 에 저장합니다.
 *
 * 사용법: node scripts/update-exchange-rates.mjs
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, '../public/data/exchange-rates.json');

// 앱에서 사용하는 통화 목록
const TARGET_CURRENCIES = [
  'USD', 'EUR', 'JPY', 'CNY', 'GBP', 'CHF',
  'CAD', 'AUD', 'HKD', 'SGD', 'THB', 'VND', 'TWD', 'PHP',
];

// 폴백 값 (API 실패 시)
const FALLBACK_RATES = {
  USD: 1380, EUR: 1500, JPY: 9.2, CNY: 190, GBP: 1750,
  CHF: 1570, CAD: 1000, AUD: 890, HKD: 177, SGD: 1030,
  THB: 40, VND: 0.055, TWD: 43, PHP: 24,
};

async function fetchRates() {
  // open.er-api.com: USD 기준 환율 → KRW 기준으로 변환
  const res = await fetch('https://open.er-api.com/v6/latest/USD');
  if (!res.ok) throw new Error(`API responded with ${res.status}`);

  const data = await res.json();
  if (data.result !== 'success') throw new Error(`API error: ${data['error-type']}`);

  const usdRates = data.rates;
  const krwPerUsd = usdRates.KRW;

  if (!krwPerUsd) throw new Error('KRW rate not found in API response');

  // 각 통화를 "1단위당 KRW" 로 변환
  // JPY, VND 는 100단위 기준 (앱에서 rateToKRW 는 "100엔당 원" 형태)
  const rates = {};

  for (const code of TARGET_CURRENCIES) {
    const usdPerUnit = usdRates[code];
    if (!usdPerUnit) {
      console.warn(`⚠️ ${code} not found in API, using fallback`);
      rates[code] = FALLBACK_RATES[code];
      continue;
    }

    // 1 [code] = ? KRW
    // 1 USD = krwPerUsd KRW
    // 1 [code] = (1/usdPerUnit) USD = krwPerUsd / usdPerUnit KRW
    let rateToKRW = krwPerUsd / usdPerUnit;

    // JPY, VND: 앱에서 100단위로 표시하므로 /100 해서 저장
    if (code === 'JPY' || code === 'VND') {
      rateToKRW = rateToKRW / 100;
    }

    // 소수점 합리적 자릿수로 반올림
    rates[code] = Math.round(rateToKRW * 10000) / 10000;
  }

  return rates;
}

async function main() {
  console.log('🔄 환율 데이터 업데이트 시작...');

  let rates;
  let source;

  try {
    rates = await fetchRates();
    source = 'open.er-api.com';
    console.log('✅ API에서 환율 데이터를 가져왔습니다.');
  } catch (err) {
    console.error('❌ API 호출 실패:', err.message);
    console.log('⚠️ 폴백 데이터를 사용합니다.');
    rates = FALLBACK_RATES;
    source = 'fallback';
  }

  const output = {
    base: 'KRW',
    updatedAt: new Date().toISOString(),
    source,
    rates,
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + '\n', 'utf-8');
  console.log(`📁 저장 완료: ${OUTPUT_PATH}`);
  console.log('📊 환율 데이터:', JSON.stringify(rates, null, 2));
}

main();
