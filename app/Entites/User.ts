
export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    registrationNumber: string;
    department?: string;
}