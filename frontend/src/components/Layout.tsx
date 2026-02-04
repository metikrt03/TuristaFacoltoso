import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-20 min-h-screen">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="mt-16 lg:mt-0">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
