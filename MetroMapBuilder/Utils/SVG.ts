﻿import { Point } from "./Geometry";

export class SVG {
    public static labelText(start: Point, fontSizeInPercents: number, cellSize: number, names: string[], id: number): SVGTextElement {
        let text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
        text.setAttribute('font-size', `${fontSizeInPercents}%`);
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('font-family', 'Times New Roman');
        text.setAttribute('data-id', `${id}`);

        let y = start.y;
        for (let i = 0; i < names.length; i++) {
            let textPart = document.createElementNS("http://www.w3.org/2000/svg", 'tspan');
            textPart.textContent = names[i];
            textPart.setAttribute('x', <any>start.x);
            textPart.setAttribute('y', <any>y);
            text.appendChild(textPart);
            y += cellSize;
        }

        return text;
    }

    public static circleStation(center: Point, radius: number, id: string, dataId: number): SVGCircleElement {
        let circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        circle.setAttribute('cx', `${center.x}`);
        circle.setAttribute('cy', `${center.y}`);
        circle.setAttribute('r', `${radius}`);
        circle.setAttribute('id', id);
        circle.setAttribute('data-id', `${dataId}`);
        return circle;
    }

    public static gridLine(x1: number, y1: number, x2: number, y2: number, id: string): SVGLineElement {
        let line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
        line.setAttribute('x1', x1.toString());
        line.setAttribute('y1', y1.toString());
        line.setAttribute('x2', x2.toString());
        line.setAttribute('y2', y2.toString());
        line.setAttribute("id", id);
        return line;
    }

    public static straightConnection(start: Point, finish: Point): SVGLineElement {
        let line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
        line.setAttribute('x1', start.x.toString());
        line.setAttribute('y1', start.y.toString());
        line.setAttribute('x2', finish.x.toString());
        line.setAttribute('y2', finish.y.toString());
        return line;
    }

    public static curveConnection(start: Point, finish: Point, controlPoint: Point): SVGPathElement {
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        let d = `M${start.x},${start.y} Q${controlPoint.x},${controlPoint.y} ${finish.x},${finish.y}`;
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        return path;
    }

    public static createGroup(attrs: object): SVGGElement {
        let group = document.createElementNS("http://www.w3.org/2000/svg", 'g');        
        Object.keys(attrs).forEach(prop => group.setAttribute(`${prop}`, `${attrs[prop]}`));
        return group;
    }

    public static rectStation(topLeft: Point, width: number, height: number, angle: number, cornerRadius: number,
                              fulcrum: Point, id: string, dataId: number): SVGRectElement {
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