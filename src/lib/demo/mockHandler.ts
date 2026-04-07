// Demo mock handler. Dispatches URL+method to in-memory store and returns
// shaped responses matching what the real API would return.

import { store, DEMO_USER, CREATOR_REF, DEMO_NOW } from "./mockStore";
import type { PaginatedResponse } from "@/types/pagination";

type AnyObj = Record<string, any>;

function paginate<T>(items: T[], limit: number, offset: number): PaginatedResponse<T> {
  const page = items.slice(offset, offset + limit);
  return {
    items: page,
    pageInfo: {
      totalItems: items.length,
      total: items.length,
      limit,
      offset,
      hasNext: offset + limit < items.length,
      hasPrev: offset > 0,
      hasMore: offset + limit < items.length,
      nextOffset: offset + limit < items.length ? offset + limit : null,
      prevOffset: offset > 0 ? Math.max(0, offset - limit) : null,
    },
  };
}

function cursorPaginate<T extends { id: number }>(
  items: T[],
  limit: number,
  cursor?: string | number | null,
) {
  const startIdx = cursor
    ? items.findIndex((i) => String(i.id) === String(cursor)) + 1
    : 0;
  const page = items.slice(startIdx, startIdx + limit);
  const nextCursor =
    page.length === limit ? page[page.length - 1].id : null;
  return { items: page, nextCursor };
}

function searchTitles<T extends { title: string }>(items: T[], query?: string): T[] {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter((i) => i.title.toLowerCase().includes(q));
}

function emptyPage<T>(limit = 10, offset = 0): PaginatedResponse<T> {
  return paginate<T>([], limit, offset);
}

