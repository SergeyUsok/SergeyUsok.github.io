const svgns = "http://www.w3.org/2000/svg";
$(document).ready(() => {
    let map = document.getElementById("map");
    map.onclick = (event) => {
        let station = document.createElementNS(svgns, 'circle');
        station.setAttributeNS(null, 'cx', event.offsetX.toString());
        station.setAttributeNS(null, 'cy', event.offsetY.toString());
        station.setAttributeNS(null, 'r', "10");
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
function handleLeftClick(event) {
    event.stopPropagation();
}
function handleRightClick(event) {
    event.preventDefault();
    event.srcElement.remove();
    return false;
}
function drawGrid(map) {
    let cellSize = 40;
    let canvas = map;
    // draw vertical lines
    for (let x = 0; x <= canvas.width.baseVal.value; x += cellSize) {
        let line = document.createElementNS(svgns, 'line');
        line.setAttributeNS(null, 'x1', x.toString());
        line.setAttributeNS(null, 'y1', "0");
        line.setAttributeNS(null, 'x2', x.toString());
        line.setAttributeNS(null, 'y2', canvas.height.baseVal.value.toString());
        line.setAttributeNS(null, 'stroke', "black");
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
        line.setAttributeNS(null, 'stroke', "black");
        line.setAttributeNS(null, 'stroke-width', "1");
        canvas.appendChild(line);
    }
}
//# sourceMappingURL=app.js.map