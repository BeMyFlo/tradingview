let chart, series;
// const url = 'https://be-bpool.vercel.app/api/user';
const url = 'http://localhost:8000/api/user';

async function fetchCandles(symbol, interval, limit = 500) {
  const res = await fetch(url + "/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symbol, interval })
  });
  const data = await res.json();
  return data.map(c => ({
    time: c[0] / 1000,
    open: +c[1], high: +c[2], low: +c[3], close: +c[4]
  }));
}

async function loadChart() {
  const loading = document.getElementById('loading');
  loading.style.display = 'flex';

  const symbol = document.getElementById('symbol').value;
  const interval = document.getElementById('interval').value;
  const chartType = document.getElementById('chartType').value;

  document.getElementById('header-title').innerText = `${symbol} - ${interval}`;

  try {
    const candles = await fetchCandles(symbol, interval);
    document.getElementById('chart').innerHTML = '';

    chart = LightweightCharts.createChart(document.getElementById('chart'), {
      layout: { background: { color: '#fff' }, textColor: '#000' },
      timeScale: { timeVisible: true },
      rightPriceScale: { visible: true },
    });

    series = chartType === 'candlestick'
      ? chart.addCandlestickSeries()
      : chart.addLineSeries();
    series.setData(candles);

    document.getElementById("price").innerText = candles.at(-1)?.close?.toFixed(2);
  } catch (err) {
    console.error(err);
  } finally {
    loading.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadChart();

  document.getElementById('symbol').addEventListener('change', loadChart);
  document.getElementById('interval').addEventListener('change', loadChart);
  document.getElementById('chartType').addEventListener('change', loadChart);

  const coins = [
    { symbol: 'BTCUSDT', price: '107000' },
    { symbol: 'ADAUSDT', price: '0.5678' },
    { symbol: 'ETHUSDT', price: '2488' },
    { symbol: 'XRPUSDT', price: '0.472' },
    { symbol: 'BNBUSDT', price: '578' },
  ];
  const coinList = document.getElementById('coinList');
  coins.forEach(coin => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="coin-name">${coin.symbol}</span><span class="coin-price">${coin.price}</span>`;
    coinList.appendChild(li);
  });
});

async function updateRightSidebarPrices() {
  try {
    const res = await fetch(url + '/prices');
    const data = await res.json();

    const coinList = document.getElementById('coinList');
    coinList.innerHTML = ''; // clear trước khi render lại

    data.forEach(coin => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="coin-name">${coin.symbol}</span><span class="coin-price">${coin.price}</span>`;
      coinList.appendChild(li);
    });
  } catch (err) {
    console.error('Lỗi khi fetch coin prices:', err);
  }
}

updateRightSidebarPrices();
setInterval(updateRightSidebarPrices, 3000);