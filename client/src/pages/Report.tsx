import '../styles/Report.css';
import Navbar from "../components/Navigation_Bar/Navbar";
import PageTitle from '../components/Page_Title/PageTitle';

function Report()
{
    return (
        <PageTitle title="report">
            <Navbar />
            <main id="report">
                <h1> Report User</h1>
            </main>
        </PageTitle>
    )
}

export default Report;