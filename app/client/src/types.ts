export interface Versions {
    data: Array<Record<string, never>> | null
    errors: Array<string>
    status: string
}

export interface User {
    data: Record<string, never> | null
    errors: Array<string>
    status: string
}
