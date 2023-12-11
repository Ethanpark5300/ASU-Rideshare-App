import '../styles/Report.css';
import Navbar from "../components/Navigation_Bar/Navbar";
import PageTitle from '../components/Page_Title/PageTitle';

function Report()
{
    return (
        <PageTitle title="Report">
            <Navbar />
            <div className="Report">
                <h1> Report User</h1>
            </div>
        </PageTitle>
    )
}

export default Report;