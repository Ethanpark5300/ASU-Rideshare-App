import '../styles/Home.css';
import Navbar from "../components/Navigation_Bar/Navbar";

function Home() 
{
    return (
        <div className='Home'>
            <Navbar />
            <h1>ASU Rideshare</h1>

            <p>This is an app designed to help ASU students conveniently share rides. 
                Whether you need a lift to campus or are offering an open seat in your car, ASU Rideshare makes it easy to request and offer rides within the ASU community.</p>

            <p id="cancelPolicy">Cancellation Policy: If you need to cancel your ride request, please do so at least 2 hours before the scheduled pickup time. 
                Last minute cancellations leave drivers unable to fill the open seat. To be fair to our community, riders may be banned for repeated last-minute cancellations.</p>
        </div>
    );
}

export default Home;
