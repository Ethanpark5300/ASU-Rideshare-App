import { Link } from "react-router-dom";
import "./NavigationBar.css";
import Navbar_Logo from "./Navbar-Logo.svg";
import { useEffect } from "react";
import { useAppSelector } from "../../store/hooks";
import { Account, AccountTypeFlag } from "../../account/Account";

function Navbar() {
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

        // Cleanup function to remove event listeners when the component unmounts
        return () => {
            hamburgerEl.removeEventListener('click', toggleNav);
            navItemEls.forEach((navItemEl) => {
                navItemEl.removeEventListener('click', closeNav);
            });
        };
    }, []);

    const account = useAppSelector((state) => state.account);

	// console.log(account?.account?.accountType);

    return (
        <nav>
            <div className="navbar-content">
                <Link to="/" className="navbar-logo">
                    <img className="logo__img" src={Navbar_Logo} alt="logo" />
                    <span className="logo__text">ASU Rideshare App</span>
                </Link>

                <div className="navbar-links">
                    {/* Rider Navbar */}
                    
					
						{
						((account?.account?.accountType & (AccountTypeFlag.Rider | AccountTypeFlag.Driver)) !== 0) && (
							<ul className="nav__list">
								
									<li className="nav__item">
										<Link className="nav__link fromLeft" to="/">Home</Link>
									</li>
									<li className="nav__item">
										<Link className="nav__link fromLeft" to="/Profile">Profile</Link>
									</li>
									{/* Drivers get a single extra tab, for now */ }
											{
												((account?.account?.accountType & AccountTypeFlag.Driver) !== 0) && (
													<li className="nav__item">
														<Link className="nav__link fromLeft" to="/FavoritesList">Favorites</Link>
													</li>
												)
											}
									<li className="nav__item">
										<Link className="nav__link fromLeft" to="/BlockedList">Blocked</Link>
									</li>
									<li className="nav__item">
										<Link className="nav__link fromLeft" to="/RideHistory">Ride History</Link>
									</li>
									<li>
										<Link to="/RequestRide">
											<button>Request Ride</button>
										</Link>
									</li>
								
								</ul>
							)
						}
                        
                     

                    {/* Driver Navbar */}
                    {/*{*/}
                    {/*    (account?.account?.accountType & AccountTypeFlag.Driver) && (*/}
                    {/*        <ul className="nav__list">*/}
                    {/*            <li className="nav__item">*/}
                    {/*                <Link className="nav__link fromLeft" to="/">Home</Link>*/}
                    {/*            </li>*/}
                    {/*            <li className="nav__item">*/}
                    {/*                <Link className="nav__link fromLeft" to="/Profile">Profile</Link>*/}
                    {/*            </li>*/}
                    {/*            <li className="nav__item">*/}
                    {/*                <Link className="nav__link fromLeft" to="/BlockedList">Blocked</Link>*/}
                    {/*            </li>*/}
                    {/*            <li className="nav__item">*/}
                    {/*                <Link className="nav__link fromLeft" to="/RideHistory">Ride History</Link>*/}
                    {/*            </li>*/}
                    {/*            <li>*/}
                    {/*                <Link to="/ChooseRider">*/}
                    {/*                    <button>View Requests</button>*/}
                    {/*                </Link>*/}
                    {/*            </li>*/}
                    {/*        </ul>*/}
                    {/*    )*/}
                    {/*}*/}

                    {/* Guest Navbar */}
                    {
                        (!account.account || ((account.account.accountType & AccountTypeFlag.None) !== 0)) && (
                            <ul className="nav__list">
                                <li>
                                    <Link to="/Login">
                                        <button>Login</button>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/Register">
                                        <button>Register</button>
                                    </Link>
                                </li>
                            </ul>
                        )
                    }
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