export interface Recommendation {
    id: string;
    patientId: string;
    doctorId: string;
    activityType: string;
    duration: string;
    createdAt: Date;
}