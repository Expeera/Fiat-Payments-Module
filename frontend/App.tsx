import React from "react"

/*
 * Import canister definitions like this:
 */
import {
  BrowserRouter,
  Route,
  Router,
  Routes,
  useNavigate,
} from "react-router-dom"
import { Showcase } from "./components/showcase"
import { DefaultLayout } from "./components/Layouts/Default"
import { ToastContainer } from "react-toastify"
import { Authenticated } from "./Guards/Authenticated"
import { Login } from "./components/pages/Login"
import "react-toastify/dist/ReactToastify.css"
import { AuthClient } from "@dfinity/auth-client"
import { useAuthClient, Invoice } from "./Hooks/UseAuthClient"

import { ActorSubclass } from "@dfinity/agent"
import { UsersManagement } from "./components/pages/UsersManagement"
import { _SERVICE } from "./declarations/fiat/fiat.did"
import Form from "./components/pages/Form"
import Success from "./components/pages/Success"
import Admin from "./components/pages/Admin"
import Cancel from "./components/pages/Cancel"
import "bootstrap/dist/css/bootstrap.min.css"
import MyInvoices from "./components/pages/myInvoices"

interface AppStateInterface {
  authClient?: AuthClient
  loading: boolean
  setAuthClient?: React.Dispatch<AuthClient>
  isAuthenticated?: boolean | null
  setIsAuthenticated?: React.Dispatch<React.SetStateAction<boolean | null>>
  login: () => void
  logout: () => void
  actor: ActorSubclass<_SERVICE>
  hasLoggedIn: boolean
  isOwner?: () => boolean | Promise<boolean>
  loadingUser: boolean
  balance: string
}
const INITIAL_APP_STATE = {
  isAuthenticated: false,
  loading: false,
  user: null,
  login: () => {},
  logout: () => {},
  hasLoggedIn: false,
  isOwner: async () => {
    return false
  },
  nftActor: undefined,
  ledgerActor: undefined,
  loadingUser: true,
  balance: "0.0",
}
export const AppContext =
  React.createContext<AppStateInterface>(INITIAL_APP_STATE)

// @todo take all the strings to a seperate file and import them here
// @todo take the routing logic out of the app component
function App() {
  const {
    authClient,
    setAuthClient,
    isAuthenticated,
    setIsAuthenticated,
    login,
    logout,
    actor,
    loading,
    isOwner,
    hasLoggedIn,
    balance,
    loadingUser,
  } = useAuthClient()

  return (
    <AppContext.Provider
      value={{
        authClient,
        setAuthClient,
        isAuthenticated,
        loading,
        setIsAuthenticated,
        login,
        logout,
        isOwner,
        actor,
        hasLoggedIn,
        balance,
        loadingUser,
      }}
    >
      {/*
      radial-gradient(circle at 50% 100%,#d7cdeb,#fff)

// radial-gradient(circle at 50% 100%,#d7cdeb,fff)
      radial-gradient(circle at 50% 100%,#d7cdeb,fff)
      */}
      <div className="App">
        {/* fixed loader that wouldnt appear unless loading is true also , it is fixed spinner with primary color  */}
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<DefaultLayout />}>
              <Route path="login" element={<Login />}></Route>
            </Route>
            <Route
              path="stripe/success/:invoiceNo/:sessionId"
              element={<Success />}
            />
            <Route
              path="stripe/cancel/:invoiceNo/:sessionId"
              element={<Cancel />}
            />

            <Route path="paypal/success/:invoiceNo" element={<Success />} />
            <Route path="paypal/cancel/:invoiceNo" element={<Cancel />} />

            <Route path="/invoice" element={<Form />} />
            <Route path="/myinvoices" element={<MyInvoices />} />
            <Route path="/admin" element={<Admin />} />
            <Route
              path="/"
              element={
                <Authenticated>
                  <DefaultLayout />
                </Authenticated>
              }
            ></Route>
          </Routes>
        </BrowserRouter>
        <ToastContainer />
      </div>
    </AppContext.Provider>
  )
}

export default React.memo(App)
