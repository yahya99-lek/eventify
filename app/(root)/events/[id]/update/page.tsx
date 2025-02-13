import EventForm from "@/components/shared/EventForm";
import { getEventById } from "@/lib/actions/event.actions";
import { auth, currentUser } from "@clerk/nextjs/server";
import React from "react";

type UpdateEventProps = {
  params: {
    id: string
  }
}

export default async function UpdateEvent({ params }: any) {
  const { userId } = await auth();
  const local = await params;
  const { id } = local;
  const event = await getEventById(id)
  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">
          Update Event
        </h3>
      </section>
      <div className="wrapper my-8">
        <EventForm
          userId={userId ?? ""}
          type="Update"
          event={event}
          eventId={event._id}
        />
      </div>
    </>
  );
}
