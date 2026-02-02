/**
 * MiseKai Database Types
 *
 * These types represent the database schema and should match
 * the SQL migrations. In production, these should be generated
 * using `supabase gen types typescript`.
 */

export type UserRole = "team_member" | "pm";
export type UserStatus = "active" | "pending" | "deactivated";
export type ActionStatus = "on_target" | "delayed" | "complete" | "backlog";
export type DelayCategory =
  | "people"
  | "process"
  | "technical"
  | "capacity"
  | "external"
  | "other";

// Gantt-related types
export type ProjectStatus = "active" | "on_hold" | "complete" | "archived";
export type DependencyType =
  | "finish_to_start"
  | "start_to_start"
  | "finish_to_finish"
  | "start_to_finish";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  start_date: string | null;
  target_end_date: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  name: string;
  target_date: string;
  description: string | null;
  color: string;
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
  // Gantt-related fields
  start_date: string | null;
  estimated_duration_days: number | null;
  milestone_id: string | null;
  is_critical: boolean;
  actual_start_date: string | null;
  actual_end_date: string | null;
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface ActionDependency {
  id: string;
  predecessor_id: string;
  successor_id: string;
  dependency_type: DependencyType;
  lag_days: number;
  created_at: string;
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
      projects: {
        Row: Project;
        Insert: Omit<Project, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Project, "id" | "created_at">> & {
          updated_at?: string;
        };
      };
      milestones: {
        Row: Milestone;
        Insert: Omit<Milestone, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Milestone, "id" | "created_at">> & {
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
      action_dependencies: {
        Row: ActionDependency;
        Insert: Omit<ActionDependency, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Pick<ActionDependency, "dependency_type" | "lag_days">>;
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

// =============================================================================
// Gantt Helper Types
// =============================================================================

/** Action with dependencies for Gantt chart rendering */
export interface GanttAction extends Action {
  dependencies?: ActionDependency[];
  milestone?: Milestone;
}

/** Milestone with its associated actions */
export interface MilestoneWithActions extends Milestone {
  actions: Action[];
}

/** Project with milestones and actions for full Gantt view */
export interface ProjectWithMilestones extends Project {
  milestones: MilestoneWithActions[];
}
