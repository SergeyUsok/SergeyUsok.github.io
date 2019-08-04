import { GridController } from "./Controllers/GridController";
import { SizeSettings, SubwayMap } from "./Models/SubwayMap";
import { BackgroundController } from "./Controllers/BackgroundController";
import { RoutesController } from "./Controllers/RoutesController";
import { StationsController } from "./Controllers/StationsController";
import { MapView } from "./Utils/MapView";
import { Geometry } from "./Utils/Geometry";
import { RemovalController } from "./Controllers/RemovalController";
import { IOController } from "./Controllers/IOController";

if (document.readyState !== 'loading') {
    initApp();
} else {
    document.addEventListener("DOMContentLoaded", initApp);
}

function initApp() {

    let sizeSettings = getSizeSettings();
    let mapModel = new SubwayMap(sizeSettings);
    let geometry = new Geometry(sizeSettings);

    let map = createMapCanvas(mapModel.sizeSettings.canvasSize);
    let view = new MapView(map, geometry);
    
    let gridController = new GridController(mapModel, view);
    let backgroundController = new BackgroundController(view);
    let routesController = new RoutesController(mapModel, view);
    let stationsController = new StationsController(mapModel, view, geometry);
    let removalController = new RemovalController(mapModel, view);
    let ioController = new IOController(mapModel, view);

    function getSizeSettings() {
        let gridSize = 80;
        let canvasSize = 1000;
        let lineWidthFactor = 0.2;
        return new SizeSettings(gridSize, canvasSize, lineWidthFactor);
    }

    function createMapCanvas(size: number) {
        let parent = document.getElementById("canvas");
        let map = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        map.setAttribute("width", <any>size);
        map.setAttribute("height", <any>size);
        map.setAttribute("class", "bgd-color");
        map.setAttribute("id", "map");
        parent.appendChild(map);
        return map;
    }
}



