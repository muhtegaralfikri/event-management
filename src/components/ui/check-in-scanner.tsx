"use client";

import { useEffect, useRef, useState } from "react";
import {
  Html5Qrcode,
  Html5QrcodeScannerState,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";

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
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div
        id={scannerElementId}
        className="min-h-72 overflow-hidden rounded-lg bg-slate-950 [&_video]:aspect-square [&_video]:w-full [&_video]:object-cover"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void startScanner()}
          disabled={isScanning}
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Mulai scan
        </button>
        <button
          type="button"
          onClick={() => void stopScanner()}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Stop
        </button>
      </div>

      <p className="mt-3 text-sm text-slate-600">{message}</p>

      <form ref={formRef} action={action} className="mt-5 space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Kode tiket</span>
          <input
            name="ticketCode"
            value={ticketCode}
            onChange={(event) => setTicketCode(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm uppercase outline-none focus:border-teal-700"
            placeholder="EVT-XXX-12345678"
            required
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Check-in tiket
        </button>
      </form>
    </div>
  );
};
