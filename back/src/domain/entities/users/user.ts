export class User {
  constructor(
    public readonly id: number,
    public readonly firstName: string | null,
    public readonly lastName: string | null,
    public readonly userName: string | null,
    public readonly email: string | null,
    public readonly passwordHash: string,
    public readonly userRole: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date | null,
    public readonly isActive: boolean,
  ) {}
}
