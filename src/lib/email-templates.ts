import { format } from "date-fns";
import { id } from "date-fns/locale";

type TemplateProps = {
  name: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  ticketCode: string;
  isPaid: boolean;
};

export const generateTicketHtml = ({
  name,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  ticketCode,
  isPaid,
}: TemplateProps) => {
  const dateStr = format(new Date(eventDate), "EEEE, d MMMM yyyy", { locale: id });
  
  // URL untuk QR Code generator API (gratis)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticketCode)}`;

  return `
    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0f766e; color: white; padding: 32px 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">${eventTitle}</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">EventTix</p>
      </div>
      
      <div style="padding: 32px 24px;">
        <p style="font-size: 16px; color: #374151;">Halo <strong>${name}</strong>,</p>
        
        ${isPaid 
          ? `<p style="font-size: 16px; color: #374151; line-height: 1.5;">Pendaftaran Anda berhasil. Berikut adalah tiket digital Anda. Tunjukkan QR Code ini kepada panitia saat check-in di lokasi.</p>`
          : `<p style="font-size: 16px; color: #374151; line-height: 1.5;">Terima kasih telah mendaftar. Pendaftaran Anda berstatus <strong>PENDING</strong>. Silakan selesaikan pembayaran untuk mendapatkan E-Ticket yang sah.</p>`
        }
        
        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin: 32px 0; text-align: center;">
          ${isPaid ? `<img src="${qrCodeUrl}" alt="QR Code" style="width: 200px; height: 200px; margin-bottom: 16px;" />` : ''}
          <div style="font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">KODE TIKET</div>
          <div style="font-size: 32px; font-weight: bold; color: #111827; margin-top: 4px;">${ticketCode}</div>
          <div style="margin-top: 12px; display: inline-block; background-color: ${isPaid ? '#d1fae5' : '#fef3c7'}; color: ${isPaid ? '#065f46' : '#92400e'}; padding: 4px 12px; border-radius: 9999px; font-size: 14px; font-weight: 600;">
            ${isPaid ? 'PAID / LUNAS' : 'PENDING'}
          </div>
        </div>

        <h3 style="color: #111827; margin-top: 0;">Detail Event:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; width: 120px;">Tanggal</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 500;">${dateStr}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Waktu</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 500;">${eventTime}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Lokasi</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 500;">${eventLocation}</td>
          </tr>
        </table>
        
        <p style="margin-top: 32px; font-size: 14px; color: #6b7280;">Jika Anda memiliki pertanyaan, silakan hubungi pihak penyelenggara acara.</p>
      </div>
      
      <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 14px;">
        &copy; ${new Date().getFullYear()} EventTix. All rights reserved.
      </div>
    </div>
  `;
};
