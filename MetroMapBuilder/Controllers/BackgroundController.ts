import { MapDrawer } from "../Utils/MapDrawer";

export class BackgroundController {

    public constructor(drawer: MapDrawer) {
        let map = drawer.getCanvas();
        this.initialize(map);
    }

    private initialize(map: SVGSVGElement) {
        let backgroundUrl = '';
        let backgroundCheckbox = <HTMLInputElement>document.getElementById("background-switch");

        backgroundCheckbox.addEventListener("click", () => {
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
        });

        document.getElementById("url").addEventListener("input", e => {
            if ((<any>e).target.value != "") {
                document.getElementById("load").removeAttribute("disabled");
                document.getElementById("clear").removeAttribute("disabled");
            }
            else {
                document.getElementById("load").setAttribute("disabled", "disabled");
                document.getElementById("clear").setAttribute("disabled", "disabled");
            }
        });

        document.getElementById("load").addEventListener("click", () => {
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
        });

        document.getElementById("clear").addEventListener("click", () => {
            map.classList.remove("bgd");
            map.classList.add("bgd-color");
            map.style.backgroundImage = '';
            (<any>document.getElementById("url")).value = '';
            backgroundUrl = '';
            document.getElementById("clear").setAttribute("disabled", "disabled");
            backgroundCheckbox.setAttribute("disabled", "disabled");
            backgroundCheckbox.checked = false;
        });        
    }
}