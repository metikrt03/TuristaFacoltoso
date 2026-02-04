import { Link, useLocation } from 'react-router-dom'
import { 
  Home, Users, Hotel, Building2, Calendar, 
  MessageSquare, BarChart3, Menu, X, Moon, Sun 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'
import { useState } from 'react'

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/utenti', label: 'Utenti', icon: Users },
  { path: '/host', label: 'Host', icon: Hotel },
  { path: '/abitazioni', label: 'Abitazioni', icon: Building2 },
  { path: '/prenotazioni', label: 'Prenotazioni', icon: Calendar },
  { path: '/feedback', label: 'Feedback', icon: MessageSquare },
  { path: '/report', label: 'Report', icon: BarChart3 },
]

export default function Sidebar() {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-20 lg:w-20
          bg-card border-r border-border
          flex flex-col items-center py-6
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center">
          <img src="/logo.png" alt="Turista Facoltoso" className="h-10 w-10 object-contain" />
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                title={item.label}
                className={`
                  relative flex items-center justify-center w-12 h-12 rounded-lg mx-auto
                  transition-all duration-200
                  ${isActive
                    ? 'text-foreground bg-[#2563eb]/10'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                {isActive && (
                  <span className="absolute left-0 w-1 h-6 bg-[#2563eb] rounded-r-full" />
                )}
                <Icon className="h-5 w-5" />
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto space-y-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Modalità scura' : 'Modalità chiara'}
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>
      </aside>
    </>
  )
}
