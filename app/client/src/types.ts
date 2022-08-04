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

export interface User {
    data: Dict<string> | null
    errors: Array<string>
    status: string
}

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
    SUBMITTED = 'submitted',
    ASSIGN = 'assign',
    MICROREACT = 'microreact',
    NETWORK = 'network'
}

export type AnalysisStatus = {
    [key in AnalysisType]: string | null
}

export type Status = {
    task: AnalysisType
    data: string
}

export interface ClusterInfo {
    data: Dict<Dict<string>>
}
