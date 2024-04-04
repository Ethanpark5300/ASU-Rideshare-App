import { Link, useNavigate } from "react-router-dom";
import "./NavigationBar.css";
import Navbar_Logo from "./Navbar-Logo.svg";
import { useCallback, useEffect, useState } from "react";
import { useAppSelector } from "../../store/hooks";
import { AccountTypeFlag } from "../../account/Account";

function Navbar() {
    const account = useAppSelector((state) => state.account);
    const [userType, setUserType] = useState();
    const navigate = useNavigate();

    useEffect(() => {
        const navEl = document.querySelector('.navbar-links') as HTMLElement;
        const hamburgerEl = document.querySelector('.hamburger') as HTMLElement;
        const navItemEls = document.querySelectorAll('.nav__item') as NodeListOf<HTMLElement>;

        const toggleNav = () => {
            navEl.classList.toggle('nav--open');
            hamburgerEl.classList.toggle('hamburger--open');
        };

        const closeNav = () => {
            navEl.classList.remove('nav--open');
            hamburgerEl.classList.remove('hamburger--open');
        };

        hamburgerEl.addEventListener('click', toggleNav);
        navItemEls.forEach((navItemEl) => {
            navItemEl.addEventListener('click', closeNav);
        });

        return () => {
            hamburgerEl.removeEventListener('click', toggleNav);
            navItemEls.forEach((navItemEl) => {
                navItemEl.removeEventListener('click', closeNav);
            });
        };
    }, []);

    const getAccountInformation = useCallback(async () => {
        try {
            const response = await fetch(`/view-account-info?accountEmail=${account?.account?.email}`);
            const data = await response.json();
            if (data.account) setUserType(data.account.Type_User);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [account?.account?.email]);

    useEffect(() => {
        getAccountInformation();
    }, [getAccountInformation]);

    return (
        <nav>
            <div className="navbar-content">
                <Link to="/" className="navbar-logo">
                    <img className="logo__img" src={Navbar_Logo} alt="logo" />
                    <span className="logo__text">ASU Rideshare App</span>
                </Link>

                <div className="navbar-links">

                    {/** Rider navbar */}
                    {(userType === 1) && (
                        <ul className="nav__list">
                            <li className="nav__item">
                                <Link className="nav__link fromLeft" to="/">Home</Link>
                            </li>
                            <li className="nav__item">
                                <Link className="nav__link fromLeft" to="/Profile">Profile</Link>
                            </li>
                            <li className="nav__item">
                                <Link className="nav__link fromLeft" to="/FavoritesList">Favorites</Link>
                            </li>
                            <li className="nav__item">
                                <Link className="nav__link fromLeft" to="/BlockedList">Blocked</Link>
                            </li>
                            <li className="nav__item">
                                <Link className="nav__link fromLeft" to="/RideHistory">Ride History</Link>
                            </li>
                            <li>
                                <button onClick={() => navigate("/RequestRide")}>Request Ride</button>
                            </li>
                        </ul>
                    )}

                    {/** Driver navbar */}
                    {(userType === 2) && (
                        <ul className="nav__list">
                            <li className="nav__item">
                                <Link className="nav__link fromLeft" to="/">Home</Link>
                            </li>
                            <li className="nav__item">
                                <Link className="nav__link fromLeft" to="/Profile">Profile</Link>
                            </li>
                            <li className="nav__item">
                                <Link className="nav__link fromLeft" to="/FavoritesList">Pending Favorites</Link>
                            </li>
                            <li className="nav__item">
                                <Link className="nav__link fromLeft" to="/BlockedList">Blocked</Link>
                            </li>
                            <li className="nav__item">
                                <Link className="nav__link fromLeft" to="/RideHistory">Ride History</Link>
                            </li>
                            <li>
                                <button onClick={() => navigate("/ChooseRider")}>Pending Requests</button>
                            </li>
                        </ul>
                    )}

                    {/** Guest navbar */}
                    {(!account.account || ((account.account.accountType & AccountTypeFlag.None) !== 0)) && (
                        <ul className="nav__list">
                            <li>
                                <button onClick={() => navigate("/Login")}>Login</button>
                            </li>
                            <li>
                                <button onClick={() => navigate("/Register")}>Register</button>
                            </li>
                        </ul>
                    )}
                </div>

                <div className="hamburger">
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;