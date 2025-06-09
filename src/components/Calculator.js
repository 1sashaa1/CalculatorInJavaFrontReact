import React, { useState, useEffect } from 'react';
import Result from './Result';
import History from './History';
import axios from 'axios';
import { Button, Form, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import '../css/Calculator.css';

const Calculator = () => {
    const [operation, setOperation] = useState(null);
    const [inputNumbers, setInputNumbers] = useState([]);
    const [result, setResult] = useState('0');
    const [history, setHistory] = useState([]);
    const [error, setError] = useState('');
    const [availableOperations, setAvailableOperations] = useState([]);
    const [inputMode, setInputMode] = useState('operation'); // 'operation' или 'numbers'
    const API_URL = '/api/calculator';

    // Количество требуемых чисел для каждой операции
    const operationRequirements = {
        'add': 2,
        'subtract': 2,
        'multiply': 2,
        'divide': 2,
        'sqrt': 1,
        'pow': 2,
        'log': 1
    };

    const fetchOperations = async () => {
        try {
            const response = await axios.get(`${API_URL}/operations`);
            setAvailableOperations(response.data);
        } catch (err) {
            console.error('Ошибка при получении операций:', err);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await axios.get(`${API_URL}/history`);
            setHistory(response.data);
        } catch (err) {
            console.error('Ошибка при получении истории:', err);
        }
    };

    const handleOperationSelect = (op) => {
        setOperation(op);
        setInputNumbers([]);
        setInputMode('numbers');
        setError('');
    };

    const handleNumberInput = (num) => {
        if (!operation) return;

        const requiredNumbers = operationRequirements[operation] || 2;

        if (inputNumbers.length < requiredNumbers) {
            setInputNumbers([...inputNumbers, num]);
        }
    };

    const calculate = async () => {
        if (!operation) {
            setError('Сначала выберите операцию');
            return;
        }

        const requiredNumbers = operationRequirements[operation] || 2;
        if (inputNumbers.length < requiredNumbers) {
            setError(`Для операции ${operation} нужно ${requiredNumbers} числа`);
            return;
        }

        try {
            const args = inputNumbers.slice(0, requiredNumbers).map(Number);
            const response = await axios.post(`${API_URL}/calculate`, {
                operation: operation,
                args: args
            });

            setResult(response.data.toString());
            setHistory(prev => [...prev, `${operation}(${args.join(', ')}) = ${response.data}`]);
            setError('');
            resetCalculator();
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка вычисления');
        }
    };

    const resetCalculator = () => {
        setOperation(null);
        setInputNumbers([]);
        setInputMode('operation');
    };

    const renderOperationButtons = () => {
        return availableOperations.map(op => (
            <Button
                key={op}
                variant={operation === op ? 'primary' : 'outline-primary'}
                className="m-1 operation-btn"
                onClick={() => handleOperationSelect(op)}
            >
                {op}
            </Button>
        ));
    };

    const renderNumberButtons = () => {
        return [7, 8, 9, 4, 5, 6, 1, 2, 3, 0, '.'].map(num => (
            <Button
                key={num}
                variant="outline-secondary"
                className="m-1 number-btn"
                onClick={() => handleNumberInput(num.toString())}
            >
                {num}
            </Button>
        ));
    };

    useEffect(() => {
        fetchOperations();
        fetchHistory();
    }, []);

    return (
        <Container className="mt-5">
            <Row className="justify-content-md-center">
                <Col md={6} lg={5} xl={4}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-4">
                            <Card.Title className="text-center mb-4 fs-3 fw-bold text-primary">
                                Калькулятор
                            </Card.Title>

                            <div className="calculator-display mb-4 p-3 rounded-3 bg-light bg-opacity-10">
                                <div className="text-muted calculator-input fs-6">
                                    {operation ? `${operation}(${inputNumbers.join(', ')})` : 'Выберите операцию'}
                                </div>
                                <div className="text-end calculator-result fw-bold fs-2 mt-2">
                                    {result}
                                </div>
                            </div>


                            {inputMode === 'operation' && (
                                <div className="d-grid gap-2">
                                    <div className="d-flex flex-wrap justify-content-center gap-2">
                                        {availableOperations.map(op => (
                                            <button
                                                key={op}
                                                className={`btn ${operation === op ? 'btn-primary' : 'btn-outline-primary'} rounded-pill px-4 py-2 operation-btn`}
                                                onClick={() => handleOperationSelect(op)}
                                            >
                                                {op}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}


                            {inputMode === 'numbers' && (
                                <div className="calculator-buttons">
                                    <div className="d-grid gap-2">
                                        <div className="row row-cols-4 g-2">
                                            {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0, '.'].map(num => (
                                                <div key={num} className="col">
                                                    <button
                                                        className="btn btn-light rounded-3 w-100 py-3 number-btn shadow-sm"
                                                        onClick={() => handleNumberInput(num.toString())}
                                                    >
                                                        {num}
                                                    </button>
                                                </div>
                                            ))}
                                            <div className="col">
                                                <button
                                                    className="btn btn-success rounded-3 w-100 py-3 equals-btn shadow-sm"
                                                    onClick={calculate}
                                                    disabled={inputNumbers.length < (operationRequirements[operation] || 2)}
                                                >
                                                    =
                                                </button>
                                            </div>
                                            <div className="col">
                                                <button
                                                    className="btn btn-danger rounded-3 w-100 py-3 clear-btn shadow-sm"
                                                    onClick={resetCalculator}
                                                >
                                                    C
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center mt-3 text-muted small">
                                        Нужно ввести {operationRequirements[operation] || 2} числа
                                    </div>
                                </div>
                            )}

                            {error && (
                                <Alert variant="danger" className="mt-3 rounded-3 border-0 shadow-sm">
                                    {error}
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-4 justify-content-md-center">
                <Col md={6} lg={5} xl={4}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-4">
                            <Card.Title className="text-center mb-3 fs-4 fw-bold text-primary">
                                История вычислений
                            </Card.Title>
                            <div className="history-list">
                                {history.length > 0 ? (
                                    history.map((item, index) => (
                                        <div
                                            key={index}
                                            className="py-2 px-3 mb-2 rounded-3 bg-light bg-opacity-10 d-flex justify-content-between"
                                        >
                                            <span className="text-muted">{item.split('=')[0]}</span>
                                            <span className="fw-bold">= {item.split('=')[1]}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-muted py-3">
                                        История пуста
                                    </div>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Calculator;