export interface ListNotification {
  id: number;
  lat: number;
  lon: number;
  location: string;
  type: string;
  status: string;
  date: Date;
  useremail?: string;
}