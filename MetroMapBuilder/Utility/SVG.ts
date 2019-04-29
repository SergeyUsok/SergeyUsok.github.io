
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
        line.setAttribute('stroke', "black");
        line.setAttribute('stroke-width', "1");
        return line;
    }
}