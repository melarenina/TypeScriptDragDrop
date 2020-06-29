import { Draggable } from '../interfaces/drag-drop-interface.js';
import { Project } from '../models/project-model.js';
import { Component } from './base-component.js';
import { autobind } from '../decorators/autobind-decorator.js';

  //-------------------------------------PROJECT ITEM CLASS--------------------------------------
  export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable{

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