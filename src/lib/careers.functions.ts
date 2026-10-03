import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { fetchOpenCareer, fetchOpenCareers } from "./careers.server";

export const listOpenCareers = createServerFn({ method: "GET" }).handler(() => fetchOpenCareers());

export const getOpenCareer = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(({ data }) => fetchOpenCareer(data.slug));
