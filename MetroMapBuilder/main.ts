import { GridController } from "./Controllers/GridController";
import { SizeSettings, SubwayMap } from "./Models/SubwayMap";
import { BackgroundController } from "./Controllers/BackgroundController";
import { RoutesController } from "./Controllers/RoutesController";
import { StationsController } from "./Controllers/StationsController";
import { MapDrawer } from "./Utils/MapDrawer";
import { Geometry } from "./Utils/Geometry";
import { RemovalController } from "./Controllers/RemovalController";

if (document.readyState === 'complete') {
    initApp();
} else {
    document.addEventListener("DOMContentLoaded", initApp);
}

function initApp() {

    let sizeSettings = getSizeSettings();
    let mapModel = new SubwayMap(sizeSettings);
    let geometry = new Geometry(sizeSettings);

    let map = createMapCanvas(mapModel.sizeSettings.canvasSize);
    let drawer = new MapDrawer(map, geometry);
    
    let gridController = new GridController(mapModel, drawer);
    let backgroundController = new BackgroundController(drawer);
    let routesController = new RoutesController(mapModel, drawer);
    let stationsController = new StationsController(mapModel, drawer, geometry);
    let removalController = new RemovalController(mapModel, drawer);
    // add ControlPanelController

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



