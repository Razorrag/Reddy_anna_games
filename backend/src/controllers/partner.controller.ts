import { Request, Response, NextFunction } from 'express';
import { partnerService } from '../services/partner.service';
import { AppError } from '../middleware/errorHandler';

export class PartnerController {
  // Register as partner
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const {
        businessName,
        contactPerson,
        email,
        phoneNumber,
        bankAccountName,
        bankAccountNumber,
        bankIfscCode,
        upiId,
      } = req.body;

      if (!businessName || !contactPerson || !email || !phoneNumber) {
        throw new AppError('Missing required fields', 400);
      }

      const partner = await partnerService.registerPartner({
        userId,
        businessName,
        contactPerson,
        email,
        phoneNumber,
        bankAccountName,
        bankAccountNumber,
        bankIfscCode,
        upiId,
      });

      res.status(201).json({
        success: true,
        message: 'Partner registration submitted for approval',
        data: partner,
      });
    } catch (error) {
      next(error);
    }
  }

  // Partner login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        throw new AppError('Username and password are required', 400);
      }

      const result = await partnerService.loginPartner(username, password);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get partner profile
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const partnerId = req.user?.partnerId;
      if (!partnerId) {
        throw new AppError('Unauthorized', 401);
      }

      const partner = await partnerService.getPartnerById(partnerId);

      res.json({
        success: true,
        data: partner,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update partner profile
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const partnerId = req.user?.partnerId;
      if (!partnerId) {
        throw new AppError('Unauthorized', 401);
      }

      const {
        businessName,
        contactPerson,
        email,
        phoneNumber,
        bankAccountName,
        bankAccountNumber,
        bankIfscCode,
        upiId,
      } = req.body;

      const partner = await partnerService.updatePartnerProfile(partnerId, {
        businessName,
        contactPerson,
        email,
        phoneNumber,
        bankAccountName,
        bankAccountNumber,
        bankIfscCode,
        upiId,
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: partner,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get partner statistics
  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const partnerId = req.user?.partnerId;
      if (!partnerId) {
        throw new AppError('Unauthorized', 401);
      }

      const statistics = await partnerService.getPartnerStatistics(partnerId);

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get commission history
  async getCommissions(req: Request, res: Response, next: NextFunction) {
    try {
      const partnerId = req.user?.partnerId;
      if (!partnerId) {
        throw new AppError('Unauthorized', 401);
      }

      const { status, startDate, endDate, limit = '50', offset = '0' } = req.query;

      const filters: any = {};
      if (status) filters.status = status;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const commissions = await partnerService.getPartnerCommissions(
        partnerId,
        filters,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.json({
        success: true,
        data: commissions,
        pagination: {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          total: commissions.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get referred players
  async getReferredPlayers(req: Request, res: Response, next: NextFunction) {
    try {
      const partnerId = req.user?.partnerId;
      if (!partnerId) {
        throw new AppError('Unauthorized', 401);
      }

      const players = await partnerService.getReferredPlayers(partnerId);

      res.json({
        success: true,
        data: players,
      });
    } catch (error) {
      next(error);
    }
  }

  // Request withdrawal
  async requestWithdrawal(req: Request, res: Response, next: NextFunction) {
    try {
      const partnerId = req.user?.partnerId;
      if (!partnerId) {
        throw new AppError('Unauthorized', 401);
      }

      const { amount } = req.body;

      if (!amount || amount <= 0) {
        throw new AppError('Invalid amount', 400);
      }

      const result = await partnerService.requestWithdrawal(partnerId, amount);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Get all partners
  async getAllPartners(req: Request, res: Response, next: NextFunction) {
    try {
      const { isActive, searchTerm } = req.query;

      const filters: any = {};
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (searchTerm) filters.searchTerm = searchTerm as string;

      const partners = await partnerService.getAllPartners(filters);

      res.json({
        success: true,
        data: partners,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Approve partner
  async approvePartner(req: Request, res: Response, next: NextFunction) {
    try {
      const { partnerId } = req.params;

      const partner = await partnerService.approvePartner(partnerId);

      res.json({
        success: true,
        message: 'Partner approved successfully',
        data: partner,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Deactivate partner
  async deactivatePartner(req: Request, res: Response, next: NextFunction) {
    try {
      const { partnerId } = req.params;

      const partner = await partnerService.deactivatePartner(partnerId);

      res.json({
        success: true,
        message: 'Partner deactivated successfully',
        data: partner,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Pay commission
  async payCommission(req: Request, res: Response, next: NextFunction) {
    try {
      const { commissionId } = req.params;

      const result = await partnerService.payCommission(commissionId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const partnerController = new PartnerController();