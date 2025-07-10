let chart, series;
let lastCandleTime = 0;
let chartCandlesGlobal = [];
let rsiChart, rsiSeries, oversoldLine, overboughtLine;
window.Indicators = window.Indicators || {};

// =================== KẾT NỐI WEBSOCKET ===================
const socket = new WebSocket(AppConfig.socketUrl);
socket.onopen = () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.warn("⚠️ Không có userId, không gửi auth WebSocket");
    return;
  }

  socket.send(JSON.stringify({ type: "auth", userId }));
};

socket.onmessage = (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === "priceUpdate") {
    updateRightSidebarPrices(msg.data);
  }

  if (msg.type === "candleUpdate") {
    const candle = msg.data;
    if (
      series &&
      candle?.symbol === currentSymbol &&
      candle?.interval === currentInterval
    ) {
      const time = candle.time;
      if (time >= lastCandleTime) {
        series.update({
          time,
          open: +candle.open,
          high: +candle.high,
          low: +candle.low,
          close: +candle.close,
        });

        lastCandleTime = time;

        if (candle.rsi !== undefined && rsiSeries) {
          console.log("Cập nhật RSI:", candle.rsi);
          rsiSeries.update({ time, value: candle.rsi });
          oversoldLine.update({ time, value: 25 });
          overboughtLine.update({ time, value: 70 });
        }
      }
    }
  }
};

// =================== SỰ KIỆN KHI DOM ĐÃ SẴN SÀNG ===================
document.addEventListener("DOMContentLoaded", async () => {
  await loadSymbolList();
  new TomSelect("#symbol", {
    create: false,
    sortField: { field: "text", direction: "asc" },
    placeholder: "Chọn coin...",
  });

  initEventListeners();
  loadChart();
});
// =================== KHỞI TẠO CÁC SỰ KIỆN CHỌN MENU ===================
function initEventListeners() {
  document.getElementById("symbol").addEventListener("change", loadChart);
  document.getElementById("interval").addEventListener("change", loadChart);
  document.getElementById("chartType").addEventListener("change", loadChart);

  // document.getElementById("add-trade-tool")?.addEventListener("click", () => {
  //   isPlacingTradeBox = true;
  //   console.log("Bắt đầu đặt trade box");
  // });
}

// =================== LOAD BIỂU ĐỒ THEO SYMBOL / INTERVAL ===================
async function loadChart() {
  const loading = document.getElementById("loading");
  loading.style.display = "flex";

  const symbol = document.getElementById("symbol").value;
  const interval = document.getElementById("interval").value;
  const chartType = document.getElementById("chartType").value;

  currentSymbol = symbol;
  currentInterval = interval;

  try {
    const candles = await fetchCandles(symbol, interval);

    updateChartInfoSidebar(candles, symbol);
    initChart(chartType, candles);

    // ✅ Gửi yêu cầu subscribe realtime cho symbol+interval này
    socket.send(
      JSON.stringify({
        type: "subscribeCandle",
        symbol,
        interval,
      })
    );
  } catch (err) {
    console.error("Lỗi khi tải biểu đồ:", err);
  } finally {
    loading.style.display = "none";
  }
}

// =================== LẤY DỮ LIỆU NẾN TỪ BACKEND ===================
async function fetchCandles(symbol, interval) {
  const res = await fetch(AppConfig.apiBaseUrl + "/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symbol, interval }),
  });
  const data = await res.json();

  if (!Array.isArray(data) || data.length === 0) {
    console.warn("⚠️ Không có dữ liệu nến cho symbol:", symbol);
    return [];
  }

  return data.map((c) => ({
    time: c[0] / 1000,
    open: +c[1],
    high: +c[2],
    low: +c[3],
    close: +c[4],
    volume: +c[5], // thêm volume nếu có
  }));
}

