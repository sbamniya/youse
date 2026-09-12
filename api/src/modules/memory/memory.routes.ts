import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate";
import * as controller from "./memory.controller";
import {
  createMemorySchema,
  favoriteMemorySchema,
  memoryIdSchema,
} from "./memory.schema";

export const memoryRouter = Router();
memoryRouter.use(requireAuth);

memoryRouter.get("/", controller.list);
memoryRouter.post("/", validate(createMemorySchema), controller.create);
memoryRouter.get("/:id", validate(memoryIdSchema), controller.get);
memoryRouter.patch(
  "/:id/favorite",
  validate(favoriteMemorySchema),
  controller.setFavorite,
);
memoryRouter.delete("/:id", validate(memoryIdSchema), controller.remove);
