"use strict";

const joinUrl = require("urljoin");

function httpRequest(endpoint, queryParams, body, method) {
  const { baseUrl, keyId, secretKey, apiVersion, oauth } = this.configuration;
  const url = new URL(joinUrl(baseUrl, apiVersion, endpoint));

  for (const [k, v] of Object.entries(queryParams || {})) {
    if (v instanceof Date) {
      url.searchParams.append(k, v.toISOString());
    } else {
      url.searchParams.append(k, v);
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

function dataHttpRequest(endpoint, queryParams, body, method) {
  const { dataBaseUrl, keyId, secretKey, oauth } = this.configuration;
  const url = new URL(joinUrl(dataBaseUrl, "v1", endpoint));

  for (const [k, v] of Object.entries(queryParams || {})) {
    url.searchParams.append(k, v);
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

function sendRequest(f, endpoint, queryParams, body, method) {
  return f(endpoint, queryParams, body, method).then(async (resp) => {
    const responseText = await resp.text();
    if (!responseText) {
      return;
    }

    const responseJson = await JSON.parse(responseText);
    if (responseJson.message) {
      return Promise.reject(new Error(`${resp.status}`));
    }

    return responseJson;
  });
}

module.exports = {
  httpRequest,
  dataHttpRequest,
  sendRequest,
};
