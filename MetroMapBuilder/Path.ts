class Path {
    public static begin(startX: number, startY: number): SvgPathBuilder {
        return new SvgPathBuilder(startX, startY);
    }
}

class SvgPathBuilder {
    
    private path: SVGPathElement;
    private pathDefinition: string;

    public constructor(startX: number, startY: number) {
        this.path = <SVGPathElement>document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.pathDefinition = `M${startX},${startY}`;
    }

    public moveTo(x: number, y: number): SvgPathBuilder {
        this.pathDefinition += `M${x},${y}`;
        return this;
    }

    public lineTo(x: number, y: number): SvgPathBuilder {
        this.pathDefinition += `L${x},${y}`;
        return this;
    }

    public verticalLineTo(y: number): SvgPathBuilder {
        this.pathDefinition += `V${y}`;
        return this;
    }

    public horizontalLineTo(x: number): SvgPathBuilder {
        this.pathDefinition += `H${x}`;
        return this;
    }

    public quadraticCurveTo(x1: number, y1: number, x: number, y: number): SvgPathBuilder {
        this.pathDefinition += `Q${x1},${y1},${x},${y}`;
        return this;
    }

    public cubicCurveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): SvgPathBuilder {
        this.pathDefinition += `C${x1},${y1},${x2},${y2},${x},${y}`;
        return this;
    }

    public arc(rx: number, ry: number, xRotation: boolean, largeArcFlag: boolean, sweepFlag: boolean, endX: number, endY: number): SvgPathBuilder {
        this.pathDefinition += `A${rx},${ry},${xRotation ? 1 : 0},${largeArcFlag ? 1 : 0},${sweepFlag ? 1 : 0},${endX},${endY}`;
        return this;
    }

    public close(): SvgPathBuilder {
        this.pathDefinition += "Z";
        return this;
    }

    public fill(color: string): SvgPathBuilder {
        this.path.setAttribute("fill", color);
        return this;
    }

    public stroke(color: string): SvgPathBuilder {
        this.path.setAttribute("stroke", color);
        return this;
    }

    public strokeWidth(width: number): SvgPathBuilder {
        this.path.setAttribute("stroke_width", width.toString());
        return this;
    }

    public build(): SVGPathElement {
        this.pathDefinition.trim();
        this.path.setAttribute("d", this.pathDefinition);
        return this.path;
    }
}