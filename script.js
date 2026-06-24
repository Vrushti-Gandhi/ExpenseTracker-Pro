const description = document.getElementById("description");
const amount = document.getElementById("amount");
const date = document.getElementById("date");
const type = document.getElementById("type");
const category = document.getElementById("category");
const addBtn = document.getElementById("addBtn");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");

const transactionList = document.getElementById("transactionList");

const darkModeBtn = document.getElementById("darkModeBtn");

let transactions =
JSON.parse(localStorage.getItem("transactions")) || [];

let editIndex = -1;

let chart;

/* --------------------------
   SAVE DATA
-------------------------- */

function saveData() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );
}

/* --------------------------
   SUMMARY
-------------------------- */

function updateSummary() {

    let income = 0;
    let expense = 0;

    transactions.forEach((transaction) => {

        if(transaction.type === "income") {
            income += transaction.amount;
        } else {
            expense += transaction.amount;
        }

    });

    balanceEl.textContent = `₹${income - expense}`;
    incomeEl.textContent = `₹${income}`;
    expenseEl.textContent = `₹${expense}`;
}

/* --------------------------
   PIE CHART
-------------------------- */

function updateChart() {

    const categoryData = {};

    transactions.forEach((transaction) => {

        if(transaction.type === "expense") {

            categoryData[transaction.category] =
                (categoryData[transaction.category] || 0)
                + transaction.amount;
        }

    });

    const labels = Object.keys(categoryData);
    const values = Object.values(categoryData);

    const ctx =
    document.getElementById("expenseChart");

    if(chart){
        chart.destroy();
    }

    chart = new Chart(ctx, {

        type: "pie",

        data: {

            labels: labels,

            datasets: [{

                data: values

            }]
        }
    });
}

/* --------------------------
   RENDER TRANSACTIONS
-------------------------- */

function renderTransactions() {

    transactionList.innerHTML = "";

    transactions.forEach((transaction, index) => {

        const li =
        document.createElement("li");

        li.classList.add(
            transaction.category.toLowerCase()
        );

        li.innerHTML = `

        <div class="transaction-info">

            <strong>
            ${transaction.type === "income"
            ? "🟢"
            : "🔴"}

            ${transaction.description}

            </strong>

            <span>
            ${transaction.category}
            | ₹${transaction.amount}
            </span>

            <span class="transaction-date">
            ${transaction.date}
            </span>

        </div>

        <div class="action-buttons">

            <button
            class="edit-btn"
            onclick="editTransaction(${index})">

            ✏️

            </button>

            <button
            class="delete-btn"
            onclick="deleteTransaction(${index})">

            🗑️

            </button>

        </div>

        `;

        transactionList.appendChild(li);

    });

    updateSummary();
    updateChart();
}

/* --------------------------
   ADD / UPDATE
-------------------------- */

addBtn.addEventListener("click", () => {

    if(
        description.value === "" ||
        amount.value === "" ||
        date.value === ""
    ){
        alert("Please fill all fields");
        return;
    }

    const transaction = {

        description:
        description.value,

        amount:
        Number(amount.value),

        date:
        date.value,

        type:
        type.value,

        category:
        category.value
    };

    if(editIndex === -1){

        transactions.push(transaction);

    }else{

        transactions[editIndex] =
        transaction;

        editIndex = -1;

        addBtn.textContent =
        "Add Transaction";
    }

    saveData();

    renderTransactions();

    description.value = "";
    amount.value = "";
    date.value = "";
});

/* --------------------------
   DELETE
-------------------------- */

function deleteTransaction(index) {

    const confirmDelete =
    confirm(
    "Are you sure you want to delete?"
    );

    if(confirmDelete){

        transactions.splice(index,1);

        saveData();

        renderTransactions();
    }
}

/* --------------------------
   EDIT
-------------------------- */

function editTransaction(index){

    description.value =
    transactions[index].description;

    amount.value =
    transactions[index].amount;

    date.value =
    transactions[index].date;

    type.value =
    transactions[index].type;

    category.value =
    transactions[index].category;

    editIndex = index;

    addBtn.textContent =
    "Update Transaction";
}

/* --------------------------
   DARK MODE
-------------------------- */

if(
localStorage.getItem("darkMode")
=== "enabled"
){
    document.body.classList.add("dark");
}

darkModeBtn.addEventListener(
"click",
() => {

    document.body.classList.toggle(
    "dark"
    );

    if(
    document.body.classList.contains(
    "dark"
    )
    ){

        localStorage.setItem(
        "darkMode",
        "enabled"
        );

    }else{

        localStorage.setItem(
        "darkMode",
        "disabled"
        );
    }
});

/* --------------------------
   INITIAL LOAD
-------------------------- */

renderTransactions();