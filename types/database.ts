export type ProposalStatus = "won" | "lost" | "draft";
export type BrandAssetType = "logo" | "color_palette" | "guidelines" | "other";

export interface QuizData {
  company_name: string;
  industry: string;
  website: string;
  project_type: string;
  budget_range: string;
  timeline: string;
  pain_points: string;
  desired_outcomes: string;
  contact_name: string;
  contact_email: string;
}

export interface GensparkDossier {
  company_overview?: string;
  recent_news?: string[];
  decision_makers?: string[];
  tech_stack?: string[];
  company_size?: string;
  funding_stage?: string;
  key_initiatives?: string[];
  website_summary?: string;
  linkedin_summary?: string;
  raw?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ProposalSections {
  executive_summary?: string;
  understanding_of_needs?: string;
  proposed_approach?: string;
  deliverables?: string;
  timeline?: string;
  pricing?: string;
  why_us?: string;
  next_steps?: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  brand_kit_json: Record<string, unknown>;
  voice_guide_text: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandAsset {
  id: string;
  company_id: string;
  type: BrandAssetType;
  file_url: string;
  storage_path: string;
  extracted_rules_json: Record<string, unknown>;
  created_at: string;
}

export interface Prospect {
  id: string;
  company_id: string;
  quiz_data_json: QuizData;
  research_data_json: GensparkDossier | Record<string, unknown>;
  sparkpage_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  company_id: string;
  title: string;
  content_json: Record<string, unknown>;
  status: ProposalStatus;
  prospect_data_json: Record<string, unknown>;
  raw_text: string | null;
  storage_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface GeneratedProposal {
  id: string;
  prospect_id: string;
  company_id: string;
  content_json: Record<string, unknown>;
  sections_json: ProposalSections;
  pdf_url: string | null;
  sparkpage_url: string | null;
  model_used: string;
  tokens_used: number | null;
  created_at: string;
  updated_at: string;
}

// Supabase Database type — must include __InternalSupabase for SDK v2.100+
export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      companies: {
        Row: Company;
        Insert: {
          id?: string;
          name: string;
          slug: string;
          brand_kit_json?: Record<string, unknown>;
          voice_guide_text?: string | null;
          owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          brand_kit_json?: Record<string, unknown>;
          voice_guide_text?: string | null;
          owner_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      brand_assets: {
        Row: BrandAsset;
        Insert: {
          id?: string;
          company_id: string;
          type: BrandAssetType;
          file_url: string;
          storage_path: string;
          extracted_rules_json?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          extracted_rules_json?: Record<string, unknown>;
        };
        Relationships: [];
      };
      prospects: {
        Row: Prospect;
        Insert: {
          id?: string;
          company_id: string;
          quiz_data_json: QuizData;
          research_data_json?: Record<string, unknown>;
          sparkpage_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          quiz_data_json?: QuizData;
          research_data_json?: Record<string, unknown>;
          sparkpage_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      proposals: {
        Row: Proposal;
        Insert: {
          id?: string;
          company_id: string;
          title: string;
          content_json?: Record<string, unknown>;
          status?: ProposalStatus;
          prospect_data_json?: Record<string, unknown>;
          raw_text?: string | null;
          storage_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          content_json?: Record<string, unknown>;
          status?: ProposalStatus;
          prospect_data_json?: Record<string, unknown>;
          raw_text?: string | null;
          storage_path?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      generated_proposals: {
        Row: GeneratedProposal;
        Insert: {
          id?: string;
          prospect_id: string;
          company_id: string;
          content_json?: Record<string, unknown>;
          sections_json?: ProposalSections;
          pdf_url?: string | null;
          sparkpage_url?: string | null;
          model_used?: string;
          tokens_used?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          content_json?: Record<string, unknown>;
          sections_json?: ProposalSections;
          pdf_url?: string | null;
          sparkpage_url?: string | null;
          tokens_used?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      match_winning_proposals: {
        Args: {
          query_embedding: number[];
          match_company_id: string;
          match_count?: number;
        };
        Returns: Array<{
          id: string;
          title: string;
          content_json: Record<string, unknown>;
          raw_text: string | null;
          similarity: number;
        }>;
      };
    };
    Enums: {
      proposal_status: ProposalStatus;
      brand_asset_type: BrandAssetType;
    };
    CompositeTypes: Record<string, never>;
  };
};
