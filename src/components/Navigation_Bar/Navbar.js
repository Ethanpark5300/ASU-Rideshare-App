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
        <IconContext.Provider value = {{color: "#800000"}}>
            <nav className="navbar">
                <div className="navbar-container container">
                    <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
                        
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
                                Request a Ride
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/trackride" className={({ isActive }) => "nav-links" + (isActive ? " activated" : "")} onClick = {closeMobileMenu}>
                                Track Ride
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/ridehistory" className={({ isActive }) => "nav-links" + (isActive ? " activated" : "")} onClick = {closeMobileMenu}>
                                Ride History
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/payment" className={({ isActive }) => "nav-links" + (isActive ? " activated" : "")} onClick = {closeMobileMenu}>
                                Payment
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/profile" className={({ isActive }) => "nav-links" + (isActive ? " activated" : "")} onClick = {closeMobileMenu}>
                                Profile
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