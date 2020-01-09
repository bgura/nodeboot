export{};

class Route {
    // Members

    private name: string;
    private method: string;
    private pattern: string;
    private handler: (arg0: any, arg1: any) => any;

    // Properties
    getName(): string {
        return this.name;
    }

    getMethod(): string {
        return this.method;
    }

    getPattern(): string { 
        return this.pattern;
    }

    getHandler(): (arg0: any, arg1: any) => any { 
        return this.handler;
    }

    constructor(name: string, method: string, pattern: string, handler: (arg0: any, arg1: any) => any) {
        this.name = name;
        this.method = method;
        this.pattern = pattern;
        this.handler = handler;
    }
}

export default Route