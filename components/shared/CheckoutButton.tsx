'use client'
import { IEvent } from '@/lib/database/models/event.model'
import { useUser } from '@clerk/nextjs';
import React from 'react'
import { Button } from '../ui/button';

const CheckoutButton = ({ event }: { event: IEvent }) => {
    const { user } = useUser();
    const userId = user?.publicMetadata.userId as string;
    const hasEventFinished = new Date(event.endDateTime) < new Date();
    console.log(userId);

    return (
        <div className='flex items-center gap-3'>
            { /* Cannot But Past Events*/}
            {hasEventFinished ? (
                <p>Sorry, tickets are no longer available.</p>
            ) : (
                <>
                Button
                </>
            )}
        </div>
    )
}

export default CheckoutButton