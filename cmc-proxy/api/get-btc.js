export default async function handler(req, res) {
  // 1. 設定 CORS 標頭
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. 讀取 API Key
  const apiKey = process.env.CMC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'CMC_API_KEY 未設定' });
  }

  try {
    // 3. 向 CoinMarketCap 抓取資料
    const response = await fetch(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=BTC',
      {
        method: 'GET',
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CMC API 回應錯誤 status: ${response.status}`);
    }

    const data = await response.json();
    const btcData = data.data.BTC.quote.USD;

    // =========================================================
    // 4. 設定 Cache-Control Header（加在這裡！）
    // =========================================================
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate'); // <--- 加在這裡

    // 5. 回傳 JSON 資料給前端 (Webflow)
    return res.status(200).json({
      symbol: 'BTC',
      price: btcData.price,
      updatedAt: btcData.last_updated
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}