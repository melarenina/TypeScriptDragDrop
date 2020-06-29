//----------------------------------DRAG AND DROP INTERFACES----------------------------------
  export interface Draggable{
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
  }
  
  export interface DragTarget{
    dragOverHandler(event: DragEvent): void; // To permit the drop
    dropHandler(event: DragEvent): void; // To drop
    dragLeaveHandler(event: DragEvent): void;
  }
//----------------------------------DRAG AND DROP INTERFACES----------------------------------