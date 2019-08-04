import { SubwayMap } from "../Models/SubwayMap";
import { MapView } from "../Utils/MapView";
import { ErrorController } from "./ErrorController";
import { Strings } from "../Utils/Strings";

export class IOController extends ErrorController {
    private savedMaps: any[];
    private key: string = "saved_maps";

    public constructor(private subwayMap: SubwayMap, private mapView: MapView) {
        super();
        let serializedMaps = window.localStorage.getItem(this.key);
        this.savedMaps = serializedMaps != null ? JSON.parse(serializedMaps) : [];
        this.initialize();
    } 

    private initialize(): void {
        // save map dialog handlers
        let mapNameTextBox = <HTMLInputElement>document.getElementById("map-name");
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
        let fileInput = <HTMLInputElement>document.getElementById("importedMap");
        document.getElementById("import").addEventListener("click", () => fileInput.click());
        document.getElementById("importedMap").addEventListener("change", () => this.importMap(fileInput.files));
    }

    private importMap(files: FileList): void {
        if (files.length == 0)
            return;

        let file = files[0]; // import only first file from list

        var reader = new FileReader();
        reader.onload = e => {
            try {
                let map = JSON.parse((<any>e).target.result);
                this.loadMap(map);
            } catch (e) {
                this.showError(Strings.errorOnJsonParse(e.message));
                console.error(e.message);
            }
        };
        reader.onerror = () => {
            reader.abort();
            this.showError(Strings.errorOnFileRead(reader.error.message));
        };
        
        reader.readAsText(file);
    }

    private exportMap(): void {
        let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.subwayMap.toJson()));
        let downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "metro_map.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    private openLoadDialog(): void {
        let msgEl = document.getElementById("maps-msg");
        msgEl.innerText = this.savedMaps.length > 0 ? "Saved maps" : "No saved maps found";
        this.createList("maps-list-load", map => this.loadMap(map));
    }

    private loadMap(map: any): void {
        try {
            this.subwayMap = this.subwayMap.fromJson(map);
        } catch (e) {
            this.showError(Strings.errorOnMapParse(e.message));
            console.error(e.message);
        }

        this.mapView.redrawMap(this.subwayMap);
    }

    private createList(parentId: string, clickHandler: (map:any) => void): void {
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

    private handleSave(event: MouseEvent, mapNameTextBox: HTMLInputElement): any {
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

    private confirm(mapNameTextBox: HTMLInputElement): void {
        this.hideConfirmation();
        let name = mapNameTextBox.value;
        let index = this.savedMaps.findIndex(a => a.name == name);
        this.updateLocalStorage(name, index);
    }

    private hideConfirmation(): void {
        document.getElementById("confirmation").classList.add("d-none");
        document.getElementById("save").classList.remove("disabled");
        document.getElementById("map-name").removeAttribute("disabled");        
    }

    private showConfirmation(name: string) {
        document.querySelector("#confirmation p strong").innerHTML = name;
        document.getElementById("save").classList.add("disabled");
        document.getElementById("map-name").setAttribute("disabled", "disabled");
        document.getElementById("confirmation").classList.remove("d-none");
    }

    private validate(mapNameTextBox: HTMLInputElement): void {
        if (mapNameTextBox.value == "" || mapNameTextBox.value == null) {
            mapNameTextBox.classList.add("is-invalid");
        }
        else {
            mapNameTextBox.classList.remove("is-invalid");
        }
    }

    private openSaveDialog(mapNameTextBox: HTMLInputElement): void {
        // reset to defaults
        mapNameTextBox.value = "";
        mapNameTextBox.classList.remove("is-invalid");
        this.hideConfirmation();
        // build and view list of saved maps
        this.createList("maps-list", map => mapNameTextBox.value = map.name);
    }    

    private updateLocalStorage(name: string, index: number) {
        let jsonObject = this.subwayMap.toJson(name);

        if (index <= -1) {
            this.savedMaps.push(jsonObject);
        }
        else {
            this.savedMaps[index] = jsonObject;
        }
        
        window.localStorage.setItem(this.key, JSON.stringify(this.savedMaps));
    }

    private clearNode(node: Element) {
        while (node.hasChildNodes()) {
            node.lastChild.remove();
        }
    }
}