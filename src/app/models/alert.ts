export interface Alert {
    id: string;
    patientId: string;
    message: string;
    timestamp: string; // sau Date, dacă vrei obiect de tip Date
  }