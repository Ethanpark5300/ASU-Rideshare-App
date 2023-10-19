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

            <h2>Cancellation Policy</h2>
            <p>Cancellation Policy</p>
        </div>
    );
}

export default Home;
