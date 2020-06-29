import { Project, ProjectStatus } from '../models/project-model.js';
class State {
    constructor() {
        this.listeners = [];
    }
    addListener(listenerFun) {
        this.listeners.push(listenerFun);
    }
}
export class ProjectState extends State {
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
        const newProject = new Project(Math.random().toString(), title, description, numOfPeople, ProjectStatus.Active // Every new project is initializated with active
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
export const projectState = ProjectState.getInstance(); // To only have one object for our whole project
//----------------------------------PROJECT STATE MANAGEMENT----------------------------------
//# sourceMappingURL=project-state.js.map