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

  console.log("📊 Các chỉ báo được chọn:", indicators);
  closeIndicatorPopup();

  if (indicators.includes("bollinger")) {
    drawBollingerBands(); // cần có hàm này trong script chính
  }
}
