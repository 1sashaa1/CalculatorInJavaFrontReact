import React from 'react';
import { Alert } from 'react-bootstrap';

const Result = ({ result }) => {
    if (result === null) return null;

    return (
        <Alert variant="success" className="mt-3">
            <Alert.Heading>Результат:</Alert.Heading>
            <p>{result}</p>
        </Alert>
    );
};

export default Result;