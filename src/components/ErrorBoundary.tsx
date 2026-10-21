import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[300px] w-full flex-col items-center justify-center rounded-3xl border border-rose-500/30 bg-[#0E121B] p-8 text-center text-white">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <AlertTriangle size={28} />
          </div>
          <h3 className="font-['Orbitron'] text-lg font-bold text-white mb-2">
            {this.props.fallbackTitle || "Une erreur inattendue est survenue"}
          </h3>
          <p className="max-w-md font-['Chakra_Petch'] text-xs text-slate-400 mb-6">
            Le composant a rencontré un problème. Vous pouvez réactualiser l'interface pour reprendre votre session en toute sécurité.
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-lg hover:from-emerald-500 hover:to-teal-500 transition active:scale-95"
          >
            <RefreshCw size={14} />
            <span>Recharger l'affichage</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
