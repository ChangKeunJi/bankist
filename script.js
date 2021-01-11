'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2021-01-08T23:36:17.929Z',
    '2021-01-10T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
//! ----------------- Functions -----------------------

//! Calculate Date
const formatMovementDate = function (date) {
  const calcDaysPassed = (date1, date2) => {
    return Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  };
  const dayPassed = calcDaysPassed(new Date(), date);

  if (dayPassed === 0) return 'Today';
  if (dayPassed === 1) return 'Yesterday';
  if (dayPassed <= 7) return `${dayPassed} days ago`;

  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const year = date.getFullYear();
  return `${day} /${month} /${year}`;
};

//! Displaying movements on display

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  // Decide sorting or not
  // : We don't want to mutate data so
  // make a shallow copy with slice().
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date);
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type} </div>
    <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${mov.toFixed(2)} €</div>
    </div>
    `;

    // 'afterbegin': Just inside the element, before its first child.
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//! Display calculated Balance

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, cur) => acc + cur, 0);
  labelBalance.textContent = `${acc.balance.toFixed(2)} EUR`;
};

//! Display calculated summary

const calcDisplaySummary = function (acc) {
  let incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumIn.textContent = `${incomes.toFixed(2)} €`;

  let outcomes = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumOut.textContent = `${Math.abs(outcomes).toFixed(2)} €`;

  let interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)} €`;
};

//! Creating username property on each account.

