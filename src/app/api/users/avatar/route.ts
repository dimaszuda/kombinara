import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File wajib diupload" }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran file maksimal 5MB" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File harus berupa gambar" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `${user.id}/avatar.${ext}`;

    // Use service role for storage (bypass RLS)
    const serviceRoleClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await serviceRoleClient.storage
      .from("avatars")
      .upload(filename, buffer, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("[POST /api/users/avatar] Upload error:", uploadError);
      
      // Better error message for common issues
      let errorMsg = "Gagal upload gambar";
      if (uploadError.message?.includes("Bucket not found")) {
        errorMsg = "Bucket 'avatars' belum dibuat di Supabase Storage. Hubungi admin untuk setup.";
      } else if (uploadError.message?.includes("bucket_resource_limit_exceeded")) {
        errorMsg = "Penyimpanan penuh. Hapus beberapa file lama.";
      } else {
        errorMsg = `Gagal upload gambar: ${uploadError.message}`;
      }
      
      return NextResponse.json(
        { error: errorMsg },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = serviceRoleClient.storage.from("avatars").getPublicUrl(uploadData.path);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err) {
    console.error("[POST /api/users/avatar] Error:", err);
    return NextResponse.json(
      { error: "Gagal upload avatar" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Use service role for storage (bypass RLS)
    const serviceRoleClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Delete avatar file from storage
    const { error: deleteError } = await serviceRoleClient.storage
      .from("avatars")
      .remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.png`, `${user.id}/avatar.webp`, `${user.id}/avatar.gif`, `${user.id}/avatar.jpeg`]);

    if (deleteError) {
      console.error("[DELETE /api/users/avatar] Delete error:", deleteError);
      // Silently fail, file might not exist
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/users/avatar] Error:", err);
    return NextResponse.json(
      { error: "Gagal hapus avatar" },
      { status: 500 }
    );
  }
}
