Indicators.drawBollingerBands = function () {
  if (!chart || !chartCandlesGlobal || chartCandlesGlobal.length === 0) return;

  const candlesToSend = chartCandlesGlobal.map((c) => ({
    time: c.time,
    close: c.close,
  }));

  fetch(AppConfig.apiBaseUrl + "/bollinger", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candles: candlesToSend }),
  })
    .then((res) => res.json())
    .then((bands) => {
      const upperSeries = chart.addLineSeries({
        color: "rgba(0, 200, 255, 0.6)",
        lineWidth: 1,
      });
      const middleSeries = chart.addLineSeries({
        color: "rgba(255, 165, 0, 0.8)",
        lineWidth: 1,
      });
      const lowerSeries = chart.addLineSeries({
        color: "rgba(0, 200, 255, 0.6)",
        lineWidth: 1,
      });

      upperSeries.setData(bands.map((b) => ({ time: b.time, value: b.upper })));
      middleSeries.setData(
        bands.map((b) => ({ time: b.time, value: b.middle }))
      );
      lowerSeries.setData(bands.map((b) => ({ time: b.time, value: b.lower })));
    })
    .catch((err) => {
      console.error("❌ Lỗi khi vẽ Bollinger Bands:", err.message);
    });
};
