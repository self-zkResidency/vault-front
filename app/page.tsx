"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
  countries, 
  getUniversalLink,
} from "@selfxyz/qrcode";
import { ethers } from "ethers";

export default function Home() {
  const router = useRouter();
  const [linkCopied, setLinkCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState("");
  const [userId] = useState(ethers.ZeroAddress);
  const [isVerified, setIsVerified] = useState(false);
  // Use useMemo to cache the array to avoid creating a new array on each render
  const excludedCountries = useMemo(() => [countries.UNITED_STATES, countries.IRAN, countries.COLOMBIA, countries.NORTH_KOREA], []);
  const dataForInvoice = ethers.AbiCoder.defaultAbiCoder().encode(
    ["bytes16", "uint8"],
    ["0x12345678901234567890123456789012", 1]);
  // Use useEffect to ensure code only executes on the client side
  useEffect(() => {
    try {
      const app = new SelfAppBuilder({
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "Nomi Money",
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "proofOfCountry",
        endpoint: '0xa9fdfabb124b94613d9325cd5b05b0c7f55e4b33', //`${process.env.NEXT_PUBLIC_SELF_ENDPOINT}`,
        logoBase64:
          "https://i.postimg.cc/mrmVf9hm/self.png", // url of a png image, base64 is accepted but not recommended
        userId: userId,
        endpointType: "staging_celo",
        userIdType: "hex", // use 'hex' for ethereum address or 'uuid' for uuidv4
        userDefinedData: dataForInvoice.toString(),
        disclosures: {
        // what you want to verify from users' identity
          minimumAge: 18,
          ofac: true,
          excludedCountries: excludedCountries,
          // what you want users to reveal
          // name: false,
          // issuing_state: true,
          // nationality: true,
          // date_of_birth: true,
          // passport_number: false,
          // gender: true,
          // expiry_date: false,
        }
      }).build();

      setSelfApp(app);
      setUniversalLink(getUniversalLink(app));
    } catch (error) {
      console.error("Failed to initialize Self app:", error);
    }
  }, [excludedCountries, userId, dataForInvoice]);

  // Leer verificación previa del storage
  useEffect(() => {
    try {
      const ok = typeof window !== "undefined" && localStorage.getItem("selfVerified") === "true";
      if (ok) setIsVerified(true);
    } catch {}
  }, []);

  const displayToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const copyToClipboard = () => {
    if (!universalLink) return;

    navigator.clipboard
      .writeText(universalLink)
      .then(() => {
        setLinkCopied(true);
        displayToast("Universal link copied to clipboard!");
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        displayToast("Failed to copy link");
      });
  };

  const openSelfApp = () => {
    if (!universalLink) return;

    window.open(universalLink, "_blank");
    displayToast("Opening Self App...");
  };

  const handleSuccessfulVerification = () => {
    try {
      // Marcar al usuario como verificado para proteger rutas posteriores
      if (typeof window !== "undefined") {
        localStorage.setItem("selfVerified", "true");
      }
      setIsVerified(true);
    } catch {}
    displayToast("Verification successful! Redirecting...");
    // Sin redirección; los botones de acciones aparecerán abajo
  };

  return (
    <div className="min-h-screen w-full bg-nomi.bg text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Header con ASCII */}
      <div className="mb-6 md:mb-10 text-center">
        <pre aria-hidden className="text-[10px] xs:text-xs sm:text-sm md:text-base leading-[1.05] font-mono text-slate-100/90 select-none whitespace-pre overflow-x-auto p-3 rounded-lg border border-white/30 bg-black/10">
{String.raw`███╗   ██╗ ██████╗ ███╗   ███╗██╗
████╗  ██║██╔═══██╗████╗ ████║██║
██╔██╗ ██║██║   ██║██╔████╔██║██║
██║╚██╗██║██║   ██║██║╚██╔╝██║██║
██║ ╚████║╚██████╔╝██║ ╚═╝ ██║██║
╚═╝  ╚═══╝ ╚═════╝ ╚═╝     ╚═╝╚═╝`}
        </pre>
        <h1 className="text-2xl sm:text-3xl font-semibold mt-4 tracking-tight">
          {process.env.NEXT_PUBLIC_SELF_APP_NAME || "Nomi Money"}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 px-2 mt-1">
          Scan the QR with Self to verify your identity
        </p>
      </div>

      {/* Contenido principal */}
      <div className="bg-nomi.surface/70 rounded-xl border border-white/10 p-4 sm:p-6 w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto">
        <div className="flex justify-center mb-4 sm:mb-6">
          {selfApp ? (
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
              <SelfQRcodeWrapper
                selfApp={selfApp}
                onSuccess={handleSuccessfulVerification}
                onError={() => {
                  displayToast("Error: Failed to verify identity");
                }}
              />
            </div>
          ) : (
            <div className="w-[256px] h-[256px] bg-black/30 border border-white/10 rounded-md animate-pulse flex items-center justify-center">
              <p className="text-slate-400 text-sm">Cargando QR…</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 mb-4 sm:mb-6">
          <button
            type="button"
            onClick={copyToClipboard}
            disabled={!universalLink}
            className="flex-1 bg-slate-100 text-black hover:bg-white transition-colors p-2 rounded-md text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {linkCopied ? "Copied!" : "Copy Universal Link"}
          </button>

          <button
            type="button"
            onClick={openSelfApp}
            disabled={!universalLink}
            className="flex-1 bg-nomi.accent/90 hover:bg-nomi.accent transition-colors text-black p-2 rounded-md text-sm sm:text-base mt-2 sm:mt-0 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Open Self App
          </button>


        </div>
        {/* Acciones principales: visibles solo si está verificado */}
        {isVerified && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => router.push("/invoice")}
              className="bg-white text-black rounded-md px-4 py-2 hover:bg-slate-100 border border-white/10"
            >
              Create Invoice
            </button>
            <button
              type="button"
              onClick={() => router.push("/pay")}
              className="bg-white text-black rounded-md px-4 py-2 hover:bg-slate-100 border border-white/10"
            >
              Pay Invoice
            </button>
          </div>
        )}
        <div className="flex flex-col items-center gap-2 mt-2">
          <span className="text-slate-400 text-xs uppercase tracking-wide">User Address</span>
          <div className="bg-black/30 rounded-md px-3 py-2 w-full text-center break-all text-sm font-mono text-slate-100 border border-white/10">
            {userId ? userId : <span className="text-slate-500">Not connected</span>}
          </div>
        </div>

        {/* Toast notification */}
        {showToast && (
          <div className="fixed bottom-4 right-4 bg-black/80 border border-white/10 text-white py-2 px-4 rounded shadow-lg animate-fade-in text-sm">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
