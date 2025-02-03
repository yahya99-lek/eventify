"use server";

import { CreateEventParams } from "@/types";
import { connectToDatabase } from "../database";
import Event from "../database/models/event.model";
import { handleError } from "../utils";
import User from "../database/models/user.model";

export async function createEvent({ event, userId, path }: CreateEventParams) {
  try {
    await connectToDatabase();
    console.log("this is users", userId);
    console.log(event);
    const organizer = await User.findOne({ clerkId: userId })

    if (!organizer) {
      throw new Error("Organizer not found");
    }

    const newEvent = await Event.create({
      ...event,
      category: event.categoryId,
      organizer: organizer._id,
    });
   
    console.log(newEvent);
    return JSON.parse(JSON.stringify(newEvent));
  } catch (error) {
    console.log(error);
    handleError(error);
  }
}
