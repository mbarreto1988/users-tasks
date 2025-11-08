import bcrypt from 'bcrypt';

import { RegisterDTO, LoginDTO, registerSchema, loginSchema } from '../../dto/auth/auth.dto';
import { IAuthRepository } from '../../../domain/repositories/auth/IAuthRepository';
import { AppError } from '../../../shared/errors/AppError';
import { env } from '../../../infrastructure/config';
import { JwtService } from '../../../infrastructure/services/auth.service';



export class AuthUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async register(data: RegisterDTO) {
    try {
      const parsed = registerSchema.parse(data);

      const existingUser = await this.authRepo.findByEmail(parsed.email);
      if (existingUser)
        throw new AppError('El email ya está registrado', 409);

      const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
      const hash = await bcrypt.hash(parsed.password, salt);

      const newUser = await this.authRepo.create({
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        userName: parsed.userName,
        email: parsed.email,
        passwordHash: hash,
        userRole: parsed.userRole ?? 'user',
        isActive: true,
      });

      return {
        message: 'Usuario registrado correctamente',
        user: {
          id: newUser.id,
          userName: newUser.userName,
          email: newUser.email,
          role: newUser.userRole,
        },
      };
    } catch (error) {
      console.error('[AuthUseCase] register error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Error al registrar usuario', 500);
    }
  }

  async login(input: LoginDTO) {
    try {
      const { email, password } = loginSchema.parse(input);

      const user = await this.authRepo.findByEmail(email);
      if (!user) throw new AppError('Credenciales inválidas', 401);

      if (!user.isActive)
        throw new AppError('El usuario está inactivo o bloqueado', 403);

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) throw new AppError('Credenciales inválidas', 401);

      const payload = {
        userId: user.id,
        email: user.email ?? '',
        role: user.userRole ?? 'user',
      };

      const accessToken = JwtService.generateAccessToken(payload);
      const refreshToken = JwtService.generateRefreshToken(payload);

      return {
        message: 'Login exitoso',
        tokens: { accessToken, refreshToken },
        user: {
          id: user.id,
          userName: user.userName,
          email: user.email,
          role: user.userRole,
        },
      };
    } catch (error) {
      console.error('[AuthUseCase] login error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Error durante el login', 500);
    }
  }
}