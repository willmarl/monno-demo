// In-memory demo store. Module-level singleton - mutated in place,
// resets on full page refresh (which is the desired stateless behavior).

import type { User } from "@/features/users/types/user";
import type { Post } from "@/features/posts/types/post";
import type { Article } from "@/features/articles/types/article";
import type { Collection } from "@/features/collections/types/collection";
import type { Comment } from "@/features/comments/types/comment";

const NOW_ISO = new Date("2024-06-01T12:00:00Z").toISOString();
const CREATED_AT = new Date("2024-01-01T00:00:00Z");

const CREATOR = {
  id: 1,
  username: "bob",
  avatarPath: "",
};

export const DEMO_USER: User = {
  id: 1,
  username: "bob",
  email: "bob@demo.local",
  avatarPath: null,
  password: null,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
  refreshToken: null,
  role: "ADMIN",
  googleId: null,
  githubId: null,
  tempEmail: null,
  emailVerifiedAt: CREATED_AT,
  isEmailVerified: true,
  status: "ACTIVE",
  statusExpireAt: null,
  statusReason: null,
  deleted: false,
  deletedAt: null,
  subscription: { status: "ACTIVE", tier: "PRO", nextTier: "PRO" },
  credits: 100,
};

const POST_TITLES = [
  "Welcome to the Monno demo",
  "Getting started with Next.js",
  "Why TypeScript matters",
  "Building with Tailwind",
  "A tour of Shadcn components",
  "TanStack Query patterns",
  "Zod schemas everywhere",
  "Deploying to GitHub Pages",
  "Thoughts on monorepos",
  "The joy of pnpm",
];

const ARTICLE_TITLES = [
  "Hello, world — the long version",
  "How we built our auth flow",
  "Making forms less painful",
  "Shipping fast without breaking things",
  "Notes on code review",
  "Observability from day one",
  "Database migrations in practice",
  "When to reach for a queue",
  "Scaling the frontend",
  "Keeping dependencies happy",
];

const COLLECTION_NAMES = [
  "Favorites",
  "Reading list",
  "Tutorials",
  "Design inspiration",
  "Weekend projects",
];

function makePost(id: number): Post {
  return {
    id,
    title: POST_TITLES[id - 1] ?? `Sample post ${id}`,
    content:
      "This is demo content. Everything you see here is stored in memory and will reset when you refresh the page.",
    creator: { ...CREATOR },
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    deleted: false,
    deletedAt: "",
    likeCount: 0,
    likedByMe: false,
    viewCount: id * 3,
  };
}

function makeArticle(id: number): Article {
  return {
    id,
    title: ARTICLE_TITLES[id - 1] ?? `Sample article ${id}`,
    content:
      "# Demo article\n\nThis article is part of the static demo. Edits are in-memory only.",
    imagePath: null,
    creator: { ...CREATOR },
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    status: "PUBLISHED",
    likeCount: 0,
    likedByMe: false,
    viewCount: id * 5,
  };
}

function makeCollection(id: number): Collection {
  return {
    id,
    name: COLLECTION_NAMES[id - 1] ?? `Collection ${id}`,
    description: "A demo collection. Add and remove items freely.",
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    creator: { ...CREATOR },
    items: [],
    deleted: false,
    deletedAt: "",
  };
}

let nextPostId = 11;
let nextArticleId = 11;
let nextCollectionId = 6;
let nextCommentId = 1;
let nextCollectionItemId = 1;

export const store = {
  posts: Array.from({ length: 10 }, (_, i) => makePost(i + 1)),
  articles: Array.from({ length: 10 }, (_, i) => makeArticle(i + 1)),
  collections: Array.from({ length: 5 }, (_, i) => makeCollection(i + 1)),
  comments: [] as Comment[],
  likes: new Set<string>(), // key: "RESOURCETYPE:id"
  nextPostId: () => nextPostId++,
  nextArticleId: () => nextArticleId++,
  nextCollectionId: () => nextCollectionId++,
  nextCommentId: () => nextCommentId++,
  nextCollectionItemId: () => nextCollectionItemId++,
};

export const CREATOR_REF = CREATOR;
export const DEMO_NOW = NOW_ISO;
