// Analysis.tsx
import React, { useEffect, useState } from 'react';

const Analysis = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Function to run the analysis
    const runAnalysis = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('API_ENDPOINT');
            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }
            const result = await response.json();
            setData(result);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Effect to validate the API key and run analysis on mount
    useEffect(() => {
        const apiKey = process.env.REACT_APP_API_KEY;
        if (!apiKey) {
            setError('API key is missing. Please set your API key.');
            return;
        }
        runAnalysis();
    }, []);

    return (
        <div>
            <h1>Analysis Results</h1>
            {loading ? <p>Loading...</p> : error ? <p>{error}</p> : <pre>{JSON.stringify(data, null, 2)}</pre>}
        </div>
    );
};

export default Analysis;
