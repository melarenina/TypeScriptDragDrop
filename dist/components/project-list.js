var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ProjectStatus } from '../models/project-model.js';
import { Component } from './base-component.js';
import { autobind } from '../decorators/autobind-decorator.js';
import { projectState } from '../state/project-state.js';
import { ProjectItem } from './project-item.js';
//-------------------------------------PROJECT LIST CLASS--------------------------------------
export class ProjectList extends Component {
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
        projectState.moveProject(prjId, this.typeProject === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
    }
    dragLeaveHandler(_event) {
        const listEl = this.element.querySelector('ul');
        listEl.classList.remove('droppable');
    }
    renderProjects() {
        const listEl = document.getElementById(`${this.typeProject}-projects-list`);
        listEl.innerHTML = ''; // Get rid of all the items and then rerender them, so it doesn't duplicate
        for (const projItem of this.assignedProjects) {
            new ProjectItem(this.element.querySelector('ul').id, projItem);
        }
    }
    configure() {
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);
        this.element.addEventListener('drop', this.dropHandler);
        projectState.addListener((projectsList) => {
            const relevantProjects = projectsList.filter(prj => {
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
        this.element.querySelector('ul').id = listId;
        this.element.querySelector('h2').textContent = this.typeProject.toUpperCase() + ' PROJECTS';
    }
}
__decorate([
    autobind
], ProjectList.prototype, "dragOverHandler", null);
__decorate([
    autobind
], ProjectList.prototype, "dropHandler", null);
__decorate([
    autobind
], ProjectList.prototype, "dragLeaveHandler", null);
//-------------------------------------PROJECT LIST CLASS--------------------------------------
//# sourceMappingURL=project-list.js.map