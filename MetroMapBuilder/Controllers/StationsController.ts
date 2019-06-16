import { Geometry } from "../Utility/Geometry";
import { SVG } from "../Utility/SVG";
import { Controller } from "./GridController";
import { LinesController } from "./LinesController";
import { Point, Station } from "../Types";

export class StationsController implements Controller {

    private circles: Array<SVGCircleElement> = [];
    private addStation = (e) => this.handleLeftClick(e);
    private removeStation = (e) => this.handleRightClick(e);
    private highlightCell = (e) => this.handleHighlightCell(e);
    private background = (e) => this.handleBackground(e);
    private tooltipSpan: HTMLElement;
    private highlightedLines: HTMLElement[] = [];

    private backgroundUrl: string = null;

    public constructor(private map: HTMLElement) {
        this.initialize(map);
    }

    public next(): Controller {
        let stations: Station[] = [];

        for (let i = 0; i < this.circles.length; i++) {
            let circle = this.circles[i];
            let gridPoint = Geometry.normalizeToGridCell(circle.cx.baseVal.value, circle.cy.baseVal.value);
            let station = { id: i, name: "", x: gridPoint.x, y: gridPoint.y, circle: circle, connections: [] };
            stations.push(station);
        }

        return new LinesController(stations, this.backgroundUrl);
    }

    public dispose(): void {
        this.map.removeEventListener("click", this.addStation);
        this.map.removeEventListener("contextmenu", this.removeStation, false);
        this.map.removeEventListener("mousemove", this.highlightCell);
        document.getElementById("background-switch").removeEventListener("click", this.background);
        document.getElementById("background-switch").setAttribute("disabled", "disabled");

        for (let i = 0; i < this.highlightedLines.length; i++) {
            this.highlightedLines[i].classList.remove("highlightCell");
        }

        this.tooltipSpan.remove();
    }

    private handleHighlightCell(event: MouseEvent) {
        let cell = null;

        if (event.target instanceof SVGLineElement) {
            // get coords relative to of svg canvas rather than just line ones
            let rect = (<any>(event.currentTarget)).getBoundingClientRect();
            cell = Geometry.normalizeToGridCell(event.clientX - rect.left, event.clientY - rect.top);
        }
        else if (event.target instanceof SVGCircleElement) {
            cell = Geometry.normalizeToGridCell(event.target.cx.baseVal.value, event.target.cy.baseVal.value);
        }
        else {
            cell = Geometry.normalizeToGridCell(event.offsetX, event.offsetY);
        }

        for (let i = 0; i < this.highlightedLines.length; i++) {
            this.highlightedLines[i].classList.remove("highlightCell");
        }

        this.updateTooltip(cell, event);

        this.highlightedLines = [];

        // lines which surrounds this cell by x axis
        let lineX1 = document.getElementById(`x${cell.x}`);
        lineX1.classList.add("highlightCell");
        this.highlightedLines.push(lineX1);

        let lineX2 = document.getElementById(`x${cell.x + 1}`);
        lineX2.classList.add("highlightCell");
        this.highlightedLines.push(lineX2);

        // lines which surrounds this cell by y axis
        let lineY1 = document.getElementById(`y${cell.y}`);
        lineY1.classList.add("highlightCell");
        this.highlightedLines.push(lineY1);

        let lineY2 = document.getElementById(`y${cell.y + 1}`);
        lineY2.classList.add("highlightCell");
        this.highlightedLines.push(lineY2);
    }

    private updateTooltip(cell: Point, event: MouseEvent): void {
        // positioning tooltip over cursor (get initial coords relative to window)
        // factors 1.2 and 0.1 were selected empirically
        this.tooltipSpan.style.top = (event.clientY - this.tooltipSpan.clientHeight*1.2) + 'px';
        this.tooltipSpan.style.left = (event.clientX + this.tooltipSpan.clientWidth*0.1) + 'px';

        this.tooltipSpan.innerText = `${cell.x} ${cell.y}`;
    }

    private handleBackground(e: MouseEvent) {
        let checkbox = <any>e.target;

        if (checkbox.checked) {            
            this.map.classList.remove("bgd-color");
            this.map.classList.add("bgd");
            this.map.style.backgroundImage = this.backgroundUrl;
        }
        else {
            this.map.classList.remove("bgd");
            this.map.classList.add("bgd-color");            
            this.map.style.backgroundImage = "";
        }
    }

    private handleLeftClick(event: MouseEvent) {
        // nothing to process if existing circle or line was clicked
        if (event.target instanceof SVGCircleElement || event.target instanceof SVGLineElement)
            return;
        
        let center = Geometry.centrify(event.offsetX, event.offsetY);
        let circle = SVG.circle(center.x, center.y, Geometry.radius);
        this.circles.push(circle); // add to internal array
        this.map.appendChild(circle); // add to visual presentation
    }

    private handleRightClick(event: MouseEvent) {        
        if (!(event.target instanceof SVGCircleElement)) { // nothing to remove if empty cell was clicked
            return;
        }

        event.preventDefault();            
        let target = event.target as SVGCircleElement;

        let index = this.circles.findIndex(circle =>
            circle.cx.baseVal.value == target.cx.baseVal.value &&
            circle.cy.baseVal.value == target.cy.baseVal.value);

        this.circles[index].remove(); // remove from visual presentation
        this.circles.splice(index, 1); // remove from array
    }

    private initialize(map: HTMLElement) {
        map.addEventListener("click", this.addStation);
        map.addEventListener("contextmenu", this.removeStation, false);
        map.addEventListener("mousemove", this.highlightCell);

        let backgroundCheckbox = <HTMLInputElement>document.getElementById("background-switch");

        if (map.classList.contains("bgd")) {
            backgroundCheckbox.addEventListener("click", this.background);
            this.backgroundUrl = map.style.backgroundImage;
            backgroundCheckbox.checked = true;
        }
        else {
            backgroundCheckbox.setAttribute("disabled", "disabled");
        }

        let span = document.createElement("span");
        span.id = 'tooltip';
        map.parentElement.appendChild(span);
        this.tooltipSpan = span;
    }
}