"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import type { Database } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Species = Database["public"]["Tables"]["species"]["Row"];

// We use zod (z) to define a schema for the "Add species" form.
// zod handles validation of the input values with methods like .string(), .nullable(). It also processes the form inputs with .transform() before the inputs are sent to the database.

// Define kingdom enum for use in Zod schema and displaying dropdown options in the form
const kingdoms = z.enum(["Animalia", "Plantae", "Fungi", "Protista", "Archaea", "Bacteria"]);

// Use Zod to define the shape + requirements of a Species entry; used in form validation
const speciesSchema = z.object({
  scientific_name: z
    .string()
    .trim()
    .min(1)
    .transform((val) => val?.trim()),
  common_name: z
    .string()
    .nullable()
    // Transform empty string or only whitespace input to null before form submission, and trim whitespace otherwise
    .transform((val) => (!val || val.trim() === "" ? null : val.trim())),
  kingdom: kingdoms,
  total_population: z.number().int().positive().min(1).nullable(),
  image: z
    .string()
    .url()
    .nullable()
    // Transform empty string or only whitespace input to null before form submission, and trim whitespace otherwise
    .transform((val) => (!val || val.trim() === "" ? null : val.trim())),
  description: z
    .string()
    .nullable()
    // Transform empty string or only whitespace input to null before form submission, and trim whitespace otherwise
    .transform((val) => (!val || val.trim() === "" ? null : val.trim())),
});

type FormData = z.infer<typeof speciesSchema>;

// display the scientific_name, common_name, total_population, kingdom, and description

export default function LearnMoreDialog({
  userId,
  species,
  sessionId,
}: {
  userId: string;
  species: Species;
  sessionId: string;
}) {
  const router = useRouter();

  // Control open/closed state of the dialog
  const [open, setOpen] = useState<boolean>(false);

  // control editing state
  const [editing, setEditing] = useState<boolean>(false);

  const resetToSpecies = () => {
    form.reset({
      scientific_name: species.scientific_name,
      common_name: species.common_name,
      kingdom: species.kingdom,
      total_population: species.total_population,
      image: species.image,
      description: species.description,
    });
  };

  // determine if current user is author of the species
  const isAuthor = sessionId !== undefined && sessionId === species.author;

  const defaultValues: Partial<FormData> = {
    scientific_name: species.scientific_name,
    common_name: species.common_name,
    kingdom: species.kingdom,
    total_population: species.total_population,
    image: species.image,
    description: species.description,
  };

  // (from add-species) Instantiate form functionality with React Hook Form, passing in the Zod schema (for validation) and default values
  const form = useForm<FormData>({
    resolver: zodResolver(speciesSchema),
    defaultValues,
    mode: "onChange",
  });

  const supabase = createBrowserSupabaseClient();

  const onSubmit = async (input: FormData) => {
    // The `input` prop contains data that has already been processed by zod. We can now use it in a supabase query
    const { error } = await supabase
      .from("species")
      .update({
        scientific_name: input.scientific_name,
        common_name: input.common_name,
        kingdom: input.kingdom,
        total_population: input.total_population,
        image: input.image,
        description: input.description,
      })
      .eq("id", species.id);

    // Catch and report errors from Supabase and exit the onSubmit function with an early 'return' if an error occurred.
    if (error) {
      toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // if successful edit
    form.reset(defaultValues);
    setEditing(false);
    setOpen(false);
    router.refresh();
    return toast({
      title: "Species edited!",
      description: "Successfully edited " + species.scientific_name + ".",
    });
  };

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
        </div>

        {/* edit button shown only to the author */}
        {isAuthor && !editing && (
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                resetToSpecies();
                setEditing(true);
              }}
            >
              Edit Species
            </Button>
          </div>
        )}

        {/* form editing if user is author of species */}
        {isAuthor && editing && (
          <Form {...form}>
            <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}>
              <FormField
                control={form.control}
                name="scientific_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scientific Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Scientific Name" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="common_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Common Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Common Name" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="kingdom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kingdom</FormLabel>
                    <Select onValueChange={(value) => field.onChange(kingdoms.parse(value))} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a kingdom" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {kingdoms.options.map((kingdom, index) => (
                            <SelectItem key={index} value={kingdom}>
                              {kingdom}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total_population"
                render={({ field }) => {
                  const { value, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Total population</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={value ?? ""}
                          placeholder="300000"
                          {...rest}
                          onChange={(event) =>
                            field.onChange(event.target.value === "" ? null : Number(event.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => {
                  // We must extract value from field and convert a potential defaultValue of `null` to "" because inputs can't handle null values: https://github.com/orgs/react-hook-form/discussions/4091
                  const { value, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input
                          value={value ?? ""}
                          placeholder="https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/George_the_amazing_guinea_pig.jpg/440px-George_the_amazing_guinea_pig.jpg"
                          {...rest}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => {
                  // We must extract value from field and convert a potential defaultValue of `null` to "" because textareas can't handle null values: https://github.com/orgs/react-hook-form/discussions/4091
                  const { value, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          value={value ?? ""}
                          placeholder="The guinea pig or domestic guinea pig, also known as the cavy or domestic cavy, is a species of rodent belonging to the genus Cavia in the family Caviidae."
                          {...rest}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <div className="flex">
                <Button type="submit" className="ml-1 mr-1 flex-auto">
                  Save Changes
                </Button>
                <DialogClose asChild>
                  <Button
                    type="button"
                    className="ml-1 mr-1 flex-auto"
                    variant="secondary"
                    onClick={() => {
                      resetToSpecies();
                      setEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                </DialogClose>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
