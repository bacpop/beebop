export interface MyObject {
    [key: string]: string;
}

export interface Isolate {
    hash?: string,
    filename?: string,
    amr?: string,
    cluster?: string,
    sketch?: string
}

export interface IsolateObject {
    [key: string]: Isolate;
}

export interface Versions {
    data: Array<MyObject> | null
    errors: Array<string>
    status: string
}

export interface User {
    data: MyObject | null
    errors: Array<string>
    status: string
}

export interface Results {
    perIsolate: IsolateObject
}