const createUsername = function (accs) {
  accs.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createUsername(accounts);

//! Update UI

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

//! ------------------ Event Handlers ------------------

let currentAccount;
// Delare outside of function. So other funtions can access.

//! Fake always login
currentAccount = accounts[0];
updateUI(currentAccount);
containerApp.style.opacity = 1;

//! Login

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value.trim()
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //? Display UI and Message
    labelWelcome.textContent = `Welcome Back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 1;

    // Setting current date
    const now = new Date();
    //=> Mon Jan 11 2021 14:10:34 GMT+0900 (Korean Standard Time) => day/month/year

    const day = `${now.getDate()}`.padStart(2, '0');
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    // To use padStart method, convert it to string first since it's a string method.
    const year = now.getFullYear();
    const hour = `${now.getHours()}`.padStart(2, '0');
    const min = `${now.getMinutes()}`.padStart(2, '0');

    labelDate.textContent = `${day} /${month} /${year}, ${hour}:${min}`;

    //? Clear Input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur(); // Loose focus.

    //? Create UI
    updateUI(currentAccount);
  }
});

//! Transfer

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAccount = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  if (
    amount > 0 &&
    receiverAccount &&
    currentAccount.balance >= amount &&
    receiverAccount.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiverAccount.movements.push(amount);
    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAccount.movementsDates.push(new Date().toISOString());
    updateUI(currentAccount);
  }
  inputTransferAmount.value = inputTransferTo.value = '';
});

//! Request loan

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  // Rounding "String" value.
  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount / 10)) {
    currentAccount.movements.push(amount);
    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    updateUI(currentAccount);
  }

  inputLoanAmount.value = '';
});

//! Close account

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === +inputClosePin.value
  ) {
    let currentIndex = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    // Delete account
    accounts.splice(currentIndex, 1);
    // Change UI
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Log in to get started';
    inputCloseUsername.value = inputClosePin.value = '';
  }
});

//! Sort movements
let sorted = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

//! Convert and Check numbers

// console.log(23 === 23.0);
// // true

// //? Numbers are stored in binary base in JS

// console.log(0.1 + 0.2);
// // 0.30000000000000004
// // Resulte in infinite fraction.
// // (e.g. in 10base, 3/10 => 0.333333...)

// //? Type coercion

// console.log(Number('23'));
// // Number 23
// console.log(+'23');
// // Number 23
// // As soon as see "+", JS converts it to Number

// //? Parsing

// //parseInt() function parses a string argument and returns an integer of the specified radix
// // parseInt(str,regex)
// // regex refers to what base should be.

// console.log(Number.parseInt('38px', 10));
// // 30
// console.log(Number.parseInt('e11', 10));
// // NaN / Need to start with Number.

// console.log(Number.parseInt('2.5rem'));
// // 2
// console.log(Number.parseFloat('2.5rem'));
// // 2.5

// //? isNaN

// console.log(Number.isNaN('halo'));
// //false
// console.log(Number.isNaN(777));
// //false
// console.log(Number.isNaN(+'20px'));
// // true
// console.log(Number.isNaN(23 / 0));
// // false / it is inifinity

// //? Check if value is a number.

// // including floating number
// console.log(Number.isFinite(20));
// // true
// console.log(Number.isFinite('20'));
// // false

// console.log(Number.isInteger(23.11));
// // false
// console.log(Number.isInteger(23));
// // true

//! Math & Rounding number

//// Square root

// console.log(Math.sqrt(25));
// // 5
// console.log(25 ** (1 / 2));
// // 5
// console.log(8 ** (1 / 3));
// // 2

// // Math.max & Math.min
// //: Returns a maximum or minimum value

// console.log(Math.max(1, 2, 3, 1, 7));
// // 7
// console.log(Math.max(1, 2, 3, 1, '7'));
// // 7 / Also does type coercion
// console.log(Math.min(7, 3, 2, 3));
// // 2

// // Create random number
// // 1. 0 < Math.random() < 1
// // 2. 0 < Math.random() * 6 < 6
// // 3. 0 <= Math.trunc(Math.random() * 6) <= 5
// // 4. 1 <= Math.trunc(Math.random() * 6) + 1 <= 6

// console.log(Math.trunc(Math.random() * 6) + 1);

// const randomInt = (min, max) =>
//   Math.floor(Math.random() * (max - min + 1)) + min;

// // 1. 0 < Math.random() < 1
// // 2. 0 < Math.random() * (max - min + 1) < (max- min + 1)
// // 3. 0 + min < Math.random() * (max - min + 1) + min < (max- min + 1) + min
// // 4. => min < ... < max

// console.log(15, 20);

// // Rounding Integer

// // Cut off decimal part
// console.log(Math.trunc(23.3)); // 23
// // Rounded to the nearest integer.
// console.log(Math.round(23.2)); // 23
// console.log(Math.round(23.9)); // 24
// // Rounds a number up to the next largest integer.
// console.log(Math.ceil(23.3)); // 24
// console.log(Math.ceil(23.9)); // 24
// // less than or equal to a given number.
// console.log(Math.floor(23.3)); // 23
// console.log(Math.floor(23.9)); // 23
// // trunc & floor
// console.log(Math.trunc(-2.3)); // -2
// console.log(Math.floor(-2.3)); // -3

// // Rounding decimals : toFixed
// // formats a number using fixed-point notation.
// // The number is rounded if necessary,

// console.log((2.7).toFixed(0));
// // "3"
// console.log((2.6666).toFixed(3));
// // "2.667"
// console.log((2.2).toFixed(0));

//! Remainder

// console.log(5 % 2); // 1

// // even or odd number

// const isEven = n => console.log(n % 2 === 0);
// isEven(7); // false

// // Even or Odd in Application

// labelBalance.addEventListener('click', () => {
//   [...document.querySelectorAll('.movements__row')]
//     // Change node list to array
//     .forEach(function (row, i) {
//       if (i % 2 === 0) {
//         // 0,2,4,6..
//         row.style.backgroundColor = 'orangered';
//       }
//       if (i % 3 === 0) {
//         // 0,3,6,9..
//         row.style.backgroundColor = 'yellow';
//       }
//     });
// });

//! BigInt

// Numbers are stored by binary base 64bit.
// Among 64bits only 53bits are used to store the digit themselves rest of them used for decimal point and sign.

// console.log(2 ** 53 - 1);
// // 9007199254740991
// // Biggest number in JS which can be safe.

// console.log(Number.MAX_SAFE_INTEGER);
// // 9007199254740991

// console.log(2 ** 53 + 1);
// // 9007199254740992
// // Should be 9007199254740993 accurately

// // BigInt
// // : Can be used to stored number as large as we want.

// console.log(999007199254740991n);
// // 999007199254740991n
// console.log(BigInt(999999));
// // 999999n

// //? BigInt - Operation

// console.log(10000n + 10000n);
// // 20000n

// // console.log(1000n + 23);
// // TypeError: can't convert BigInt to number
// // Can't mix Bigint with other type.

// // console.log(Math.sqrt(16n));
// // TypeError: can't convert BigInt to number

// //? Exceptions - type coercion happens

// console.log(20n > 15); // true
// console.log(20n === 20); // false
// console.log(20n == 20); // true
// console.log(20n + ' is a huge Number');
// // 20 is a huge Number

//! Date & Times

// 1. Create a date

// const now = new Date();
// console.log(now);

// // with only a partial data
// // Date Mon Jan 11 2021 13:24:53
// console.log(new Date('Mon Jan 11 2021'));
// // Date Mon Jan 11 2021 00:00:00
// console.log(new Date('December 24, 2000'));
// // Date Sun Dec 24 2000 00:00:00
// console.log(new Date(2999, 10, 17, 18, 40, 40));
// // Date Sun Nov 17 2999 18:40:40
// console.log(account1.movementsDates[0]);
// // 2019-11-18T21:31:17.178Z

// console.log(new Date(0));
// // Date Thu Jan 01 1970 09:00:00
// console.log(new Date(3 * 24 * 60 * 60 * 1000));
// // After 3days from start day
// // Timestamp : 259200000

//! 2. Woring with Date

// const future = new Date(2999, 10, 17, 18, 40, 40);
// console.log(future);
// console.log(future.getFullYear()); // 2999
// console.log(future.getMonth()); // 10: November
// console.log(future.getDate()); // 17
// console.log(future.getDay()); // 0: Sunday
// console.log(future.getHours()); // 18
// console.log(future.getMinutes()); // 40
// console.log(future.getSeconds()); // 40
// console.log(future.toISOString());
// // 2999-11-17T09:40:40.000Z
// console.log(future.getTime());
// // 32499826840000: milliseconds from 1970
// console.log(new Date(32499826840000));
// // Date Sun Nov 17 2999 18:40:40

// // Get current timestamp
// //: Keep changing every milliseconds

// console.log(Date.now());
// console.log(new Date().getTime());

// // Re setting date

// future.setFullYear(3999);
// console.log(future);
// // Date Wed Nov 17 3999 18:40:40

//! Operation with Dates

// console.log(new Date());
// // Date Mon Jan 11 2021 17:36:22 GMT+0900
// console.log(+new Date());
// // 1610354205214
// console.log(Date.now());
// // 1610353584576

// const calcDaysPassed = (date1, date2) => {
//   return (date2 - date1) / (1000 * 60 * 60 * 24);
// };

// const day1 = new Date(2030, 3, 14);
// const day2 = new Date(2030, 3, 24);

// console.log(typeof day1);
// // "object"
// console.log(day1);
// // Date Sun Apr 14 2030 00:00:00
// console.log(Number(day1));
// // 1902322800000
// console.log(Number(day1) === day1);
// // false
// console.log(day2 - day1);
// // 864000000

// const calcDay = calcDaysPassed(day1, day2);
// console.log(calcDay);
// // 10

// console.log(calcDaysPassed(new Date(2030, 3, 14), new Date(2030, 3, 24)));
// // 10
