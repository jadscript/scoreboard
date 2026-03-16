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
  component: LoginPage,
})

const scoreboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scoreboard',
  component: ScoreboardPage,
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
