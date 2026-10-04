import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  organisation: z.string().trim().max(160).optional().default(""),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z
    .string()
    .trim()
    .max(40)
    .regex(/^[+\d\s()-]*$/, "Enter a valid phone number")
    .optional()
    .default(""),
  enquiry_type: z.string().trim().min(1).max(120),
  message: z.string().trim().min(10, "Tell us a little more (10+ characters)").max(5000),
  website: z.string().max(0).optional().default(""), // honeypot
  elapsedMs: z.number().int().nonnegative(),
});

export type ContactInput = z.input<typeof schema>;

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((d) => schema.parse(d))
  .handler(async ({ data }) => {
    // Silently accept bot submissions (honeypot filled or submitted too fast) without saving.
    if (data.website || data.elapsedMs < 2500) return { ok: true };
    if ((data.message.match(/https?:\/\//g) ?? []).length > 3) {
      throw new Error("Please remove some links from your message.");
    }
    const { createClient } = await import("@supabase/supabase-js");
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const sb = createClient(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
    const { error } = await sb.from("contact_messages").insert({
      name: data.name,
      organisation: data.organisation || null,
      email: data.email,
      phone: data.phone || null,
      enquiry_type: data.enquiry_type,
      interest: data.enquiry_type,
      message: data.message,
    });
    if (error) {
      console.error("contact insert failed", error.message);
      throw new Error("We couldn't send your message. Please try again.");
    }
    return { ok: true };
  });
