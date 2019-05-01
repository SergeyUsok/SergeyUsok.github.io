import { Controller, GridController } from "./Controllers/GridController";

$(document).ready(() => {
    enum Phase {
        customizeGrid,
        stationsSetUp,
        linesSetUp,
        drawing
    }

    document.getElementById("next").onclick = next;

    let map = document.getElementById("map");
    let currentState = Phase.customizeGrid;
    var controller: Controller = new GridController(map);

    function next() {
        if (currentState == Phase.customizeGrid) {
            currentState = Phase.stationsSetUp;
            disable("grid-customization");
            enable("stations-setup");
        }

        else if (currentState == Phase.stationsSetUp) {
            currentState = Phase.linesSetUp;
            disable("stations-setup");
            enable("lines-setup");
        }

        else if (currentState == Phase.linesSetUp) {
            currentState = Phase.drawing;
            disable("lines-setup");
            enable("drawing");
        }            

        controller.dispose();
        controller = controller.next();
    }

    function disable(elementId: string) {
        document.getElementById(elementId).classList.add("disabled");
        document.getElementById(elementId).classList.remove("activated");
    }

    function enable(elementId: string) {
        document.getElementById(elementId).classList.remove("disabled");
        document.getElementById(elementId).classList.add("activated");
    }
});


