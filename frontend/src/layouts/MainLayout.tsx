import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Icon } from "../components/Icon";

const navLinkBase = "inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 hover-lift";
const navLinkActive = "bg-primary text-primary-content shadow-lg";
const navLinkInactive = "text-base-content hover:bg-base-200 hover:text-primary";

export default function MainLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-base-100">
      <header className="sticky top-0 z-50 border-b border-base-300 bg-base-200/80 backdrop-blur-xl shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link 
            to="/" 
            className="text-2xl font-extrabold text-gradient animate-pulse-slow hover:scale-110 transition-transform duration-300"
          >
            <Icon name="school" className="mr-2 text-3xl animate-float" /> Edu Learn Pro
          </Link>
          <nav className="flex items-center gap-3">
            <NavLink
              to="/catalog"
              className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive}`}
            >
              <Icon name="menu_book" className="mr-2 text-xl" /> Catalog
            </NavLink>
            {user && (
              <NavLink
                to={user.role === "instructor" ? "/instructor" : "/student"}
                className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive}`}
              >
                <Icon name="query_stats" className="mr-2 text-xl" /> Dashboard
              </NavLink>
            )}
            {user && (
              <NavLink
                to="/profile"
                className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive}`}
              >
                <Icon name="account_circle" className="mr-2 text-xl" /> Profile
              </NavLink>
            )}
            {user ? (
              <button
                onClick={logout}
                className="inline-flex items-center rounded-xl bg-base-300 px-5 py-2 text-sm font-semibold text-base-content shadow-lg transition-all hover:scale-110 hover:shadow-xl"
              >
                <Icon name="logout" className="mr-2 text-base" /> Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-content shadow-lg transition-all hover:scale-110 hover:shadow-xl"
              >
                <Icon name="lock" className="mr-2 text-base" /> Login
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto flex-1 max-w-7xl w-full px-4 py-8">
        <Outlet />
      </main>
      <footer className="mt-auto border-t border-base-300 bg-primary text-primary-content shadow-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-sm">
          <span className="font-semibold">© {new Date().getFullYear()} Edu Learn Pro. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-primary-content/80 transition-colors font-medium hover:scale-110 inline-block">About</Link>
            <Link to="/contact" className="hover:text-primary-content/80 transition-colors font-medium hover:scale-110 inline-block">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
