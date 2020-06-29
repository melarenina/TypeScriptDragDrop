import { DragTarget } from '../interfaces/drag-drop-interface';
import { Project, ProjectStatus } from '../models/project-model';
import { Component } from './base-component';
import { autobind } from '../decorators/autobind-decorator';
import { projectState } from '../state/project-state';
import { ProjectItem } from './project-item';

//-------------------------------------PROJECT LIST CLASS--------------------------------------
export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {

  private assignedProjects: Project[] = [];

  constructor(private typeProject: 'active' | 'finished') {
    super('project-list', 'app', false, `${typeProject}-projects`);
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