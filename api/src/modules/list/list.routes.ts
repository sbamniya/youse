import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate";
import * as controller from "./list.controller";
import { createListItemSchema, createListSchema, listEntityIdSchema, updateListItemSchema } from "./list.schema";
export const listRouter = Router();
listRouter.use(requireAuth);

listRouter.get("/", controller.list);
listRouter.post("/", validate(createListSchema), controller.create);
listRouter.delete("/:id", validate(listEntityIdSchema), controller.remove);
listRouter.post("/:listId/items", validate(createListItemSchema), controller.createItem);
listRouter.patch("/items/:id", validate(updateListItemSchema), controller.updateItem);
listRouter.delete("/items/:id", validate(listEntityIdSchema), controller.removeItem);
