//------------------------------------COMPONENT BASE CLASS-------------------------------------
export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string,
  ) {
    this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T; // Div app

    const importedNode = document.importNode(this.templateElement.content, true); // Pass a pointer at your template
    this.element = importedNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attach(insertAtStart);
  }

  private attach(insertAtStart: boolean) { // If insertAtStart is true, it get the 'afterbegin' value, otherwise, 'beforeend'
    this.hostElement.insertAdjacentElement(insertAtStart ? 'afterbegin' : 'beforeend', this.element); // Insert the html element in a specific place
  }

  abstract configure(): void;
  abstract renderContent(): void;

}
  //------------------------------------COMPONENT BASE CLASS-------------------------------------