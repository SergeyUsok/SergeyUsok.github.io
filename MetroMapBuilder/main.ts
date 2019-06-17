import { Controller, GridController } from "./Controllers/GridController";

$(document).ready(() => {
    enum Phase {
        customizeGrid,
        stationsSetUp,
        linesSetUp,
        drawing
    }

    document.getElementById("next").onclick = next;
    document.getElementById("url").addEventListener("input", urlTextChaged);
    document.getElementById("load").addEventListener("click", loadBackground);
    document.getElementById("clear").addEventListener("click", clearBackground);

    let backgroundCheckbox = <HTMLInputElement>document.getElementById("background-switch");
    backgroundCheckbox.addEventListener("click", switchBackground);
    let backgroundUrl = '';

    let map = document.getElementById("map");
    let currentState = Phase.customizeGrid;
    let controller: Controller = new GridController(map);

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
    };

    function enable(elementId: string) {
        document.getElementById(elementId).classList.remove("disabled");
        document.getElementById(elementId).classList.add("activated");
    };

    function switchBackground() {
        if (backgroundCheckbox.checked) {
            map.classList.remove("bgd-color");
            map.classList.add("bgd");
            map.style.backgroundImage = backgroundUrl;
        }
        else {
            map.classList.remove("bgd");
            map.classList.add("bgd-color");
            map.style.backgroundImage = '';
        }
    };

    function loadBackground(): void {
        let url = (<any>document.getElementById("url")).value;
        let map = document.getElementById("map");
        map.classList.add("bgd");
        map.classList.remove("bgd-color");
        backgroundUrl = `url(${url})`;
        map.style.backgroundImage = backgroundUrl;
        document.getElementById("load").setAttribute("disabled", "disabled");
        document.getElementById("clear").removeAttribute("disabled");
        backgroundCheckbox.removeAttribute("disabled");
        backgroundCheckbox.checked = true;
    };

    function clearBackground(): void {
        let map = document.getElementById("map");
        map.classList.remove("bgd");
        map.classList.add("bgd-color");
        map.style.backgroundImage = '';
        (<any>document.getElementById("url")).value = '';
        backgroundUrl = '';
        document.getElementById("clear").setAttribute("disabled", "disabled");
        backgroundCheckbox.setAttribute("disabled", "disabled");
        backgroundCheckbox.checked = false;
    };

    function urlTextChaged(e) {
        if (e.target.value != "") {
            document.getElementById("load").removeAttribute("disabled");
            document.getElementById("clear").removeAttribute("disabled");
        }
        else {
            document.getElementById("load").setAttribute("disabled", "disabled");
            document.getElementById("clear").setAttribute("disabled", "disabled");
        }
    };
});


