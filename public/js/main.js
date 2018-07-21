const formExpenses = document.getElementById("expenses");
const formAddExpense = document.getElementById("addExpense");

form.addEventListener("submit", e => {
  e.preventDefault();
  //console.log(e);
  const choice = document.querySelectorAll("input[name=expenses]");
  console.log("choice: ", choice);
});

formAddExpense.addEventListener("submit", e => {
  e.preventDefault();
  //console.log(e);
  const choice = document.querySelectorAll("input[name=addExpense]");
  console.log("choice: ", choice);
});