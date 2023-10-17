import React from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import '../styles/ErrorPage.css'
import Navbar from "../components/Navigation_Bar/Navbar";

const ErrorPage: React.FC = () => {
    const error = useRouteError();
    let errorMessage: string;

    if (isRouteErrorResponse(error)) {
        // error is type `ErrorResponse`
        errorMessage = error.data.message || error.statusText;
    } 
    else if (error instanceof Error) {
        errorMessage = error.message;
    } 
    else if (typeof error === 'string') {
        errorMessage = error;
    } 
    else {
        console.error(error);
        errorMessage = 'Unknown error';
    }

    return (
        <div className='ErrorPage'>
            <Navbar />
            <h1>Error Page</h1>
            <h2>Oops!</h2>
            <p>Sorry, an unexpected error has occurred.</p>
        </div>
    );
};

export default ErrorPage;