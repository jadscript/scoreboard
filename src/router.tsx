import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router'
import { LoginPage } from './pages/Login'
import { ScoreboardPage } from './pages/Scoreboard'
import { PlayersPage } from './pages/players'

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ScoreboardPage,
})

const scoreboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const playersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/players',
  component: PlayersPage,
})

const routeTree = rootRoute.addChildren([loginRoute, scoreboardRoute, playersRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
