import React, { useEffect } from 'react';

interface PageProps {
    title: string;
    children: React.ReactNode;
}

function PageTitle({ title, children }: PageProps) {
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