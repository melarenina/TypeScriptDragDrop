//------------------------------------COMPONENT BASE CLASS-------------------------------------
export class Component {
    constructor(templateId, hostElementId, insertAtStart, newElementId) {
        this.templateElement = document.getElementById(templateId);
        this.hostElement = document.getElementById(hostElementId); // Div app
        const importedNode = document.importNode(this.templateElement.content, true); // Pass a pointer at your template
        this.element = importedNode.firstElementChild;
        if (newElementId) {
            this.element.id = newElementId;
        }
        this.attach(insertAtStart);
    }
    attach(insertAtStart) {
        this.hostElement.insertAdjacentElement(insertAtStart ? 'afterbegin' : 'beforeend', this.element); // Insert the html element in a specific place
    }
}
//------------------------------------COMPONENT BASE CLASS-------------------------------------
//# sourceMappingURL=base-component.js.map