import "dotenv/config";

import * as mockServer from "./support/mock-server";

export async function setup() {
  await mockServer.start();
}

export async function teardown() {
  await mockServer.stop();
}
