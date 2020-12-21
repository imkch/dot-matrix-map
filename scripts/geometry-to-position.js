const fs = require("fs");
const bounds = [-180, -90, 180, 90];

const coordinatesToPosition = () => {
  console.time('转换完成');
  const result = fs.readFileSync('data/dot.geojson');
  const { features } = JSON.parse(result.toString());
  const positionCol = [];
  features.forEach(feature => {
    const coordinate = feature.geometry.coordinates[0];
    const positionX = Math.round(coordinate[0] - bounds[0]);
    const positionY = Math.round(bounds[3] - coordinate[1]);
    positionCol.push([positionX, positionY]);
  });
  fs.writeFileSync(`data/dot.json`, JSON.stringify(positionCol));
  console.timeEnd('转换完成');
};

coordinatesToPosition();