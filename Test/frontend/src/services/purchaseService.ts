import api from "./api";
import { Purchase } from "../types";

export const createPurchase = (payload: Partial<Purchase>) =>
  api.post<Purchase>("/purchases", payload);