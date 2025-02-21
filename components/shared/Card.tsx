import { IEvent } from '@/lib/database/models/event.model'
import { formatDateTime } from '@/lib/utils'
import { auth } from '@clerk/nextjs/server'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { DeleteConfirmation } from './DeleteConfirmation'


type CardProps = {
    event: IEvent,
    hasOrderLink?: boolean,
    hidePrice?: boolean,
}

const Card = async ({ event, hasOrderLink, hidePrice }: CardProps) => {
    const { userId } = await auth();
    const isEventCreator = userId === event.organizer?.clerkId?.toString();

    return (
        <div className="group relative flex min-h-[380px] w-full max-w-[400px]
            flex-col overflow-hidden rounded-xl bg-white shadow-md
            transition-all hover:shadow-lg md:min-h-[438px]">

            {/* Event Image */}
            <Link href={`/events/${event._id}`} className="relative w-full h-[230px]">
                <Image
                    src={event.imageUrl}
                    alt="Event Image"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-xl"
                />
            </Link>

            {/* Edit Button (If Creator) */}
            {isEventCreator && !hidePrice && (
                <div className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md z-10">
                    <Link href={`/events/${event._id}/update`}>
                        <Image src="/assets/icons/edit.svg" alt="Edit" width={20} height={20} />
                    </Link>

                    <DeleteConfirmation eventId={event._id} />
                </div>
            )}

            {/* Event Details */}
            <div className="relative flex flex-col gap-3 p-5 md:gap-4 z-10 bg-white">
                {!hidePrice && (
                    <div className="flex gap-2">
                        <span className="p-semibold-14 w-min rounded-full bg-green-100 px-4 py-1 text-green-600">
                            {event.isFree ? 'Free' : `$${event.price}`}
                        </span>
                        <p className="p-semibold-14 w-min rounded-full bg-grey-500/10 px-4 py-1 text-grey-500 line-clamp-1">
                            {event?.category?.name}
                        </p>
                    </div>
                )}

                <p className="p-medium-16 p-medium-18 text-grey-500">
                    {formatDateTime(event.startDateTime).dateTime}
                </p>
                <Link href={`/events/${event._id}`}>
                    <p className="p-medium-16 md:p-medium-20 line-clamp-2 flex-1 text-black">
                        {event.title}
                    </p>
                </Link>


                {/* Organizer Name & Order Link */}
                <div className="flex justify-between items-center w-full">
                    <p className="p-medium-14 md:p-medium-15 text-grey-600">
                        {event?.organizer?.username}
                    </p>

                    {hasOrderLink && (
                        <Link href={`/orders?eventId=${event._id}`} className="flex gap-2">
                            <p className="text-primary-500">Order Details</p>
                            <Image src="/assets/icons/arrow.svg" alt="search" width={10} height={10} />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Card
