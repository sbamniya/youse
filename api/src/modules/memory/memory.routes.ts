import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate";
import * as controller from "./memory.controller";
import {
  addMemoryPhotoSchema,
  createMemorySchema,
  favoriteMemorySchema,
  memoryItemIdSchema,
  memoryIdSchema,
  updateMemoryItemCaptionSchema,
} from "./memory.schema";

export const memoryRouter = Router();
memoryRouter.use(requireAuth);

memoryRouter.get("/", controller.list);
memoryRouter.post("/", validate(createMemorySchema), controller.create);
memoryRouter.post(
  "/:id/photos",
  validate(addMemoryPhotoSchema),
  controller.addPhoto,
);
memoryRouter.patch(
  "/:id/photos/:itemId",
  validate(updateMemoryItemCaptionSchema),
  controller.updatePhotoCaption,
);
memoryRouter.delete(
  "/:id/photos/:itemId",
  validate(memoryItemIdSchema),
  controller.removePhoto,
);
memoryRouter.get("/:id", validate(memoryIdSchema), controller.get);
memoryRouter.patch(
  "/:id/favorite",
  validate(favoriteMemorySchema),
  controller.setFavorite,
);
memoryRouter.delete("/:id", validate(memoryIdSchema), controller.remove);