export function handleDemoRequest<T>(url: string, options?: AnyObj): T {
  const method = (options?.method ?? "GET").toUpperCase();
  const body = options?.json;
  const spRaw = options?.searchParams ?? {};
  // ky searchParams may be a plain object or URLSearchParams
  const sp: AnyObj = {};
  if (spRaw instanceof URLSearchParams) {
    spRaw.forEach((v, k) => (sp[k] = v));
  } else {
    Object.assign(sp, spRaw);
  }

  const limit = Number(sp.limit ?? 10);
  const offset = Number(sp.offset ?? 0);
  const cursor = sp.cursor ?? null;
  const query = sp.query ?? sp.q ?? undefined;

  // ==========================================================================
  //  AUTH
  // ==========================================================================
  if (url === "auth/login" || url === "auth/register") return {} as T;
  if (url === "auth/logout" || url === "auth/logout-all") return undefined as T;
  if (url === "auth/refresh") return {} as T;
  if (url === "auth/send-verification") return {} as T;
  if (url === "auth/verify-email") return {} as T;
  if (url === "auth/request-password-reset") return {} as T;
  if (url === "auth/reset-password") return {} as T;

  // ==========================================================================
  //  SESSIONS
  // ==========================================================================
  if (url === "sessions") {
    return [
      {
        id: "demo-session-abc123",
        userAgent:
          typeof navigator !== "undefined"
            ? navigator.userAgent
            : "Chrome on Linux",
        ipAddress: "127.0.0.1",
        location: "Demo City, US",
        isNewLocation: false,
        isNewDevice: false,
        riskScore: 5,
        createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
        lastUsedAt: new Date().toISOString(),
      },
    ] as T;
  }
  if (/^sessions\/[^/]+$/.test(url)) return undefined as T;

  // ==========================================================================
  //  USERS / ME
  // ==========================================================================
  if (url === "users/me") {
    if (method === "GET") return DEMO_USER as T;
    if (method === "PATCH") {
      Object.assign(DEMO_USER, body ?? {});
      return DEMO_USER as T;
    }
    if (method === "DELETE") return undefined as T;
  }
  if (url === "users/me/password") return {} as T;

  // /users/:id/collections
  const userCollMatch = url.match(/^users\/(\d+)\/collections$/);
  if (userCollMatch) {
    return paginate(store.collections, limit, offset) as T;
  }

  // /users/username/:username
  if (url.startsWith("users/username/")) {
    return {
      id: DEMO_USER.id,
      username: DEMO_USER.username,
      avatarPath: DEMO_USER.avatarPath,
      createdAt: String(DEMO_USER.createdAt),
      status: DEMO_USER.status,
      deleted: false,
      deletedAt: null,
    } as T;
  }

  // /users (public list)
  if (url === "users") return paginate([DEMO_USER], limit, offset) as T;

  // ==========================================================================
  //  POSTS
  // ==========================================================================
  if (url === "posts" && method === "GET") {
    return paginate(searchTitles(store.posts, query), limit, offset) as T;
  }
  if (url === "posts" && method === "POST") {
    const post = {
      id: store.nextPostId(),
      title: body?.title ?? "Untitled",
      content: body?.content ?? "",
      creator: { ...CREATOR_REF },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deleted: false,
      deletedAt: "",
      likeCount: 0,
      likedByMe: false,
      viewCount: 0,
    };
    store.posts.unshift(post);
    return post as T;
  }
  if (url === "posts/cursor") {
    return cursorPaginate(searchTitles(store.posts, query), limit, cursor) as T;
  }
  if (url === "posts/search/suggest") {
    return searchTitles(store.posts, query).slice(0, limit) as T;
  }
  const postIdMatch = url.match(/^posts\/(\d+)$/);
  if (postIdMatch) {
    const id = Number(postIdMatch[1]);
    const idx = store.posts.findIndex((p) => p.id === id);
    if (method === "GET") {
      return (store.posts[idx] ?? store.posts[0]) as T;
    }
    if (method === "PATCH") {
      if (idx >= 0) Object.assign(store.posts[idx], body ?? {}, { updatedAt: new Date().toISOString() });
      return store.posts[idx] as T;
    }
    if (method === "DELETE") {
      if (idx >= 0) store.posts.splice(idx, 1);
      return undefined as T;
    }
  }
  const postsByUserMatch = url.match(/^posts\/users\/(\d+)(\/liked)?(\/cursor)?$/);
  if (postsByUserMatch) {
    const isCursor = !!postsByUserMatch[3];
    const filtered = store.posts;
    return isCursor
      ? (cursorPaginate(filtered, limit, cursor) as T)
      : (paginate(filtered, limit, offset) as T);
  }

  // ==========================================================================
  //  ARTICLES
  // ==========================================================================
  if (url === "articles" && method === "GET") {
    return paginate(searchTitles(store.articles, query), limit, offset) as T;
  }
  if (url === "articles" && method === "POST") {
    const article = {
      id: store.nextArticleId(),
      title: body?.title ?? "Untitled",
      content: body?.content ?? "",
      imagePath: null,
      creator: { ...CREATOR_REF },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: body?.status ?? "DRAFT",
      likeCount: 0,
      likedByMe: false,
      viewCount: 0,
    };
    store.articles.unshift(article);
    return article as T;
  }
  if (url === "articles/cursor") {
    return cursorPaginate(searchTitles(store.articles, query), limit, cursor) as T;
  }
  if (url === "articles/search/suggest") {
    return searchTitles(store.articles, query).slice(0, limit) as T;
  }
  const articleIdMatch = url.match(/^articles\/(\d+)$/);
  if (articleIdMatch) {
    const id = Number(articleIdMatch[1]);
    const idx = store.articles.findIndex((a) => a.id === id);
    if (method === "GET") return (store.articles[idx] ?? store.articles[0]) as T;
    if (method === "PATCH") {
      if (idx >= 0) Object.assign(store.articles[idx], body ?? {}, { updatedAt: new Date().toISOString() });
      return store.articles[idx] as T;
    }
    if (method === "DELETE") {
      if (idx >= 0) store.articles.splice(idx, 1);
      return undefined as T;
    }
  }
  const articlesByUserMatch = url.match(/^articles\/users\/(\d+)(\/liked)?(\/cursor)?$/);
  if (articlesByUserMatch) {
    const isCursor = !!articlesByUserMatch[3];
    const filtered = store.articles;
    return isCursor
      ? (cursorPaginate(filtered, limit, cursor) as T)
      : (paginate(filtered, limit, offset) as T);
  }

  // ==========================================================================
  //  COLLECTIONS
  // ==========================================================================
  if (url === "collections" && method === "POST") {
    const col = {
      id: store.nextCollectionId(),
      name: body?.name ?? "Untitled collection",
      description: body?.description ?? "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      creator: { ...CREATOR_REF },
      items: [],
      deleted: false,
      deletedAt: "",
    };
    store.collections.unshift(col);
    return col as T;
  }
  const collIdMatch = url.match(/^collections\/(\d+)$/);
  if (collIdMatch) {
    const id = Number(collIdMatch[1]);
    const idx = store.collections.findIndex((c) => c.id === id);
    if (method === "GET") {
      const col = store.collections[idx] ?? store.collections[0];
      return {
        ...col,
        items: col.items ?? [],
        itemsPageInfo: {
          total: (col.items ?? []).length,
          limit,
          offset,
          hasMore: false,
        },
      } as T;
    }
    if (method === "PATCH") {
      if (idx >= 0) Object.assign(store.collections[idx], body ?? {}, { updatedAt: new Date().toISOString() });
      return store.collections[idx] as T;
    }
    if (method === "DELETE") {
      if (idx >= 0) store.collections.splice(idx, 1);
      return undefined as T;
    }
  }
  const collItemsMatch = url.match(/^collections\/(\d+)\/items$/);
  if (collItemsMatch) {
    const id = Number(collItemsMatch[1]);
    const col = store.collections.find((c) => c.id === id);
    if (method === "POST" && col) {
      const item = {
        id: store.nextCollectionItemId(),
        resourceType: body.resourceType,
        resourceId: body.resourceId,
        addedAt: new Date().toISOString(),
      };
      col.items = [...(col.items ?? []), item];
      return item as T;
    }
    if (method === "DELETE" && col) {
      col.items = (col.items ?? []).filter(
        (it) =>
          !(it.resourceType === body.resourceType && it.resourceId === body.resourceId),
      );
      return undefined as T;
    }
  }
  // /posts/:id/collections, /articles/:id/collections (fetchCollectionsForResource)
  if (/^(posts|articles|comments)\/\d+\/collections$/.test(url)) {
    return [] as T;
  }

  // ==========================================================================
  //  COMMENTS
  // ==========================================================================
  if (url === "comments" && method === "POST") {
    const comment = {
      id: store.nextCommentId(),
      content: body?.content ?? "",
      resourceType: body.resourceType,
      resourceId: body.resourceId,
      likeCount: 0,
      likedByMe: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      contentUpdatedAt: new Date().toISOString(),
      creator: { ...CREATOR_REF },
      deleted: false,
      deletedAt: null,
    };
    store.comments.push(comment);
    return comment as T;
  }
  const commentsByResourceMatch = url.match(/^comments\/resource\/([^/]+)\/(\d+)$/);
  if (commentsByResourceMatch) {
    const [, rt, rid] = commentsByResourceMatch;
    const filtered = store.comments.filter(
      (c) => c.resourceType === rt && c.resourceId === Number(rid),
    );
    return paginate(filtered, limit, offset) as T;
  }
  const commentIdMatch = url.match(/^comments\/(\d+)$/);
  if (commentIdMatch) {
    const id = Number(commentIdMatch[1]);
    const idx = store.comments.findIndex((c) => c.id === id);
    if (method === "GET") return store.comments[idx] as T;
    if (method === "PATCH") {
      if (idx >= 0) Object.assign(store.comments[idx], body ?? {}, { updatedAt: new Date().toISOString(), contentUpdatedAt: new Date().toISOString() });
      return store.comments[idx] as T;
    }
    if (method === "DELETE") {
      if (idx >= 0) store.comments.splice(idx, 1);
      return undefined as T;
    }
  }

  // ==========================================================================
  //  LIKES
  // ==========================================================================
  if (url === "likes/toggle" && method === "POST") {
    const key = `${body.resourceType}:${body.resourceId}`;
    const liked = store.likes.has(key);
    if (liked) store.likes.delete(key);
    else store.likes.add(key);
    return { Liked: !liked, likeCounter: liked ? 0 : 1 } as T;
  }

  // ==========================================================================
  //  VIEWS
  // ==========================================================================
  if (url === "views" && method === "POST") {
    return { id: 1, resourceType: body.resourceType, resourceId: body.resourceId, viewCount: 1 } as T;
  }
  if (/^views\/[^/]+\/\d+$/.test(url)) {
    return { id: 1, viewCount: 0 } as T;
  }

  // ==========================================================================
  //  ANALYTICS
  // ==========================================================================
  if (url === "analytics/track") return { success: true } as T;

  // ==========================================================================
  //  STRIPE (stubs)
  // ==========================================================================
  if (url === "stripe/health") return {} as T;
  if (url === "stripe/checkout") return { url: null } as T;
  if (url === "stripe/customer-portal") return { url: "#" } as T;
  if (url === "stripe/subscription") {
    return {
      id: 1,
      status: "ACTIVE",
      tier: "PRO",
      nextTier: null,
      periodStart: new Date(),
      periodEnd: new Date(Date.now() + 30 * 86400_000),
      createdAt: new Date(),
      updatedAt: new Date(),
      user: { id: 1, username: "bob", avatarPath: null },
    } as T;
  }
  if (url === "stripe/products/owned/") return [] as T;
  if (url.startsWith("stripe/credit-transactions")) {
    return emptyPage(limit, offset) as T;
  }

  // ==========================================================================
  //  SUPPORT
  // ==========================================================================
  if (url === "support" && method === "POST") {
    return { id: 1, ...body, status: "OPEN", createdAt: new Date().toISOString() } as T;
  }

  // ==========================================================================
  //  ADMIN
  // ==========================================================================
  if (url === "admin/stats") {
    const totalPosts = store.posts.length;
    const totalArticles = store.articles.length;
    return {
      system: {
        cpuUsage: 34.2,
        ramUsage: 61.5,
        totalRamGb: 16,
        usedRamGb: 9.8,
        uptime: 432000,
        cpuCores: 8,
      },
      users: {
        total: 1,
        byStatus: { active: 1, suspended: 0, banned: 0, deleted: 0 },
        unverifiedEmails: 0,
      },
      posts: {
        total: totalPosts,
        active: totalPosts,
        deleted: 0,
        deletionRate: 0,
      },
      articles: {
        total: totalArticles,
        active: totalArticles,
        byStatus: { draft: 3, published: totalArticles - 3, archived: 0, scheduled: 0 },
        deleted: 0,
        deletionRate: 0,
      },
      timestamp: new Date().toISOString(),
    } as T;
  }
  if (url === "admin/logs") {
    const DEMO_LOGS = [
      { id: 1, adminId: 1, action: "USER_CREATED", resource: "USER", resourceId: "1", description: "Created user bob", ipAddress: "127.0.0.1", createdAt: new Date(Date.now() - 1 * 3600_000).toISOString(), admin: { id: 1, username: "bob", email: "bob@demo.local" } },
      { id: 2, adminId: 1, action: "POST_CREATED", resource: "POST", resourceId: "1", description: "Created post #1", ipAddress: "127.0.0.1", createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(), admin: { id: 1, username: "bob", email: "bob@demo.local" } },
      { id: 3, adminId: 1, action: "POST_UPDATED", resource: "POST", resourceId: "2", description: "Updated post #2", ipAddress: "127.0.0.1", createdAt: new Date(Date.now() - 5 * 3600_000).toISOString(), admin: { id: 1, username: "bob", email: "bob@demo.local" } },
      { id: 4, adminId: 1, action: "USER_UPDATED", resource: "USER", resourceId: "1", description: "Updated user profile", ipAddress: "127.0.0.1", createdAt: new Date(Date.now() - 24 * 3600_000).toISOString(), admin: { id: 1, username: "bob", email: "bob@demo.local" } },
      { id: 5, adminId: 1, action: "POST_DELETED", resource: "POST", resourceId: "9", description: "Deleted post #9", ipAddress: "127.0.0.1", createdAt: new Date(Date.now() - 48 * 3600_000).toISOString(), admin: { id: 1, username: "bob", email: "bob@demo.local" } },
    ];
    return paginate(DEMO_LOGS, limit, offset) as T;
  }

  if (url === "admin/posts/search") {
    return paginate(searchTitles(store.posts, query), limit, offset) as T;
  }
  if (url === "admin/posts/search/cursor") {
    return cursorPaginate(searchTitles(store.posts, query), limit, cursor) as T;
  }
  const adminPostIdMatch = url.match(/^admin\/posts\/(\d+)(\/restore)?$/);
  if (adminPostIdMatch) {
    const id = Number(adminPostIdMatch[1]);
    const post = store.posts.find((p) => p.id === id) ?? store.posts[0];
    if (method === "GET") return post as T;
    if (method === "PATCH") {
      Object.assign(post, body ?? {});
      return post as T;
    }
    if (method === "DELETE") return undefined as T;
    if (method === "POST") return post as T; // restore
  }

  if (url === "admin/collections") {
    return paginate(store.collections, limit, offset) as T;
  }
  const adminCollMatch = url.match(/^admin\/collections\/(\d+)(\/restore)?$/);
  if (adminCollMatch) {
    const id = Number(adminCollMatch[1]);
    const col = store.collections.find((c) => c.id === id) ?? store.collections[0];
    if (method === "GET") return col as T;
    if (method === "PATCH") {
      Object.assign(col, body ?? {});
      return col as T;
    }
    if (method === "DELETE") return undefined as T;
    if (method === "POST") return col as T;
  }

  if (url === "admin/comments") {
    return paginate(store.comments, limit, offset) as T;
  }
  const adminCommentMatch = url.match(/^admin\/comments\/(\d+)(\/restore)?$/);
  if (adminCommentMatch) {
    const id = Number(adminCommentMatch[1]);
    const c = store.comments.find((x) => x.id === id) ?? store.comments[0];
    if (method === "GET") return c as T;
    if (method === "PATCH") {
      if (c) Object.assign(c, body ?? {});
      return c as T;
    }
    if (method === "DELETE") return undefined as T;
    if (method === "POST") return c as T;
  }

  if (url === "admin/users/search") {
    return paginate([DEMO_USER], limit, offset) as T;
  }
  if (url === "admin/users" && method === "POST") {
    return DEMO_USER as T;
  }
  const adminUserIdMatch = url.match(/^admin\/users\/(\d+)(\/restore|\/username-history)?$/);
  if (adminUserIdMatch) {
    const suffix = adminUserIdMatch[2];
    if (suffix === "/username-history") return emptyPage(limit, offset) as T;
    if (method === "GET") return [DEMO_USER] as T;
    if (method === "PATCH") {
      Object.assign(DEMO_USER, body ?? {});
      return DEMO_USER as T;
    }
    if (method === "DELETE") return undefined as T;
    if (method === "POST") return DEMO_USER as T; // restore
  }

  if (url === "admin/support") return emptyPage(limit, offset) as T;
  const adminSupportIdMatch = url.match(/^admin\/support\/(\d+)$/);
  if (adminSupportIdMatch) {
    return { id: Number(adminSupportIdMatch[1]), subject: "Demo ticket", message: "", status: "OPEN", createdAt: new Date().toISOString() } as T;
  }

  if (url === "admin/stripe/subscription") return emptyPage(limit, offset) as T;
  if (url === "admin/stripe/products") return emptyPage(limit, offset) as T;
  if (url === "admin/stripe/credit-purchases") return emptyPage(limit, offset) as T;
  if (url === "admin/stripe/credit-transactions") return emptyPage(limit, offset) as T;

  // ==========================================================================
  //  FALLBACK
  // ==========================================================================
  if (typeof console !== "undefined") {
    console.warn("[demo] unhandled API call:", method, url, options);
  }
  return {} as T;
}
