$(document).ready(() => {
    let map = document.getElementById("map");
    const svgns = "http://www.w3.org/2000/svg";
    map.onclick = (event) => {
        let station = document.createElementNS(svgns, 'circle');
        station.setAttributeNS(null, 'cx', event.offsetX.toString());
        station.setAttributeNS(null, 'cy', event.offsetY.toString());
        station.setAttributeNS(null, 'r', "5");
        station.setAttributeNS(null, 'style', 'fill: none; stroke: blue; stroke-width: 1px;');
        map.appendChild(station);
    };
});
//# sourceMappingURL=app.js.map