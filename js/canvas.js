const padding = {
  top: 40,
  bottom: 40,
  left: 60,
  right: 20
};

const days = ["Կր", "Եկ", "Եք", "Չր", "Հգ", "Ու", "Շբ"]

function getSmartYAxisTicks(data){
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const rawStep = range / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const niceSteps = [3, 10, 50, 100];
  const step = niceSteps.find(s => s * magnitude >= rawStep) * magnitude;

  const niceMin = Math.floor(min / step) * step;

  const ticks = [];
  for(let i = 0; i < 5; i++){
    ticks.push(niceMin + i * step);
  }
  return ticks;
}

export function drawGraph(canvas, values){
  const data = values.map(v => v.value);
  const ctx = canvas.getContext("2d");
  const {
    width,
    height
  } = canvas;
  const yTicks = getSmartYAxisTicks(data);
  const yMin = yTicks[0];
  const yMax = yTicks[4];

  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom - 10;

  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = "#ddd";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#888";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for(let i = 0; i < yTicks.length; i++){
    const originalTickValue = yTicks[i];
    const labelTickValue = yTicks[i].toFixed(2);

    const yPos = padding.top + graphHeight * (1 - (originalTickValue - yMin) / (yMax - yMin));

    ctx.beginPath();
    ctx.moveTo(padding.left, yPos);
    ctx.lineTo(width - padding.right, yPos);
    ctx.stroke();
    ctx.fillText(labelTickValue, padding.left - 10, yPos);
  }
  const stepX = graphWidth / (data.length - 1);
  ctx.beginPath();
  data.forEach((val, i) => {
    const x = padding.left + stepX * i;
    const y = padding.top + graphHeight * (1 - (val - yMin) / (yMax - yMin));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "#0fb3ed";
  ctx.lineWidth = 2;
  ctx.stroke();


  data.forEach((val, i) => {
    const x = padding.left + stepX * i;
    const y = padding.top + graphHeight * (1 - (val - yMin) / (yMax - yMin));

    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#e2f8f4";
    ctx.fill();

    const day = new Date(values[i].date).getDay();
    ctx.fillStyle = "#888";
    ctx.textAlign = "center";
    ctx.fillText(days[day], x, height - padding.bottom + 15);
  });

}
