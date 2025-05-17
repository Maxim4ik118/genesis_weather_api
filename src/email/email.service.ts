import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: any;
  private readonly logger = new Logger(EmailService.name);
  private readonly isDevelopment = process.env.NODE_ENV !== 'production';

  constructor() {
    // if (this.isDevelopment) {
    //   // In development, just log the emails
    //   this.logger.log(
    //     'Running in development mode - emails will be logged to console',
    //   );
    //   this.transporter = {
    //     sendMail: async (mailOptions: any) => {
    //       this.logger.log('Development Mode Email:');
    //       this.logger.log('------------------------');
    //       this.logger.log(`To: ${mailOptions.to}`);
    //       this.logger.log(`Subject: ${mailOptions.subject}`);
    //       this.logger.log('Content:');
    //       this.logger.log(mailOptions.html);
    //       this.logger.log('------------------------');
    //       return { accepted: [mailOptions.to] };
    //     },
    //   };
    // } else {
      // In production, use real email service
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        this.logger.error(
          'Email credentials not provided. Email service will not work.',
        );
      }

      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        service: 'Gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    // }
  }

  async sendConfirmationEmail(
    email: string,
    city: string,
    token: string,
  ): Promise<void> {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3333';
    const confirmationLink = `${baseUrl}/api/confirm/${token}`;
    const unsubscribeLink = `${baseUrl}/api/unsubscribe/${token}`;

    const mailOptions = {
      from: 'mmaximonchuk@gmail.com',
      to: email,
      subject: 'Confirm your weather subscription',
      html: `
        <h2>Weather Subscription Confirmation</h2>
        <p>Thank you for subscribing to weather updates for ${city}!</p>
        <p>Please click the link below to confirm your subscription:</p>
        <p><a href="${confirmationLink}">Confirm Subscription</a></p>
        <p>If you did not request this subscription, you can ignore this email or click below to unsubscribe:</p>
        <p><a href="${unsubscribeLink}">Unsubscribe</a></p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Confirmation email ${this.isDevelopment ? 'logged' : 'sent'} to ${email} for city ${city}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send confirmation email to ${email}:`,
        error,
      );
      throw new Error('Failed to send confirmation email');
    }
  }

  async sendWeatherUpdate(
    email: string,
    city: string,
    weatherData: any,
  ): Promise<void> {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3333';
    const unsubscribeLink = `${baseUrl}/api/unsubscribe/${weatherData.token}`;

    const mailOptions = {
      from: 'mmaximonchuk@gmail.com',
      to: email,
      subject: `Weather Update for ${city}`,
      html: `
        <h2>Weather Update for ${city}</h2>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
          <p><strong>Temperature:</strong> ${weatherData.temperature}°C</p>
          <p><strong>Humidity:</strong> ${weatherData.humidity}%</p>
          <p><strong>Description:</strong> ${weatherData.description}</p>
        </div>
        <p style="margin-top: 20px;">
          <small>
            To unsubscribe from these updates, 
            <a href="${unsubscribeLink}">click here</a>
          </small>
        </p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Weather update email ${this.isDevelopment ? 'logged' : 'sent'} to ${email} for city ${city}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send weather update email to ${email}:`,
        error,
      );
      throw new Error('Failed to send weather update email');
    }
  }
}
