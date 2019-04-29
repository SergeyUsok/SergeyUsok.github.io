define(["require", "exports"], function (require, exports) {
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
            line.setAttribute('stroke', "black");
            line.setAttribute('stroke-width', "1");
            return line;
        }
    }
    exports.SVG = SVG;
});
//# sourceMappingURL=SVG.js.map