// =================== HIỂN THỊ THÔNG TIN BÊN PHẢI CHART ===================
function updateChartInfoSidebar(candles, symbol) {
  if (candles.length === 0) return;
  const last = candles[candles.length - 1];
  const first = candles[0];

  const price = last.close;
  const change = (((last.close - first.open) / first.open) * 100).toFixed(2);
  const volume = parseFloat(last.volume || 0).toFixed(2);

  document.getElementById("info-symbol").innerText = symbol;
  document.getElementById("info-price").innerText = price;
  document.getElementById("info-change").innerText =
    (change > 0 ? "+" : "") + change + "%";
  document.getElementById("info-change").className =
    change >= 0 ? "up" : "down";
  document.getElementById("info-volume").innerText = volume + " BTC";
}

// =================== KHỞI TẠO VÀ VẼ CHART ===================
function initChart(chartType, candles) {
  chartCandlesGlobal = candles;
  const chartContainer = document.getElementById("chart-inner");
  chartContainer.innerHTML = "";

  chart = LightweightCharts.createChart(chartContainer, {
    layout: {
      background: { color: "#fff" },
      textColor: "#696969",
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      fontSize: 12,
    },
    timeScale: { timeVisible: true },
    rightPriceScale: { visible: true },
    crosshair: {
      mode: LightweightCharts.CrosshairMode.Normal,
    },
    grid: {
      vertLines: {
        color: "rgba(197, 203, 206, 0.3)",
        style: 0,
      },
      horzLines: {
        color: "rgba(197, 203, 206, 0.3)",
        style: 0,
      },
    },
  });

  if (chartType === "candlestick") {
    series = chart.addCandlestickSeries();
    series.setData(candles);
    lastCandleTime = candles[candles.length - 1]?.time || 0;
  } else if (chartType === "bar") {
    series = chart.addBarSeries();
    series.setData(candles);
    lastCandleTime = candles[candles.length - 1]?.time || 0;
  } else if (chartType === "line") {
    series = chart.addLineSeries();
    series.setData(candles.map((c) => ({ time: c.time, value: c.close })));
    lastCandleTime = candles[candles.length - 1]?.time || 0;
  } else if (chartType === "area") {
    series = chart.addAreaSeries();
    series.setData(candles.map((c) => ({ time: c.time, value: c.close })));
    lastCandleTime = candles[candles.length - 1]?.time || 0;
  } else if (chartType === "heikin_ashi") {
    seriesData = convertToHeikinAshi(candles);
    series = chart.addCandlestickSeries();
    series.setData(seriesData);
    lastCandleTime = seriesData[seriesData.length - 1]?.time || 0;
  }
}

// =================== CẬP NHẬT GIÁ COIN BÊN PHẢI ===================
let previousPrices = {}; // Global biến lưu giá trước đó

function updateRightSidebarPrices(data) {
  const coinList = document.getElementById("coinList");
  coinList.innerHTML = `
    <li class="coin-header">
      <span class="coin-name">Coin</span>
      <span class="coin-price">Price</span>
      <span class="coin-change">24h %</span>
    </li>
  `;

  data.forEach((coin) => {
    const oldPrice = previousPrices[coin.symbol];
    const newPrice = parseFloat(coin.price);
    const change24h = parseFloat(coin.change);

    // Lưu lại giá mới nhất để so sánh lần sau
    previousPrices[coin.symbol] = newPrice;

    const priceClass = !oldPrice
      ? ""
      : newPrice > oldPrice
      ? "up"
      : newPrice < oldPrice
      ? "down"
      : "";

    const changeArrow = change24h > 0 ? "▲" : change24h < 0 ? "▼" : "";
    const changeClass = change24h > 0 ? "up" : change24h < 0 ? "down" : "";

    const li = document.createElement("li");
    li.innerHTML = `
      <span class="coin-name">${coin.symbol}</span>
      <span class="coin-price ${priceClass}">${newPrice.toFixed(4)}</span>
      <span class="coin-change ${changeClass}">
        ${changeArrow} ${Math.abs(change24h).toFixed(2)}%
      </span>
    `;
    coinList.appendChild(li);
  });
}

