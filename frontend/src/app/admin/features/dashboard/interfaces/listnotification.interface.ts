export interface ListNotification {
  id: number;
  location: string;
  type: string;
  status: string;
  date: Date;
  useremail?: string;
}