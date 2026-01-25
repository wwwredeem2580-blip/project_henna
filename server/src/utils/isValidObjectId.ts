import { Types } from "mongoose";

export const isValidObjectId = (id: string) => Types.ObjectId.isValid(id);