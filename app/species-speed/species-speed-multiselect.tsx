"use client";

import { MultiSelect } from "@/components/ui/multi-select";
import { csv } from "d3-fetch";
import { useEffect, useState } from "react";

interface Options {
  label: string;
  value: string;
}

export default function SpeciesSpeedMultiSelect() {
  const [options, setOptions] = useState<Options[]>([]);

  useEffect(() => {
    csv("/sample_animals.csv")
      .then((rows) => {
        const typedRows = rows as unknown as Record<string, string>[];
        // CSV headers in the file are like "Animal", "Average Speed (km/h)", "Diet"
        const options: Options[] = typedRows.map((row) => {
          const name = String(row.Animal ?? row.name ?? "");
          return { label: name, value: name } as Options;
        });
        console.log("parsed animal data sample:", options.slice(0, 5));
        setOptions(options);
      })
      .catch((err) => console.error("Failed to load CSV:", err));
  }, []);

  return (
    <MultiSelect
      options={options}
      onValueChange={(value) => {
        console.log("selected animals: ", value);
        window.dispatchEvent(new CustomEvent("animalSelectionChange", { detail: value }));
      }}
      defaultValue={[]}
      searchable={true}
      hideSelectAll={false}
      placeholder="Search animals"
      emptyIndicator={
        <div className="p-4 text-center text-muted-foreground">
          <p className="text-sm">No animals found matching your search</p>
        </div>
      }
      animationConfig={{
        badgeAnimation: "bounce",
        popoverAnimation: "slide",
      }}
    />
  );
}
