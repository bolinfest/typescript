// Bug 16374: Optional parameters not considered when computing overloads
class Z {
    public func(): void { }
}
class Y extends Z {
    public func(value?: any): void { }
}
