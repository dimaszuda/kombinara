// TODO: Generate dari Supabase CLI:
// npx supabase gen types typescript --project-id <id> > src/types/database.ts
// Untuk sementara gunakan tipe longgar agar build tidak gagal.

export type Database = {
  public: {
    Tables: { [key: string]: any };
    Views: { [key: string]: any };
    Functions: { [key: string]: any };
  };
};
