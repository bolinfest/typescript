interface Drivable {
    // Start the car's ignition so that it can drive.
    start(): void;
    // Attempt to drive a distance. Returns true or false based on whether or not the drive was successful.
    drive(distance: number): bool;
    // Give the distance from the start.
    getPosition(): number;
}

class Car implements Drivable {
    private _isRunning: bool;
    private _distanceFromStart: number;
    constructor() {
        this._isRunning = false;
        this._distanceFromStart = 0;
    }
    public start() {
        this._isRunning = true;
    }
    public drive(distance: number): bool {
        if (this._isRunning) {
            this._distanceFromStart += distance;
            return true;
        }
        return false;
    }
    public getPosition(): number {
        return this._distanceFromStart;
    }
}

// Want to experiment? Try adding a second interface: Flyable. Implement it in a Helicopter class, then write a FlyingCar class that implements both Drivable and Flyable!