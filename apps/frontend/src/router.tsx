import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router'
import { LoginPage } from './pages/Login'
import { ScoreboardPage } from './pages/scoreboard'
import { PlayersPage } from './pages/players'
// import { GamePage } from './pages/game'
import { RankingPage } from './pages/ranking'
import { HomePage } from './pages/home'

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const gameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
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

const rankingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ranking',
  component: RankingPage,
})

const routeTree = rootRoute.addChildren([
  gameRoute,
  loginRoute,
  scoreboardRoute,
  playersRoute,
  rankingRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
