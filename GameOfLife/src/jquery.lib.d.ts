// Some simple and naïve declaring of JQuery
// Declare some small set of JQuery methods

declare var $: JQuery; 

interface JQuery {
    (value: any): JQuery;
    click(callback: () => void): JQuery;
    empty(): JQuery;
    on(event: string, callback: () => void): JQuery;
    val(value?: string): string;
    get(index: number): HTMLElement;
    ready(callback: () => void): any;
    append(value: any): JQuery;
    appendTo(target: any): JQuery;
    addClass(cls: string): JQuery;
    removeClass(cls: string): JQuery;
    attr(name: string, value?: string): JQuery;
    html(value: string): JQuery;
    prop(name: string, value?: any): JQuery;
    find(selector: string): JQuery;
    off(event?: string): JQuery;
    width(): number;
    hide(speed?: string | number): JQuery;
    show(speed?: string | number): JQuery;
}