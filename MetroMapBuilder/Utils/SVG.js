define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SVG {
        static labelText(start, fontSizeInPercents, cellSize, names, id) {
            let text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
            text.setAttribute('font-size', `${fontSizeInPercents}%`);
            text.setAttribute('font-weight', 'bold');
            text.setAttribute('font-family', 'Times New Roman');
            text.setAttribute('data-id', `${id}`);
            let y = start.y;
            for (let i = 0; i < names.length; i++) {
                let textPart = document.createElementNS("http://www.w3.org/2000/svg", 'tspan');
                textPart.textContent = names[i];
                textPart.setAttribute('x', start.x);
                textPart.setAttribute('y', y);
                text.appendChild(textPart);
                y += cellSize;
            }
            return text;
        }
        static circleStation(center, radius, id, dataId) {
            let circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
            circle.setAttribute('cx', `${center.x}`);
            circle.setAttribute('cy', `${center.y}`);
            circle.setAttribute('r', `${radius}`);
            circle.setAttribute('id', id);
            circle.setAttribute('data-id', `${dataId}`);
            return circle;
        }
        static gridLine(x1, y1, x2, y2, id) {
            let line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
            line.setAttribute('x1', x1.toString());
            line.setAttribute('y1', y1.toString());
            line.setAttribute('x2', x2.toString());
            line.setAttribute('y2', y2.toString());
            line.setAttribute("id", id);
            return line;
        }
        static routeConnection(start, finish) {
            let line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
            line.setAttribute('x1', start.x.toString());
            line.setAttribute('y1', start.y.toString());
            line.setAttribute('x2', finish.x.toString());
            line.setAttribute('y2', finish.y.toString());
            return line;
        }
        static gridGroup(id) {
            let group = document.createElementNS("http://www.w3.org/2000/svg", 'g');
            group.setAttribute('id', id);
            group.setAttribute('stroke', '#4e4e4e');
            group.setAttribute('stroke-width', '0.5');
            group.setAttribute('visibility', 'visible');
            return group;
        }
        static createGroup(attrs) {
            let group = document.createElementNS("http://www.w3.org/2000/svg", 'g');
            Object.keys(attrs).forEach(prop => group.setAttribute(`${prop}`, `${attrs[prop]}`));
            //id: string, lineWidth: number, color: string
            //group.setAttribute('id', id);
            //group.setAttribute('stroke', color);
            //group.setAttribute('stroke-width', <any>lineWidth);
            return group;
        }
        static rectStation(topLeft, width, height, angle, cornerRadius, fulcrum, id, dataId) {
            let rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
            rect.setAttribute('x', `${topLeft.x}`);
            rect.setAttribute('y', `${topLeft.y}`);
            rect.setAttribute('rx', `${cornerRadius}`);
            rect.setAttribute('ry', `${cornerRadius}`);
            rect.setAttribute('width', `${width}`);
            rect.setAttribute('height', `${height}`);
            rect.setAttribute('transform', `rotate(${angle} ${fulcrum.x} ${fulcrum.y})`);
            rect.setAttribute('id', id);
            rect.setAttribute('data-id', `${dataId}`);
            return rect;
        }
    }
    exports.SVG = SVG;
});
//# sourceMappingURL=SVG.js.map