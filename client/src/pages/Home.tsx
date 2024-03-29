import "../styles/Home.css";
import PageTitle from "../components/PageTitle/PageTitle";

function Home() {
    return (
        <PageTitle title="Home">
            <main id="home">
                <section className="hero">
                    <div className="heroText">
                        <h1>Better Commuting for Sun Devils</h1>
                        <p>
                            ASU Rideshare makes it easy to request and offer rides within the
                            ASU community.
                        </p>
                    </div>
                </section>

                <section className="instructions-container">
                    <div className="rider-container">
                        <h3>Riders</h3>

                        <ul className="rider-steps">
                            <li>Open app and enter pickup location</li>
                            <li>Browse drivers and select one headed your way</li>
                            <li>Wait at pickup spot for your driver</li>
                        </ul>
                    </div>

                    <div className="driver-container">
                        <h3>Drivers</h3>
                        <ul className="driver-steps">
                            <li>Open app and enter route details</li>
                            <li>Browse ride requests along your way</li>
                            <li>Pick up riders at designated spots</li>
                        </ul>
                    </div>
                </section>
                <section className="cancelPolicy">
                    <p>
                        Cancellation Policy: If you need to cancel your ride request, please
                        do so at least 2 hours before the scheduled pickup time. Last minute
                        cancellations leave drivers unable to fill the open seat. To be fair
                        to our community, riders may be banned for repeated last-minute
                        cancellations.
                    </p>
                </section>
            </main>
        </PageTitle>
    );
}

export default Home;
