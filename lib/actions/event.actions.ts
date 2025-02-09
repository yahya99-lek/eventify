"use server";

import {
  CreateEventParams,
  DeleteEventParams,
  GetAllEventsParams,
  GetEventsByUserParams,
  GetRelatedEventsByCategoryParams,
  UpdateEventParams,
} from "@/types";
import { connectToDatabase } from "../database";
import Event from "../database/models/event.model";
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Category from "../database/models/category.model";
import { revalidatePath } from "next/cache";

const getCategoryByName = async (name: string) => {
  return Category.findOne({ name: { $regex: name, $options: "i" } });
};

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
    const titleCondition = query
      ? { title: { $regex: query, $options: "i" } }
      : {};
    const categoryCondition = category
      ? await getCategoryByName(category)
      : null;
    const conditions = {
      $and: [
        titleCondition,
        categoryCondition ? { category: categoryCondition._id } : {},
      ],
    };

    const skipAmount = (Number(page) - 1) * limit;
    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
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

// UPDATE
export async function updateEvent({ userId, event, path }: UpdateEventParams) {
  try {
    await connectToDatabase();

    const eventToUpdate = await Event.findById(event._id);

    const user = await User.findOne({ clerkId: userId });
    if (!user || user._id.toString() !== eventToUpdate.organizer.toString()) {
      throw new Error("Unauthorized or event not found");
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      event._id,
      { ...event, category: event.categoryId },
      { new: true }
    );
    revalidatePath(path);

    return JSON.parse(JSON.stringify(updatedEvent));
  } catch (error) {
    handleError(error);
  }
}

// DELETE
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

// GET EVENTS BY ORGANIZER
export async function getEventsByUser({
  userId,
  limit = 6,
  page,
}: GetEventsByUserParams) {
  try {
    await connectToDatabase();
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      throw new Error("User not found");
    }

    // Use the user's `_id` (which is an ObjectId) as the organizer
    const conditions = { organizer: user._id };
    const skipAmount = (page - 1) * limit;

    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
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
}

// GET RELATED EVENTS: EVENTS WITH SAME CATEGORY
export async function getRelatedEventsByCategory({
  categoryId,
  eventId,
  limit = 3,
  page = 1,
}: GetRelatedEventsByCategoryParams) {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;
    const conditions = {
      $and: [{ category: categoryId }, { _id: { $ne: eventId } }],
    };

    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
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
}
