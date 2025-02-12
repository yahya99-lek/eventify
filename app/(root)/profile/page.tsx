import Collection from '@/components/shared/Collection'
import { Button } from '@/components/ui/button'
import { getEventsByUser } from '@/lib/actions/event.actions'
import { getOrdersByUser } from '@/lib/actions/order.actions'
import { IOrder } from '@/lib/database/models/order.model'
import { SearchParamProps } from '@/types'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import React from 'react'

const profilePage = async ({ searchParams }: SearchParamProps) => {
    const { userId } = await auth();
    const ordersPage = Number(searchParams?.ordersPage) || 1;
    const eventsPage = Number(searchParams?.eventsPage) || 1;
    const orders = await getOrdersByUser({ userId, page: ordersPage })

    /*Extracts the events from the retrieved orders. If no orders are found, returns an empty array.*/
    const orderdEvents = orders?.data.map((order: IOrder) => order.event) || [];
    const organizedEvents = await getEventsByUser({ userId: userId ?? "", page: eventsPage });
    return (
        <>
            { /* My Tickets */}
            <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
                <div className="wrapper flex itens-center justify-center sm:justify-between">
                    <h3 className='h3-bold text-center sm:text-left'>My Tickets</h3>
                    <Button asChild size="lg" className='button hidden sm:flex'>
                        <Link href="/#events">
                            Explore More Events
                        </Link>
                    </Button>
                </div>
            </section>

            <section className="wrapper my-8">
                <Collection
                    data={orderdEvents}
                    emptyTitle="No event tickets purchased yet"
                    emptyStateSubText="No Worries- olenty of exciting events to explore!"
                    collectionType="My_Tickets"
                    limit={3}
                    page={ordersPage}
                    urlParamName='ordersPage'
                    totalPages={orders?.totalPages}
                />
            </section>

            { /* Events Organized */}
            <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
                <div className="wrapper flex itens-center justify-center sm:justify-between">
                    <h3 className='h3-bold text-center sm:text-left'>Events Organized</h3>
                    <Button asChild size="lg" className='button hidden sm:flex'>
                        <Link href="/events/create">
                            Create New Event
                        </Link>
                    </Button>
                </div>
            </section>

            <section className="wrapper my-8">
                <Collection
                    data={organizedEvents?.data}
                    emptyTitle="No event have been created"
                    emptyStateSubText="Go Create some events now"
                    collectionType="Events_Organized"
                    limit={6}
                    page={eventsPage}
                    urlParamName='eventsPage'
                    totalPages={organizedEvents?.totalPages}
                />
            </section>



        </>
    )
}

export default profilePage