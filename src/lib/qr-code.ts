import QRCode from "qrcode";

export const createTicketQrSvg = async (ticketCode: string) =>
  QRCode.toString(ticketCode, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 256,
    color: {
      dark: "#020617",
      light: "#ffffff",
    },
  });
