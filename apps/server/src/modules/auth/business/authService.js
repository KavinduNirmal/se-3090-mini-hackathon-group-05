import { userRepository } from '../persistence/userRepository.js';
import { hashPassword, comparePassword, signToken } from '../../../shared/utils/security.js';
import { AppError } from '../../../shared/errors/AppError.js';

export class AuthService {
  /**
   * Register a new user (Charity or Donor)
   */
  async register(data) {
    const { email, password, role = 'CHARITY' } = data;

    if (!email || !email.includes('@')) {
      throw new AppError('Please provide a valid email address.', 400);
    }

    if (!password || password.length < 6) {
      throw new AppError('Password must be at least 6 characters long.', 400);
    }

    // Check if email already registered
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    const passwordHash = await hashPassword(password);

    let user;
    if (role === 'CHARITY') {
      const {
        orgName,
        charityType = 'SHELTER',
        regNumber,
        contactPerson,
        phone,
        address,
        city,
        district,
        beneficiaryCount,
      } = data;

      if (!orgName || !contactPerson || !phone || !address || !city) {
        throw new AppError(
          'Please fill all required organization fields (Name, Contact Person, Phone, Address, City).',
          400,
        );
      }

      user = await userRepository.createCharityUser({
        email,
        passwordHash,
        orgName,
        charityType,
        regNumber,
        contactPerson,
        phone,
        address,
        city,
        district,
        beneficiaryCount,
      });
    } else if (role === 'DONOR') {
      const {
        businessName,
        donorType = 'RESTAURANT',
        contactPerson,
        phone,
        address,
        city,
        district,
        regNumber,
      } = data;

      if (!businessName || !contactPerson || !phone || !address || !city) {
        throw new AppError(
          'Please fill all required business fields (Name, Contact Person, Phone, Address, City).',
          400,
        );
      }

      user = await userRepository.createDonorUser({
        email,
        passwordHash,
        businessName,
        donorType,
        contactPerson,
        phone,
        address,
        city,
        district,
        regNumber,
      });
    } else {
      throw new AppError(`Unsupported role: ${role}`, 400);
    }

    // Generate JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const sanitizedUser = this.sanitizeUser(user);

    return {
      token,
      user: sanitizedUser,
    };
  }

  /**
   * Log in user with email and password
   */
  async login(email, password) {
    if (!email || !password) {
      throw new AppError('Please provide both email and password.', 400);
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Fetch current user profile
   */
  async getMe(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return this.sanitizeUser(user);
  }

  /**
   * Strip sensitive fields like passwordHash
   */
  sanitizeUser(user) {
    const { passwordHash: _hash, ...safeUser } = user;
    return safeUser;
  }
}

export const authService = new AuthService();
