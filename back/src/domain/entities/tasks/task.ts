export class Task {
  constructor(
    public readonly id: number,
    public title: string,
    public description: string | null,
    public status: 'pending' | 'in_progress' | 'done',
    public priority: 'low' | 'medium' | 'high',
    public userId: number,
    public isActive: boolean,
    public createdAt: Date,
    public updatedAt: Date | null
  ) {}
}
