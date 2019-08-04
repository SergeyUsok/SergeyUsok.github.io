
export abstract class ErrorController {
    private timerId: number = -1;

    protected constructor() {
        document.getElementById("close-alert").addEventListener("click", () => {
            document.getElementById("error").classList.remove("visible");
            document.getElementById("error").classList.add("invisible");
            clearTimeout(this.timerId);
        });
    }

    protected showError(errorMsg: string): void {
        let alert = document.getElementById("error");
        document.getElementById("error").classList.remove("invisible");
        document.getElementById("error").classList.add("visible");
        alert.firstElementChild.textContent = errorMsg;

        this.timerId = setTimeout(() => {
            document.getElementById("error").classList.remove("visible");
            document.getElementById("error").classList.add("invisible");
        }, 5000);
    }
}