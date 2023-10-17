import {useState} from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";
import {FaBars, FaTimes} from "react-icons/fa";
import {IconContext} from "react-icons/lib";

function Navbar() 
{
    const [click, setClick] = useState(false)

    const handleClick = () => setClick(!click)
    const closeMobileMenu = () => setClick(false)

    return (
        <>
        <IconContext.Provider value = {{color: "white"}}>
            <nav className="navbar">
                <div className="navbar-container container">
                    <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
                        {/* Add logo here */}
                        <div className="navbar-title"> ASU Rideshare App </div>
                    </Link>
                    <div className="menu-icon" onClick={handleClick}> {click ? <FaTimes /> : <FaBars /> } </div>
                    <ul className={click ? "nav-menu active" : "nav-menu"}>
                        <li className="nav-item">
                            <NavLink to="/" className={({ isActive }) => "nav-links" + (isActive ? " activated" : "")} onClick = {closeMobileMenu}>
                                Home
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/requestride" className={({ isActive }) => "nav-links" + (isActive ? " activated" : "")} onClick = {closeMobileMenu}>
                                Ride Request/Rider Request
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/profile" className={({ isActive }) => "nav-links" + (isActive ? " activated" : "")} onClick = {closeMobileMenu}>
                                Profile
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/login" className={({ isActive }) => "nav-links" + (isActive ? " activated" : "")} onClick = {closeMobileMenu}>
                                Login/Register
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </nav>
        </IconContext.Provider>
        </>
    )
}

export default Navbar;