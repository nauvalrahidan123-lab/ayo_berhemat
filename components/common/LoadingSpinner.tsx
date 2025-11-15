import React from 'react';

const FullPageLoader: React.FC<{ message?: string }> = ({ message = "Memuat..." }) => {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col justify-center items-center text-center p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[var(--accent)] mb-4"></div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">{message}</p>
            <p className="text-[var(--text-secondary)]">Harap tunggu sebentar.</p>
        </div>
    )
}


export default FullPageLoader;
