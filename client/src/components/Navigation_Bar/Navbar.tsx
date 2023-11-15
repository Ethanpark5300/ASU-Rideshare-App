import { Link } from "react-router-dom";
import "./Navbar.css";
import ASU_Logo from "../../images/ASU-Logo.svg";
import { useEffect } from "react";
import { useAppSelector } from "../../store/hooks";
import { Account } from "../../account/Account";

function Navbar() {
    useEffect(() => {
        const navEl = document.querySelector('.nav') as HTMLElement;
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

        // Cleanup function to remove event listeners when the component unmounts
        return () => {
            hamburgerEl.removeEventListener('click', toggleNav);
            navItemEls.forEach((navItemEl) => {
                navItemEl.removeEventListener('click', closeNav);
            });
        };
    }, []);

    const account = useAppSelector((state)=>state.account);

    return (
        <div className="navbar">
            <header className="header">
                <div className="bottom-bar">
                    <div className="bottom-bar__content">
                        <Link to="/" className="logo">
                            <img className="logo__img" src={ASU_Logo} alt="logo" />
                            <span className="logo__text">ASU Rideshare App</span>
                        </Link>

                        <nav className="nav">
                            {/* Signed in Navbar */}
                            { 
                                (account.account) && (
                                    <ul className="nav__list">
                                        <li className="nav__item">
                                            <Link className="nav__link fromLeft" to="/"> Home </Link>
                                        </li>
                                        <li className="nav__item">
                                            <Link className="nav__link fromLeft" to="/Profile"> Profile </Link>
                                        </li>
                                        <li className="nav__button-item">
                                            <Link className="btn" to="/RequestRide"> Request Ride </Link>
                                        </li>
                                    </ul>
                                )
                            }

                            {/* Guest Navbar */}
                            {
                                (!account.account) && (
                                    <ul className="nav__list">
                                        <li className="nav__item">
                                            <Link className="btn" to="/Login"> Login </Link>
                                        </li>
                                        <li className="nav__item">
                                            <Link className="btn" to="/Register"> Register </Link>
                                        </li>
                                    </ul>
                                )
                            }
                            
                        </nav>

                        <div className="hamburger">
                            <div className="bar"></div>
                            <div className="bar"></div>
                            <div className="bar"></div>
                        </div>
                    </div>
                </div>
            </header>
        </div>
    )
}

export default Navbar;