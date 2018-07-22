console.log("test string");

const getDate = () => {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();

  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }
  today = dd + '/' + mm + '/' + yyyy;

  return today;
};

const submitExpense = e => {
  e.preventDefault();
  const expenseNodeList = document.querySelectorAll('input[name=expense]');
  console.log('choice: ', expenseNodeList);

  const expenseArray = Array.prototype.slice.call(expenseNodeList);
  const requestArray = [];

  expenseArray.map(expense => {
    if (expense.value) {
      requestArray.push({
        name: expense.getAttribute('data-expense-name'),
        amount: expense.value,
        type: expense.getAttribute('data-expense-type')
      });
      //console.log(expense.value);
      //console.log(expense.getAttribute('data-expense-type'));
    }
  });
  const completeRequest = {
    date: getDate(),
    expenses: requestArray
  };
  fetch('/sheets', {
    method: 'post',
    body: JSON.stringify(completeRequest),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  })
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.log(err));
};

const addExpenseType = e => {
  e.preventDefault();
  const choice = document.querySelector('input[name=addExpenseType]').value;

  const currentExpenseList = document.querySelectorAll(
    'form[id=expenses] span'
  );
  let currentExpenseListArray = Array.prototype.slice.call(currentExpenseList);

  let check = false;
  if (choice == '') {
    alert('Please enter a valid expense type');
  } else {
    for (i = 0; i < currentExpenseListArray.length; i++) {
      if (currentExpenseListArray[i].innerHTML == choice) {
        check = true;
        break;
      }
    }

    if (check) {
      alert('This expense type is already defined above');
    } else {
      $('#expenses input[type=submit]').before(`
        <p>
        <span style="font-weight:bold">${choice}</span>
        <input type="text" name="expense" data-expense-type="other" data-expense-name=${choice}>
        </p>`);
    }
  }
};

$(document).ready(() => {
  const formExpenses = document.getElementById('expenses');
  const formAddExpense = document.getElementById('addExpenseType');

  formExpenses.addEventListener('submit', submitExpense);
  formAddExpense.addEventListener('submit', addExpenseType);
});
