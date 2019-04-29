import { Controller, GridController } from "./Controllers/GridController";

$(document).ready(() => {
    enum Phase {
        customizeGrid,
        stationsSetUp,
        linesSetUp,
        drawing
    }

    let map = document.getElementById("map");

    let currentState = Phase.customizeGrid;

    var controller: Controller = new GridController(map);

    document.getElementById("next").onclick = next;

    function next() {
        if (currentState == Phase.customizeGrid) {
            currentState = Phase.stationsSetUp;
            document.getElementById("grid-customization").classList.add("disabled");
            document.getElementById("stations-setup").classList.add("active");
            document.getElementById("stations-setup").classList.remove("disabled");
        }

        else if (currentState == Phase.stationsSetUp) {
            currentState = Phase.linesSetUp;
        }

        else if (currentState == Phase.linesSetUp) {
            currentState = Phase.drawing;
        }            

        controller.dispose();
        controller = controller.next();
    }
});