// =================== Load danh sách coin ra để select ===================
async function loadSymbolList() {
  try {
    const res = await fetch(AppConfig.apiBaseUrl + "/symbols");
    const symbols = await res.json();

    const symbolSelect = document.getElementById("symbol");
    symbolSelect.innerHTML = "";

    symbols.forEach((symbol) => {
      const option = document.createElement("option");
      option.value = symbol;
      option.text = symbol;
      symbolSelect.appendChild(option);
    });

    // Đặt mặc định là BTCUSDT nếu có
    symbolSelect.value = "BTCUSDT";

    loadChart(); // Load chart với BTCUSDT
  } catch (err) {
    console.error("Lỗi khi load danh sách symbol:", err);
  }
}

// ===================== Thêm kiểu nến Heikin Ashi =====================
function convertToHeikinAshi(candles) {
  const haCandles = [];

  for (let i = 0; i < candles.length; i++) {
    const prev = haCandles[i - 1] || candles[i]; // fallback là nến gốc đầu tiên

    const open = (prev.open + prev.close) / 2;
    const close =
      (candles[i].open + candles[i].high + candles[i].low + candles[i].close) /
      4;
    const high = Math.max(candles[i].high, open, close);
    const low = Math.min(candles[i].low, open, close);

    haCandles.push({
      time: candles[i].time,
      open,
      high,
      low,
      close,
    });
  }

  return haCandles;
}

// ==================== Vẽ RSI Chart ===================
async function drawRSIChart() {
  if (!chart || !chartCandlesGlobal || chartCandlesGlobal.length === 0) return;

  const candlesToSend = chartCandlesGlobal.map((c) => ({
    time: c.time,
    close: c.close,
  }));

  try {
    const res = await fetch("http://localhost:8090/api/user/rsi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candles: candlesToSend,
        interval: currentInterval,
      }),
    });

    const rsiData = await res.json();

    const rsiContainer = document.getElementById("chart-rsi");
    rsiContainer.innerHTML = "";

    const rsiChart = LightweightCharts.createChart(rsiContainer, {
      layout: { background: { color: "#fff" }, textColor: "#000" },
      timeScale: { timeVisible: true, alignLabels: false },
      rightPriceScale: { visible: true },
      crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
      height: 150,
    });

    rsiSeries = rsiChart.addLineSeries({
      color: "#f09",
      lineWidth: 1,
    });

    rsiSeries.setData(rsiData);

    oversoldLine = rsiChart.addLineSeries({
      color: "rgba(0, 200, 0, 0.3)",
      lineWidth: 1,
    });
    oversoldLine.setData(rsiData.map((d) => ({ time: d.time, value: 25 })));

    overboughtLine = rsiChart.addLineSeries({
      color: "rgba(200, 0, 0, 0.3)",
      lineWidth: 1,
    });
    overboughtLine.setData(rsiData.map((d) => ({ time: d.time, value: 70 })));

    chart.timeScale().subscribeVisibleTimeRangeChange((range) => {
      rsiChart.timeScale().setVisibleRange(range);
    });
  } catch (err) {
    console.error("❌ Lỗi khi vẽ RSI:", err.message);
  }
}

// function syncTimeScale(mainChart, subChart) {
//   let blockSync = false;

//   mainChart.timeScale().subscribeVisibleTimeRangeChange((range) => {
//     if (blockSync) return;
//     blockSync = true;
//     subChart.timeScale().setVisibleRange(range);
//     blockSync = false;
//   });

//   subChart.timeScale().subscribeVisibleTimeRangeChange((range) => {
//     if (blockSync) return;
//     blockSync = true;
//     mainChart.timeScale().setVisibleRange(range);
//     blockSync = false;
//   });
// }

fetch("./user/auth-popup.html")
  .then((res) => res.text())
  .then((html) => {
    document.getElementById("auth-popup-container").innerHTML = html;

    const script = document.createElement("script");
    script.src = "./user/user.js";
    script.onload = () => {
      // Gọi hàm khởi tạo sau khi JS đã load xong
      initAuthPopupEvents();
    };
    document.body.appendChild(script);
  });

fetch("./indicators/indicator-popup.html")
  .then((res) => res.text())
  .then((html) => {
    document.getElementById("indicator-popup-container").innerHTML = html;

    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = "./indicators/indicator-popup.css";
    document.head.appendChild(style);

    const script = document.createElement("script");
    script.src = "./indicators/indicator-popup.js";
    document.body.appendChild(script);
  });
