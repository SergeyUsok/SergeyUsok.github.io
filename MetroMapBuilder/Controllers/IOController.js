define(["require", "exports", "./ErrorController", "../Utils/Strings"], function (require, exports, ErrorController_1, Strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class IOController extends ErrorController_1.ErrorController {
        constructor(subwayMap, mapView) {
            super();
            this.subwayMap = subwayMap;
            this.mapView = mapView;
            this.key = "saved_maps";
            let serializedMaps = window.localStorage.getItem(this.key);
            this.savedMaps = serializedMaps != null ? JSON.parse(serializedMaps) : [];
            this.initialize();
        }
        initialize() {
            // save map dialog handlers
            let mapNameTextBox = document.getElementById("map-name");
            mapNameTextBox.addEventListener("input", () => this.validate(mapNameTextBox));
            document.getElementById("openSave").addEventListener("click", () => this.openSaveDialog(mapNameTextBox));
            document.getElementById("save").addEventListener("click", e => this.handleSave(e, mapNameTextBox));
            document.getElementById("yes").addEventListener("click", () => this.confirm(mapNameTextBox));
            document.getElementById("no").addEventListener("click", () => this.hideConfirmation());
            // load map dialog handlers
            document.getElementById("openLoad").addEventListener("click", () => this.openLoadDialog());
            // export map
            document.getElementById("export").addEventListener("click", () => this.exportMap());
            // import map
            let fileInput = document.getElementById("importedMap");
            document.getElementById("import").addEventListener("click", () => fileInput.click());
            document.getElementById("importedMap").addEventListener("change", () => this.importMap(fileInput.files));
        }
        importMap(files) {
            if (files.length == 0)
                return;
            let file = files[0]; // import only first file from list
            var reader = new FileReader();
            reader.onload = e => {
                try {
                    let map = JSON.parse(e.target.result);
                    this.loadMap(map);
                }
                catch (e) {
                    this.showError(Strings_1.Strings.errorOnJsonParse(e.message));
                    console.error(e.message);
                }
            };
            reader.onerror = () => {
                reader.abort();
                this.showError(Strings_1.Strings.errorOnFileRead(reader.error.message));
            };
            reader.readAsText(file);
        }
        exportMap() {
            let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.subwayMap.toJson()));
            let downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "metro_map.json");
            document.body.appendChild(downloadAnchorNode); // required for firefox
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        }
        openLoadDialog() {
            let msgEl = document.getElementById("maps-msg");
            msgEl.innerText = this.savedMaps.length > 0 ? "Saved maps" : "No saved maps found";
            this.createList("maps-list-load", map => this.loadMap(map));
        }
        loadMap(map) {
            try {
                this.subwayMap = this.subwayMap.fromJson(map);
            }
            catch (e) {
                this.showError(Strings_1.Strings.errorOnMapParse(e.message));
                console.error(e.message);
            }
            this.mapView.redrawMap(this.subwayMap);
        }
        createList(parentId, clickHandler) {
            let parentUl = document.getElementById(parentId);
            this.clearNode(parentUl);
            for (let i = this.savedMaps.length - 1; i >= 0; i--) {
                let map = this.savedMaps[i];
                let li = document.createElement("li");
                let remove = document.createElement("button");
                remove.classList.add("btn", "btn-link", "remove-map");
                remove.addEventListener("click", e => {
                    e.stopPropagation();
                    li.remove();
                    this.savedMaps.splice(i, 1);
                    window.localStorage.setItem(this.key, JSON.stringify(this.savedMaps));
                });
                remove.innerText = "Remove";
                li.addEventListener("click", () => clickHandler(map));
                li.textContent = map.name;
                li.appendChild(remove);
                parentUl.appendChild(li);
            }
        }
        handleSave(event, mapNameTextBox) {
            if (mapNameTextBox.value == "" || mapNameTextBox.value == null) {
                mapNameTextBox.classList.add("is-invalid");
                event.stopPropagation();
                return;
            }
            let name = mapNameTextBox.value;
            let index = this.savedMaps.findIndex(a => a.name == name);
            // if map with provided name already exists then ask user for confirmation for overwritting
            if (index > -1) {
                event.stopPropagation();
                this.showConfirmation(name);
            }
            else {
                this.updateLocalStorage(name, index);
            }
        }
        confirm(mapNameTextBox) {
            this.hideConfirmation();
            let name = mapNameTextBox.value;
            let index = this.savedMaps.findIndex(a => a.name == name);
            this.updateLocalStorage(name, index);
        }
        hideConfirmation() {
            document.getElementById("confirmation").classList.add("d-none");
            document.getElementById("save").classList.remove("disabled");
            document.getElementById("map-name").removeAttribute("disabled");
        }
        showConfirmation(name) {
            document.querySelector("#confirmation p strong").innerHTML = name;
            document.getElementById("save").classList.add("disabled");
            document.getElementById("map-name").setAttribute("disabled", "disabled");
            document.getElementById("confirmation").classList.remove("d-none");
        }
        validate(mapNameTextBox) {
            if (mapNameTextBox.value == "" || mapNameTextBox.value == null) {
                mapNameTextBox.classList.add("is-invalid");
            }
            else {
                mapNameTextBox.classList.remove("is-invalid");
            }
        }
        openSaveDialog(mapNameTextBox) {
            // reset to defaults
            mapNameTextBox.value = "";
            mapNameTextBox.classList.remove("is-invalid");
            this.hideConfirmation();
            // build and view list of saved maps
            this.createList("maps-list", map => mapNameTextBox.value = map.name);
        }
        updateLocalStorage(name, index) {
            let jsonObject = this.subwayMap.toJson(name);
            if (index <= -1) {
                this.savedMaps.push(jsonObject);
            }
            else {
                this.savedMaps[index] = jsonObject;
            }
            window.localStorage.setItem(this.key, JSON.stringify(this.savedMaps));
        }
        clearNode(node) {
            while (node.hasChildNodes()) {
                node.lastChild.remove();
            }
        }
    }
    exports.IOController = IOController;
});
//# sourceMappingURL=IOController.js.map