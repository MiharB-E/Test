import api from "./api";
import { Group } from "../types";

export const createGroup = (name: string) => api.post<Group>("/groups", { name });

export const joinGroup = (invite_code: string) =>
  api.post<Group>("/groups/join", { invite_code });

export const getMyGroup = () => api.get<Group>("/groups/me");