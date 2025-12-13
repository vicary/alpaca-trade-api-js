"use strict";

function joinUrl(base: string, ...parts: string[]): string {
  const url = new URL(base);
  const segments: string[] = [];

  const addPart = (part: string) => {
    const trimmed = part.replace(/^\/+|\/+$/g, "");
    if (trimmed) segments.push(trimmed);
  };

  addPart(url.pathname);
  for (const part of parts) {
    if (part) addPart(part);
  }

  url.pathname = "/" + segments.join("/");
  url.search = "";
  url.hash = "";
  return url.toString();
}

import { Alpaca } from "./alpaca-trade-api";

export function httpRequest(
  this: Alpaca,
  endpoint: string,
  queryParams?: Record<string, unknown>,
  body?: unknown,
  method?: string
) {
  const { baseUrl, keyId, secretKey, apiVersion, oauth } = this.configuration;
  const url = new URL(joinUrl(baseUrl, apiVersion, endpoint));

  for (const [k, v] of Object.entries(queryParams || {})) {
    if (v instanceof Date) {
      url.searchParams.append(k, v.toISOString());
    } else if (v != null) {
      url.searchParams.append(k, v.toString());
    }
  }

  return fetch(url.toString(), {
    method: method || "GET",
    headers:
      oauth !== ""
        ? {
            "content-type": method !== "DELETE" ? "application/json" : "",
            Authorization: "Bearer " + oauth,
          }
        : {
            "content-type": method !== "DELETE" ? "application/json" : "",
            "APCA-API-KEY-ID": keyId,
            "APCA-API-SECRET-KEY": secretKey,
          },
    body: !body ? undefined : JSON.stringify(body),
  });
}

export function dataHttpRequest(
  this: Alpaca,
  endpoint: string,
  queryParams?: Record<string, unknown>,
  body?: unknown,
  method?: string
) {
  const { dataBaseUrl, keyId, secretKey, oauth } = this.configuration;
  const url = new URL(joinUrl(dataBaseUrl, "v1", endpoint));

  for (const [k, v] of Object.entries(queryParams || {})) {
    if (v != null) {
      url.searchParams.append(k, v.toString());
    }
  }

  return fetch(url.toString(), {
    method: method || "GET",
    headers:
      oauth !== ""
        ? {
            "content-type": method !== "DELETE" ? "application/json" : "",
            Authorization: "Bearer " + oauth,
          }
        : {
            "content-type": method !== "DELETE" ? "application/json" : "",
            "APCA-API-KEY-ID": keyId,
            "APCA-API-SECRET-KEY": secretKey,
          },
    body: !body ? undefined : JSON.stringify(body),
  });
}

export async function sendRequest(
  this: Alpaca,
  f: typeof httpRequest | typeof dataHttpRequest,
  endpoint: string,
  queryParams?: Record<string, unknown>,
  body?: unknown,
  method?: string
) {
  const resp = await f.call(this, endpoint, queryParams, body, method);

  const responseText = await resp.text();
  if (!responseText) {
    return;
  }
  const responseJson = await JSON.parse(responseText);
  if (responseJson.message) {
    return Promise.reject(new Error(`${resp.status}`));
  }
  return await responseJson;
}
