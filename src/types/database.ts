// TODO: Generate dari Supabase CLI:
// npx supabase gen types typescript --project-id <id> > src/types/database.ts
// Untuk sementara gunakan tipe longgar agar build tidak gagal.

export type Database = {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: any[];
      };
    };
    Views: { [key: string]: any };
    Functions: { [key: string]: any };
  };
};
