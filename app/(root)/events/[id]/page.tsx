import React from 'react'
import { SearchParamProps } from '@/types'
import { getEventById } from '@/lib/actions/event.action'
import Image from 'next/image';
import { formatDateTime } from '@/lib/utils';

const EventDetails = async ({ params: { id } }: SearchParamProps) => {
    const event = await getEventById(id);
    console.log(event);

    return (
        <section className="flex justify-center bg-primary-50 bg-dotted-pattern bg-contain py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-7xl w-full px-5 md:px-10">
                {/* Event Image */}
                <div className="overflow-hidden rounded-xl shadow-lg">
                    <Image
                        src={event.imageUrl}
                        alt="hero image"
                        width={1000}
                        height={1000}
                        className="h-full min-h-[300px] w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                </div>

                {/* Event Details */}
                <div className="flex flex-col gap-8 p-5 md:p-10 bg-white rounded-xl shadow-md">
                    <div className="flex flex-col gap-6">
                        <h2 className="text-3xl font-bold text-gray-800">{event.title}</h2>

                        <div className="flex flex-wrap gap-3 items-center">
                            <p className="p-bold-20 rounded-full bg-green-500/10 px-5 py-2 text-green-700">
                                {event.isFree ? 'Free' : `$${event.price}`}
                            </p>
                            <p className="p-medium-16 rounded-full bg-gray-200 px-4 py-2.5 text-gray-700">
                                {event.category.name}
                            </p>
                        </div>

                        <p className="text-lg text-gray-600">
                            Hosted by <span className="font-semibold text-primary-500">{event.organizer.username}</span>
                        </p>
                    </div>

                    {/* Event Timing & Location */}
                    <div className="flex flex-col gap-5 p-5 bg-gray-100 rounded-lg shadow-sm">
                        <div className="flex gap-3 items-center">
                            <Image src="/assets/icons/calendar.svg" alt="calendar" width={32} height={32} />
                            <div className="flex flex-col">
                                <p className="text-gray-700">
                                    {formatDateTime(event.startDateTime).dateOnly} - {' '}
                                    {formatDateTime(event.startDateTime).timeOnly}
                                </p>
                                <p className="text-gray-700">
                                    {formatDateTime(event.endDateTime).dateOnly} - {' '}
                                    {formatDateTime(event.endDateTime).timeOnly}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 items-center">
                            <Image src="/assets/icons/location.svg" alt="location" width={32} height={32} />
                            <p className="text-gray-700">{event.location}</p>
                        </div>
                    </div>

                    {/* Event Description */}
                    <div className="flex flex-col gap-2">
                        <h3 className="text-2xl font-semibold text-gray-800">What You'll Learn</h3>
                        <p className="text-gray-600">{event.description}</p>

                        {/* Event Link */}
                        <a
                            href={event.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 text-lg font-medium text-primary-500 underline hover:text-primary-700 transition"
                        >
                            {event.url}
                        </a>
                    </div>

                    {/* CTA Button */}
                    {/* <button className="mt-5 px-6 py-3 text-lg font-semibold text-white bg-primary-500 rounded-lg shadow-md hover:bg-primary-600 transition">
                        Register Now
                    </button> */}
                </div>
            </div>
        </section>
    );
};

export default EventDetails;
