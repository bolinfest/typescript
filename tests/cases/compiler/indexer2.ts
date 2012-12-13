interface IHeapObjectProperty {}
interface IDirectChildrenMap { 
        hasOwnProperty(objectId: number) : bool; 
        [objectId: number] : IHeapObjectProperty[]; 
}    
var directChildrenMap = <IDirectChildrenMap>{}; 