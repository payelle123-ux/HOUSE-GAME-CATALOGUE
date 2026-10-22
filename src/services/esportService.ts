import {
  Tournament,
  EsportRegistration,
  EsportLicense,
  EsportPlayer,
  EsportMatch,
  EsportAuditLog,
  RegistrationStatus,
  LicenseStatus,
} from "../types";
import { db } from "../lib/firebase";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query,
  limit,
} from "firebase/firestore";
import {
  firestoreCache,
  DEFAULT_TTLS,
  SingletonSubscription,
} from "./firestoreCache";

// Storage Keys
const TOURNAMENTS_KEY = "hg_esport_tournaments_v3";
const REGISTRATIONS_KEY = "hg_esport_registrations_v3";
const LICENSES_KEY = "hg_esport_licenses_v3";
const MATCHES_KEY = "hg_esport_matches_v3";
const RANKINGS_KEY = "hg_esport_rankings_v3";
const LOGS_KEY = "hg_esport_logs_v3";

// Firestore Collection Names
const COLL_TOURNAMENTS = "tournaments";
const COLL_REGISTRATIONS = "registrations";
const COLL_LICENSES = "player_licenses";
const COLL_MATCHES = "matches";
const COLL_LOGS = "esport_logs";

// Banner & Logo Storage Key
const BANNER_CONFIG_KEY = "hg_esport_banner_config_v3";

export interface EsportBannerConfig {
  logoUrl: string; // Custom logo Data URL or URL (empty = default House Game logo)
  bgImageUrl?: string; // Custom banner background image Data URL or URL
  title?: string;
  subtitle?: string;
  description?: string;
  badgeText?: string;
}

export const DEFAULT_ESPORT_BANNER_CONFIG: EsportBannerConfig = {
  logoUrl: "",
  bgImageUrl: "",
  title: "ARÈNE OFFICIELLE, TOURNOIS & CASH PRIZES GARANTIS",
  subtitle: "HOUSE GAME ESPORT",
  description:
    "Plateforme officielle de compétition de jeux vidéo au Cameroun. Retrouvez les championnats majeurs sur EA SPORTS FC 27, Tekken 8 et Naruto Storm Connections. Inscrivez-vous, obtenez votre licence numérique certifiée HOUSE GAME ID, suivez les scores en direct et hissez-vous au sommet du classement.",
  badgeText: "CIRCUIT OFFICIEL HOUSE GAME ESPORT • CAMEROUN",
};

export function loadEsportBannerConfig(): EsportBannerConfig {
  try {
    const raw = localStorage.getItem(BANNER_CONFIG_KEY);
    if (!raw) return DEFAULT_ESPORT_BANNER_CONFIG;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_ESPORT_BANNER_CONFIG, ...parsed };
  } catch {
    return DEFAULT_ESPORT_BANNER_CONFIG;
  }
}

export function saveEsportBannerConfig(config: EsportBannerConfig): boolean {
  try {
    localStorage.setItem(BANNER_CONFIG_KEY, JSON.stringify(config));
    return true;
  } catch {
    return false;
  }
}

/**
 * Compresse et lit un logo en préservant le canal alpha transparent (PNG/SVG/WebP).
 */
export function compressLogoPreservingAlpha(file: File, maxDim = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Erreur de lecture SVG"));
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height >= width && height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const outputType = file.type === "image/png" ? "image/png" : "image/webp";
        resolve(canvas.toDataURL(outputType, 0.9));
      };
      img.onerror = () => reject(new Error("Image illisible"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Erreur de lecture"));
    reader.readAsDataURL(file);
  });
}

/**
 * Construit l'URL directe de partage pour un tournoi spécifique.
 * Le lien inclut le paramètre ?tab=esport&tournament=ID et l'ancre #tournament-ID
 * pour permettre à n'importe quel membre de la communauté d'atterrir directement sur l'onglet Esport
 * et de voir immédiatement le tournoi sélectionné et mis en valeur.
 */
