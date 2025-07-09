// App.jsx
import React, { useState, useEffect } from 'react';
import './styles/App.css';
import PieChartComponent from './components/PieChartComponent';

function App() {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
  const [theme, setTheme] = useState('light');
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (description && !isNaN(parsedAmount)) {
      const newTransaction = {
        id: Date.now(),
        description,
        amount: parsedAmount,
        type,
      };
      setTransactions([...transactions, newTransaction]);
      setDescription('');
      setAmount('');
      setType('income');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    }
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const exportToCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Description,Amount,Type']
        .concat(
          transactions.map((t) => `${t.description},${t.amount},${t.type}`)
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const balance = income - expenses;

  return (
    <div className='container'>
      <h1>Budget Tracker</h1>
      <div id='balance'>Balance: ${balance.toFixed(2)}</div>
      <div id='income'>Income: ${income.toFixed(2)}</div>
      <div id='expenses'>Expenses: ${expenses.toFixed(2)}</div>

      <form onSubmit={handleSubmit}>
        <input
          type='text'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder='Description'
          required
        />
        <input
          type='number'
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder='Amount'
          required
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value='income'>Income</option>
          <option value='expense'>Expense</option>
        </select>
        <button type='submit' className='add-btn'>
          💰 Add Transaction
        </button>
      </form>

      {transactions.length > 0 && (
        <>
          <button
            type='button'
            className='clear-btn'
            onClick={() => setTransactions([])}
          >
            🧹 Clear All
          </button>
          <button type='button' className='export-btn' onClick={exportToCSV}>
            📄 Export to CSV
          </button>
        </>
      )}

      <button
        type='button'
        className='theme-toggle-btn'
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      >
        🌓 Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
      </button>

      {showNotification && (
        <div className='notification'>✅ Transaction Added!</div>
      )}

      <ul id='transaction-list'>
        {transactions.map((t) => (
          <li key={t.id}>
            {t.description}{' '}
            <span className={t.type === 'income' ? 'income' : 'expense'}>
              {t.type === 'income' ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
            </span>
            <button
              className='delete-btn'
              onClick={() => deleteTransaction(t.id)}
            >
              x
            </button>
          </li>
        ))}
      </ul>

      <PieChartComponent income={income} expenses={expenses} />
    </div>
  );
}

export default App;
