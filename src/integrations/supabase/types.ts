export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      alerts: {
        Row: {
          destination_ip: string | null
          event_type: string | null
          id: string
          level: string
          message: string
          source_ip: string | null
          timestamp: string | null
        }
        Insert: {
          destination_ip?: string | null
          event_type?: string | null
          id?: string
          level: string
          message: string
          source_ip?: string | null
          timestamp?: string | null
        }
        Update: {
          destination_ip?: string | null
          event_type?: string | null
          id?: string
          level?: string
          message?: string
          source_ip?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      connected_devices: {
        Row: {
          device_name: string
          device_type: string
          id: string
          ip_address: string
          is_authorized: boolean | null
          last_seen: string | null
          mac_address: string
        }
        Insert: {
          device_name: string
          device_type: string
          id?: string
          ip_address: string
          is_authorized?: boolean | null
          last_seen?: string | null
          mac_address: string
        }
        Update: {
          device_name?: string
          device_type?: string
          id?: string
          ip_address?: string
          is_authorized?: boolean | null
          last_seen?: string | null
          mac_address?: string
        }
        Relationships: []
      }
      metrics: {
        Row: {
          active_threats: number
          id: string
          last_scan_time: string | null
          network_threats: number | null
          protected_assets: number
          scan_status: string | null
          system_threats: number | null
          threat_score: number
          total_alerts: number
          updated_at: string | null
          vulnerability_threats: number | null
        }
        Insert: {
          active_threats?: number
          id?: string
          last_scan_time?: string | null
          network_threats?: number | null
          protected_assets?: number
          scan_status?: string | null
          system_threats?: number | null
          threat_score?: number
          total_alerts?: number
          updated_at?: string | null
          vulnerability_threats?: number | null
        }
        Update: {
          active_threats?: number
          id?: string
          last_scan_time?: string | null
          network_threats?: number | null
          protected_assets?: number
          scan_status?: string | null
          system_threats?: number | null
          threat_score?: number
          total_alerts?: number
          updated_at?: string | null
          vulnerability_threats?: number | null
        }
        Relationships: []
      }
      network_logs: {
        Row: {
          bytes_transferred: number
          destination_ip: string
          id: string
          is_suspicious: boolean | null
          port: number
          protocol: string
          source_ip: string
          timestamp: string | null
        }
        Insert: {
          bytes_transferred: number
          destination_ip: string
          id?: string
          is_suspicious?: boolean | null
          port: number
          protocol: string
          source_ip: string
          timestamp?: string | null
        }
        Update: {
          bytes_transferred?: number
          destination_ip?: string
          id?: string
          is_suspicious?: boolean | null
          port?: number
          protocol?: string
          source_ip?: string
          timestamp?: string | null
        }
        Relationships: []
      }
      stock_historical_data: {
        Row: {
          close_price: number
          created_at: string
          date: string
          high_price: number
          id: number
          low_price: number
          open_price: number
          symbol: string | null
          volume: number
        }
        Insert: {
          close_price: number
          created_at?: string
          date: string
          high_price: number
          id?: number
          low_price: number
          open_price: number
          symbol?: string | null
          volume: number
        }
        Update: {
          close_price?: number
          created_at?: string
          date?: string
          high_price?: number
          id?: number
          low_price?: number
          open_price?: number
          symbol?: string | null
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_historical_data_symbol_fkey"
            columns: ["symbol"]
            isOneToOne: false
            referencedRelation: "stocks"
            referencedColumns: ["symbol"]
          },
        ]
      }
      stocks: {
        Row: {
          company_name: string
          created_at: string
          logo_url: string | null
          symbol: string
        }
        Insert: {
          company_name: string
          created_at?: string
          logo_url?: string | null
          symbol: string
        }
        Update: {
          company_name?: string
          created_at?: string
          logo_url?: string | null
          symbol?: string
        }
        Relationships: []
      }
      system_events: {
        Row: {
          description: string
          event_type: string
          id: string
          severity: Database["public"]["Enums"]["vulnerability_severity"]
          source: string
          timestamp: string | null
        }
        Insert: {
          description: string
          event_type: string
          id?: string
          severity: Database["public"]["Enums"]["vulnerability_severity"]
          source: string
          timestamp?: string | null
        }
        Update: {
          description?: string
          event_type?: string
          id?: string
          severity?: Database["public"]["Enums"]["vulnerability_severity"]
          source?: string
          timestamp?: string | null
        }
        Relationships: []
      }
      vulnerabilities: {
        Row: {
          affected_system: string
          cve_id: string | null
          description: string
          discovered_at: string | null
          exploit_available: boolean | null
          id: string
          patched_at: string | null
          plugin_family: string | null
          plugin_id: number | null
          plugin_name: string | null
          port: number | null
          protocol: string | null
          risk_factor: string | null
          severity: Database["public"]["Enums"]["vulnerability_severity"]
          solution: string | null
          status: string
          title: string
          vulnerability_state: string | null
        }
        Insert: {
          affected_system: string
          cve_id?: string | null
          description: string
          discovered_at?: string | null
          exploit_available?: boolean | null
          id?: string
          patched_at?: string | null
          plugin_family?: string | null
          plugin_id?: number | null
          plugin_name?: string | null
          port?: number | null
          protocol?: string | null
          risk_factor?: string | null
          severity: Database["public"]["Enums"]["vulnerability_severity"]
          solution?: string | null
          status: string
          title: string
          vulnerability_state?: string | null
        }
        Update: {
          affected_system?: string
          cve_id?: string | null
          description?: string
          discovered_at?: string | null
          exploit_available?: boolean | null
          id?: string
          patched_at?: string | null
          plugin_family?: string | null
          plugin_id?: number | null
          plugin_name?: string | null
          port?: number | null
          protocol?: string | null
          risk_factor?: string | null
          severity?: Database["public"]["Enums"]["vulnerability_severity"]
          solution?: string | null
          status?: string
          title?: string
          vulnerability_state?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      vulnerability_severity: "low" | "medium" | "high" | "critical"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
