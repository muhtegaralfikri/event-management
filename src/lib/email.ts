import nodemailer from "nodemailer";
import { generateTicketHtml } from "./email-templates";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendTicketEmail = async (
  to: string,
  name: string,
  event: { title: string; date: Date; time: string; location: string },
  ticketCode: string,
  status: string
) => {
  // Jika SMTP belum di-set, mock untuk development
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log("=========================================");
    console.log(`Mock Email sent to: ${to}`);
    console.log(`Subject: Tiket Anda untuk ${event.title}`);
    console.log(`Ticket Code: ${ticketCode}`);
    console.log(`Status: ${status}`);
    console.log("=========================================");
    return;
  }

  const isPaid = status === "PAID";
  const subject = isPaid 
    ? `E-Ticket Resmi: ${event.title}` 
    : `Selesaikan Pembayaran Anda: ${event.title}`;

  const html = generateTicketHtml({
    name,
    eventTitle: event.title,
    eventDate: event.date.toISOString(),
    eventTime: event.time,
    eventLocation: event.location,
    ticketCode,
    isPaid
  });

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || "EventTix <noreply@eventtix.local>",
    to,
    subject,
    html,
  });

  console.log(`Email sent: ${info.messageId}`);
};
