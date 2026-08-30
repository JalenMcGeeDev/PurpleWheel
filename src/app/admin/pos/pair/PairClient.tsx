'use client';
import { useState } from 'react';
import type { Terminal } from '../../../../types';

interface Props { terminals: Terminal[] }
type Step = 'idle' | 'generating' | 'waiting' | 'done' | 'error';

export default function PairClient({ terminals: initial }: Props) {
  const [step,       setStep]       = useState<Step>('idle');
  const [code,       setCode]       = useState('');
  const [codeId,     setCodeId]     = useState('');
  const [locationId, setLocationId] = useState('');
  const [terminals,  setTerminals]  = useState(initial);
  const [error,      setError]      = useState('');
  const [pollRef,    setPollRef]    = useState<ReturnType<typeof setInterval> | null>(null);

  async function generate() {
    setStep('generating');
    setError('');
    const res  = await fetch('/api/admin/pos/pair', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setStep('error'); return; }
    setCode(data.code);
    setCodeId(data.codeId);
    setLocationId(data.locationId);
    setStep('waiting');
    const id = setInterval(async () => {
      const r  = await fetch(`/api/admin/pos/pair/${data.codeId}?locationId=${data.locationId}`);
      const d  = await r.json();
      if (d.status === 'PAIRED') {
        clearInterval(id);
        setStep('done');
        // Reload page to show new terminal in the list
        setTimeout(() => window.location.reload(), 1500);
      }
      if (d.status === 'EXPIRED') {
        clearInterval(id);
        setError('Pairing code expired. Generate a new one.');
        setStep('error');
      }
    }, 3000);
    setPollRef(id);
  }

  function cancel() {
    if (pollRef) clearInterval(pollRef);
    setStep('idle');
  }

  return (
    <div className="space-y-6">
      {terminals.length > 0 && (
        <div className="bg-white rounded-2xl border border-lilac p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-ink/50 mb-3">Paired Terminals</p>
          <div className="space-y-3">
            {terminals.map((t) => (
              <div key={t.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">{t.name}</p>
                  <p className="text-xs text-ink/40 font-mono">{t.squareDeviceId}</p>
                </div>
                {t.isActive && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple text-white font-medium">Active</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'idle' && (
        <button
          onClick={generate}
          className="w-full py-4 bg-purple text-white font-bold rounded-xl hover:bg-purple-deep transition-colors"
        >
          Generate Pairing Code
        </button>
      )}

      {step === 'generating' && (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 rounded-full border-2 border-lilac border-t-purple animate-spin" />
        </div>
      )}

      {step === 'waiting' && (
        <div className="bg-white rounded-2xl border border-lilac p-8 text-center space-y-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink/50">Enter this code on your Terminal</p>
          <p className="font-heading text-5xl tracking-[0.2em] text-purple-deep font-bold">{code}</p>
          <p className="text-sm text-ink/60">On the Terminal: Settings → Connect Device → enter the code above</p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="w-4 h-4 rounded-full border-2 border-lilac border-t-purple animate-spin shrink-0" />
            <span className="text-sm text-ink/40">Waiting for Terminal to pair…</span>
          </div>
          <button onClick={cancel} className="text-xs text-ink/30 hover:text-ink/60 mt-2">Cancel</button>
        </div>
      )}

      {step === 'done' && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <p className="font-semibold text-green-700 text-lg">Terminal paired!</p>
          <p className="text-sm text-green-600 mt-1">Reloading…</p>
        </div>
      )}

      {(step === 'error') && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={() => setStep('idle')} className="text-sm text-purple hover:underline">Try again</button>
        </div>
      )}
    </div>
  );
}
