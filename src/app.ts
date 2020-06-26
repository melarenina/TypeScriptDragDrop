//----------------------------------DRAG AND DROP INTERFACES----------------------------------
interface Draggable{
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget{
  dragOverHandler(event: DragEvent): void; // To permit the drop
  dropHandler(event: DragEvent): void; // To drop
  dragLeaveHandler(event: DragEvent): void;
}
//----------------------------------DRAG AND DROP INTERFACES----------------------------------


//----------------------------------------PROJECT TYPE----------------------------------------
enum ProjectStatus { Active, Finished }

class Project {

  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}

}
//----------------------------------------PROJECT TYPE----------------------------------------

//----------------------------------PROJECT STATE MANAGEMENT---------------------------------
type Listener<T> = (items: T[]) => void; // Void - return type

class State<T>{
  protected listeners: Listener<T>[] = [];

  addListener(listenerFun: Listener<T>) {
    this.listeners.push(listenerFun);
  }
}

class ProjectState extends State<Project>{
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
   }
  
  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  

  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(), title, description, numOfPeople, ProjectStatus.Active // Every new project is initializated with active
    );
    this.projects.push(newProject);
    this.updateListeners();
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find(prj => prj.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners() {
    for (const listenerFun of this.listeners) {
      listenerFun(this.projects.slice()); // returning a copy of projects array so you can't edit from the outside
    }
  }
}
//----------------------------------PROJECT STATE MANAGEMENT----------------------------------

const projectState = ProjectState.getInstance(); // To only have one object for our whole project

//-------------------------------------AUTOBIND DECORATOR-------------------------------------
function autobind(_target: any, _methodName: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    }
  };
  return adjDescriptor;
}
//-------------------------------------AUTOBIND DECORATOR-------------------------------------

//-----------------------------------------VALIDATION------------------------------------------
interface Validatable {
  value: string | number;
  required?: boolean; // ? - not mandatory
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number; // Check if the number is negative or positive, or bigger than X number
}

function validate(validatableInput: Validatable) {
  let isValid = true;
  if (validatableInput.required) {  // Trim() - Removes whitespace from both sides of a string
    isValid = isValid && validatableInput.value.toString().trim().length !== 0; // If the thing after && is false, is valid will be false too
  }
  if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
  }
  if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
  }
  if (validatableInput.min != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (validatableInput.max != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid;
}
//-----------------------------------------VALIDATION------------------------------------------

//------------------------------------COMPONENT BASE CLASS-------------------------------------
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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

//-------------------------------------PROJECT ITEM CLASS--------------------------------------
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable{

  private project: Project;

  get persons() {
    if (this.project.people === 1) {
      return '1 resource';
    } else {
      return `${this.project.people} resources`
    }
  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  @autobind
  dragStartHandler(event: DragEvent) { 
    event.dataTransfer!.setData('text/plain', this.project.id);
    event.dataTransfer!.effectAllowed = 'move';
  }
  
  dragEndHandler(_event: DragEvent) {
    console.log('Drag end');
   }

  configure() {
    this.element.addEventListener('dragstart', this.dragStartHandler)
    this.element.addEventListener('dragend', this.dragEndHandler)
  }

  renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = this.persons + ' assigned';
    this.element.querySelector('p')!.textContent = this.project.description;

  };
}
//-------------------------------------PROJECT ITEM CLASS--------------------------------------

//-------------------------------------PROJECT LIST CLASS--------------------------------------
class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{

  private assignedProjects: Project[] = [];

  constructor(private typeProject: 'active' | 'finished') {
    super('project-list', 'app', false,`${typeProject}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  @autobind
  dragOverHandler(event: DragEvent) {

    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') { // To just allow text plain drop
      event.preventDefault(); // To allow the drop. By default, JS does not allow
      const listEl = this.element.querySelector('ul')!;
      listEl.classList.add('droppable');
    }
    
   }

  @autobind
  dropHandler(event: DragEvent) {
    const prjId = event.dataTransfer!.getData('text/plain');
    projectState.moveProject(prjId, this.typeProject === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
   }

  @autobind
  dragLeaveHandler(_event: DragEvent) {
    const listEl = this.element.querySelector('ul')!;
    listEl.classList.remove('droppable');
   }
  


  private renderProjects() {
    const listEl = document.getElementById(`${this.typeProject}-projects-list`)! as HTMLUListElement;
    listEl.innerHTML = ''; // Get rid of all the items and then rerender them, so it doesn't duplicate
    for (const projItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector('ul')!.id, projItem);
    }
  }

  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);
    projectState.addListener((projectsList: Project[]) => { 
      const relevantProjects = projectsList.filter(prj => { // When this function returns true, we keep the item in a new array, stored in relevantProjects
        if (this.typeProject === 'active') {
          return prj.status === ProjectStatus.Active;
        }
        return prj.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
   }

   renderContent() {
    const listId = `${this.typeProject}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = this.typeProject.toUpperCase() + ' PROJECTS';
  }
  
}
//-------------------------------------PROJECT LIST CLASS--------------------------------------

//-------------------------------------PROJECT INPUT CLASS-------------------------------------
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{

  private titleInputElement: HTMLInputElement;
  private descriptionInputElement: HTMLInputElement;
  private peopleInputElement: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true, 'user-input');

    this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

    this.renderContent();
    this.configure();
    
  }

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true
    }
    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5
    }
    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5
    }

    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable) 
    ){
      alert('Invalid input, please try again!');
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault(); // To don't send a HTTP request
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)){
      const [title, desc, people] = userInput;
      projectState.addProject(title, desc, people);
      this.clearInputs();
    }
  }
  
  renderContent() {};
  configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

}
//-------------------------------------PROJECT INPUT CLASS-------------------------------------

const prjInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');
