// src/app/components/UserInfo.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const UserInfo = () => {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (status === 'loading') {
            // Session is still loading
            return
        }

        if (session?.user?.email) {
            // User is authenticated, use the email from session
            setUserEmail(session.user.email)
        } else {
            // Not authenticated, check localStorage for demo email
            const storedEmail = localStorage.getItem('userEmail')
            if (storedEmail) {
                setUserEmail(storedEmail)
            }
        }

        setLoading(false)
    }, [session, status])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    // Function to get initials from email
    const getInitialsFromEmail = (email: string): string => {
        // Extract the part before @ and get first two characters in uppercase
        const usernamePart = email.split('@')[0]
        return usernamePart.substring(0, 2).toUpperCase()
    }

    const handleLogout = async () => {
        // Clear localStorage demo email
        localStorage.removeItem('userEmail')

        // Sign out from NextAuth
        await signOut({ redirect: false })

        // Close dropdown
        setDropdownOpen(false)

        // Redirect to signin page
        router.push('/auth/signin')
    }

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen)
    }

    if (loading || status === 'loading') {
        return (
            <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="hidden md:block h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
            </div>
        )
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
            >
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                    {userEmail ? getInitialsFromEmail(userEmail) : 'GU'}
                </div>
                <span className="text-gray-700 font-medium hidden md:block">
                    {userEmail || 'Guest User'}
                </span>
                <svg
                    className={`h-4 w-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-full sm:w-64 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm text-gray-700 font-medium break-words">{userEmail}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {session ? 'Authenticated' : 'Demo Mode'}
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                        Sign out
                    </button>
                </div>
            )}
        </div>
    )
}

export default UserInfo