const validateInsertionPayload = ({ date, expenses }) => {
  if (!date) {
    return { isValid: false, error: "Please include a date, or ensure it's spelled correctly." };
  }
  if (!expenses) {
    return { isValid: false, error: "Please include an expenses payload, or ensure it's spelled correctly." };
  }

  const isExpenseKeysValid = expenses.every(expenseItem => {
    const { name, amount, type } = expenseItem;
    return name && amount && type ? true : false;
  });

  return !isExpenseKeysValid
    ? { isValid: false, error: 'One of your payload object keys are incorrect. Looking for name, amount, type' }
    : { isValid: true };
};

module.exports = { validateInsertionPayload };
