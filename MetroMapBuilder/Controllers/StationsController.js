define(["require", "exports", "./ErrorController", "../Utils/Strings"], function (require, exports, ErrorController_1, Strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StationsController extends ErrorController_1.ErrorController {
        constructor(subwayMap, mapView, geometry) {
            super();
            this.subwayMap = subwayMap;
            this.mapView = mapView;
            this.geometry = geometry;
            this.stationsCounter = 0;
            this.initialize(mapView.getCanvas(), subwayMap);
        }
        initialize(canvas, subwayMap) {
            canvas.addEventListener("click", event => this.handleClick(event));
            subwayMap.mapReloaded(() => this.onMapReloaded());
        }
        onMapReloaded() {
            this.stationsCounter = this.subwayMap.stations.length;
        }
        handleClick(event) {
            this.hideEditPopup();
            if (event.target instanceof SVGTextPositioningElement) {
                this.renameStation(event);
            }
            else {
                this.tryAddStation(event);
            }
        }
        hideEditPopup() {
            let edit = document.getElementById("edit-label");
            if (edit != null) {
                edit.remove();
            }
        }
        renameStation(event) {
            let target = event.target instanceof SVGTextElement ? event.target : event.target.parentElement;
            let label = this.subwayMap.getStation(this.mapView.getId(target)).label;
            let center = this.geometry.centrify(label);
            let topLeft = this.geometry.rectTopLeftCorner(center, this.geometry.cellSize, this.geometry.cellSize);
            let editForm = this.prepareEditPopup(label);
            editForm.style.display = "block";
            editForm.style.left = `${topLeft.x}px`;
            editForm.style.top = `${topLeft.y}px`;
            document.body.appendChild(editForm);
        }
        prepareEditPopup(label) {
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
        addEventHandlers(editForm, label) {
            // textarea
            let text = editForm.children[0];
            text.addEventListener("input", () => {
                if (Strings_1.Strings.isNullOrWhitespace(text.value)) {
                    editForm.children[2].classList.add('disabled'); // do not allow save empty value
                    return;
                }
                else {
                    editForm.children[2].classList.remove('disabled');
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
                if (!Strings_1.Strings.isNullOrWhitespace(text.value)) {
                    label.setName(...text.value.split(/\r\n|\r|\n/).map(s => s.trim()));
                    editForm.remove();
                    this.mapView.redrawMap(this.subwayMap);
                }
            });
            return editForm;
        }
        tryAddStation(event) {
            let rect = (event.currentTarget).getBoundingClientRect();
            let cell = this.geometry.normalizeToGridCell(event.clientX - rect.left, event.clientY - rect.top);
            if (this.mapView.isCellAvailable(cell)) {
                let id = this.stationsCounter++;
                this.subwayMap.newStation(id, cell.x, cell.y);
                this.mapView.redrawMap(this.subwayMap);
            }
            // if cell does not contain another station but still occupied by something else show error
            else if (event.target instanceof SVGSVGElement ||
                event.target instanceof SVGLineElement ||
                event.target instanceof SVGTextPositioningElement) {
                this.showError(Strings_1.Strings.occupiedCellError());
            }
        }
    }
    exports.StationsController = StationsController;
});
//# sourceMappingURL=StationsController.js.map