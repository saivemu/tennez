export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: string
          api_id: number
          name: string
          country_code: string | null
          country_flag_url: string | null
          photo_url: string | null
          ranking_atp: number | null
          ranking_wta: number | null
          tour: 'ATP' | 'WTA' | 'Challenger' | 'ITF' | null
          handed: 'Right' | 'Left' | 'Unknown' | null
          birth_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['players']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['players']['Insert']>
      }
      tournaments: {
        Row: {
          id: string
          api_id: number
          name: string
          country_code: string | null
          surface: 'Hard' | 'Clay' | 'Grass' | 'Indoor Hard' | 'Carpet' | null
          category: string | null
          tour: 'ATP' | 'WTA' | 'Grand Slam' | 'Challenger' | 'ITF' | null
          logo_url: string | null
          start_date: string | null
          end_date: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['tournaments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['tournaments']['Insert']>
      }
      matches: {
        Row: {
          id: string
          api_id: number
          tournament_id: string | null
          player1_id: string | null
          player2_id: string | null
          round: string | null
          status: 'live' | 'finished' | 'upcoming' | 'cancelled'
          scheduled_at: string | null
          surface: 'Hard' | 'Clay' | 'Grass' | 'Indoor Hard' | 'Carpet' | null
          sets_json: Json | null
          winner_id: string | null
          player1_seed: number | null
          player2_seed: number | null
          court_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['matches']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['matches']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          country_code: string | null
          theme_preference: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      match_ratings: {
        Row: {
          id: string
          user_id: string
          match_id: string
          overall_score: number
          entertainment: number | null
          level_of_play: number | null
          umpiring: number | null
          crowd: number | null
          fan_of_player_id: string | null
          watching_on: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['match_ratings']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['match_ratings']['Insert']>
      }
      player_match_ratings: {
        Row: {
          id: string
          user_id: string
          match_id: string
          player_id: string
          score: number
          comment: string | null
          is_potm: boolean
          is_worst: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['player_match_ratings']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['player_match_ratings']['Insert']>
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          match_id: string
          body: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
      review_votes: {
        Row: {
          id: string
          user_id: string
          review_id: string
          vote_type: 'up' | 'down'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['review_votes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['review_votes']['Insert']>
      }
      match_comments: {
        Row: {
          id: string
          user_id: string
          match_id: string
          body: string
          score_context: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['match_comments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['match_comments']['Insert']>
      }
      follows: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: Database['public']['Tables']['follows']['Row']
        Update: Partial<Database['public']['Tables']['follows']['Insert']>
      }
      favorites_players: {
        Row: { user_id: string; player_id: string }
        Insert: Database['public']['Tables']['favorites_players']['Row']
        Update: never
      }
      favorites_tournaments: {
        Row: { user_id: string; tournament_id: string }
        Insert: Database['public']['Tables']['favorites_tournaments']['Row']
        Update: never
      }
      favorites_matches: {
        Row: { user_id: string; match_id: string }
        Insert: Database['public']['Tables']['favorites_matches']['Row']
        Update: never
      }
      watch_intents: {
        Row: { user_id: string; match_id: string; created_at: string }
        Insert: Omit<Database['public']['Tables']['watch_intents']['Row'], 'created_at'>
        Update: never
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'vote' | 'comment' | 'follow' | 'match_reminder' | 'upset_alert'
          reference_id: string | null
          message: string
          read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      match_rating_aggregates: {
        Row: {
          match_id: string
          avg_overall: number | null
          avg_entertainment: number | null
          avg_level: number | null
          avg_umpiring: number | null
          avg_crowd: number | null
          total_ratings: number
          rating_distribution: Json | null
          fan_perspective: Json | null
          updated_at: string
        }
        Insert: Database['public']['Tables']['match_rating_aggregates']['Row']
        Update: Partial<Database['public']['Tables']['match_rating_aggregates']['Insert']>
      }
      player_match_aggregates: {
        Row: {
          match_id: string
          player_id: string
          avg_score: number | null
          total_votes: number
          potm_votes: number
          worst_votes: number
          updated_at: string
        }
        Insert: Database['public']['Tables']['player_match_aggregates']['Row']
        Update: Partial<Database['public']['Tables']['player_match_aggregates']['Insert']>
      }
    }
  }
}
