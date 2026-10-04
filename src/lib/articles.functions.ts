import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { fetchPublishedArticle, fetchPublishedArticles } from "./articles.server";

export type { PublicArticle } from "./articles.server";

export const listPublishedArticles = createServerFn({ method: "GET" }).handler(() =>
  fetchPublishedArticles(),
);

export const getPublishedArticle = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(({ data }) => fetchPublishedArticle(data.slug));

export const articlesQuery = queryOptions({
  queryKey: ["public-articles"],
  queryFn: () => listPublishedArticles(),
});

export function formatArticleDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
