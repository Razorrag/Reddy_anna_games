import axios from 'axios';

interface WhatsAppConfig {
  apiUrl: string;
  apiKey: string;
  phoneNumberId: string;
}

export class WhatsAppService {
  private config: WhatsAppConfig;

  constructor() {
    this.config = {
      apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0',
      apiKey: process.env.WHATSAPP_API_KEY || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    };
  }

  // Send text message
  async sendTextMessage(to: string, message: string) {
    try {
      if (!this.config.apiKey || !this.config.phoneNumberId) {
        console.log('WhatsApp not configured, message would be sent:', { to, message });
        return { success: true, mock: true };
      }

      const response = await axios.post(
        `${this.config.apiUrl}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to.replace(/\D/g, ''), // Remove non-digits
          type: 'text',
          text: { body: message },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Send WhatsApp message error:', error);
      throw error;
    }
  }

  // Send template message
  async sendTemplateMessage(to: string, templateName: string, parameters: string[]) {
    try {
      if (!this.config.apiKey || !this.config.phoneNumberId) {
        console.log('WhatsApp not configured, template would be sent:', { to, templateName, parameters });
        return { success: true, mock: true };
      }

      const response = await axios.post(
        `${this.config.apiUrl}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to.replace(/\D/g, ''),
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en' },
            components: [
              {
                type: 'body',
                parameters: parameters.map(param => ({ type: 'text', text: param })),
              },
            ],
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Send WhatsApp template error:', error);
      throw error;
    }
  }

  // Send welcome message
  async sendWelcomeMessage(phoneNumber: string, username: string) {
    try {
      const message = `Welcome to Reddy Anna, ${username}! 🎮\n\nYour account has been created successfully. Start playing now and win big rewards!\n\nVisit: ${process.env.FRONTEND_URL}`;
      return await this.sendTextMessage(phoneNumber, message);
    } catch (error) {
      console.error('Send welcome message error:', error);
      throw error;
    }
  }

  // Send deposit confirmation
  async sendDepositConfirmation(phoneNumber: string, amount: number, transactionId: string) {
    try {
      const message = `Deposit Successful! ✅\n\nAmount: ₹${amount}\nTransaction ID: ${transactionId}\n\nYour balance has been updated. Happy gaming!`;
      return await this.sendTextMessage(phoneNumber, message);
    } catch (error) {
      console.error('Send deposit confirmation error:', error);
      throw error;
    }
  }

  // Send withdrawal confirmation
  async sendWithdrawalConfirmation(phoneNumber: string, amount: number, status: string) {
    try {
      const messages = {
        pending: `Withdrawal Request Received 📝\n\nAmount: ₹${amount}\nStatus: Processing\n\nYour request is being reviewed.`,
        approved: `Withdrawal Approved ✅\n\nAmount: ₹${amount}\n\nYour withdrawal will be processed within 24 hours.`,
        completed: `Withdrawal Completed 🎉\n\nAmount: ₹${amount}\n\nThe amount has been transferred to your account.`,
        rejected: `Withdrawal Rejected ❌\n\nAmount: ₹${amount}\n\nPlease contact support for more information.`,
      };

      const message = messages[status as keyof typeof messages] || `Withdrawal Status: ${status}`;
      return await this.sendTextMessage(phoneNumber, message);
    } catch (error) {
      console.error('Send withdrawal confirmation error:', error);
      throw error;
    }
  }

  // Send win notification
  async sendWinNotification(phoneNumber: string, amount: number) {
    try {
      const message = `Congratulations! 🎉\n\nYou won ₹${amount}!\n\nKeep playing to win more rewards!`;
      return await this.sendTextMessage(phoneNumber, message);
    } catch (error) {
      console.error('Send win notification error:', error);
      throw error;
    }
  }

  // Send bonus notification
  async sendBonusNotification(phoneNumber: string, amount: number, bonusType: string) {
    try {
      const message = `Bonus Received! 🎁\n\nType: ${bonusType}\nAmount: ₹${amount}\n\nUse your bonus to play more games!`;
      return await this.sendTextMessage(phoneNumber, message);
    } catch (error) {
      console.error('Send bonus notification error:', error);
      throw error;
    }
  }

  // Send referral notification
  async sendReferralNotification(phoneNumber: string, referredUsername: string, bonus: number) {
    try {
      const message = `Referral Bonus! 🤝\n\n${referredUsername} joined using your referral code!\n\nYou earned: ₹${bonus}`;
      return await this.sendTextMessage(phoneNumber, message);
    } catch (error) {
      console.error('Send referral notification error:', error);
      throw error;
    }
  }

  // Send OTP
  async sendOTP(phoneNumber: string, otp: string) {
    try {
      const message = `Your Reddy Anna OTP: ${otp}\n\nValid for 10 minutes. Do not share with anyone.`;
      return await this.sendTextMessage(phoneNumber, message);
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  }

  // Send account status notification
  async sendAccountStatusNotification(phoneNumber: string, status: string, reason?: string) {
    try {
      const messages = {
        active: `Account Activated ✅\n\nYour account is now active. Start playing!`,
        suspended: `Account Suspended ⚠️\n\n${reason ? `Reason: ${reason}\n\n` : ''}Please contact support.`,
        banned: `Account Banned 🚫\n\n${reason ? `Reason: ${reason}\n\n` : ''}Contact support for assistance.`,
      };

      const message = messages[status as keyof typeof messages] || `Account Status: ${status}`;
      return await this.sendTextMessage(phoneNumber, message);
    } catch (error) {
      console.error('Send account status notification error:', error);
      throw error;
    }
  }

  // Send promotion message
  async sendPromotionMessage(phoneNumber: string, title: string, message: string) {
    try {
      const fullMessage = `🎮 ${title}\n\n${message}\n\nVisit: ${process.env.FRONTEND_URL}`;
      return await this.sendTextMessage(phoneNumber, fullMessage);
    } catch (error) {
      console.error('Send promotion message error:', error);
      throw error;
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      // Implement webhook signature verification based on WhatsApp Business API docs
      // This is a placeholder implementation
      return true;
    } catch (error) {
      console.error('Verify webhook signature error:', error);
      return false;
    }
  }
}

export const whatsappService = new WhatsAppService();