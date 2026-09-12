import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate";
import * as pokeController from "./poke.controller";
import { pokeSchema } from "./poke.schema";

export const pokeRouter = Router();
pokeRouter.use(requireAuth);
pokeRouter.post("/pokes", validate(pokeSchema), pokeController.sendPoke);
