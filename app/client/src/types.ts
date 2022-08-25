type Dict<T> = Record<string, T>

export interface Isolate {
    hash?: string
    filename?: string
    amr?: string
    sketch?: string
    cluster?: string
}

export interface Versions {
    data: Array<Dict<string>> | null
    errors: Array<string>
    status: string
}

export type User = Dict<string> | null

export interface Results {
    perIsolate: Dict<Isolate>
}

export enum ValueTypes {
    AMR = 'amr',
    SKETCH = 'sketch'
}

export interface IsolateValue {
    hash: string
    type: ValueTypes
    result: string
}

export enum AnalysisType {
    ASSIGN = 'assign',
    MICROREACT = 'microreact',
    NETWORK = 'network'
}

export type AnalysisStatus = {
    [key in AnalysisType]: string | null
}

export type ClusterInfo = Dict<Dict<string>>

export interface BeebopError {
    error: string,
    detail?: string
}

export interface ResponseFailure {
    status: 'failure';
    data: null;
    errors: BeebopError[];
}

export interface ResponseSuccess<T=unknown> {
    status: 'success';
    data: T;
    errors: null;
}
