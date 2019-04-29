const svgns = "http://www.w3.org/2000/svg";
const cellSize = 20;
$(document).ready(() => {
    let map = document.getElementById("map");
    map.onclick = (event) => {
        let station = document.createElementNS(svgns, 'circle');
        var coords = remapToGridCoords(event.offsetX, event.offsetY);
        station.setAttributeNS(null, 'cx', coords.x.toString());
        station.setAttributeNS(null, 'cy', coords.y.toString());
        station.setAttributeNS(null, 'r', "7");
        station.setAttributeNS(null, 'style', 'fill: white; stroke: blue; stroke-width: 1px;');
        station.onclick = (event) => {
            handleLeftClick(event);
        };
        station.addEventListener("contextmenu", (event) => {
            return handleRightClick(event);
        }, false);
        map.appendChild(station);
    };
    drawGrid(map);
});

function gridCellCoords(pixeledX,pixeledY){
	  
  return {
  	x: Math.floor(pixeledX / cellSize),
    y: Math.floor(pixeledY / cellSize)
  };
}

function centerOfGridCell(gridX,gridY){
	
  // left border of cell
  //  + right border of cell
  // divided by 2 to get center of the cell by x axis
  let x = gridX * cellSize + cellSize / 2;

  // top border of cell
  //  + bottom border of cell
  // divided by 2 to get center of the cell by y axis
  let y = gridY * cellSize + cellSize / 2;  
  
  return {x,y};
}

function remapToGridCoords(x,y) {
	let cell = gridCellCoords(x,y);
  let center = centerOfGridCell(cell.x, cell.y);
  
  return {
  	x: center.x,
    y: center.y,
  };
}

function handleLeftClick(event) {
    event.stopPropagation();
}
function handleRightClick(event) {
    event.preventDefault();
    event.srcElement.remove();
    return false;
}
function drawGrid(map) {    
    let canvas = map;
    // draw vertical lines
    for (let x = 0; x <= canvas.width.baseVal.value; x += cellSize) {
        let line = document.createElementNS(svgns, 'line');
        line.setAttributeNS(null, 'x1', x.toString());
        line.setAttributeNS(null, 'y1', "0");
        line.setAttributeNS(null, 'x2', x.toString());
        line.setAttributeNS(null, 'y2', canvas.height.baseVal.value.toString());
        line.setAttributeNS(null, 'stroke', "grey");
        line.setAttributeNS(null, 'stroke-width', "1");
        canvas.appendChild(line);
    }
    // draw horizontal lines
    for (let y = 0; y <= canvas.height.baseVal.value; y += cellSize) {
        let line = document.createElementNS(svgns, 'line');
        line.setAttributeNS(null, 'x1', "0");
        line.setAttributeNS(null, 'y1', y.toString());
        line.setAttributeNS(null, 'x2', canvas.width.baseVal.value.toString());
        line.setAttributeNS(null, 'y2', y.toString());
        line.setAttributeNS(null, 'stroke', "grey");
        line.setAttributeNS(null, 'stroke-width', "1");
        canvas.appendChild(line);
    }
}
//# sourceMappingURL=app.js.map
