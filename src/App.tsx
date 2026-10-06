import { HashRouter, Routes, Route } from 'react-router'
import { Dashboard } from './Pages/Dashboard'
import { LoginPage } from './Pages/LoginPage'
import { SetupPage } from './Pages/SetupPage'

function App() {

  // async function loader({ request }: Route.LoaderArgs) {
  // if (!isLoggedIn(request))
  //   throw redirect("/login");
  // }

  return (
    <div className="dottedBackground w-full h-svh">
      <div  className="min-h-svh bg-base-100 text-base-content w-full md:w-[1000px] lg:mx-auto">
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
  )
}

export default App
