'use client'

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { formUrlQuery, removeKeysFromQuery } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Search Component
 * 
 * This component provides a search input field that updates the URL query parameters
 * dynamically based on the user's input. It uses a debounced effect to prevent excessive
 * updates while typing.
 * 
 * Features:
 * - Debounced search input (300ms delay)
 * - Updates the URL query parameters dynamically
 * - Removes the search query from the URL if the input is empty
 * - Uses Next.js `useRouter` and `useSearchParams` for navigation and query handling
 */
const Search = ({ placeholder = 'Search Title' }: { placeholder?: string }) => {
    // State to store the search query input
    const [query, setQuery] = useState('');

    // Next.js router instance for updating the URL
    const router = useRouter();

    // Get the current search parameters from the URL
    const searchParams = useSearchParams();

    /**
     * Effect hook to handle query updates with debounce.
     * - When the query changes, it updates the URL.
     * - If the query is empty, it removes the 'query' key from the URL.
     * - Uses a 300ms debounce to avoid excessive URL updates while typing.
     */
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            let newUrl = '';

            if (query) {
                // Update the URL with the new query parameter
                newUrl = formUrlQuery({
                    params: searchParams.toString(),
                    key: 'query',
                    value: query
                });
            } else {
                // Remove 'query' from the URL if input is empty
                newUrl = removeKeysFromQuery({
                    params: searchParams.toString(),
                    keysToRemove: ['query'],
                });
            }

            // Push the new URL to the router without triggering a full page reload
            router.push(newUrl, { scroll: false });
        }, 300);

        // Cleanup function to clear timeout when the component unmounts or query changes
        return () => clearTimeout(delayDebounceFn);
    }, [query, router, searchParams]);

    return (
        <div className='flex-center min-h-[54px] w-full overflow-hidden
        rounded-full bg-green-50 px-4 py-2'>
            {/* Search Icon */}
            <Image src="/assets/icons/search.svg" alt='search' width={24} height={24} />

            {/* Search Input Field */}
            <Input
                type='text'
                placeholder={placeholder}
                onChange={(e) => setQuery(e.target.value)}
                className='p-regular-16 border-0 bg-grey-50 outline-offset-0
            placeholder:text-grey-500 focus:border-0 focus-visible:ring-0 
            focus-visible:ring-offset-0'
            />
        </div>
    );
};

export default Search;
