import { PageHeader } from "@/components/ui/page-header";
import { BrandKitForm } from "@/components/onboarding/brand-kit-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Company } from "@/types/database";

export default async function BrandKitPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("companies")
    .select("id, name, brand_kit_json, voice_guide_text")
    .eq("owner_id", user!.id)
    .single();

  const company = data as Pick<Company, "id" | "name" | "brand_kit_json" | "voice_guide_text"> | null;

  return (
    <div className="animate-fade-up max-w-2xl">
      <PageHeader
        title="Brand Kit"
        description="Upload your brand assets and writing guidelines. Every generated proposal will match your brand automatically."
      />
      <BrandKitForm company={company} />
    </div>
  );
}
