import { Project, ProjectStatus } from '../models/project-model';

//----------------------------------PROJECT STATE MANAGEMENT---------------------------------
type Listener<T> = (items: T[]) => void; // Void - return type

class State<T>{
  protected listeners: Listener<T>[] = [];

  addListener(listenerFun: Listener<T>) {
    this.listeners.push(listenerFun);
  }
}

export class ProjectState extends State<Project>{
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

export const projectState = ProjectState.getInstance(); // To only have one object for our whole project
//----------------------------------PROJECT STATE MANAGEMENT----------------------------------