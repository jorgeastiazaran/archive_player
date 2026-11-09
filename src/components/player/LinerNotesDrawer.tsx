import React, { useState } from 'react';
import {
  X,
  BookOpen,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  MapPin,
  Calendar,
  Disc3,
  Tag,
  Sparkles,
} from 'lucide-react';
import { usePlayer } from '../../store/PlayerContext';

export const LinerNotesDrawer: React.FC = () => {
  const {
    currentItem,
    showLinerNotes,
    setShowLinerNotes,
    queue,
    playItem,
  } = usePlayer();

  const [copied, setCopied] = useState(false);

  if (!showLinerNotes || !currentItem) {
    return null;
  }

  const handleCopyAttribution = async () => {
    const attribution =
      currentItem.license.attributionText ||
      `"${currentItem.title}" por ${currentItem.artist} — Fuente: ${currentItem.sourceLabel} (${currentItem.license.label}). Disponible en: ${currentItem.sourcePageUrl}`;

    try {
      await navigator.clipboard.writeText(attribution);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="fixed inset-0"
        onClick={() => setShowLinerNotes(false)}
        aria-hidden="true"
      />

      <aside
        aria-label="Notas históricas y licencia"
        className="relative z-10 w-full max-w-md bg-zinc-950 border-l border-zinc-800/90 h-full flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Cabecera */}
        <div className="px-5 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">
                Liner Notes y Contexto Histórico
              </h2>
              <p className="text-[11px] text-zinc-400">
                Ficha documental y créditos de uso libre
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLinerNotes(false)}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            title="Cerrar panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido desplazable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Portada y datos principales */}
          <div className="flex gap-4 items-center bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800/80">
            <img
              src={currentItem.thumbnailUrl}
              alt={currentItem.title}
              className="w-20 h-20 rounded-xl object-cover bg-zinc-800 shrink-0 border border-zinc-700/60"
            />
            <div className="min-w-0 flex-1">
              <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-1">
                {currentItem.sourceLabel}
              </span>
              <h3 className="text-base font-bold text-zinc-100 truncate">
                {currentItem.title}
              </h3>
              <p className="text-xs text-zinc-300 truncate">{currentItem.artist}</p>
              <p className="text-[11px] text-zinc-500 truncate mt-0.5 flex items-center gap-1">
                <Disc3 className="w-3 h-3 shrink-0" />
                {currentItem.albumOrCollection}
              </p>
            </div>
          </div>

          {/* Metadatos de época y origen */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/70">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-400" />
                Año / Década
              </span>
              <p className="text-xs font-semibold text-zinc-200 mt-1">
                {currentItem.year ? `${currentItem.year} (${currentItem.decade})` : currentItem.decade}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/70">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                Región / Origen
              </span>
              <p className="text-xs font-semibold text-zinc-200 mt-1 truncate">
                {currentItem.region || 'Archivo Internacional'}
              </p>
            </div>
          </div>

          {/* Notas históricas ("Liner Notes") */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/25 via-zinc-900/80 to-zinc-900 border border-amber-500/25 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Historia de la Grabación / Obra
            </h4>
            <p className="text-sm text-zinc-200 leading-relaxed">
              {currentItem.historicalContext}
            </p>
          </div>

          {/* Géneros y atmósferas */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-zinc-500" />
              Géneros y Atmósferas
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentItem.genres.map((g) => (
                <span
                  key={g}
                  className="text-xs px-2.5 py-1 rounded-full bg-zinc-800/90 text-zinc-200 border border-zinc-700/70"
                >
                  {g}
                </span>
              ))}
              {currentItem.moods.map((m) => (
                <span
                  key={m}
                  className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20"
                >
                  #{m}
                </span>
              ))}
            </div>
          </div>

          {/* Sello de Licencia Abierta (Safe for Creators) */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                    Safe for Creators • Licencia Verificada
                  </span>
                  <h4 className="text-sm font-bold text-zinc-100">
                    {currentItem.license.label}
                  </h4>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {currentItem.license.code}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 font-mono break-words">
              {currentItem.license.attributionText}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyAttribution}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    ¡Atribución Copiada!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copiar Atribución (Safe for Creators)
                  </>
                )}
              </button>

              <a
                href={currentItem.sourcePageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
              >
                <span>Ver en archive.org</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Cola de reproducción actual */}
          {queue.length > 1 && (
            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Cola de Reproducción ({queue.length})
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {queue.map((item) => {
                  const active = item.id === currentItem.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => playItem(item)}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors ${
                        active
                          ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                          : 'hover:bg-zinc-900 text-zinc-300'
                      }`}
                    >
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-8 h-8 rounded-lg object-cover shrink-0 bg-zinc-800"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{item.title}</p>
                        <p className="text-[10px] text-zinc-500 truncate">{item.artist}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
