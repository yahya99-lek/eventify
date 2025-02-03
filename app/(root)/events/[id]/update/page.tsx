import EventForm from "@/components/shared/EventForm";
import { auth, currentUser } from "@clerk/nextjs/server";
import React from "react";

export default async function UpdateEvent() {
  const { userId } = await auth();

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">
          Update Event
        </h3>
      </section>
      <div className="wrapper my-8">
        <EventForm userId={userId ?? ""} type="Update" />
      </div>
    </>
  );
}
