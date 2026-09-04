import { authService } from '../business/authService.js';

export class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Registration successful',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getMe(req.user.id);
      res.status(200).json({
        status: 'success',
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
