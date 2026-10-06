import { HashRouter, Routes, Route } from 'react-router'
import { UserProvider } from './context/UserContext'
import { Dashboard } from './Pages/Dashboard'
import { LoginPage } from './Pages/LoginPage'
import { SetupPage } from './Pages/SetupPage'

function App() {

  // async function loader({ request }: Route.LoaderArgs) {
  // if (!isLoggedIn(request))
  //   throw redirect("/login");
  // }

  // UserProvider sits outside the router so every route, guard, and the
  // navbar can read the session via useUser().
  return (
    // Context provider
    <UserProvider>
    <div className="dottedBackground w-full h-svh">
      <div  className="">
        <HashRouter>
          <Routes>
            <Route path='/' element={<Dashboard />} />
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </HashRouter>
      </div>  
    </div>
    </UserProvider>
  )
}

export default App
