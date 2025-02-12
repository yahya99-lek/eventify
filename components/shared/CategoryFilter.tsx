'use client'
import React, { useEffect, useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRouter, useSearchParams } from 'next/navigation';
import { formUrlQuery, removeKeysFromQuery } from '@/lib/utils';
import { getAllCategories } from '@/lib/actions/category.actions';
import { ICategory } from '@/lib/database/models/category.model';


const CategoryFilter = () => {

    const [categories, setCategories] = useState<ICategory[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const getCategories = async () => {
            const categoriList = await getAllCategories();
            categoriList && setCategories(categoriList as ICategory[]);
        }
        getCategories();
    }, [])

    const onSelectCategory = (category: string) => {
        let newUrl = '';
        if (category === 'All') {
            // Remove 'category' filter from the URL when "All" is selected
            newUrl = removeKeysFromQuery({
                params: searchParams.toString(),
                keysToRemove: ['category'],
            });
        } else {
            // Update the URL with the selected category
            newUrl = formUrlQuery({
                params: searchParams.toString(),
                key: 'category',
                value: category
            });
        }
        // Push the new URL to the router without triggering a full page reload
        router.push(newUrl, { scroll: false });
    };


    return (
        <Select onValueChange={(value: string) => onSelectCategory(value)}>
            <SelectTrigger className="select-field">
                <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="All" className='select-item
                p-regular-14'>All</SelectItem>
                {categories.map((category) => (
                    <SelectItem key={category._id} value={category.name} className='select-item p-regular-14'>
                        {category.name}
                    </SelectItem>
                ))}

            </SelectContent>
        </Select>

    )
}

export default CategoryFilter