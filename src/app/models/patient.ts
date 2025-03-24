export interface Patient {
    firstName: string;
    lastName: string;
    CNP: string;
    age: number;
    address: string;
    phone: string;
    email: string;
    medicalHistory?: string;
    doctorId: string;
}