import bcrypt from 'bcrypt';

import { IUserRepository } from '../../../domain/repositories/users/IUserRepository';
import { User } from '../../../domain/entities/users/user';
import { AppError } from '../../../shared/errors/AppError';
import {
  CreateUserDTO,
  UpdateUserDTO,
  PatchUserDTO,
  createUserSchema,
  updateUserSchema,
  patchUserSchema
} from '../../dto/users/user.dto';
import { env } from '../../../infrastructure/config';

export class UsersUseCase {
  constructor(private readonly repo: IUserRepository) {}

  async getAll(userId: number, role: string): Promise<User[]> {
    if (role === 'admin') return this.repo.getAll();

    const user = await this.repo.getById(userId);
    if (!user) throw new AppError('User not found', 404);
    return [user];
  }

  async getById(id: number, userId: number, role: string): Promise<User> {
    if (role !== 'admin' && id !== userId)
      throw new AppError('You do not have permission to view this user', 403);

    const user = await this.repo.getById(id);
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async create(data: CreateUserDTO, role: string): Promise<User> {
    if (role !== 'admin')
      throw new AppError('Only administrators can create users', 403);

    const parsed = createUserSchema.parse(data);

    const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
    const hash = await bcrypt.hash(parsed.password, salt);

    const newUser = await this.repo.create({
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      userName: parsed.userName,
      email: parsed.email,
      passwordHash: hash,
      userRole: parsed.userRole ?? 'user',
      isActive: true
    });

    return newUser;
  }

  async update(
    id: number,
    data: UpdateUserDTO,
    userId: number,
    role: string
  ): Promise<User> {
    if (role !== 'admin' && id !== userId)
      throw new AppError('You do not have permission to modify this user', 403);

    const parsed = updateUserSchema.parse(data);
    const user = await this.repo.getById(id);
    if (!user) throw new AppError('Usuario no encontrado', 404);

    const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
    const hash = await bcrypt.hash(parsed.password, salt);

    const updatedUser = await this.repo.update(id, {
      ...user,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      userName: parsed.userName,
      email: parsed.email,
      passwordHash: hash,
      userRole: parsed.userRole ?? user.userRole,
      isActive: user.isActive
    });

    if (!updatedUser) throw new AppError('Error updating user', 500);

    return updatedUser;
  }

  async patch(
    id: number,
    data: PatchUserDTO,
    userId: number,
    role: string
  ): Promise<User> {
    if (role !== 'admin' && id !== userId)
      throw new AppError('You do not have permission to modify this user', 403);

    const parsed = patchUserSchema.parse(data);
    const user = await this.repo.getById(id);
    if (!user) throw new AppError('User not found', 404);

    let passwordHash = user.passwordHash;
    if (parsed.password) {
      const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
      passwordHash = await bcrypt.hash(parsed.password, salt);
    }

    const updatedUser = await this.repo.update(id, {
      ...user,
      ...parsed,
      passwordHash
    });

    if (!updatedUser)
      throw new AppError('Error partially updating user', 500);

    return updatedUser;
  }

  async delete(id: number, userId: number, role: string): Promise<void> {
    if (role !== 'admin' && id !== userId)
      throw new AppError('You do not have permission to delete this user', 403);

    const user = await this.repo.getById(id);
    if (!user) throw new AppError('User not found', 404);

    const success = await this.repo.delete(id);
    if (!success) throw new AppError('Error deleting user', 500);
  }
}
