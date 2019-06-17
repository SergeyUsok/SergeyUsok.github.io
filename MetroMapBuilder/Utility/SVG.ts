import { Color, Point, Station, StationKeeper } from "../Types";
import { Geometry } from "./Geometry";

export class SVG {

    public static circle(x: number, y: number, radius: number): SVGCircleElement {
        let circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        circle.setAttribute('cx', x.toString());
        circle.setAttribute('cy', y.toString());
        circle.setAttribute('r', radius.toString());
        return circle;
    }

    public static gridLine(x1: number, y1: number, x2: number, y2: number): SVGLineElement {
        let line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
        line.setAttribute('x1', x1.toString());
        line.setAttribute('y1', y1.toString());
        line.setAttribute('x2', x2.toString());
        line.setAttribute('y2', y2.toString());
        return line;
    }

    public static polyline(stations: StationKeeper[], color: Color): SVGPolylineElement {
        let line = document.createElementNS("http://www.w3.org/2000/svg", 'polyline');

        let points = "";

        for (let i = 0; i < stations.length; i++) {
            let circle = stations[i].circle;
            points += `${circle.cx.baseVal.value},${circle.cy.baseVal.value} `;
        }

        line.setAttribute('points', points);
        line.setAttribute('fill', 'none');
        line.setAttribute('stroke', color.toString());
        line.setAttribute('stroke-width', Geometry.lineWidth.toString());
        return line;
    }

    public static line(start: Point, finish: Point, color: Color, width: number): SVGLineElement {
        let line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
        line.setAttribute('x1', start.x.toString());
        line.setAttribute('y1', start.y.toString());
        line.setAttribute('x2', finish.x.toString());
        line.setAttribute('y2', finish.y.toString());
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', width.toString());
        return line;
    }

    public static groupGridLines(id: string) {
        let group = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        group.setAttribute('id', id);
        group.setAttribute('stroke', "#4e4e4e");
        group.setAttribute('stroke-width', "0.5");
        group.setAttribute('visibility', "visible");
        return group;
    }
}