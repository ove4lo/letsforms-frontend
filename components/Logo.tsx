import Link from 'next/link'
import React from 'react'

function Logo() {
    return (
        <Link href={"/"} className="font-bold text-3xl text-white text-transparent bg-clip-text hover:cursor-pointer">
            LetsForms
        </Link>
    )
}

export default Logo