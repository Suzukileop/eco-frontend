/** Aligné sur PagedResponse Spring / wrapper frontend */
export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

/** Réponse brute Spring Data Page (avant normalisation) */
export interface SpringPageRaw<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
  last?: boolean;
}

// --- Legacy service request (certains endpoints peuvent encore renvoyer ce format) ---
export type ServiceRequestStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'PROPOSED'
  | 'VALIDATED'
  | 'REJECTED'
  | 'COMPLETED';

export interface ServiceRequestDto {
  id: string;
  clientId: string;
  type: string;
  status: ServiceRequestStatus;
  uniqueCode: string;
  createdAt: string;
}

// --- Refonte écosystème / niche (contrats prompt) ---

export type NicheStatus =
  | 'PENDING'
  | 'PROPOSED'
  | 'VALIDATED'
  | 'PAID'
  | 'ACTIVE'
  | 'REJECTED'
  | 'CANCELLED';

export type NextStep =
  | 'BOT_CHAT'
  | 'WAITING_AGENT'
  | 'VALIDATE_MODEL'
  | 'PAYMENT'
  | 'SCHEDULER'
  | 'ACTIVE';

export type RefType = 'MCT' | 'URL' | 'MP4';

export type EcosystemPlatform = 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE' | 'FACEBOOK' | 'TWITTER';

export type PaymentStatus = 'UNPAID' | 'PENDING_PAYMENT' | 'PAID' | 'FAILED' | 'REFUNDED' | string;

/** Détail / liste niche — aligné NicheRequestResponse (prompt) */
export interface NicheRequestResponse {
  id: string;
  uniqueCode: string;
  nicheTheme: string;
  description: string;
  language: string;
  nbPostsPerWeek: number;
  platforms: EcosystemPlatform[];
  refType: RefType | null;
  refMctCode: string | null;
  refExternalUrl: string | null;
  refSourcePlatform?: EcosystemPlatform | null;
  refFileUrl: string | null;
  monthlyAmountCents: number;
  monthlyAmountFormatted: string;
  status: NicheStatus | string;
  paymentStatus?: PaymentStatus | null;
  botConfirmed: boolean;
  demoContentUrl: string | null;
  agentNotes: string | null;
  createdAt: string;
  updatedAt?: string | null;
  activatedAt?: string | null;
  nextStep: NextStep | string;
  /** Renvoyé après validation acceptée + création session Stripe */
  stripeCheckoutUrl?: string | null;
  rejectionReason?: string | null;
  deadline?: string | null;
}

export interface NicheRequestFormData {
  nicheTheme: string;
  description: string;
  language: string;
  nbPostsPerWeek: number;
  platforms: EcosystemPlatform[];
  refType?: RefType | null;
  refMctCode?: string | null;
  refExternalUrl?: string | null;
  refSourcePlatform?: EcosystemPlatform | null;
}

export interface BotMessageBody {
  message: string;
}

export interface BotResponseDto {
  botMessage: string;
  botConfirmed: boolean;
  nextStep: string;
  /** Réponse IA avec marqueur de fin — le dossier n’avance qu’après confirmNicheAfterBot. */
  readyToConfirm?: boolean;
}

export interface ValidateModelBody {
  accepted: boolean;
  rejectionReason?: string;
}

/** Aligné backend : 0 = dimanche … 6 = samedi (même échelle que `publication_days` historique). */
export const ECOSYSTEM_DAY_LABELS: Record<number, string> = {
  0: 'Dim',
  1: 'Lun',
  2: 'Mar',
  3: 'Mer',
  4: 'Jeu',
  5: 'Ven',
  6: 'Sam',
};

export interface PublicationSlotDto {
  dayOfWeek: number;
  time: string;
}

export interface ScheduledConfigDto {
  nicheRequestId: string;
  publicationSlots: PublicationSlotDto[];
}

export interface AgentProposeBody {
  demoContentUrl: string;
  agentNotes?: string;
}

export interface TariffConfigResponse {
  tarifUnitaireCents: number;
  formatted?: string;
}

export interface RefUploadResponse {
  refFileUrl: string;
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
}

export interface DemoUploadResponse {
  demoContentUrl: string;
}

/** Messages chat bot niche (GET history) — champs optionnels pour tolérance backend */
export interface EcosystemBotMessage {
  id: string;
  content: string;
  sentAt: string;
  senderType?: 'BOT' | 'HUMAN' | 'SYSTEM' | string;
  role?: string;
}

// --- Ancienne page détail service (compat minimale) ---
export interface NicheRequestDto {
  id: string;
  clientId: string;
  agentId: string | null;
  nicheTheme: string;
  description: string;
  refModelId: string | null;
  status: string;
  proposedModelId: string | null;
  notes: string | null;
  deadline: string | null;
  createdAt: string;
}

export interface ServiceRequestDetailDto {
  roomId: string;
  serviceRequest: ServiceRequestDto;
  nicheRequest: NicheRequestDto | null;
}

export interface ValidateNicheResponse {
  nextStep?: string | null;
  nicheCode?: string | null;
  accepted?: boolean;
}

export interface ProposeModelBody {
  proposedModelId: string;
  notes?: string;
}

export interface ChatMessageDto {
  id: string;
  roomId: string;
  /** Null pour messages système / bot sans User JPA */
  senderId: string | null;
  senderName: string;
  content: string;
  sentAt: string;
  isRead: boolean | null;
  /** HUMAN | BOT | AGENT — renvoyé par l’API */
  senderType?: string | null;
}

export interface NotificationDto {
  id: string;
  type: string;
  title: string;
  message: string | null;
  isRead: boolean;
  createdAt: string;
  refId?: string | null;
}

export interface CreatorProfileDto {
  id: string;
  bio: string | null;
  niche: string | null;
  websiteUrl: string | null;
  socialLinks: Record<string, string> | null;
  isVerified?: boolean | null;
}

export interface CreatorProfileUpdateBody {
  bio?: string;
  niche?: string;
  websiteUrl?: string;
  socialLinks?: Record<string, string>;
}

export const SOCIAL_PLATFORMS = [
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'TIKTOK', label: 'TikTok' },
  { value: 'TWITTER', label: 'X (Twitter)' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'OTHER', label: 'Autre' },
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]['value'];
