import Handlebars from "handlebars";
import nodemailer from "nodemailer";
import path from "path";
import fs from 'fs/promises';
import Mail from "nodemailer/lib/mailer";
import { config } from '../config/config';


async function getCompiledTemplate() {
  try {
    const templatePath = path.join(__dirname, '../views', 'email.handlebars');
    const templateContent = await fs.readFile(templatePath, 'utf-8');

    // Just compile the template without dealing with images
    return Handlebars.compile(templateContent);
  } catch (error) {
    console.error('Error preparing template:', error);
    throw error;
  }
}

const sendEmail = async ({ email, otp }: { email: string, otp: string }): Promise<void> => {
  try {

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      host: config.HOST,
      secure: config.SECURE,
      port: config.EMAIL_PORT,
      service: config.SERVICE,
      auth: {
        user: config.USERID,
        pass: config.PASS
      },
      tls: {
        rejectUnauthorized: false,
      }
    });

    const template = await getCompiledTemplate();

    // Generate HTML content with CID image reference
    const htmlContent = template({
      otp: otp,
      email: email,
      year: new Date().getFullYear(),
      // Reference the image using CID
      logoUrl: 'cid:logo'
    });

    const mailOptions: Mail.Options = {
      from: `"Meals On Deals" <${config.USERID}>`,
      to: email,
      subject: "Meals On Deals OTP Verification",
      html: htmlContent,
      attachments: [{
        filename: 'mealsondeals.png',
        path: path.join(__dirname, '../public/mealsondeals.png'),
        cid: 'logo' // Same as referenced in template
      }]
    };

    // Check if mailOptions is defined before sending
    if (!mailOptions) {
      throw new Error("Mail options not defined");
    }

    // trigger the sending of the E-mail
    transporter.sendMail(mailOptions, (error: Error | null, info: nodemailer.SentMessageInfo) => {
      if (error) {
        console.log(error);
        console.log("email not sent!");
      }
      console.log("email sent successfully");
    });
  } catch (error) {
    console.log("email not sent!");
    console.log(error);
  }
};

export default sendEmail;
