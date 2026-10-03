import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { fetchPublishedWork, fetchPublishedWorks } from "./works.server";

export const listPublishedWorks = createServerFn({ method: "GET" }).handler(() =>
  fetchPublishedWorks(),
);

export const getPublishedWork = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(({ data }) => fetchPublishedWork(data.slug));
