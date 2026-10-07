import { HashRouter, Routes, Route } from 'react-router'
import { StoresDashboard } from './Pages/StoresDashboard'
import { StoreDashboard } from './Pages/StoreDashboard'
import { LoginPage } from './Pages/LoginPage'
import { SetupPage } from './Pages/SetupPage'
import { PrivateRoute, RoleRoute, JurisdictionGuard, RoleLanding } from './components/guards'
import { Layout } from './components/Layout'

function App() {
  // Public pages (login/setup) render without the navbar.
  // Everything else requires a session and lives under Layout.
  return (
    <div className="dottedBackground w-full h-svh">
      <div className="">
        <HashRouter>
          <Routes>
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<RoleLanding />} />
                <Route element={<RoleRoute allowed={["owner"]} />}>
                  <Route path="/stores" element={<StoresDashboard />} />
                </Route>
                <Route element={<JurisdictionGuard />}>
                  <Route path="/stores/:storeId" element={<StoreDashboard />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </HashRouter>
      </div>
    </div>
  )
}

export default App
