import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router'
import { LoginPage } from './pages/Login'
import { ScoreboardPage } from './pages/scoreboard'
import { HomePage } from './pages/home'
import { OnboardingPage } from './pages/onboarding'

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

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  component: OnboardingPage,
})

const scoreboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scoreboard',
  component: ScoreboardPage,
})

const routeTree = rootRoute.addChildren([
  gameRoute,
  loginRoute,
  onboardingRoute,
  scoreboardRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
