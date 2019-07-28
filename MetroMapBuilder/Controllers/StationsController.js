define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StationsController {
        constructor(subwayMap, mapView, geometry) {
            this.subwayMap = subwayMap;
            this.mapView = mapView;
            this.geometry = geometry;
            this.stationsCounter = 0;
            this.initialize(mapView.getCanvas());
        }
        initialize(canvas) {
            canvas.addEventListener("click", event => this.handleClick(event));
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
            let topLeft = this.geometry.topLeftCorner(label);
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
                if (this.isNullOrWhitespace(text.value)) {
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
                if (!this.isNullOrWhitespace(text.value)) {
                    label.setName(...text.value.split(/\r\n|\r|\n/).map(s => s.trim()));
                    editForm.remove();
                    this.mapView.redrawMap(this.subwayMap);
                }
            });
            return editForm;
        }
        isNullOrWhitespace(input) {
            if (typeof input === 'undefined' || input == null)
                return true;
            return input.replace(/\s/g, '').length < 1;
        }
        tryAddStation(event) {
            let rect = (event.currentTarget).getBoundingClientRect();
            let cell = this.geometry.normalizeToGridCell(event.clientX - rect.left, event.clientY - rect.top);
            if (this.mapView.isCellAvailable(cell)) {
                let id = this.stationsCounter++;
                this.subwayMap.newStation(id, cell.x, cell.y);
                this.mapView.redrawMap(this.subwayMap);
            }
            else {
                // TODO show error about not available cell
            }
        }
    }
    exports.StationsController = StationsController;
});
//# sourceMappingURL=StationsController.js.map