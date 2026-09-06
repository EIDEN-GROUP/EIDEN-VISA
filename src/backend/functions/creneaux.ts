import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { eq, asc } from "drizzle-orm";
import { db } from "@/backend/db/client";
import { creneaux as creneauxTable } from "@/backend/db/schema";
import { requireUserId } from "@/backend/functions/auth";

const statutEnum = z.enum(["libre", "reserve", "ferme"]);

export const listCreneaux = createServerFn({ method: "GET" }).handler(async () => {
  await requireUserId();
  return db.select().from(creneauxTable).orderBy(asc(creneauxTable.createdAt));
});

export const createCreneau = createServerFn({ method: "POST" })
  .validator(
    z.object({
      centre: z.string().min(1),
      date: z.string().min(1),
      places: z.number().min(0),
      statut: statutEnum,
      dossierId: z.string().nullable(),
    }),
  )
  .handler(async ({ data }) => {
    await requireUserId();
    const id = crypto.randomUUID();
    await db.insert(creneauxTable).values({ id, ...data });
    return { id };
  });

export const updateCreneau = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string(),
      centre: z.string().min(1),
      date: z.string().min(1),
      places: z.number().min(0),
      statut: statutEnum,
      dossierId: z.string().nullable(),
    }),
  )
  .handler(async ({ data }) => {
    await requireUserId();
    const { id, ...rest } = data;
    await db.update(creneauxTable).set(rest).where(eq(creneauxTable.id, id));
  });

export const deleteCreneau = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await requireUserId();
    await db.delete(creneauxTable).where(eq(creneauxTable.id, data.id));
  });
