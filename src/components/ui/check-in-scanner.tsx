"use client";

import { useEffect, useRef, useState } from "react";
import {
  Html5Qrcode,
  Html5QrcodeScannerState,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";
import { QrCode, Square, Video } from "lucide-react";

type CheckInScannerProps = {
  action: (formData: FormData) => void;
};

const scannerElementId = "eventtix-check-in-scanner";

export const CheckInScanner = ({ action }: CheckInScannerProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [ticketCode, setTicketCode] = useState("");
  const [message, setMessage] = useState("Klik mulai scan untuk membuka kamera.");
  const [isScanning, setIsScanning] = useState(false);

  const stopScanner = async () => {
    const scanner = scannerRef.current;

    if (!scanner) {
      setIsScanning(false);
      return;
    }

    try {
      if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
        await scanner.stop();
      }

      scanner.clear();
    } catch {
      setMessage("Scanner berhenti, tetapi browser tidak mengembalikan status kamera lengkap.");
    } finally {
      scannerRef.current = null;
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, []);

  const startScanner = async () => {
    if (isScanning) {
      return;
    }

    await stopScanner();

    const scanner = new Html5Qrcode(scannerElementId, {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      useBarCodeDetectorIfSupported: true,
      verbose: false,
    });

    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1,
          disableFlip: false,
        },
        (decodedText) => {
          const code = decodedText.trim();

          if (!code) {
            return;
          }

          setTicketCode(code);
          setMessage(`Kode terbaca: ${code}`);
          void stopScanner();
          window.setTimeout(() => formRef.current?.requestSubmit(), 150);
        },
        () => {
          // Frame tanpa QR code adalah kondisi normal saat kamera sedang mencari kode.
        },
      );

      setIsScanning(true);
      setMessage("Scanner aktif. Arahkan kamera ke QR code tiket.");
    } catch {
      scannerRef.current = null;
      setIsScanning(false);
      setMessage(
        "Kamera tidak bisa dibuka. Pastikan izin kamera aktif, gunakan HTTPS/localhost, atau pakai input manual.",
      );
    }
  };

  return (
    <div className="rounded-lg border border-stone-200 bg-[#fffdf8] p-5 shadow-xl">
      <div
        id={scannerElementId}
        className="min-h-72 overflow-hidden rounded-lg bg-stone-950 [&_video]:aspect-square [&_video]:w-full [&_video]:object-cover"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void startScanner()}
          disabled={isScanning}
          className="inline-flex items-center gap-2 rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          <Video className="h-4 w-4" aria-hidden="true" />
          Mulai scan
        </button>
        <button
          type="button"
          onClick={() => void stopScanner()}
          className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100"
        >
          <Square className="h-4 w-4" aria-hidden="true" />
          Stop
        </button>
      </div>

      <p className="mt-3 text-sm text-stone-600">{message}</p>

      <form ref={formRef} action={action} className="mt-5 space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Kode tiket</span>
          <input
            name="ticketCode"
            value={ticketCode}
            onChange={(event) => setTicketCode(event.target.value)}
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 font-mono text-sm uppercase outline-none focus:border-teal-700"
            placeholder="EVT-XXX-12345678"
            required
          />
        </label>
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          <QrCode className="h-4 w-4" aria-hidden="true" />
          Check-in tiket
        </button>
      </form>
    </div>
  );
};
