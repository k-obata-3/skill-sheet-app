import { afterEach } from "vitest";
import { resetPrismaMock } from "./mockPrisma";

afterEach(() => {
  resetPrismaMock();
});