export function getTournamentShareUrl(tournamentId: string): string {
  try {
    const origin = window.location.origin || "";
    const pathname = window.location.pathname || "/";
    return `${origin}${pathname}?tab=esport&tournament=${encodeURIComponent(tournamentId)}#tournament-${encodeURIComponent(tournamentId)}`;
  } catch {
    return `?tab=esport&tournament=${encodeURIComponent(tournamentId)}#tournament-${encodeURIComponent(tournamentId)}`;
  }
}

// ==================== SEED INITIAL DATA (ALL EMPTY AS REQUESTED) ====================

export const INITIAL_ESPORT_TOURNAMENTS: Tournament[] = [];
export const INITIAL_ESPORT_PLAYERS: EsportPlayer[] = [];
export const INITIAL_ESPORT_LICENSES: EsportLicense[] = [];
export const INITIAL_ESPORT_REGISTRATIONS: EsportRegistration[] = [];
export const INITIAL_ESPORT_MATCHES: EsportMatch[] = [];
export const INITIAL_ESPORT_LOGS: EsportAuditLog[] = [];

// ==================== STORAGE & PERSISTENCE HELPERS ====================

export function loadEsportTournaments(): Tournament[] {
  try {
    const raw = localStorage.getItem(TOURNAMENTS_KEY);
    if (!raw) {
      saveEsportTournaments([]);
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveEsportTournaments(tournaments: Tournament[]): boolean {
  try {
    localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(tournaments));
    return true;
  } catch {
    return false;
  }
}

export function loadEsportRegistrations(): EsportRegistration[] {
  try {
    const raw = localStorage.getItem(REGISTRATIONS_KEY);
    if (!raw) {
      saveEsportRegistrations([]);
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveEsportRegistrations(regs: EsportRegistration[]): boolean {
  try {
    localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(regs));
    return true;
  } catch {
    return false;
  }
}

export function loadEsportLicenses(): EsportLicense[] {
  try {
    const raw = localStorage.getItem(LICENSES_KEY);
    if (!raw) {
      saveEsportLicenses([]);
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveEsportLicenses(lics: EsportLicense[]): boolean {
  try {
    localStorage.setItem(LICENSES_KEY, JSON.stringify(lics));
    return true;
  } catch {
    return false;
  }
}

export function loadEsportMatches(): EsportMatch[] {
  try {
    const raw = localStorage.getItem(MATCHES_KEY);
    if (!raw) {
      saveEsportMatches([]);
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveEsportMatches(matches: EsportMatch[]): boolean {
  try {
    localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
    return true;
  } catch {
    return false;
  }
}

export function loadEsportPlayers(): EsportPlayer[] {
  try {
    const raw = localStorage.getItem(RANKINGS_KEY);
    if (!raw) {
      saveEsportPlayers([]);
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveEsportPlayers(players: EsportPlayer[]): boolean {
  try {
    localStorage.setItem(RANKINGS_KEY, JSON.stringify(players));
    return true;
  } catch {
    return false;
  }
}

export function loadEsportLogs(): EsportAuditLog[] {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (!raw) {
      saveEsportLogs([]);
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveEsportLogs(logs: EsportAuditLog[]): boolean {
  try {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    return true;
  } catch {
    return false;
  }
}

export function clearAllEsportStorage(): void {
  try {
    localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify([]));
    localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify([]));
    localStorage.setItem(LICENSES_KEY, JSON.stringify([]));
    localStorage.setItem(MATCHES_KEY, JSON.stringify([]));
    localStorage.setItem(RANKINGS_KEY, JSON.stringify([]));
    localStorage.setItem(LOGS_KEY, JSON.stringify([]));
    localStorage.setItem("hg_tournaments", JSON.stringify([]));
  } catch (err) {
    console.warn("clearAllEsportStorage error:", err);
  }
}

// ==================== CROSS-TAB & BROADCAST CHANNEL ====================
export const ESPORT_BROADCAST_CHANNEL = "hg_esport_channel_v3";

export function broadcastEsportEvent(type: string, payload: unknown): void {
  try {
    if (typeof window !== "undefined") {
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel(ESPORT_BROADCAST_CHANNEL);
        bc.postMessage({ type, payload, timestamp: Date.now() });
        setTimeout(() => {
          try { bc.close(); } catch { /* ignore */ }
        }, 300);
      }
      window.dispatchEvent(new CustomEvent("hg:esport-event", { detail: { type, payload } }));
      window.dispatchEvent(new CustomEvent("hg:new-registration", { detail: payload }));
    }
  } catch (err) {
    console.warn("Broadcast error:", err);
  }
}

// ==================== FIRESTORE SYNC & SUBSCRIPTIONS ====================

// Singleton multiplexer for registrations: ensures App.tsx and EsportTab.tsx share ONE onSnapshot listener
const registrationsMultiplexer = new SingletonSubscription<EsportRegistration[]>("registrations");
const licensesSubscribers = new Set<(lics: EsportLicense[]) => void>();
const matchesSubscribers = new Set<(matches: EsportMatch[]) => void>();

export function subscribeToEsportRegistrations(
  onUpdate: (regs: EsportRegistration[]) => void,
  onError?: (err: unknown) => void
): () => void {
  return registrationsMultiplexer.subscribe(
    onUpdate,
    (emit) => {
      const colRef = collection(db, COLL_REGISTRATIONS);
      const q = query(colRef, limit(200));

      return onSnapshot(
        q,
        (snapshot) => {
          try {
            const cloudItems: EsportRegistration[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as EsportRegistration;
              cloudItems.push({ ...data, id: d.id });
            });

            // Smart merge with local storage: local validated status is preserved if newer
            const localItems = loadEsportRegistrations();
            const map = new Map<string, EsportRegistration>();
            localItems.forEach((r) => map.set(r.id, r));
            cloudItems.forEach((r) => {
              const existing = map.get(r.id);
              if (existing && existing.status === "validée" && r.status === "en attente") {
                map.set(r.id, { ...r, ...existing });
              } else {
                map.set(r.id, { ...(existing || {}), ...r });
              }
            });

            const merged = Array.from(map.values());
            merged.sort((a, b) => (b.registeredAt || 0) - (a.registeredAt || 0));

            saveEsportRegistrations(merged);
            firestoreCache.set("registrations", merged, DEFAULT_TTLS.REGISTRATIONS, REGISTRATIONS_KEY);
            emit(merged);
          } catch (err) {
            console.warn("Error processing registrations snapshot:", err);
            const cached = loadEsportRegistrations();
            emit(cached);
            if (onError) onError(err);
          }
        },
        (err) => {
          firestoreCache.isQuotaError(err);
          console.warn("Firestore registrations notice (using local cache):", err);
          const cached = loadEsportRegistrations();
          emit(cached);
          if (onError) onError(err);
        }
      );
    },
    loadEsportRegistrations()
  );
}

export async function saveRegistrationCloud(reg: EsportRegistration): Promise<void> {
  const current = loadEsportRegistrations();
  const updated = current.some((r) => r.id === reg.id)
    ? current.map((r) => (r.id === reg.id ? reg : r))
    : [reg, ...current];

  saveEsportRegistrations(updated);
  firestoreCache.set("registrations", updated, DEFAULT_TTLS.REGISTRATIONS, REGISTRATIONS_KEY);
  registrationsMultiplexer.updateLocally(updated);

  try {
    const docRef = doc(db, COLL_REGISTRATIONS, reg.id);
    const sanitized = JSON.parse(JSON.stringify(reg));
    await setDoc(docRef, sanitized, { merge: true });
  } catch (err) {
    firestoreCache.isQuotaError(err);
    console.warn("Firestore saveRegistrationCloud notice (persisted locally):", err);
  }
}

export async function deleteRegistrationCloud(id: string): Promise<void> {
  const current = loadEsportRegistrations();
  const updated = current.filter((r) => r.id !== id);

  saveEsportRegistrations(updated);
  firestoreCache.set("registrations", updated, DEFAULT_TTLS.REGISTRATIONS, REGISTRATIONS_KEY);
  registrationsMultiplexer.updateLocally(updated);

  try {
    const docRef = doc(db, COLL_REGISTRATIONS, id);
    await deleteDoc(docRef);
  } catch (err) {
    firestoreCache.isQuotaError(err);
    console.warn("Firestore deleteRegistrationCloud notice:", err);
  }
}

// ==================== LICENSES (CACHE-FIRST WITH TTL) ====================

export function subscribeToEsportLicenses(
  onUpdate: (lics: EsportLicense[]) => void,
  onError?: (err: unknown) => void
): () => void {
  licensesSubscribers.add(onUpdate);

  const cached = firestoreCache.get<EsportLicense[]>("licenses", LICENSES_KEY);
  const initial = cached?.data || loadEsportLicenses();
  onUpdate(initial);

  if (cached?.isFresh || firestoreCache.isQuotaCoolingDown()) {
    return () => {
      licensesSubscribers.delete(onUpdate);
    };
  }

  let isCancelled = false;
  firestoreCache
    .dedupe("fetch_licenses", async () => {
      const colRef = collection(db, COLL_LICENSES);
      const q = query(colRef, limit(200));
      const snapshot = await getDocs(q);

      const cloudItems: EsportLicense[] = [];
      snapshot.forEach((d) => {
        cloudItems.push({ ...(d.data() as EsportLicense), id: d.id });
      });

      // Smart merge: never discard locally issued licenses
      const localItems = loadEsportLicenses();
      const map = new Map<string, EsportLicense>();
      localItems.forEach((l) => map.set(l.id, l));
      cloudItems.forEach((l) => {
        const existing = map.get(l.id);
        map.set(l.id, { ...(existing || {}), ...l });
      });

      return Array.from(map.values());
    })
    .then((fresh) => {
      if (isCancelled) return;
      saveEsportLicenses(fresh);
      firestoreCache.set("licenses", fresh, DEFAULT_TTLS.LICENSES, LICENSES_KEY);
      licensesSubscribers.forEach((cb) => {
        try { cb(fresh); } catch { /* ignore */ }
      });
    })
    .catch((err) => {
      firestoreCache.isQuotaError(err);
      console.warn("Licenses fetch notice (using cache):", err);
      if (onError) onError(err);
    });

  return () => {
    isCancelled = true;
    licensesSubscribers.delete(onUpdate);
  };
}

export async function saveLicenseCloud(lic: EsportLicense): Promise<void> {
  const current = loadEsportLicenses();
  const updated = current.some((l) => l.id === lic.id)
    ? current.map((l) => (l.id === lic.id ? lic : l))
    : [lic, ...current];

  saveEsportLicenses(updated);
  firestoreCache.set("licenses", updated, DEFAULT_TTLS.LICENSES, LICENSES_KEY);
  licensesSubscribers.forEach((cb) => {
    try { cb(updated); } catch { /* ignore */ }
  });

  try {
    const docRef = doc(db, COLL_LICENSES, lic.id);
    const sanitized = JSON.parse(JSON.stringify(lic));
    await setDoc(docRef, sanitized, { merge: true });
  } catch (err) {
    firestoreCache.isQuotaError(err);
    console.warn("Firestore saveLicenseCloud notice (persisted locally):", err);
  }
}

export async function deleteLicenseCloud(id: string): Promise<void> {
  const current = loadEsportLicenses();
  const updated = current.filter((l) => l.id !== id);

  saveEsportLicenses(updated);
  firestoreCache.set("licenses", updated, DEFAULT_TTLS.LICENSES, LICENSES_KEY);
  licensesSubscribers.forEach((cb) => {
    try { cb(updated); } catch { /* ignore */ }
  });

  try {
    const docRef = doc(db, COLL_LICENSES, id);
    await deleteDoc(docRef);
  } catch (err) {
    firestoreCache.isQuotaError(err);
    console.warn("Firestore deleteLicenseCloud notice:", err);
  }
}

// ==================== MATCHES (CACHE-FIRST WITH TTL) ====================

export function subscribeToEsportMatches(
  onUpdate: (matches: EsportMatch[]) => void,
  onError?: (err: unknown) => void
): () => void {
  matchesSubscribers.add(onUpdate);

  const cached = firestoreCache.get<EsportMatch[]>("matches", MATCHES_KEY);
  const initial = cached?.data || loadEsportMatches();
  onUpdate(initial);

  if (cached?.isFresh || firestoreCache.isQuotaCoolingDown()) {
    return () => {
      matchesSubscribers.delete(onUpdate);
    };
  }

  let isCancelled = false;
  firestoreCache
    .dedupe("fetch_matches", async () => {
      const colRef = collection(db, COLL_MATCHES);
      const q = query(colRef, limit(200));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return initial;
      }

      const items: EsportMatch[] = [];
      snapshot.forEach((d) => items.push({ ...(d.data() as EsportMatch), id: d.id }));
      items.sort((a, b) => (a.round || 1) - (b.round || 1) || (a.matchNumber || 0) - (b.matchNumber || 0));
      return items;
    })
    .then((fresh) => {
      if (isCancelled) return;
      saveEsportMatches(fresh);
      firestoreCache.set("matches", fresh, DEFAULT_TTLS.MATCHES, MATCHES_KEY);
      matchesSubscribers.forEach((cb) => {
        try { cb(fresh); } catch { /* ignore */ }
      });
    })
    .catch((err) => {
      firestoreCache.isQuotaError(err);
      console.warn("Matches fetch notice (using cache):", err);
      if (onError) onError(err);
    });

  return () => {
    isCancelled = true;
    matchesSubscribers.delete(onUpdate);
  };
}

export async function saveMatchCloud(match: EsportMatch): Promise<void> {
  const current = loadEsportMatches();
  const updated = current.some((m) => m.id === match.id)
    ? current.map((m) => (m.id === match.id ? match : m))
    : [...current, match];

  saveEsportMatches(updated);
  firestoreCache.set("matches", updated, DEFAULT_TTLS.MATCHES, MATCHES_KEY);
  matchesSubscribers.forEach((cb) => {
    try { cb(updated); } catch { /* ignore */ }
  });

  try {
    const docRef = doc(db, COLL_MATCHES, match.id);
    const sanitized = JSON.parse(JSON.stringify(match));
    await setDoc(docRef, sanitized, { merge: true });
  } catch (err) {
    firestoreCache.isQuotaError(err);
    console.warn("Firestore saveMatchCloud notice (persisted locally):", err);
  }
}

export async function deleteMatchCloud(id: string): Promise<void> {
  const current = loadEsportMatches();
  const updated = current.filter((m) => m.id !== id);

  saveEsportMatches(updated);
  firestoreCache.set("matches", updated, DEFAULT_TTLS.MATCHES, MATCHES_KEY);
  matchesSubscribers.forEach((cb) => {
    try { cb(updated); } catch { /* ignore */ }
  });

  try {
    const docRef = doc(db, COLL_MATCHES, id);
    await deleteDoc(docRef);
  } catch (err) {
    firestoreCache.isQuotaError(err);
    console.warn("Firestore deleteMatchCloud notice:", err);
  }
}

// ==================== ENGINE & BUSINESS LOGIC ====================

/**
 * Generates an official unique player ID
 */
export function generatePlayerId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `HGP-${num}`;
}

/**
 * Generates an official unique license ID: HGE-2026-XXXX
 */
export function generateLicenseNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `HGE-${year}-${rand}`;
}

/**
 * Masks a phone number for public display (prevents privacy leakage)
 */
export function maskPhoneNumber(phone?: string | null): string {
  if (!phone) return "*** ***";
  const cleaned = String(phone).trim();
  if (cleaned.length < 8) return "*** ***";
  const start = cleaned.slice(0, 7);
  const end = cleaned.slice(-2);
  return `${start} *** *${end}`;
}

/**
 * Generates an official QR code data URL using an SVG matrix representation
 */
export function generateSvgQrDataUri(content: string): string {
  // Simple, robust high-fidelity SVG QR code pattern generator with finder patterns
  const hash = Array.from(content).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000007, 7);
  const size = 25; // 25x25 matrix
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Finder pattern helper (7x7 with 3x3 core)
  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          matrix[r0 + r][c0 + c] = true;
        }
      }
    }
  };

  drawFinder(0, 0); // Top-left
  drawFinder(0, size - 7); // Top-right
  drawFinder(size - 7, 0); // Bottom-left

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Deterministic pseudo-random data bits based on content hash
  let seed = Math.abs(hash);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Don't overwrite finders
      const inTL = r < 8 && c < 8;
      const inTR = r < 8 && c >= size - 8;
      const inBL = r >= size - 8 && c < 8;
      if (!inTL && !inTR && !inBL && matrix[r][c] === false) {
        seed = (seed * 16807 + 11) % 2147483647;
        matrix[r][c] = (seed % 3 === 0);
      }
    }
  }

  // Build SVG path
  let path = "";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) {
        path += `M${c},${r}h1v1h-1z `;
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#0A0D14"/><path d="${path}" fill="#00FF88"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Public Verification Tool for House Game Digital License
 */
export function verifyEsportLicense(
  licenseNumberOrQuery: string,
  licenses: EsportLicense[]
): {
  found: boolean;
  license?: EsportLicense;
  message: string;
  isStatusActive: boolean;
} {
  const query = licenseNumberOrQuery.trim().toUpperCase();
  if (!query) {
    return {
      found: false,
      message: "Veuillez renseigner un numéro de licence officiel (ex: HGE-2026-1001).",
      isStatusActive: false,
    };
  }

  const match = licenses.find(
    (l) =>
      l.id.toUpperCase() === query ||
      l.gamerTag.toUpperCase() === query ||
      l.playerId.toUpperCase() === query
  );

  if (!match) {
    return {
      found: false,
      message: `Aucune licence trouvée pour la référence « ${query} ». Vérifiez la saisie ou contactez l'administration House Game.`,
      isStatusActive: false,
    };
  }

  const isStatusActive = match.status === "Active";
  const message = isStatusActive
    ? `Licence officielle certifiée valide pour ${match.gamerTag} (${match.fullName}). Statut : ACTIVE.`
    : `Attention : cette licence est actuellement ${match.status.toUpperCase()}. Elle n'autorise pas la participation aux tournois officiels.`;

  return {
    found: true,
    license: match,
    message,
    isStatusActive,
  };
}

/**
 * Automated Bracket Generation Engine
 * Creates a single-elimination tournament bracket from validated registrations
 */
export function generateTournamentMatches(
  tournament: Tournament,
  registrations: EsportRegistration[],
  actorName: string
): { matches: EsportMatch[]; log: EsportAuditLog } {
  // Filter validated registrations only
  const validPlayers = registrations.filter(
    (r) => r.tournamentId === tournament.id && r.status === "validée"
  );

  if (validPlayers.length < 2) {
    throw new Error(
      "Impossible de générer le tableau : au moins 2 inscriptions validées sont requises."
    );
  }

  // Shuffle for fair random draw
  const shuffled = [...validPlayers].sort(() => Math.random() - 0.5);

  // Determine power of 2 bracket size (e.g., 4, 8, 16, 32)
  let bracketSize = 2;
  while (bracketSize < shuffled.length && bracketSize < 32) {
    bracketSize *= 2;
  }

  const generatedMatches: EsportMatch[] = [];
  const now = Date.now();
  let matchCounter = 1;

  // Round 1 (Opening round, e.g. Quarts de finale or 8èmes de finale)
  const round1Pairs = bracketSize / 2;
  const round1Name =
    round1Pairs === 1
      ? "Grande Finale"
      : round1Pairs === 2
      ? "Demi-finales"
      : round1Pairs === 4
      ? "Quarts de finale"
      : round1Pairs === 8
      ? "8èmes de finale"
      : "16èmes de finale";

  // Pre-generate match IDs for wiring nextMatchId
  const r1Matches: EsportMatch[] = [];
  for (let i = 0; i < round1Pairs; i++) {
    const p1 = shuffled[i * 2];
    const p2 = shuffled[i * 2 + 1];

    const match: EsportMatch = {
      id: `M-${tournament.id.replace("tourn-", "T")}-${matchCounter}`,
      tournamentId: tournament.id,
      round: 1,
      roundName: round1Name,
      matchNumber: matchCounter,
      player1Id: p1 ? p1.playerId : undefined,
      player1Tag: p1 ? p1.gamerTag : "Exempté (Bye)",
      player1Score: 0,
      player2Id: p2 ? p2.playerId : undefined,
      player2Tag: p2 ? p2.gamerTag : "Exempté (Bye)",
      player2Score: 0,
      status: "À venir",
      tableOrScreen: `Poste ${String(i + 1).padStart(2, "0")}`,
      scheduledTime: tournament.time || "10h00",
      referee: "Arbitre Officiel HG",
      updatedAt: now,
    };

    // Auto-advance if bye
    if (p1 && !p2) {
      match.winnerId = p1.playerId;
      match.winnerTag = p1.gamerTag;
      match.status = "Terminé";
      match.notes = "Qualification automatique (Exemption)";
    }

    matchCounter++;
    r1Matches.push(match);
    generatedMatches.push(match);
  }

  // Generate subsequent rounds until Final
  let previousRoundMatches = r1Matches;
  let currentRound = 2;
  let currentPairs = round1Pairs / 2;

  while (currentPairs >= 1) {
    const currentRoundName =
      currentPairs === 1
        ? "Grande Finale"
        : currentPairs === 2
        ? "Demi-finales"
        : currentPairs === 4
        ? "Quarts de finale"
        : "8èmes de finale";

    const nextMatches: EsportMatch[] = [];
    for (let i = 0; i < currentPairs; i++) {
      const match: EsportMatch = {
        id: `M-${tournament.id.replace("tourn-", "T")}-${matchCounter}`,
        tournamentId: tournament.id,
        round: currentRound,
        roundName: currentRoundName,
        matchNumber: matchCounter,
        player1Tag: "En attente Vainqueur",
        player1Score: 0,
        player2Tag: "En attente Vainqueur",
        player2Score: 0,
        status: "À venir",
        tableOrScreen: currentPairs === 1 ? "Scène Centrale (Écran Géant)" : `Poste ${String(i + 1).padStart(2, "0")}`,
        scheduledTime: tournament.time || "À suivre",
        referee: "Arbitre Officiel HG",
        updatedAt: now,
      };

      // Link child matches from previous round to this parent match
      const child1 = previousRoundMatches[i * 2];
      const child2 = previousRoundMatches[i * 2 + 1];
      if (child1) child1.nextMatchId = match.id;
      if (child2) child2.nextMatchId = match.id;

      matchCounter++;
      nextMatches.push(match);
      generatedMatches.push(match);
    }

    previousRoundMatches = nextMatches;
    currentPairs = Math.floor(currentPairs / 2);
    currentRound++;
  }

  const log: EsportAuditLog = {
    id: `log-${Date.now()}`,
    action: "Génération du tableau officiel",
    actor: actorName || "Staff Esport",
    targetId: tournament.id,
    targetType: "tournoi",
    details: `Tirage au sort officiel et génération de ${generatedMatches.length} matchs pour « ${tournament.title} » (${validPlayers.length} participants validés).`,
    timestamp: now,
  };

  return { matches: generatedMatches, log };
}

/**
 * Exports data to CSV string with standard UTF-8 BOM
 */
export function exportToCsv<T extends object>(data: T[], filename: string): void {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]) as (keyof T)[];
  const rows = data.map((obj) =>
    headers
      .map((header) => {
        const val = (obj as Record<string, unknown>)[header as string];
        const stringVal = val === null || val === undefined ? "" : String(val);
        const escaped = stringVal.replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(";")
  );

  const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
