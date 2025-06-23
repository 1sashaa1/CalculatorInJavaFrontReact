import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import '../css/Calculator.scss';

const Calculator = () => {
    const [currentInput, setCurrentInput] = useState('0');
    const [result, setResult] = useState('0');
    const [history, setHistory] = useState([]);
    const [error, setError] = useState('');
    const [storedValue, setStoredValue] = useState(null);
    const [currentOperation, setCurrentOperation] = useState(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);
    const API_URL = '/api/calculator';

    const basicOperations = ['+', '-', '*', '/', '%', '^'];
    const scientificOperations = ['sin', 'cos', 'tan', 'atan', 'atan2', 'sqrt', 'log', 'log10', 'exp', 'abs', 'round', 'max', 'min'];
    const allOperations = [...basicOperations, ...scientificOperations];

    const fetchHistory = async () => {
        try {
            const response = await axios.get(`${API_URL}/history`);
            setHistory(response.data);
        } catch (err) {
            console.error('Ошибка при получении истории:', err);
        }
    };

    const clearAll = () => {
        setCurrentInput('0');
        setResult('0');
        setStoredValue(null);
        setCurrentOperation(null);
        setWaitingForOperand(false);
        setError('');
    };

    const clearEntry = () => {
        setCurrentInput('0');
        setError('');
    };

    const handleNumber = (number) => {
        if (waitingForOperand) {
            setCurrentInput(number);
            setWaitingForOperand(false);
        } else {
            setCurrentInput(currentInput === '0' ? number : currentInput + number);
        }
    };

    const handleDecimalPoint = () => {
        if (waitingForOperand) {
            setCurrentInput('0.');
            setWaitingForOperand(false);
            return;
        }

        if (!currentInput.includes('.')) {
            setCurrentInput(currentInput + '.');
        }
    };

    const handleOperation = async (op) => {
        if (scientificOperations.includes(op)) {
            // Для научных операций сразу выполняем вычисление
            try {
                const response = await axios.post(`${API_URL}/calculate`, {
                    operation: op,
                    args: [parseFloat(currentInput)]
                });

                const newResult = response.data.toString();
                setResult(newResult);
                setCurrentInput(newResult);
                setHistory(prev => [...prev, `${op}(${currentInput}) = ${newResult}`]);
                setWaitingForOperand(true);
            } catch (err) {
                setError(err.response?.data?.message || 'Ошибка вычисления');
            }
        } else {
            if (currentOperation && !waitingForOperand) {
                calculate();
            }
            setStoredValue(parseFloat(currentInput));
            setCurrentOperation(op);
            setWaitingForOperand(true);
        }
    };

    const calculate = async () => {
        if (currentOperation === null || storedValue === null) return;

        try {
            const currentValue = parseFloat(currentInput);
            let args = [storedValue];

            if (basicOperations.includes(currentOperation)) {
                args.push(currentValue);
            }

            const response = await axios.post(`${API_URL}/calculate`, {
                operation: currentOperation,
                args: args
            });

            const newResult = response.data.toString();
            setResult(newResult);
            setCurrentInput(newResult);
            setHistory(prev => [...prev,
                `${currentOperation}(${args.join(', ')}) = ${newResult}`]);
            setCurrentOperation(null);
            setStoredValue(null);
            setWaitingForOperand(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка вычисления');
        }
    };

    const handleSpecialOperation = async (op) => {
        try {
            const response = await axios.post(`${API_URL}/calculate`, {
                operation: op,
                args: [parseFloat(currentInput)]
            });

            const newResult = response.data.toString();
            setResult(newResult);
            setCurrentInput(newResult);
            setHistory(prev => [...prev, `${op}(${currentInput}) = ${newResult}`]);
            setWaitingForOperand(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка вычисления');
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    return (
        <Container className="mt-5 calculator-container">
            <Row className="justify-content-md-center">
                <Col md={8} lg={7} xl={6}>
                    <Card className="calculator-card shadow-lg border-0">
                        <Card.Body className="p-4">
                            <Card.Title className="text-center mb-4 fs-3 fw-bold text-primary calculator-title">
                                Калькулятор
                            </Card.Title>

                            <div className="calculator-display mb-4 p-3 rounded-4 bg-dark text-white">
                                <div className="calculator-input fs-6 text-muted">
                                    {
                                        currentOperation
                                            ? `${storedValue ?? ''} ${currentOperation}${ // оператор нулевого слияния
                                                waitingForOperand ? '' : ` ${currentInput}`
                                            }`
                                            : currentInput
                                    }
                                </div>
                                <div className="calculator-result fw-bold fs-2 mt-2 text-end text-light">
                                    {result}
                                </div>
                            </div>

                            <div className="scientific-operations mb-3">
                                <div className="row row-cols-5 g-2">
                                    {['sqrt', 'sin', 'cos', 'tan', 'log'].map(op => (
                                        <div key={op} className="col">
                                            <button
                                                className="btn btn-info rounded-4 w-100 py-2 operation-btn scientific-btn"
                                                onClick={() => handleSpecialOperation(op)}
                                            >
                                                {op}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="row row-cols-5 g-2 mt-2">
                                    {['log10', 'exp', 'abs', 'round', 'atan'].map(op => (
                                        <div key={op} className="col">
                                            <button
                                                className="btn btn-info rounded-4 w-100 py-2 operation-btn scientific-btn"
                                                onClick={() => handleSpecialOperation(op)}
                                            >
                                                {op}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="calculator-keyboard">
                                <div className="row row-cols-4 g-2 mb-2">
                                    <div className="col">
                                        <button className="btn btn-light rounded-0 w-100 py-3 control-btn" onClick={clearAll}>
                                            AC
                                        </button>
                                    </div>
                                    <div className="col">
                                        <button className="btn btn-light rounded-0 w-100 py-3 control-btn" onClick={clearEntry}>
                                            CE
                                        </button>
                                    </div>
                                    <div className="col">
                                        <button className="btn btn-light rounded-0 w-100 py-3 operation-btn" onClick={() => handleOperation('%')}>
                                            %
                                        </button>
                                    </div>
                                    <div className="col">
                                        <button className="btn btn-warning rounded-0 w-100 py-3 operation-btn" onClick={() => handleOperation('/')}>
                                            ÷
                                        </button>
                                    </div>
                                </div>

                                {[
                                    [7, 8, 9, '*'],
                                    [4, 5, 6, '-'],
                                    [1, 2, 3, '+'],
                                    [0, '.', '^', '=']
                                ].map((row, rowIndex) => (
                                    <div key={rowIndex} className="row row-cols-4 g-2 mb-2">
                                        {row.map((item, colIndex) => (
                                            <div key={colIndex} className="col">
                                                <button
                                                    className={`btn rounded-0 w-100 py-3 
                            ${typeof item === 'number' ? 'btn-dark number-btn' : ''}
                            ${item === '.' ? 'btn-dark number-btn' : ''}
                            ${['+', '-', '*', '/', '%', '^'].includes(item) ? 'btn-warning operation-btn' : ''}
                            ${item === '=' ? 'btn-success equals-btn' : ''}
                            ${rowIndex === 3 && colIndex === 0 ? 'col-span-2' : ''}
                        `}
                                                    onClick={() => {
                                                        if (typeof item === 'number') handleNumber(item.toString());
                                                        else if (item === '.') handleDecimalPoint();
                                                        else if (item === '=') calculate();
                                                        else handleOperation(item);
                                                    }}
                                                >
                                                    {item === '*' ? '×' : item === '/' ? '÷' : item}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            {error && (
                                <Alert variant="danger" className="mt-3 rounded-4 border-0 error-alert">
                                    {error}
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-4 justify-content-md-center">
                <Col md={8} lg={7} xl={6}>
                    <Card className="history-card shadow-lg border-0">
                        <Card.Body className="p-4">
                            <Card.Title className="text-center mb-3 fs-4 fw-bold text-primary">
                                History
                            </Card.Title>
                            <div className="history-list">
                                {history.length > 0 ? (
                                    history.map((item, index) => (
                                        <div key={index} className="history-item py-2 px-3 mb-2 rounded-4">
                                            <span className="text-muted">{item.split('=')[0]}</span>
                                            <span className="fw-bold">= {item.split('=')[1]}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-muted py-3">
                                        History is empty
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