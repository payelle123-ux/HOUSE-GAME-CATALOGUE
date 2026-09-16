import React from "react";
import { RepairTab } from "./RepairTab";
import { RepairService, ShopInfo } from "../types";
import { Wrench, Truck, ShieldCheck, Headphones, Clock } from "lucide-react";

interface ServiceTabProps {
  services: RepairService[];
  shopInfo: ShopInfo;
  isAdmin: boolean;
  onOpenAddService: () => void;
  onEditService: (service: RepairService) => void;
  onDeleteService: (service: RepairService) => void;
}

export const ServiceTab: React.FC<ServiceTabProps> = (props) => {
  return (
    <div id="hg-service-view" className="space-y-8 animate-fadeIn">
      {/* Overview of HG Service Poles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
            <Wrench size={20} />
          </div>
          <div>
            <h4 className="font-['Orbitron'] text-xs font-bold text-white">
              Atelier Micro-soudure
            </h4>
            <p className="text-[11px] font-['Chakra_Petch'] text-slate-400">
              Réparation HDMI, sticks Hall Effect & cartes mères.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Truck size={20} />
          </div>
          <div>
            <h4 className="font-['Orbitron'] text-xs font-bold text-white">
              Enlèvement & Coursier
            </h4>
            <p className="text-[11px] font-['Chakra_Petch'] text-slate-400">
              Récupération et retour de votre console à domicile.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="font-['Orbitron'] text-xs font-bold text-white">
              Garantie 90 Jours
            </h4>
            <p className="text-[11px] font-['Chakra_Petch'] text-slate-400">
              Pièces certifiées et facture avec suivi d'intervention.
            </p>
          </div>
        </div>
      </div>

      {/* Main Repair Form & Services Catalog */}
      <RepairTab {...props} />
    </div>
  );
};
