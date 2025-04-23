export interface Sensor {
    id: string;             // ID-ul senzorului
    patientId: string;      // ID-ul pacientului
    ekgSignal: string;      // Semnalul EKG (poate fi un string care reprezintă datele brute sau un cod)
    heartRate: string;      // Ritmul cardiac
    temperature: number;    // Temperatura în grade Celsius
    humidity: number;       // Umiditatea (%)
    timestamp: Date;        // Data și ora la care au fost colectate datele
  }