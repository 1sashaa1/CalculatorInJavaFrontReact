import React from 'react';
import { Table } from 'react-bootstrap';

const History = ({ history }) => {
    if (!history || history.length === 0) return null;

    return (
        <div className="mt-4">
            <h4>История вычислений</h4>
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>Выражение</th>
                    <th>Результат</th>
                </tr>
                </thead>
                <tbody>
                {history.map((item, index) => (
                    <tr key={index}>
                        <td>{item.expression}</td>
                        <td>{item.result}</td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </div>
    );
};

export default History;