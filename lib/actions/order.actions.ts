"use server";

import {
  CheckoutOrderParams,
  CreateOrderParams,
  GetOrdersByEventParams,
  GetOrdersByUserParams,
} from "@/types";
import { redirect } from "next/navigation";
import { connectToDatabase } from "../database";
import Order from "../database/models/order.model";
import { handleError } from "../utils";
import { ObjectId } from "mongodb";
import User from "../database/models/user.model";
import Event from "../database/models/event.model";

export const checkoutOrder = async (order: CheckoutOrderParams) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

  const price = order.isFree ? 0 : Number(order.price) * 100;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: price,
            product_data: {
              name: order.eventTitle,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        eventId: order.eventId,
        buyerId: order.buyerId,
      },
      mode: "payment",
      success_url: `${siteUrl}/profile`,
      cancel_url: `${siteUrl}/`,
    });
    redirect(session.url); // redirect to the session URL
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    throw error;
  }
};

export const createOrder = async (order: CreateOrderParams) => {
  try {
    await connectToDatabase();

    const newOrder = await Order.create({
      ...order,
      event: order.eventId,
      buyer: order.buyerId,
    });
    return JSON.stringify(newOrder);
  } catch (error) {
    handleError(error);
  }
};

// GET ORDERS BY EVENT
// GET ORDERS BY EVENT
export async function getOrdersByEvent({
  searchString,
  eventId,
}: GetOrdersByEventParams) {
  try {
    // Connect to database
    await connectToDatabase();

    if (!eventId) throw new Error("Event ID is required");

    const eventObjectId = new ObjectId(eventId);

    // Aggregate orders with necessary lookups
    const orders = await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "buyer",
          foreignField: "_id",
          as: "buyer",
        },
      },
      {
        $unwind: "$buyer",
      },
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "event",
        },
      },
      {
        $unwind: "$event",
      },
      {
        $project: {
          _id: 1,
          totalAmount: 1,
          createdAt: 1,
          eventTitle: "$event.title",
          eventId: "$event._id",
          buyer: "$buyer.username",
        },
      },
      {
        $match: {
          $and: [
            { eventId: eventObjectId },
            { buyer: { $regex: RegExp(searchString, "i") } },
          ],
        },
      },
    ]);

    // Return the orders after converting them to JSON format
    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    handleError(error);
  }
}

// GET ORDERS BY USER
export async function getOrdersByUser({
  userId,
  limit = 3,
  page,
}: GetOrdersByUserParams) {
  try {
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      throw new Error("User not found");
    }
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;
    const conditions = { buyer: user._id };

    const orders = await Order.distinct("event._id")
      .find(conditions)
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(limit)
      .populate({
        path: "event",
        model: Event,
        populate: {
          path: "organizer",
          model: User,
          select: "_id firstName lastName",
        },
      });

    const ordersCount = await Order.distinct("event._id").countDocuments(
      conditions
    );

    return {
      data: JSON.parse(JSON.stringify(orders)),
      totalPages: Math.ceil(ordersCount / limit),
    };
  } catch (error) {
    handleError(error);
  }
}
