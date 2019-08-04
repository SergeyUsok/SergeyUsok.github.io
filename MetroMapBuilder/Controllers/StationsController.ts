import { Geometry, Point } from "../Utils/Geometry";
import { MapView } from "../Utils/MapView";
import { SubwayMap } from "../Models/SubwayMap";
import { Label } from "../Models/StationModel";
import { ErrorController } from "./ErrorController";

export class StationsController extends ErrorController {
    private stationsCounter: number = 0;

    public constructor(private subwayMap: SubwayMap, private mapView: MapView, private geometry: Geometry) {
        super();
        this.initialize(mapView.getCanvas(), subwayMap);
    }    

    private initialize(canvas: SVGSVGElement, subwayMap: SubwayMap) {
        canvas.addEventListener("click", event => this.handleClick(event));

        subwayMap.mapReloaded(() => this.onMapReloaded());
    }

    private onMapReloaded(): void {
        this.stationsCounter = this.subwayMap.stations.length;
    }

    private handleClick(event: MouseEvent): any {
        this.hideEditPopup();
        if (event.target instanceof SVGTextPositioningElement) {            
            this.renameStation(event);
        }
        else {
            this.tryAddStation(event);
        }
    }

    private hideEditPopup(): void {
        let edit = document.getElementById("edit-label");

        if (edit != null) {
            edit.remove();
        }
    }

    private renameStation(event: MouseEvent) {
        let target = event.target instanceof SVGTextElement ? event.target : (<any>event.target).parentElement;
        let label = this.subwayMap.getStation(this.mapView.getId(target)).label;

        let topLeft = this.geometry.topLeftCorner(label);

        let editForm = this.prepareEditPopup(label);
        editForm.style.display = "block";        
        editForm.style.left = `${topLeft.x}px`;
        editForm.style.top = `${topLeft.y}px`;
        document.body.appendChild(editForm);
    }

    private prepareEditPopup(label: Label): HTMLElement {
        let labelName = label.name.join("\n");
        let width = this.geometry.labelWidthInCells(label.width) * this.geometry.cellSize;

        let template = `<div id="edit-label" style="width: ${width}px;" class='dropdown-menu show'>` +
            `<textarea class="form-control" rows="${label.height}">${labelName}</textarea>` +
            `<button class='btn btn-outline-danger btn-sm' type='button'>&#10006;</button>` +
            `<button class='btn btn-outline-success btn-sm' type='button'>&#10004;</button>` +
            "</div>";

        let temp = document.createElement('div');
        temp.innerHTML = template;
        return this.addEventHandlers(temp.firstElementChild, label);
    }

    private addEventHandlers(editForm: Element, label: Label): HTMLElement {
        // textarea
        let text = <HTMLTextAreaElement>editForm.children[0];
        text.addEventListener("input", () => {
            if (this.isNullOrWhitespace(text.value)) {
                (<any>editForm.children[2]).classList.add('disabled');// do not allow save empty value
                return;
            }
            else {
                (<any>editForm.children[2]).classList.remove('disabled');
                let linesCount = text.value.split(/\r\n|\r|\n/).length;
                text.rows = linesCount;
            }
        });

        // cancel button
        editForm.children[1].addEventListener("click", () => {
            editForm.remove();
        });

        // save button
        editForm.children[2].addEventListener("click", () => {
            if (!this.isNullOrWhitespace(text.value)) {
                label.setName(...text.value.split(/\r\n|\r|\n/).map(s => s.trim()));
                editForm.remove();
                this.mapView.redrawMap(this.subwayMap);
            }
        });

        return <HTMLElement>editForm;
    }

    private isNullOrWhitespace(input) {
        if (typeof input === 'undefined' || input == null)
            return true;

        return input.replace(/\s/g, '').length < 1;
    }

    private tryAddStation(event: MouseEvent): void {
        let rect = (<any>(event.currentTarget)).getBoundingClientRect();
        let cell = this.geometry.normalizeToGridCell(event.clientX - rect.left, event.clientY - rect.top);

        if (this.mapView.isCellAvailable(cell)) {
            let id = this.stationsCounter++;
            this.subwayMap.newStation(id, cell.x, cell.y);
            this.mapView.redrawMap(this.subwayMap);
        }
        // if cell does not contain another station but still occupied show error
        else if (event.target instanceof SVGSVGElement ||
                event.target instanceof SVGLineElement ||
                event.target instanceof SVGTextPositioningElement) {
            this.showError("Clicked cell is not available for station set up because it is occupied by line, label or it is placed too much close to another station");
        }
    }
}