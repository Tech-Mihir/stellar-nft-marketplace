import { NavLink } from 'react-router-dom'

export function Navigation() {
  return (
    <nav className="flex items-center gap-1" aria-label="Main navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center ${
            isActive ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`
        }
      >
        Home
      </NavLink>
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center ${
            isActive ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`
        }
      >
        Dashboard
      </NavLink>
      <NavLink
        to="/staking"
        className={({ isActive }) =>
          `px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center ${
            isActive ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`
        }
      >
        Staking
      </NavLink>
    </nav>
  )
}
