import { fetcher } from "@/lib/fetcher";
import { DEMO_USER } from "@/lib/demo/mockStore";

import type {
  User,
  UsersList,
  PublicUser,
  UsernameHistoryList,
  UpdateProfileInput,
  ChangePasswordInput,
  UpdateUserAdminInput,
} from "./types/user";

export const updateProfile = async (
  data: UpdateProfileInput,
  _file?: File,
) => {
  // Demo: file uploads ignored; mutate the in-memory user directly.
  Object.assign(DEMO_USER, data);
  return DEMO_USER;
};

export const changePassword = (data: ChangePasswordInput) =>
  fetcher("/users/me/password", {
    method: "PATCH",
    json: data,
  });

export const deleteProfile = () =>
  fetcher<void>(`/users/me`, {
    method: "DELETE",
  });

export const fetchUserByUsername = (username: string): Promise<PublicUser> =>
  fetcher(`/users/username/${username}`, {
    method: "GET",
  });

export const fetchUsers = ({
  query,
  limit = 10,
  offset = 0,
  searchFields,
  sort,
  caseSensitive,
}: {
  query?: string;
  limit?: number;
  offset?: number;
  searchFields?: string;
  sort?: string;
  caseSensitive?: boolean;
} = {}) => {
  const searchParams: Record<string, string | number | boolean> = {
    limit,
    offset,
  };
  if (query) searchParams.query = query;
  if (searchFields) searchParams.searchFields = searchFields;
  if (sort) searchParams.sort = sort;
  if (caseSensitive) searchParams.caseSensitive = caseSensitive;

  return fetcher<UsersList>("/users", { searchParams });
};

//==============
//   Admin
//==============

export const fetchAdminUsers = ({
  query,
  limit = 10,
  offset = 0,
  searchFields,
  sort,
  caseSensitive,
  roles,
  statuses,
}: {
  query?: string;
  limit?: number;
  offset?: number;
  searchFields?: string;
  sort?: string;
  caseSensitive?: boolean;
  roles?: string;
  statuses?: string;
} = {}) => {
  const searchParams: Record<string, string | number | boolean> = {
    limit,
    offset,
  };
  if (query) searchParams.query = query;
  if (searchFields) searchParams.searchFields = searchFields;
  if (sort) searchParams.sort = sort;
  if (caseSensitive) searchParams.caseSensitive = caseSensitive;
  if (roles) searchParams.roles = roles;
  if (statuses) searchParams.statuses = statuses;

  return fetcher<UsersList>("/admin/users/search", { searchParams });
};

export const fetchAdminUserById = (id: number) =>
  fetcher<User[]>(`/admin/users/${id}`);

export const createAdminUser = (payload: {
  username: string;
  email?: string;
  password: string;
}) => {
  return fetcher("/admin/users", {
    method: "POST",
    json: payload,
  });
};

export const updateAdminUser = async (
  _id: number,
  data: UpdateUserAdminInput,
  _file?: File,
) => {
  // Demo: only one user (bob) exists; mutate in place.
  Object.assign(DEMO_USER, data);
  return DEMO_USER;
};

export const deleteAdminUser = (id: number) =>
  fetcher<void>(`/admin/users/${id}`, {
    method: "DELETE",
  });

export const fetchAdminUsernameHistory = ({
  userId,
  limit,
  offset,
}: {
  userId: number;
  limit: number;
  offset: number;
}) =>
  fetcher<UsernameHistoryList>(`/admin/users/${userId}/username-history`, {
    searchParams: { limit, offset },
  });

export const restoreAdminUser = (id: number) =>
  fetcher<User>(`/admin/users/${id}/restore`, {
    method: "POST",
  });
