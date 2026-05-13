"use client";

import { useEffect, useRef, useState } from "react";

type Barcode = {
  rawValue: string;
};

type BarcodeDetectorInstance = {
  detect: (source: HTMLVideoElement) => Promise<Barcode[]>;
};

type BarcodeDetectorConstructor = new (options: {
  formats: string[];
}) => BarcodeDetectorInstance;

type WindowWithBarcodeDetector = Window & {
  BarcodeDetector?: BarcodeDetectorConstructor;
};

type CheckInScannerProps = {
  action: (formData: FormData) => void;
};

export const CheckInScanner = ({ action }: CheckInScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [ticketCode, setTicketCode] = useState("");
  const [message, setMessage] = useState("Arahkan kamera ke QR code tiket.");
  const [isScanning, setIsScanning] = useState(false);

  const stopScanner = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsScanning(false);
  };

  useEffect(() => stopScanner, []);

  const startScanner = async () => {
    const barcodeDetector = (window as WindowWithBarcodeDetector).BarcodeDetector;

    if (!barcodeDetector) {
      setMessage("Browser ini belum mendukung scanner kamera. Pakai input manual di bawah.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
        audio: false,
      });
      const detector = new barcodeDetector({ formats: ["qr_code"] });
      const video = videoRef.current;

      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();
      setIsScanning(true);
      setMessage("Scanner aktif. Arahkan kamera ke QR code tiket.");

      const scan = async () => {
        const currentVideo = videoRef.current;

        if (!currentVideo || !streamRef.current) {
          return;
        }

        const codes = await detector.detect(currentVideo);
        const code = codes[0]?.rawValue.trim();

        if (code) {
          setTicketCode(code);
          setMessage(`Kode terbaca: ${code}`);
          stopScanner();
          window.setTimeout(() => formRef.current?.requestSubmit(), 150);
          return;
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          void scan();
        });
      };

      void scan();
    } catch {
      setMessage("Kamera tidak bisa diakses. Periksa izin kamera atau pakai input manual.");
      stopScanner();
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="overflow-hidden rounded-lg bg-slate-950">
        <video
          ref={videoRef}
          className="aspect-video w-full object-cover"
          muted
          playsInline
        />
      </div>

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
          onClick={stopScanner}
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
