const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expenseEl = document.getElementById('expense');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');
const typeSelect = document.getElementById('type');
const categorySelect = document.getElementById('category');
const addBtn = document.getElementById('addBtn');
const transactionList = document.getElementById('transactionList');
const darkModeBtn = document.getElementById('darkModeBtn');
const expenseChartCanvas = document.getElementById('expenseChart');

let transactions = [];
let chartInstance = null;

function formatCurrency(value) {
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getSummary() {
    const income = transactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const expense = transactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const balance = income - expense;
    return { income, expense, balance };
}

function getCategoryTotals() {
    const categories = {};
    transactions
        .filter(tx => tx.type === 'expense')
        .forEach(tx => {
            categories[tx.category] = (categories[tx.category] || 0) + tx.amount;
        });
    return categories;
}

function saveTransactions() {
    localStorage.setItem('expenseTrackerTransactions', JSON.stringify(transactions));
}

function loadTransactions() {
    const stored = localStorage.getItem('expenseTrackerTransactions');
    if (!stored) return;
    try {
        transactions = JSON.parse(stored);
    } catch {
        transactions = [];
    }
}

function updateSummary() {
    const { income, expense, balance } = getSummary();
    balanceEl.textContent = formatCurrency(balance);
    incomeEl.textContent = formatCurrency(income);
    expenseEl.textContent = formatCurrency(expense);
}

function createTransactionListItem(tx) {
    const li = document.createElement('li');
    li.classList.add(tx.category.toLowerCase());

    const info = document.createElement('div');
    info.className = 'transaction-info';

    const description = document.createElement('strong');
    description.textContent = tx.description;
    info.appendChild(description);

    const meta = document.createElement('span');
    meta.className = 'transaction-date';
    meta.textContent = `${tx.date} • ${tx.category} • ${tx.type === 'income' ? 'Income' : 'Expense'}`;
    info.appendChild(meta);

    const amountLabel = document.createElement('div');
    amountLabel.textContent = tx.type === 'income' ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`;
    amountLabel.style.fontWeight = '700';
    amountLabel.style.color = tx.type === 'income' ? '#2ecc71' : '#e74c3c';

    const actions = document.createElement('div');
    actions.className = 'action-buttons';

    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => editTransaction(tx.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => removeTransaction(tx.id));

    actions.append(editBtn, deleteBtn);
    li.append(info, amountLabel, actions);
    return li;
}

function renderTransactions() {
    transactionList.innerHTML = '';
    if (transactions.length === 0) {
        const empty = document.createElement('li');
        empty.textContent = 'No transactions added yet.';
        empty.style.justifyContent = 'center';
        empty.style.color = '#7f8c8d';
        transactionList.appendChild(empty);
        return;
    }

    transactions
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(tx => transactionList.appendChild(createTransactionListItem(tx)));
}

function renderChart() {
    const categoryTotals = getCategoryTotals();
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(expenseChartCanvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                label: 'Expenses by category',
                data,
                backgroundColor: [
                    '#ff6384',
                    '#36a2eb',
                    '#ffcd56',
                    '#4bc0c0',
                    '#9966ff',
                    '#ff9f40'
                ],
                borderWidth: 1,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const value = context.raw;
                            return `${context.label}: ${formatCurrency(value)}`;
                        }
                    }
                }
            }
        },
    });
}

function resetForm() {
    descriptionInput.value = '';
    amountInput.value = '';
    dateInput.value = '';
    typeSelect.value = 'income';
    categorySelect.value = 'Food';
}

function addTransaction() {
    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const date = dateInput.value;
    const type = typeSelect.value;
    const category = categorySelect.value;

    if (!description || !amount || !date) {
        alert('Please fill out description, amount, and date.');
        return;
    }

    const transaction = {
        id: Date.now(),
        description,
        amount: Math.abs(amount),
        date,
        type,
        category,
    };

    transactions.push(transaction);
    saveTransactions();
    updateApp();
    resetForm();
}

function editTransaction(id) {
    const tx = transactions.find(item => item.id === id);
    if (!tx) return;

    descriptionInput.value = tx.description;
    amountInput.value = tx.amount;
    dateInput.value = tx.date;
    typeSelect.value = tx.type;
    categorySelect.value = tx.category;

    transactions = transactions.filter(item => item.id !== id);
    saveTransactions();
    updateApp();
}

function removeTransaction(id) {
    transactions = transactions.filter(item => item.id !== id);
    saveTransactions();
    updateApp();
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    darkModeBtn.textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
    localStorage.setItem('expenseTrackerDarkMode', isDarkMode ? 'dark' : 'light');
}

function loadDarkMode() {
    const saved = localStorage.getItem('expenseTrackerDarkMode');
    if (saved === 'dark') {
        document.body.classList.add('dark-mode');
        darkModeBtn.textContent = '☀️ Light Mode';
    }
}

function updateApp() {
    updateSummary();
    renderTransactions();
    renderChart();
}

addBtn.addEventListener('click', addTransaction);
darkModeBtn.addEventListener('click', toggleDarkMode);

loadTransactions();
loadDarkMode();
updateApp();
