class Path {
    static begin(startX, startY) {
        return new SvgPathBuilder(startX, startY);
    }
}
class SvgPathBuilder {
    constructor(startX, startY) {
        this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.pathDefinition = `M${startX},${startY}`;
    }
    moveTo(x, y) {
        this.pathDefinition += `M${x},${y}`;
        return this;
    }
    lineTo(x, y) {
        this.pathDefinition += `L${x},${y}`;
        return this;
    }
    verticalLineTo(y) {
        this.pathDefinition += `V${y}`;
        return this;
    }
    horizontalLineTo(x) {
        this.pathDefinition += `H${x}`;
        return this;
    }
    quadraticCurveTo(x1, y1, x, y) {
        this.pathDefinition += `Q${x1},${y1},${x},${y}`;
        return this;
    }
    cubicCurveTo(x1, y1, x2, y2, x, y) {
        this.pathDefinition += `C${x1},${y1},${x2},${y2},${x},${y}`;
        return this;
    }
    arc(rx, ry, xRotation, largeArcFlag, sweepFlag, endX, endY) {
        this.pathDefinition += `A${rx},${ry},${xRotation ? 1 : 0},${largeArcFlag ? 1 : 0},${sweepFlag ? 1 : 0},${endX},${endY}`;
        return this;
    }
    close() {
        this.pathDefinition += "Z";
        return this;
    }
    fill(color) {
        this.path.setAttribute("fill", color);
        return this;
    }
    stroke(color) {
        this.path.setAttribute("stroke", color);
        return this;
    }
    strokeWidth(width) {
        this.path.setAttribute("stroke_width", width.toString());
        return this;
    }
    build() {
        this.pathDefinition.trim();
        this.path.setAttribute("d", this.pathDefinition);
        return this.path;
    }
}
//# sourceMappingURL=Path.js.map