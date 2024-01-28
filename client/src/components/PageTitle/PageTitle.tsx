import React, { useEffect } from 'react';

interface PageProps {
    title: string;
    children: React.ReactNode;
}

const PageTitle: React.FC<PageProps> = ({ title, children }) => {
    useEffect(() => {
        document.title = title;
    }, [title]);

    return (
        <div>
            {children}
        </div>
    );
}

export default PageTitle;
