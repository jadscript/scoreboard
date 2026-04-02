import { Link } from "@tanstack/react-router";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-md mx-auto">
      <Link to="/">Home</Link>
    </nav>
  )
}

export default Navbar;