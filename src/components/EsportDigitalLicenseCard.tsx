import React, { useRef, useState } from "react";
import { EsportLicense } from "../types";
import {
  ShieldCheck,
  QrCode,
  Download,
  Share2,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Calendar,
  Gamepad2,
  Trash2,
} from "lucide-react";
import { generateSvgQrDataUri } from "../services/esportService";

interface EsportDigitalLicenseCardProps {
  license: EsportLicense;
  showActions?: boolean;
  onVerifyClick?: () => void;
  customLogoUrl?: string;
  onDelete?: () => void;
}

export const EsportDigitalLicenseCard: React.FC<EsportDigitalLicenseCardProps> = ({
  license,
  showActions = true,
  onVerifyClick,
  customLogoUrl,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const qrUri = license.qrCodeData.startsWith("data:")
    ? license.qrCodeData
    : generateSvgQrDataUri(license.qrCodeData || license.id);

  const handleCopyId = () => {
    navigator.clipboard.writeText(license.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      const card = cardRef.current;
      const width = 640;
      const height = 400;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        setIsExporting(false);
        return;
      }

      // Draw background cyberpunk gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, "#080B11");
      bgGrad.addColorStop(0.5, "#0E1422");
      bgGrad.addColorStop(1, "#070A0F");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Border with neon accent
      ctx.lineWidth = 3;
      const borderGrad = ctx.createLinearGradient(0, 0, width, 0);
      borderGrad.addColorStop(0, "#00FF88");
      borderGrad.addColorStop(0.5, "#3E9BFF");
      borderGrad.addColorStop(1, "#FF007A");
      ctx.strokeStyle = borderGrad;
      ctx.strokeRect(4, 4, width - 8, height - 8);

      // Top title
      ctx.fillStyle = "#00FF88";
      ctx.font = "bold 14px Orbitron, sans-serif";
      ctx.fillText("HOUSE GAME ESPORT • LICENCE OFFICIELLE", 30, 42);

      // Status
      ctx.fillStyle = license.status === "Active" ? "#10B981" : "#F59E0B";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(`STATUT : ${license.status.toUpperCase()}`, width - 180, 42);

      // GamerTag & Full Name
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 26px Orbitron, sans-serif";
      ctx.fillText(license.gamerTag, 30, 95);

      ctx.fillStyle = "#A0AEC0";
      ctx.font = "14px sans-serif";
      ctx.fillText(`Nom : ${license.fullName}`, 30, 125);
      ctx.fillText(`Rang : ${license.rankLevel}  |  Points : ${license.totalPoints || 0} pts`, 30, 150);

      // License Number
      ctx.fillStyle = "#3E9BFF";
      ctx.font = "bold 16px monospace";
      ctx.fillText(`N° LICENCE : ${license.id}`, 30, 200);

      // Validity
      ctx.fillStyle = "#718096";
      ctx.font = "12px sans-serif";
      ctx.fillText(`Émise le : ${license.issuedAt}  •  Expire le : ${license.expiresAt}`, 30, 230);
      ctx.fillText(`Spécialités : ${license.gameSpecialties?.join(", ") || "Multi-gaming"}`, 30, 255);

      // Security watermark
      ctx.fillStyle = "#2D3748";
      ctx.font = "10px monospace";
      ctx.fillText("CERTIFIÉ PAR HOUSE GAME SARL • YAOUNDÉ CAMEROUN • REPRODUCTION STRICTEMENT INTERDITE", 30, 365);

      // Export to PNG
      const link = document.createElement("a");
      link.download = `Licence-HouseGame-${license.gamerTag}-${license.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export license card error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const getRankBadgeColor = (rank: string) => {
    switch (rank) {
      case "Master":
        return "bg-gradient-to-r from-amber-400 to-yellow-600 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]";
      case "Élite":
        return "bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]";
      case "Pro":
        return "bg-gradient-to-r from-[#00FF88] to-emerald-600 text-slate-950 border-[#00FF88] shadow-[0_0_15px_rgba(0,255,136,0.5)]";
      case "Challenger":
        return "bg-gradient-to-r from-[#3E9BFF] to-blue-700 text-white border-[#3E9BFF] shadow-[0_0_15px_rgba(62,155,255,0.5)]";
      default:
        return "bg-slate-800 text-slate-200 border-slate-600";
    }
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      {/* CARD BODY */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-[#090D15] via-[#0F1626] to-[#07090F] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl transition hover:border-emerald-400/80 hover:shadow-[0_25px_70px_rgba(0,255,136,0.18)]"
      >
        {/* Futuristic Glowing Grid & Ambient Lights */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[#00FF88]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[#3E9BFF]/15 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

        {/* Card Header */}
        <div className="relative z-10 flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            {customLogoUrl ? (
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border border-emerald-500/40 bg-black/50 p-1">
                <img src={customLogoUrl} alt="Logo Esport" className="h-full w-full object-contain" />
              </div>
            ) : (
              /* Holographic Chip */
              <div className="flex h-10 w-12 items-center justify-center rounded-lg border border-amber-400/50 bg-gradient-to-br from-amber-300/40 via-yellow-500/20 to-amber-600/40 shadow-inner">
                <div className="grid grid-cols-2 gap-1 opacity-70">
                  <div className="h-2 w-3 rounded-sm border border-amber-300/60" />
                  <div className="h-2 w-3 rounded-sm border border-amber-300/60" />
                  <div className="h-2 w-3 rounded-sm border border-amber-300/60" />
                  <div className="h-2 w-3 rounded-sm border border-amber-300/60" />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center gap-1.5 font-['Orbitron'] text-xs font-black tracking-widest text-[#00FF88]">
                <ShieldCheck size={14} />
                <span>HOUSE GAME ESPORT</span>
              </div>
              <div className="font-['JetBrains_Mono'] text-[10px] text-slate-400">
                CARTE DE COMPÉTITEUR OFFICIEL
              </div>
            </div>
          </div>

          {/* Status Badge & Delete Icon */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-['JetBrains_Mono'] text-[11px] font-bold border ${
                license.status === "Active"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                  : license.status === "Suspendue"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                  : "bg-rose-500/20 text-rose-300 border-rose-500/50"
              }`}
            >
              {license.status === "Active" ? (
                <CheckCircle2 size={12} className="text-emerald-400" />
              ) : (
                <AlertTriangle size={12} className="text-amber-400" />
              )}
              <span>{license.status.toUpperCase()}</span>
            </span>

            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                title="Supprimer cette carte de licence"
                className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/25 hover:text-rose-200 transition"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Card Main Info */}
        <div className="relative z-10 py-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
          {/* Avatar / Photo */}
          <div className="sm:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden border-2 border-emerald-400/60 bg-[#121624] shadow-[0_0_20px_rgba(0,255,136,0.25)]">
              {license.photoUrl ? (
                <img
                  src={license.photoUrl}
                  alt={license.gamerTag}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-['Orbitron'] text-2xl font-bold text-emerald-400 bg-gradient-to-br from-emerald-950 to-slate-900">
                  {license.gamerTag.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* Rank Level Pill */}
            <div className="mt-2.5">
              <span
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 font-['Orbitron'] text-[10px] font-black border uppercase tracking-wider ${getRankBadgeColor(
                  license.rankLevel
                )}`}
              >
                <Award size={11} />
                <span>RANG {license.rankLevel}</span>
              </span>
            </div>
          </div>

          {/* Player details */}
          <div className="sm:col-span-8 space-y-3">
            <div>
              <div className="font-['Orbitron'] text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                {license.gamerTag}
              </div>
              <div className="font-['Chakra_Petch'] text-sm font-semibold text-slate-300">
                {license.fullName}
              </div>
            </div>

            {/* Specialties & Points */}
            <div className="grid grid-cols-2 gap-2 text-xs font-['JetBrains_Mono'] pt-1">
              <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                <span className="text-[10px] text-slate-400 block">POINTS HG</span>
                <strong className="text-emerald-400 font-['Orbitron'] text-sm">
                  {license.totalPoints || 0} pts
                </strong>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                <span className="text-[10px] text-slate-400 block">CONTACT VALIDÉ</span>
                <strong className="text-slate-200 text-xs truncate block">
                  {license.phoneMasked || "Non communiqué"}
                </strong>
              </div>
            </div>

            {/* Game Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {license.gameSpecialties?.map((game, i) => (
                <span
                  key={i}
                  className="rounded-md border border-[#3E9BFF]/30 bg-[#3E9BFF]/10 px-2 py-0.5 font-['JetBrains_Mono'] text-[10px] text-[#3E9BFF]"
                >
                  <Gamepad2 size={10} className="inline mr-1" />
                  {game}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Card Footer: Number & QR Code */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-white/10 pt-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-['JetBrains_Mono'] text-xs text-slate-400">ID LICENCE :</span>
              <span className="font-['Orbitron'] text-sm font-black text-white tracking-wider">
                {license.id}
              </span>
              <button
                onClick={handleCopyId}
                className="p-1 text-slate-400 hover:text-white transition"
                title="Copier le numéro"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
            <div className="flex items-center gap-3 font-['JetBrains_Mono'] text-[10px] text-slate-500">
              <span>Émise : {license.issuedAt}</span>
              <span>•</span>
              <span>Expiration : {license.expiresAt}</span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="h-14 w-14 rounded-xl border border-emerald-500/40 bg-black p-1 shadow-md">
              <img
                src={qrUri}
                alt={`QR Code ${license.id}`}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="text-[9px] font-['JetBrains_Mono'] text-slate-400 leading-tight hidden sm:block">
              SCAN DE
              <br />
              CONTRÔLE
              <br />
              <strong className="text-[#00FF88]">OFFICIEL</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS (Download / Verify / Delete) */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:from-emerald-500 hover:to-teal-500 transition active:scale-95 disabled:opacity-50"
          >
            <Download size={14} />
            <span>{isExporting ? "Génération de l'image..." : "Télécharger ma carte (PNG)"}</span>
          </button>

          {onVerifyClick && (
            <button
              onClick={onVerifyClick}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-['JetBrains_Mono'] text-xs text-slate-300 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-white transition"
            >
              <QrCode size={14} className="text-emerald-400" />
              <span>Vérifier</span>
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              title="Supprimer définitivement cette licence"
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 px-4 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-rose-300 hover:text-rose-200 transition active:scale-95"
            >
              <Trash2 size={14} />
              <span>Supprimer</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
