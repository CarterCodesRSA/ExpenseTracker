const submitExpense = e => {
  e.preventDefault();
  const choice = document.querySelectorAll('input[name=expenses]');
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
        <input type="text" name="expense">
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
