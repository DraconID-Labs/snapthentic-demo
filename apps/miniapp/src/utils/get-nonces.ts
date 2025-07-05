"use server";
import crypto from "node:crypto";
import { hashNonce } from "./hash-nonce";

export async function getNewNonces() {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const signedNonce = hashNonce({ nonce });

  return {
    nonce,
    signedNonce,
  };
}
