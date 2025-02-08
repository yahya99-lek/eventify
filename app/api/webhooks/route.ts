import { Webhook } from "svix";
import { clerkClient, WebhookEvent } from "@clerk/nextjs/server";
import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";
import { NextResponse } from "next/server";

// POST handler for incoming webhooks
export async function POST(req: Request) {
  // Fetch the signing secret from environment variables, you can find this key in clerk dashboard
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  // Ensure the signing secret exists, otherwise throw an error
  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Create a new Svix instance to verify the webhook
  const wh = new Webhook(SIGNING_SECRET);

  // Retrieve headers from the incoming request
  const headers = req.headers;

  // Extract Svix headers needed for verification
  const svix_id = headers.get("svix-id");
  const svix_timestamp = headers.get("svix-timestamp");
  const svix_signature = headers.get("svix-signature");

  // If any of the required Svix headers are missing, return an error
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Parse the incoming request body to get the webhook payload
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify the payload using Svix's signature and the received headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    // If verification fails, return an error response
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  // Extract event details such as event type and ID
  const { id } = evt.data;
  const eventType = evt.type;
  console.log("event", eventType);
  // Handle different webhook events based on event type
  if (eventType === "user.created") {
    const { id, email_addresses, image_url, first_name, last_name, username } =
      evt.data;

    // Create a user object from the webhook data
    const user = {
      clerkId: id,
      email: email_addresses[0].email_address,
      username: username!,
      firstName: first_name!,
      lastName: last_name!,
      photo: image_url,
    };
    console.log(user);

    // Add the new user to the database
    const newUser = await createUser(user);

    // If the user was successfully created, update their metadata with user ID
    const client = await clerkClient();
    if (newUser) {
      await client.users.updateUserMetadata(id, {
        publicMetadata: {
          userId: newUser._id,
        },
      });
    }

    // Return a successful response with the new user's information
    return NextResponse.json({ message: "OK", user: newUser });
  }

  if (eventType === "user.updated") {
    const { id, image_url, first_name, last_name, username } = evt.data;

    // Create a user object for the updated user data
    const user = {
      firstName: first_name!,
      lastName: last_name!,
      username: username!,
      photo: image_url,
    };

    // Update the user's information in the database
    const updatedUser = await updateUser(id, user);

    // Return a successful response with the updated user's information
    return NextResponse.json({ message: "OK", user: updatedUser });
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    // Delete the user from the database
    const deletedUser = await deleteUser(id!);

    // Return a successful response with the deleted user's information
    return NextResponse.json({ message: "OK", user: deletedUser });
  }

  // Default response for any other event type
  return new Response("Webhook received", { status: 200 });
}
