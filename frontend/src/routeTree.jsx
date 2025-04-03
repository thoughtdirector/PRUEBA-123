import { createRoute, RootRoute, Router, redirect, createRootRoute } from '@tanstack/react-router'
import { z } from "zod"

// Import existing components
import useAuth, { isLoggedIn } from "./hooks/useAuth"
import Admin from './routes/elements/admin'
import DashboardLayout from './components/Layout/DashboardLayout'
import DashboardRouter from './routes/elements/dashboardRouter'
import Index from './routes/index'
import Login from './routes/login'
import Signup from './routes/signup'
import ResetPassword from './routes/reset-password'
import RecoverPassword from './routes/recover-password'
import Settings from './routes/elements/settings'
import Items from './routes/elements/items'
import Chatbot from './routes/elements/chatbot'
import ChatList from './components/Chat/chatList'
import ProjectList from './routes/elements/projectList'
import Project from './routes/elements/project'
import OrganizationList from './routes/elements/organizationList'
import NotFound from './components/Common/NotFound'
// Import the new ActivateOrganizationHandler
import ActivateOrganizationHandler from './routes/_activateOrganization'

import Clients from './components/Dashboard/Clients'
import ClientRegister from './components/Dashboard/ClientRegister'
import Plans from './components/Dashboard/Plans'
import PlanDetail from './components/Dashboard/PlanDetail'
import PlanCreate from './components/Dashboard/PlanCreate'
import PlanEdit from './components/Dashboard/PlanEdit'
import Reservations from './components/Dashboard/Reservations'
import ReservationCreate from './components/Dashboard/ReservationCreate'
import Reports from './components/Dashboard/Reports'
import VisitCheckIn from './components/Dashboard/VisitCheckIn'
import Payments from './components/Dashboard/Payments'
import PaymentCreate from './components/Dashboard/PaymentCreate'
import Notifications from './components/Dashboard/Notifications'
import NotificationCreate from './components/Dashboard/NotificationCreate'

// Import client components
import ClientPlans from './components/Client/Plans'
import PlanPurchase from './components/Client/PlanPurchase'
import PlanInstanceDetail from './components/Client/PlanInstanceDetail'
import PlanQRGenerator from './components/Client/PlanQRGenerator'
import ChildRegister from './components/Client/ChildRegister'

// Import the new temporary dashboard component
import TempDashboard from './components/Temp/TempDashboard'

import CheckInPage from './components/Temp/CheckInPage'

// Root route

const rootRoute =  createRootRoute({
  notFoundComponent: () => <NotFound />,})

// Schemas
const usersSearchSchema = z.object({ page: z.number().catch(1) })
const itemsSearchSchema = z.object({ page: z.number().catch(1) })
const pageSearchSchema = z.object({ page: z.number().catch(1) })

// Login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({ to: '/dashboard' })
    }
  },
})

// Layout route - updated to use our new DashboardLayout
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardLayout,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({ to: '/login' })
    }
  },
})

// New route for components that require organization activation
const activateOrgRoute = createRoute({
  getParentRoute: () => layoutRoute,
  id: 'activateOrg',
  component: ActivateOrganizationHandler,
})

// Routes that require organization activation
const adminRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/admin',
  component: Admin,
  validateSearch: (search) => usersSearchSchema.parse(search),
})

const chatbotRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/chat',
  component: Chatbot,
})

const projectRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/project',
  component: Project,
})


const dashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: DashboardRouter,
})

const chatListRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/chatlist',
  component: ChatList,
  validateSearch: (search) => pageSearchSchema.parse(search),
})

const projectListRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/projectlist',
  component: ProjectList,
  validateSearch: (search) => pageSearchSchema.parse(search),
})

const settingsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/settings',
  component: Settings,
})


const organizationListRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/organizations',
  component: OrganizationList,
})

const itemsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/items',
  component: Items,
  validateSearch: (search) => itemsSearchSchema.parse(search),
})

// Temporary Dashboard Route
const tempDashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/temp-dashboard',
  component: TempDashboard,
})

// Other routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Index,
})

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: Signup,
})

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reset-password',
  component: ResetPassword,
})

const recoverPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recover-password',
  component: RecoverPassword,
})



const clientsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/clients',
  component: Clients,
})

const clientRegisterRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/clients/register',
  component: ClientRegister,
})

// Plan routes
const plansRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/plans',
  component: Plans,
})

const planDetailRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/plans/$planId',
  component: PlanDetail,
})

const planCreateRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/plans/create',
  component: PlanCreate,
})

const planEditRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/plans/$planId/edit',
  component: PlanEdit,
})

// Reservation routes
const reservationsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/reservations',
  component: Reservations,
})

const reservationCreateRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/reservations/create',
  component: ReservationCreate,
})

// Visit routes
const visitCheckInRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/visits/check-in',
  component: VisitCheckIn,
})

// Payment routes
const paymentsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/payments',
  component: Payments,
})

const paymentCreateRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/payments/create',
  component: PaymentCreate,
})

// Notification routes
const notificationsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/notifications/create',
  component: NotificationCreate,
})

// Reports route
const reportsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/reports',
  component: Reports,
})

// Client routes
const clientPlansRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/client/plans',
  component: ClientPlans,
})

const planPurchaseRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/client/plans/$planId/purchase',
  component: PlanPurchase,
})

const planInstanceDetailRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/client/plan-instances/$instanceId',
  component: PlanInstanceDetail,
})

const planQRGeneratorRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/client/plan-qr-generator/$planInstanceId',
  component: PlanQRGenerator,
})

// Add the new child register route
const childRegisterRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/client/register-child',
  component: ChildRegister,
})

// Add the new route for check-in page
const checkInRoute = createRoute({
  getParentRoute: () => activateOrgRoute,
  path: '/check-in/$qrCodeId',
  component: CheckInPage,
})

// Create the route tree
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    activateOrgRoute.addChildren([
      adminRoute,
      dashboardRoute,
      chatbotRoute,
      clientsRoute,
      clientRegisterRoute,
      plansRoute,
      planDetailRoute,
      planCreateRoute,
      planEditRoute,
      reservationsRoute,
      reservationCreateRoute,
      visitCheckInRoute,
      paymentsRoute,
      paymentCreateRoute,
      notificationsRoute,
      reportsRoute,
      clientPlansRoute,
      planPurchaseRoute,
      planInstanceDetailRoute,
      planQRGeneratorRoute,
      childRegisterRoute,
      tempDashboardRoute,
      checkInRoute,
    ]),
    settingsRoute,

  ]),
  indexRoute,
  loginRoute,
  signupRoute,
  resetPasswordRoute,
  recoverPasswordRoute,
])

export default routeTree