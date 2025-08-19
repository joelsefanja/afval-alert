export interface ListNotification {
  id: number;
  location: number;
  type: string;
  status: string;
  date: Date;
  useremail?: string;
}