export interface ListNotification {
  id: number;
  lat: number;
  lon: number;
  location: string;
  wastetype: string;
  status: string;
  date: Date;
  useremail?: string;
}