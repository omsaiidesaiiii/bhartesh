import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendStudentCredentials(email: string, name: string, password: string) {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Your Campus Management System Credentials',
      html: `
        <h1>Welcome to Campus Management System, ${name}!</h1>
        <p>Your account has been created successfully. Here are your login credentials:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Password:</strong> ${password}</li>
        </ul>
        <p>Please login and change your password as soon as possible.</p>
        <p>Best regards,<br>Administration</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Credentials email sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send credentials email to ${email}:`, error);
    }
  }
}
