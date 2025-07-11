// indicator-popup.js
function openIndicatorPopup() {
  document.getElementById("indicator-popup").style.display = "flex";
}

function closeIndicatorPopup() {
  document.getElementById("indicator-popup").style.display = "none";
}

function applyIndicators() {
  const indicators = [];
  document
    .querySelectorAll("#indicator-popup input[type='checkbox']:checked")
    .forEach((checkbox) => {
      indicators.push(checkbox.value);
    });

  closeIndicatorPopup();

  // Bật/tắt realtime Bollinger Bands
  if (window) {
    window.isBollingerEnabled = indicators.includes("bollinger");
  }

  if (indicators.includes("bollinger")) {
    Indicators.drawBollingerBands();
  }

  if (indicators.includes("rsi")) {
    document.getElementById("chart-rsi-area").style.display = "block";
    drawRSIChart();
  } else {
    document.getElementById("chart-rsi-area").style.display = "none";
  }
}
