export interface Patient {
    id?: string;
    firstName: string;
    lastName: string;
    cnp: string;
    age: number;
    address: string;
    phone: string;
    email: string;
    medicalHistory?: string;
    doctorId: string;
    password: string;
}