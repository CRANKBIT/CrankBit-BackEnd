import { Response, NextFunction } from "express";
import HttpStatusCodes from "http-status-codes";
import jwt from "jsonwebtoken";

import Payload from "../types/Payload";
import Request from "../types/Request";

export default function (req: Request, res: Response, next: NextFunction) {
  // Get token from header
  const token = req.header("Authorization");

  // Check if no token
  if (!token) {
    return res
      .status(HttpStatusCodes.UNAUTHORIZED)
      .json({ msg: "Authorization denied" });
  }
  // Verify token
  try {
    const payload: Payload | any = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    res
      .status(HttpStatusCodes.FORBIDDEN)
      .json({ msg: "Authorization invalid" });
  }
}