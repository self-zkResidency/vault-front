"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function InvoicePage() {
  const router = useRouter();
  const [amountUsd, setAmountUsd] = useState(10);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ paymentId?: string; error?: string } | null>(null);

  useEffect(() => {
    try {
      const ok = typeof window !== "undefined" && localStorage.getItem("selfVerified") === "true";
      if (!ok) router.replace("/");
    } catch {
      router.replace("/");
    }
  }, [router]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      // Simular delay de 2 segundos antes de mostrar el payment ID
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setResult({ paymentId: "2c6b1a91fa55c71d94f11" });
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
        <h2 className="text-xl font-semibold mb-4">Crear Payment Request</h2>
        <p className="text-sm text-slate-300 mb-6">Completa los campos y comparte el Payment ID con el pagador.</p>
        <form onSubmit={handleCreate} className="grid gap-4 max-w-md">
          <label className="grid gap-2">
            <span className="text-sm">Monto (USD)</span>
            <input
              className="bg-black/40 border border-white/10 rounded-md px-3 py-2 outline-none focus:border-nomi.accent"
              type="number"
              min={1}
              value={amountUsd}
              onChange={(e) => setAmountUsd(Number(e.target.value))}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm">Descripción</span>
            <input
              className="bg-black/40 border border-white/10 rounded-md px-3 py-2 outline-none focus:border-nomi.accent"
              placeholder="Servicio, remesa, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center bg-slate-100 text-black rounded-md px-4 py-2 hover:bg-white disabled:opacity-60"
          >
            {loading ? "Creando…" : "Crear Payment Request"}
          </button>
        </form>

        {result?.paymentId && (
          <div className="mt-6 border border-nomi.accent/40 rounded-md p-4">
            <div className="text-sm text-slate-300 mb-2">Payment ID generado</div>
            <code className="break-all text-xs bg-black/40 px-2 py-1 rounded-md block">{result.paymentId}</code>
          </div>
        )}

        {result?.error && (
          <p className="mt-4 text-sm text-nomi.warn">{result.error}</p>
        )}
      </section>
    </main>
  );
}


