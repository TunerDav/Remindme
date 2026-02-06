import { Link, useLocation } from '@tanstack/react-router'
import { Home, Users, Bell, UsersRound, CalendarClock } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: Home, label: 'Start' },
  { href: '/contacts', icon: Users, label: 'Menschen' },
  { href: '/invite-groups', icon: UsersRound, label: 'Einladungen' },
  { href: '/events', icon: CalendarClock, label: 'Termine' },
  { href: '/reminders', icon: Bell, label: 'Erinnerungen' },
]

export function BottomNav() {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div
                className={cn(
                  'p-1.5 rounded-xl transition-all duration-200',
                  isActive && 'bg-primary/10'
                )}
              >
                <item.icon
                  className={cn('h-5 w-5', isActive && 'stroke-[2.5px]')}
                />
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium',
                  isActive && 'font-semibold'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

