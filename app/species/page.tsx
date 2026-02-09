import { Separator } from "@/components/ui/separator";
import { TypographyH2 } from "@/components/ui/typography";
import type { Database } from "@/lib/schema";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import AddSpeciesDialog from "./add-species-dialog";
import SpeciesCard from "./species-card";

export default async function SpeciesList() {
  // Create supabase server component client and obtain user session from stored cookie
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // this is a protected route - only users who are signed in can view this route
    redirect("/");
  }

  // Obtain the ID of the currently signed-in user
  const sessionId = session.user.id;

  // address untyped display_name issue
  type SpeciesWithProfile = Database["public"]["Tables"]["species"]["Row"] & {
    profiles?: { display_name: string | null } | null;
  };

  // fetch species data from supabase (with display name of author)
  const { data: speciesData } = await supabase
    .from("species")
    .select("*, profiles(display_name)")
    .order("id", { ascending: false });

  const species = speciesData as SpeciesWithProfile[] | null;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <TypographyH2>Species List</TypographyH2>
        <AddSpeciesDialog userId={sessionId} />
      </div>
      <Separator className="my-4" />
      <div className="flex flex-wrap justify-center">
        {/* added passing through sessionId and author display name */}
        {species?.map((s) => <SpeciesCard key={s.id} species={s} sessionId={sessionId} />)}
      </div>
    </>
  );
}
