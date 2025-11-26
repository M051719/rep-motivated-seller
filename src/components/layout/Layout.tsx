import React from 'react'
import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'
import Footer from './Footer'
import { Toaster } from 'react-hot-toast'

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  )
}

export default Layout