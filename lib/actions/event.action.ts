"use server";

import {
  CreateEventParams,
  DeleteEventParams,
  GetAllEventsParams,
} from "@/types";
import { connectToDatabase } from "../database";
import Event from "../database/models/event.model";
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Category from "../database/models/category.model";
import { revalidatePath } from "next/cache";

/**
 * Populates referenced fields in an event query.
 *
 * This function enhances an event query by replacing the `organizer` and `category` fields
 * (which are originally stored as ObjectIds) with the actual referenced documents from
 * the `User` and `Category` collections.
 *
 * @param query - The Mongoose query object for fetching an event.
 * @returns The query with populated fields.
 */
const populateEvent = async (query: any) => {
  return query
    .populate({
      path: "organizer",
      model: User,
      select: "_id clerkId username", // Only include necessary fields
    })
    .populate({
      path: "category",
      model: Category,
      select: "_id name", // Only include necessary fields
    });
};

export async function createEvent({ event, userId, path }: CreateEventParams) {
  try {
    await connectToDatabase();

    // Find the organizer based on Clerk's user ID
    const organizer = await User.findOne({ clerkId: userId });

    if (!organizer) {
      throw new Error("Organizer not found");
    }

    // Create a new event with category and organizer references
    const newEvent = await Event.create({
      ...event,
      category: event.categoryId, // Ensure category ID is properly assigned
      organizer: organizer._id, // Assign the found organizer ID
    });

    return JSON.parse(JSON.stringify(newEvent)); // Convert Mongoose document to JSON-safe format
  } catch (error) {
    handleError(error);
  }
}

export const getEventById = async (eventId: string) => {
  try {
    await connectToDatabase();

    // Find the event and populate related fields
    const event = await populateEvent(Event.findById(eventId));

    if (!event) {
      throw new Error("Event not found");
    }

    return JSON.parse(JSON.stringify(event)); // Convert to JSON-safe format
  } catch (error) {
    handleError(error);
  }
};

export const getAllEvents = async ({
  query,
  limit = 6,
  page,
  category,
}: GetAllEventsParams) => {
  try {
    await connectToDatabase();
    const conditions = {};

    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: "desc" })
      .skip(0)
      .limit(limit);

    const events = await populateEvent(eventsQuery);
    const eventsCount = await Event.countDocuments(conditions);

    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(eventsCount / limit),
    };
  } catch (error) {
    handleError(error);
  }
};

export const deleteEvent = async ({ eventId, path }: DeleteEventParams) => {
  try {
    await connectToDatabase();

    // Find the event and delete it
    const deletedEvent = await Event.findByIdAndDelete(eventId);

    //is checking whether an event has been successfully deleted and then triggering a Next.js cache revalidation for a specific path.
    if (deletedEvent) revalidatePath(path);
  } catch (error) {
    handleError(error);
  }
};
