document.addEventListener('DOMContentLoaded', () => {
  const descriptionInput = document.getElementById('description');
  const amountInput = document.getElementById('amount');
  const categorySelect = document.getElementById('category');
  const dateInput = document.getElementById('date');
  const addExpenseBtn = document.getElementById('addExpenseBtn');
  const expenseList = document.getElementById('expenseList');
  const todayTotalSpan = document.getElementById('todayTotal');
  const monthTotalSpan = document.getElementById('monthTotal');
  const ctx = document.getElementById('chart').getContext('2d');

  let chart; // For Chart.js instance

  // Load expenses from localStorage or empty array
  function getExpenses() {
    return JSON.parse(localStorage.getItem('expenses') || '[]');
  }

  // Save expenses to localStorage
  function saveExpenses(expenses) {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }

  // Render expenses table
  function renderExpenses(expenses) {
    expenseList.innerHTML = '';

    expenses.forEach((exp, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${exp.description}</td>
        <td>₹${exp.amount.toFixed(2)}</td>
        <td>${exp.category}</td>
        <td>${exp.date}</td>
        <td><button onclick="deleteExpense(${index})" style="color:red;">Delete</button></td>
      `;
      expenseList.appendChild(tr);
    });
  }

  // Calculate totals for today and this month
  function calculateTotals(expenses) {
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7); // e.g. "2025-05"

    let todayTotal = 0;
    let monthTotal = 0;

    expenses.forEach(exp => {
      if (exp.date === today) {
        todayTotal += exp.amount;
      }
      if (exp.date.startsWith(thisMonth)) {
        monthTotal += exp.amount;
      }
    });

    todayTotalSpan.textContent = todayTotal.toFixed(2);
    monthTotalSpan.textContent = monthTotal.toFixed(2);
  }

  // Render Pie Chart of expenses by category
  function renderChart(expenses) {
    // Aggregate amounts by category
    const categoryTotals = {};
    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const categories = Object.keys(categoryTotals);
    const amounts = categories.map(cat => categoryTotals[cat]);

    // Destroy previous chart if exists
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: categories,
        datasets: [{
          data: amounts,
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#8BC34A',
            '#FF9800',
            '#9C27B0'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  // Refresh all UI parts
  function refreshUI() {
    const expenses = getExpenses();
    renderExpenses(expenses);
    calculateTotals(expenses);
    renderChart(expenses);
  }

  // Add expense event handler
  addExpenseBtn.addEventListener('click', () => {
    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;
    const date = dateInput.value;

    // Validation: all fields required, amount positive
    if (!description || isNaN(amount) || amount <= 0 || !category || category === "" || !date) {
      alert('Please add all the fields correctly.');
      return;
    }

    const expenses = getExpenses();
    expenses.push({ description, amount, category, date });
    saveExpenses(expenses);

    // Clear inputs
    descriptionInput.value = '';
    amountInput.value = '';
    categorySelect.selectedIndex = 0; // reset to placeholder
    dateInput.value = '';

    refreshUI();
  });

  // Delete expense by index
  window.deleteExpense = function(index) {
    const expenses = getExpenses();
    expenses.splice(index, 1);
    saveExpenses(expenses);
    refreshUI();
  };

  // Filter expenses (called on filter button click)
  window.filterExpenses = function() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    let expenses = getExpenses();

    if (startDate) {
      expenses = expenses.filter(exp => exp.date >= startDate);
    }
    if (endDate) {
      expenses = expenses.filter(exp => exp.date <= endDate);
    }

    renderExpenses(expenses);
    calculateTotals(expenses);
    renderChart(expenses);
  };

  // Clear filter
  window.clearFilter = function() {
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    refreshUI();
  };

  // Initial load
  refreshUI();
});


