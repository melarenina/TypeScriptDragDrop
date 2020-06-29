var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("components/base-component", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Component = void 0;
    //------------------------------------COMPONENT BASE CLASS-------------------------------------
    class Component {
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
    exports.Component = Component;
});
//------------------------------------COMPONENT BASE CLASS-------------------------------------
define("util/validation", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validate = void 0;
    function validate(validatableInput) {
        let isValid = true;
        if (validatableInput.required) { // Trim() - Removes whitespace from both sides of a string
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
    exports.validate = validate;
});
//-----------------------------------------VALIDATION------------------------------------------
define("decorators/autobind-decorator", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.autobind = void 0;
    //-------------------------------------AUTOBIND DECORATOR-------------------------------------
    function autobind(_target, _methodName, descriptor) {
        const originalMethod = descriptor.value;
        const adjDescriptor = {
            configurable: true,
            get() {
                const boundFn = originalMethod.bind(this);
                return boundFn;
            }
        };
        return adjDescriptor;
    }
    exports.autobind = autobind;
});
//-------------------------------------AUTOBIND DECORATOR-------------------------------------
define("models/project-model", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Project = exports.ProjectStatus = void 0;
    //----------------------------------------PROJECT TYPE----------------------------------------
    var ProjectStatus;
    (function (ProjectStatus) {
        ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
        ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
    })(ProjectStatus = exports.ProjectStatus || (exports.ProjectStatus = {}));
    class Project {
        constructor(id, title, description, people, status) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.people = people;
            this.status = status;
        }
    }
    exports.Project = Project;
});
//----------------------------------------PROJECT TYPE----------------------------------------
define("state/project-state", ["require", "exports", "models/project-model"], function (require, exports, project_model_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.projectState = exports.ProjectState = void 0;
    class State {
        constructor() {
            this.listeners = [];
        }
        addListener(listenerFun) {
            this.listeners.push(listenerFun);
        }
    }
    class ProjectState extends State {
        constructor() {
            super();
            this.projects = [];
        }
        static getInstance() {
            if (this.instance) {
                return this.instance;
            }
            this.instance = new ProjectState();
            return this.instance;
        }
        addProject(title, description, numOfPeople) {
            const newProject = new project_model_js_1.Project(Math.random().toString(), title, description, numOfPeople, project_model_js_1.ProjectStatus.Active // Every new project is initializated with active
            );
            this.projects.push(newProject);
            this.updateListeners();
        }
        moveProject(projectId, newStatus) {
            const project = this.projects.find(prj => prj.id === projectId);
            if (project && project.status !== newStatus) {
                project.status = newStatus;
                this.updateListeners();
            }
        }
        updateListeners() {
            for (const listenerFun of this.listeners) {
                listenerFun(this.projects.slice()); // returning a copy of projects array so you can't edit from the outside
            }
        }
    }
    exports.ProjectState = ProjectState;
    exports.projectState = ProjectState.getInstance(); // To only have one object for our whole project
});
//----------------------------------PROJECT STATE MANAGEMENT----------------------------------
define("components/project-input", ["require", "exports", "components/base-component", "util/validation", "decorators/autobind-decorator", "state/project-state"], function (require, exports, base_component_js_1, validation_js_1, autobind_decorator_js_1, project_state_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProjectInput = void 0;
    //-------------------------------------PROJECT INPUT CLASS-------------------------------------
    class ProjectInput extends base_component_js_1.Component {
        constructor() {
            super('project-input', 'app', true, 'user-input');
            this.titleInputElement = this.element.querySelector('#title');
            this.descriptionInputElement = this.element.querySelector('#description');
            this.peopleInputElement = this.element.querySelector('#people');
            this.renderContent();
            this.configure();
        }
        gatherUserInput() {
            const enteredTitle = this.titleInputElement.value;
            const enteredDescription = this.descriptionInputElement.value;
            const enteredPeople = this.peopleInputElement.value;
            const titleValidatable = {
                value: enteredTitle,
                required: true
            };
            const descriptionValidatable = {
                value: enteredDescription,
                required: true,
                minLength: 5
            };
            const peopleValidatable = {
                value: +enteredPeople,
                required: true,
                min: 1,
                max: 5
            };
            if (!validation_js_1.validate(titleValidatable) ||
                !validation_js_1.validate(descriptionValidatable) ||
                !validation_js_1.validate(peopleValidatable)) {
                alert('Invalid input, please try again!');
                return;
            }
            else {
                return [enteredTitle, enteredDescription, +enteredPeople];
            }
        }
        clearInputs() {
            this.titleInputElement.value = '';
            this.descriptionInputElement.value = '';
            this.peopleInputElement.value = '';
        }
        submitHandler(event) {
            event.preventDefault(); // To don't send a HTTP request
            const userInput = this.gatherUserInput();
            if (Array.isArray(userInput)) {
                const [title, desc, people] = userInput;
                project_state_js_1.projectState.addProject(title, desc, people);
                this.clearInputs();
            }
        }
        renderContent() { }
        ;
        configure() {
            this.element.addEventListener('submit', this.submitHandler);
        }
    }
    __decorate([
        autobind_decorator_js_1.autobind
    ], ProjectInput.prototype, "submitHandler", null);
    exports.ProjectInput = ProjectInput;
});
//-------------------------------------PROJECT INPUT CLASS-------------------------------------
define("interfaces/drag-drop-interface", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
//----------------------------------DRAG AND DROP INTERFACES----------------------------------
define("components/project-item", ["require", "exports", "components/base-component", "decorators/autobind-decorator"], function (require, exports, base_component_js_2, autobind_decorator_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProjectItem = void 0;
    //-------------------------------------PROJECT ITEM CLASS--------------------------------------
    class ProjectItem extends base_component_js_2.Component {
        constructor(hostId, project) {
            super('single-project', hostId, false, project.id);
            this.project = project;
            this.configure();
            this.renderContent();
        }
        get persons() {
            if (this.project.people === 1) {
                return '1 resource';
            }
            else {
                return `${this.project.people} resources`;
            }
        }
        dragStartHandler(event) {
            event.dataTransfer.setData('text/plain', this.project.id);
            event.dataTransfer.effectAllowed = 'move';
        }
        dragEndHandler(_event) {
            console.log('Drag end');
        }
        configure() {
            this.element.addEventListener('dragstart', this.dragStartHandler);
            this.element.addEventListener('dragend', this.dragEndHandler);
        }
        renderContent() {
            this.element.querySelector('h2').textContent = this.project.title;
            this.element.querySelector('h3').textContent = this.persons + ' assigned';
            this.element.querySelector('p').textContent = this.project.description;
        }
        ;
    }
    __decorate([
        autobind_decorator_js_2.autobind
    ], ProjectItem.prototype, "dragStartHandler", null);
    exports.ProjectItem = ProjectItem;
});
//-------------------------------------PROJECT ITEM CLASS--------------------------------------
define("components/project-list", ["require", "exports", "models/project-model", "components/base-component", "decorators/autobind-decorator", "state/project-state", "components/project-item"], function (require, exports, project_model_js_2, base_component_js_3, autobind_decorator_js_3, project_state_js_2, project_item_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProjectList = void 0;
    //-------------------------------------PROJECT LIST CLASS--------------------------------------
    class ProjectList extends base_component_js_3.Component {
        constructor(typeProject) {
            super('project-list', 'app', false, `${typeProject}-projects`);
            this.typeProject = typeProject;
            this.assignedProjects = [];
            this.assignedProjects = [];
            this.configure();
            this.renderContent();
        }
        dragOverHandler(event) {
            if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') { // To just allow text plain drop
                event.preventDefault(); // To allow the drop. By default, JS does not allow
                const listEl = this.element.querySelector('ul');
                listEl.classList.add('droppable');
            }
        }
        dropHandler(event) {
            const prjId = event.dataTransfer.getData('text/plain');
            project_state_js_2.projectState.moveProject(prjId, this.typeProject === 'active' ? project_model_js_2.ProjectStatus.Active : project_model_js_2.ProjectStatus.Finished);
        }
        dragLeaveHandler(_event) {
            const listEl = this.element.querySelector('ul');
            listEl.classList.remove('droppable');
        }
        renderProjects() {
            const listEl = document.getElementById(`${this.typeProject}-projects-list`);
            listEl.innerHTML = ''; // Get rid of all the items and then rerender them, so it doesn't duplicate
            for (const projItem of this.assignedProjects) {
                new project_item_js_1.ProjectItem(this.element.querySelector('ul').id, projItem);
            }
        }
        configure() {
            this.element.addEventListener('dragover', this.dragOverHandler);
            this.element.addEventListener('dragleave', this.dragLeaveHandler);
            this.element.addEventListener('drop', this.dropHandler);
            project_state_js_2.projectState.addListener((projectsList) => {
                const relevantProjects = projectsList.filter(prj => {
                    if (this.typeProject === 'active') {
                        return prj.status === project_model_js_2.ProjectStatus.Active;
                    }
                    return prj.status === project_model_js_2.ProjectStatus.Finished;
                });
                this.assignedProjects = relevantProjects;
                this.renderProjects();
            });
        }
        renderContent() {
            const listId = `${this.typeProject}-projects-list`;
            this.element.querySelector('ul').id = listId;
            this.element.querySelector('h2').textContent = this.typeProject.toUpperCase() + ' PROJECTS';
        }
    }
    __decorate([
        autobind_decorator_js_3.autobind
    ], ProjectList.prototype, "dragOverHandler", null);
    __decorate([
        autobind_decorator_js_3.autobind
    ], ProjectList.prototype, "dropHandler", null);
    __decorate([
        autobind_decorator_js_3.autobind
    ], ProjectList.prototype, "dragLeaveHandler", null);
    exports.ProjectList = ProjectList;
});
//-------------------------------------PROJECT LIST CLASS--------------------------------------
define("app", ["require", "exports", "components/project-input", "components/project-list"], function (require, exports, project_input_js_1, project_list_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    new project_input_js_1.ProjectInput();
    new project_list_js_1.ProjectList('active');
    new project_list_js_1.ProjectList('finished');
});
//# sourceMappingURL=bundle.js.map