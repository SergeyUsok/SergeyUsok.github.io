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
        static line(start, finish, color, width) {
            let line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
            line.setAttribute('x1', start.x.toString());
            line.setAttribute('y1', start.y.toString());
            line.setAttribute('x2', finish.x.toString());
            line.setAttribute('y2', finish.y.toString());
            line.setAttribute('stroke', color);
            line.setAttribute('stroke-width', width.toString());
            return line;
        }
        static groupGridLines(id) {
            let group = document.createElementNS("http://www.w3.org/2000/svg", 'g');
            group.setAttribute('id', id);
            group.setAttribute('stroke', "#4e4e4e");
            group.setAttribute('stroke-width', "0.5");
            group.setAttribute('visibility', "visible");
            return group;
        }
    }
    exports.SVG = SVG;
});
//# sourceMappingURL=SVG.js.map