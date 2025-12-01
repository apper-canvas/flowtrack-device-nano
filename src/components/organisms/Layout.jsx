import { Outlet } from "react-router-dom"
import { useAuth } from "@/layouts/Root"
import { useSelector } from "react-redux"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"

function Layout() {
  const { logout } = useAuth()
  const { user, isAuthenticated } = useSelector((state) => state.user)

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with logout button */}
      {isAuthenticated && (
        <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <ApperIcon name="ListTodo" className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    FlowTrack
                  </h1>
                  <p className="text-xs text-slate-500">Task Flow Management</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {user && (
                  <div className="text-sm text-slate-600">
                    Welcome, {user.firstName || user.emailAddress}
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <ApperIcon name="LogOut" className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}
      
      {/* Main content */}
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout