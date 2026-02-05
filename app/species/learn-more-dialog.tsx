"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Database } from "@/lib/schema";
import { useState } from "react";
type Species = Database["public"]["Tables"]["species"]["Row"];

// Default values for the form fields.
/* Because the react-hook-form (RHF) used here is a controlled form (not an uncontrolled form),
fields that are nullable/not required should explicitly be set to `null` by default.
Otherwise, they will be `undefined` by default, which will raise warnings because `undefined` conflicts with controlled components.
All form fields should be set to non-undefined default values.
Read more here: https://legacy.react-hook-form.com/api/useform/
*/

// display the scientific_name, common_name, total_population, kingdom, and description

export default function LearnMoreDialog({ userId, species }: { userId: string; species: Species }) {
  // Control open/closed state of the dialog
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="bg-green-400 text-white">
          Learn More
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Species details for {species.common_name ?? species.scientific_name}</DialogTitle>
          <DialogDescription>You&apos;re learning more!</DialogDescription>
        </DialogHeader>
        <div>
          <h3 className="text-lg font-semibold">Scientific name</h3>
          <p className="text-sm">{species.scientific_name}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Common name</h3>
          <p className="text-sm">{species.common_name}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Kingdom</h3>
          <p className="text-sm">{species.kingdom}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Total population</h3>
          <p className="text-sm">{species.total_population}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Description</h3>
          <p className="text-sm">{species.description}</p>
        </div>

        {/* display species author information */}
        <div>
          <h3 className="text-lg font-semibold">Author</h3>
          <p className="text-sm">{species.profiles.display_name}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
