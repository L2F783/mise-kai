/**
 * MiseKai Database Types
 *
 * These types represent the database schema and should match
 * the SQL migrations. In production, these should be generated
 * using `supabase gen types typescript`.
 */

export type UserRole = "team_member" | "pm";
export type UserStatus = "active" | "pending" | "deactivated";
export type ActionStatus = "on_target" | "delayed" | "complete";
export type DelayCategory =
  | "people"
  | "process"
  | "technical"
  | "capacity"
  | "external"
  | "other";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface Action {
  id: string;
  description: string;
  owner_id: string;
  due_date: string;
  status: ActionStatus;
  notes: string | null;
  client_visible: boolean;
  auto_flagged: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DelayReason {
  id: string;
  action_id: string;
  reason: string;
  category: DelayCategory | null;
  subcategory: string | null;
  confidence: number | null;
  ai_overridden: boolean;
  manual_category: DelayCategory | null;
  created_at: string;
  created_by: string | null;
}

export interface FiveWhysAnalysis {
  id: string;
  action_id: string;
  conducted_by: string;
  root_cause_identified: boolean;
  created_at: string;
}

export interface FiveWhysResponse {
  id: string;
  analysis_id: string;
  level: 1 | 2 | 3 | 4 | 5;
  response: string;
  created_at: string;
}

export interface DueDateHistory {
  id: string;
  action_id: string;
  old_due_date: string;
  new_due_date: string;
  changed_by: string;
  created_at: string;
}

export interface Invitation {
  id: string;
  email: string;
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

// =============================================================================
// Supabase Database Type Definition
// =============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, "id" | "created_at">> & {
          updated_at?: string;
        };
      };
      actions: {
        Row: Action;
        Insert: Omit<Action, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Action, "id" | "created_at">> & {
          updated_at?: string;
        };
      };
      delay_reasons: {
        Row: DelayReason;
        Insert: Omit<DelayReason, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<DelayReason, "id" | "created_at">>;
      };
      five_whys_analyses: {
        Row: FiveWhysAnalysis;
        Insert: Omit<FiveWhysAnalysis, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<FiveWhysAnalysis, "id" | "created_at">>;
      };
      five_whys_responses: {
        Row: FiveWhysResponse;
        Insert: Omit<FiveWhysResponse, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<FiveWhysResponse, "id" | "created_at">>;
      };
      due_date_history: {
        Row: DueDateHistory;
        Insert: Omit<DueDateHistory, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: never; // History is immutable
      };
      invitations: {
        Row: Invitation;
        Insert: Omit<Invitation, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Pick<Invitation, "accepted_at">>;
      };
    };
    Functions: {
      is_pm: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
  };
}

// =============================================================================
// Helper Types
// =============================================================================

/** Action with related delay reasons */
export interface ActionWithDelays extends Action {
  delay_reasons: DelayReason[];
}

/** Action with owner profile */
export interface ActionWithOwner extends Action {
  owner: Pick<Profile, "id" | "email" | "full_name">;
}

/** Five Whys analysis with all responses */
export interface FiveWhysAnalysisWithResponses extends FiveWhysAnalysis {
  responses: FiveWhysResponse[];
}

/** Invitation with inviter profile */
export interface InvitationWithInviter extends Invitation {
  inviter: Pick<Profile, "id" | "email" | "full_name">;
}
