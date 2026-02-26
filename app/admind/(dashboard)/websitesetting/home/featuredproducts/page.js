'use client'

import React from 'react'
import { useAdminContext } from '@/app/context/AdminContext'

function page() {

    const { saveFeaturedProductsContent } = useAdminContext();

    return (
        <div>
            <h1>Featured Products</h1>
        </div>
    )
}

export default page