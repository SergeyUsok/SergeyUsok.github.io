define(["require", "exports", "./Geometry"], function (require, exports, Geometry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SVG {
        static circle(x, y, radius) {
            let circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
            circle.setAttribute('cx', x.toString());
            circle.setAttribute('cy', y.toString());
            circle.setAttribute('r', radius.toString());
            return circle;
        }
        static gridLine(x1, y1, x2, y2) {
            let line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
            line.setAttribute('x1', x1.toString());
            line.setAttribute('y1', y1.toString());
            line.setAttribute('x2', x2.toString());
            line.setAttribute('y2', y2.toString());
            line.setAttribute('stroke', "#4e4e4e");
            line.setAttribute('stroke-width', "0.5");
            return line;
        }
        static polyline(stations, color) {
            let line = document.createElementNS("http://www.w3.org/2000/svg", 'polyline');
            let points = "";
            for (let i = 0; i < stations.length; i++) {
                let circle = stations[i].circle;
                points += `${circle.cx.baseVal.value},${circle.cy.baseVal.value} `;
            }
            line.setAttribute('points', points);
            line.setAttribute('fill', 'none');
            line.setAttribute('stroke', color.toString());
            line.setAttribute('stroke-width', Geometry_1.Geometry.lineWidth.toString());
            return line;
        }
    }
    exports.SVG = SVG;
});
//# sourceMappingURL=SVG.js.map