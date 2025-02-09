"use server";

import { CheckoutOrderParams } from "@/types";
import { redirect } from "next/navigation";

export const checkoutOrder = async (order: CheckoutOrderParams) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

  const price = order.isFree ? 0 : Number(order.price) * 100;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

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

