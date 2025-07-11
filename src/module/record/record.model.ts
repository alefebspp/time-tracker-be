export default interface Record {
  id: string;
  userId: string;
  type: "start" | "end";
  createdAt: Date;
  updatedAt?: Date | null;
}
