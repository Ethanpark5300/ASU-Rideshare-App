import '../styles/Settings.css';
import Navbar from "../components/Navigation_Bar/Navbar";
import PageTitle from '../components/Page_Title/PageTitle';

function Settings() 
{
    return (
        <PageTitle title="Settings">
            <Navbar />
            <div className='Settings'>
                <h1>Settings</h1>
            </div>
        </PageTitle>
    );
}

export default Settings;