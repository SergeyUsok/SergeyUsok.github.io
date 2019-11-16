import { Geometry, Point } from "../Utils/Geometry";
import { MapView } from "../Utils/MapView";
import { SubwayMap } from "../Models/SubwayMap";
import { Label } from "../Models/StationModel";
import { ErrorController } from "./ErrorController";
import { Strings } from "../Utils/Strings";

export class StationsController extends ErrorController {
    private stationsCounter: number = 0;

    public constructor(private subwayMap: SubwayMap, private mapView: MapView, private geometry: Geometry) {
        super();
        this.initialize(mapView, subwayMap);
    }    

    private initialize(mapView: MapView, subwayMap: SubwayMap) {
        this.setupDrugNDrop(mapView, subwayMap);

        mapView.getCanvas()
               .addEventListener("click", event => this.handleClick(event));

        subwayMap.mapReloaded(() => this.onMapReloaded());
    }

    private setupDrugNDrop(mapView: MapView, subwayMap: SubwayMap): void {
        let previous: Point = null;
        let stationId = -1;
        mapView.getCanvas().addEventListener("mousedown", ev => {
            if (ev.target instanceof SVGCircleElement ||
                ev.target instanceof SVGRectElement) {
                stationId = mapView.getId(ev.target);
                previous = this.getCell(ev);
                mapView.dragMode = true;
                mapView.getCanvas().style.cursor = "move";
            }
        });

        mapView.getCanvas().addEventListener("mousemove", ev => {
            if (stationId == -1)
                return;
            let cell = this.getCell(ev);
            if (previous.x == cell.x && previous.y == cell.y)
                return;
            
            if (mapView.isCellFreeForDrop(cell, stationId)) {
                mapView.getCanvas().style.cursor = "move";
                subwayMap.updateStationPosition(stationId, cell.x, cell.y);
                mapView.redrawMap(subwayMap);
            }
            else {
                mapView.getCanvas().style.cursor = "not-allowed";
            }
        });

        mapView.getCanvas().addEventListener("mouseup", ev => {
            stationId = -1;
            previous = null;
            mapView.dragMode = false;
        });

        // cancel browser's native Drag'n'Drop behavior
        mapView.getCanvas().ondragstart = () => false;
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

        let center = this.geometry.centrify(label);
        let topLeft = this.geometry.rectTopLeftCorner(center, this.geometry.cellSize, this.geometry.cellSize);

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
            if (Strings.isNullOrWhitespace(text.value)) {
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
            if (!Strings.isNullOrWhitespace(text.value)) {
                label.setName(text.value.split(/\r\n|\r|\n/).map(s => s.trim()));
                editForm.remove();
                this.mapView.redrawMap(this.subwayMap);
            }
        });

        return <HTMLElement>editForm;
    }

    private tryAddStation(event: MouseEvent): void {
        let cell = this.getCell(event);

        if (this.mapView.isCellFullyAvailable(cell)) {
            let id = this.stationsCounter++;
            this.subwayMap.newStation(id, cell.x, cell.y);
            this.mapView.redrawMap(this.subwayMap);
        }
        // if the cell does not contain another station but still occupied by something else show an error
        else if (event.target instanceof SVGSVGElement ||
                event.target instanceof SVGLineElement ||
                event.target instanceof SVGPathElement ||
                event.target instanceof SVGTextPositioningElement) {
            this.showError(Strings.occupiedCellError());
        }
    }

    private getCell(event: MouseEvent): Point {
        let rect = (<Element>(event.currentTarget)).getBoundingClientRect();
        return this.geometry.normalizeToGridCell(event.clientX - rect.left, event.clientY - rect.top);
    }
}