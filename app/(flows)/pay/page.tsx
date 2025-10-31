"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function PayPage() {
  const router = useRouter();
  const [paymentId, setPaymentId] = useState("");
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ txHash?: string; error?: string } | null>(null);

  // Address del relayer (hardcodeado temporalmente, o usar variable de entorno)
  const RELAYER_ADDRESS = "0x4a3f4d82a075434b24ff2920c573c704af776f6a"
  // Contrato cUSD en Celo (staging/mainnet)
  const CUSD_CONTRACT_ADDRESS = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"; // cUSD en Celo Alfajores (testnet/staging)
  const AMOUNT_CUSD = ethers.parseUnits("10", 18); // 10 cUSD

  useEffect(() => {
    try {
      const ok = typeof window !== "undefined" && localStorage.getItem("selfVerified") === "true";
      if (!ok) router.replace("/");
    } catch {
      router.replace("/");
    }
  }, [router]);

  async function connectWallet() {
    try {
      if (!window.ethereum) throw new Error("MetaMask no disponible");
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts?.[0] || null);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "No se pudo conectar la wallet";
      setResult({ error: message });
    }
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      if (!window.ethereum) throw new Error("MetaMask no está disponible");
      if (!account) throw new Error("Conecta tu wallet primero");
      if (!paymentId) throw new Error("Ingresa un Payment ID");

      // Conectar con MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // ABI mínimo para la función transfer de ERC20
      const cusdAbi = [
        "function transfer(address to, uint256 amount) external returns (bool)",
      ];

      // Crear instancia del contrato cUSD
      const cusdContract = new ethers.Contract(CUSD_CONTRACT_ADDRESS, cusdAbi, signer);

      // Enviar 10 cUSD al relayer
      const tx = await cusdContract.transfer(RELAYER_ADDRESS, AMOUNT_CUSD);

      // Retornar el hash inmediatamente (opcional: await tx.wait() para esperar confirmación)
      setResult({ txHash: tx.hash });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Fallo inesperado";
      setResult({ error: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="px-4">
      <section className="bg-nomi.surface/50 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Pagar una Invoice</h2>
        <p className="text-sm text-slate-300 mb-6">Pega el Payment ID, conecta tu wallet y firma la transacción.</p>

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={connectWallet}
            className="bg-slate-100 text-black rounded-md px-3 py-2 hover:bg-white"
          >
            {account ? "Wallet conectada" : "Conectar MetaMask"}
          </button>
          {account && (
            <code className="text-xs bg-black/40 px-2 py-1 rounded-md break-all">{account}</code>
          )}
        </div>

        <form onSubmit={handlePay} className="grid gap-4 max-w-xl">
          <label className="grid gap-2">
            <span className="text-sm">Payment ID</span>
            <input
              className="bg-black/40 border border-white/10 rounded-md px-3 py-2 outline-none focus:border-nomi.accent"
              placeholder="0x..."
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center bg-slate-100 text-black rounded-md px-4 py-2 hover:bg-white disabled:opacity-60"
          >
            {loading ? "Pagando…" : "Pagar"}
          </button>
        </form>

        {result?.txHash && (
          <div className="mt-6 border border-nomi.accent/40 rounded-md p-4">
            <div className="text-sm text-slate-300 mb-2">Transacción enviada</div>
            <code className="break-all text-xs bg-black/40 px-2 py-1 rounded-md block">{result.txHash}</code>
          </div>
        )}

        {result?.error && (
          <p className="mt-4 text-sm text-nomi.warn">{result.error}</p>
        )}
      </section>
    </main>
  );
}


