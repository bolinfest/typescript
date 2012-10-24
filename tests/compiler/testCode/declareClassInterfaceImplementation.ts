// bug 16556
// should not be an error, declared classes don't have an implementation

interface IBuffer {
    [index: number]: number;
}

declare class Buffer implements IBuffer {

}
