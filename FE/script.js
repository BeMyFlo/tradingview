let chart, series;
const url = 'http://localhost:8000/api/user';
let isPlacingTradeBox = false;

document.addEventListener('DOMContentLoaded', () => {
  loadChart();

  document.getElementById('symbol').addEventListener('change', loadChart);
  document.getElementById('interval').addEventListener('change', loadChart);
  document.getElementById('chartType').addEventListener('change', loadChart);

  document.getElementById('add-trade-tool')?.addEventListener('click', () => {
    isPlacingTradeBox = true;
    console.log('Bắt đầu đặt trade box');
  });

  updateRightSidebarPrices();
  setInterval(updateRightSidebarPrices, 3000);
});

async function fetchCandles(symbol, interval) {
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

function enableVerticalDrag(handle, container) {
  let offsetY = 0;
  handle.onmousedown = (e) => {
    offsetY = e.clientY - container.getBoundingClientRect().top;

    document.onmousemove = (moveEvent) => {
      const chartRect = document.getElementById('chart').getBoundingClientRect();
      let newTop = moveEvent.clientY - chartRect.top - offsetY;
      newTop = Math.max(0, Math.min(newTop, chartRect.height - container.offsetHeight));
      container.style.top = `${newTop}px`;
    };

    document.onmouseup = () => {
      document.onmousemove = null;
    };
  };
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
    const chartContainer = document.getElementById('chart');
    chartContainer.innerHTML = '';

    chart = LightweightCharts.createChart(chartContainer, {
      layout: { background: { color: '#fff' }, textColor: '#000' },
      timeScale: { timeVisible: true },
      rightPriceScale: { visible: true },
    });

    series = chartType === 'candlestick'
      ? chart.addCandlestickSeries()
      : chart.addLineSeries();

    series.setData(candles);

    chart.subscribeClick((param) => {
      if (!isPlacingTradeBox) return;
      isPlacingTradeBox = false;
    
      const price = param.price;
      const tpPrice = price * 1.02;
      const slPrice = price * 0.99;
    
      const yEntry = series.priceToCoordinate(price);
      const yTP = series.priceToCoordinate(tpPrice);
      const ySL = series.priceToCoordinate(slPrice);
      const x = chart.timeScale().timeToCoordinate(param.time);
    
      if ([x, yEntry, yTP, ySL].includes(undefined)) return;
    
      const top = Math.min(yTP, ySL);
      const height = Math.abs(yTP - ySL);
    
      const box = document.createElement('div');
      box.className = 'position-box';
      box.style.left = `${x - 50}px`;
      box.style.top = `${top}px`;
      box.style.height = `${height}px`;
    
      box.innerHTML = `
        <div class="tp-area" style="height:${Math.abs(yEntry - yTP)}px;"></div>
        <div class="entry-line"></div>
        <div class="sl-area" style="height:${Math.abs(ySL - yEntry)}px;"></div>
        <div class="handle"></div>
      `;
    
      document.getElementById('chart').appendChild(box);
      enableVerticalDrag(box.querySelector('.handle'), box);
    });

  } catch (err) {
    console.error('Lỗi khi tải biểu đồ:', err);
  } finally {
    loading.style.display = 'none';
  }
}

async function updateRightSidebarPrices() {
  try {
    const res = await fetch(url + '/prices');
    const data = await res.json();
    const coinList = document.getElementById('coinList');
    coinList.innerHTML = '';
    data.forEach(coin => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="coin-name">${coin.symbol}</span><span class="coin-price">${coin.price}</span>`;
      coinList.appendChild(li);
    });
  } catch (err) {
    console.error('Lỗi khi fetch coin prices:', err);
  }
}