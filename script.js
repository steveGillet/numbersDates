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
    '2021-12-31T23:36:17.929Z',
    '2022-01-03T10:51:36.790Z',
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
// Functions

const formatDate = function (date, locale) {
  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();
  // const hour = `${date.getHours()}`.padStart(2, 0);
  // const minutes = `${date.getMinutes()}`.padStart(2, 0);
  const daysPassed = (date1, date2) =>
    Math.abs((date2 - date1) / (1000 * 60 * 60 * 24));
  const currDaysPassed = Math.round(daysPassed(new Date(), date));
  if (currDaysPassed === 0) return `Today`;
  if (currDaysPassed === 1) return `Yesterday`;
  if (currDaysPassed <= 7) return `${currDaysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: `currency`,
    currency: currency,
  }).format(value);
};
const displayTransactions = function (account, sort = false) {
  containerMovements.innerHTML = ``;
  // .textContent = 0

  const trans = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;
  trans.forEach(function (tran, i) {
    const typeTran = tran > 0 ? `deposit` : `withdrawal`;

    const date = new Date(account.movementsDates[i]);
    const displayDate = formatDate(date, account.locale);
    const formatTrans = formatCurrency(tran, account.locale, account.currency);
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${typeTran}">${
      i + 1
    } ${typeTran}</div>
    <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formatTrans}</div>
      </div>`;
    containerMovements.insertAdjacentHTML(`afterbegin`, html);
  });
};

// Calculate and Display Balance
const calcPrintBalance = function (account) {
  account.balance = account.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCurrency(
    account.balance,
    account.locale,
    account.currency
  );
};

const calcPrintSummary = function (account) {
  const incomes = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, curr) => acc + curr, 0);
  labelSumIn.textContent = formatCurrency(
    incomes,
    account.locale,
    account.currency
  );
  const expenditures = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, curr) => acc + curr, 0);
  labelSumOut.textContent = formatCurrency(
    Math.abs(expenditures),
    account.locale,
    account.currency
  );
  const interest = account.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * account.interestRate) / 100)
    .filter((mov, i, arr) => {
      //console.log(arr);
      return mov >= 1;
    })
    .reduce((acc, curr) => acc + curr, 0);
  labelSumInterest.textContent = formatCurrency(
    interest,
    account.locale,
    account.currency
  );
};

// Computing Usernames
const user = `Steven Thomas Williams`;
const makeUsername = function (accounts) {
  accounts.forEach(function (account) {
    account.username = account.owner
      .toLowerCase()
      .split(` `)
      .map(name => name[0])
      .join(``);
  });
};
makeUsername(accounts);

const updateUI = function (account) {
  displayTransactions(account);
  calcPrintBalance(account);
  calcPrintSummary(account);
};

let currentAccount, timerLogOut;

// log out timer
const startTimer = function () {
  const tick = function () {
    const currMinutes = Math.trunc(currentTime / 60);
    const currSeconds = String(currentTime % 60);
    // in call print the remaining time
    labelTimer.textContent = `${currMinutes}:${currSeconds.padStart(2, 0)}`;
    // stop timer and log out user
    if (currentTime === 0) {
      clearInterval(timerLogOut);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = `Log in to get started`;
    }
    currentTime--;
  };
  // set timer to 5 minutes
  let currentTime = 300;
  // call timer every second to display
  tick();
  timerLogOut = setInterval(tick, 1000);
  return timerLogOut;
};

// // Always Logged In Status
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

// // Putting date under Current Balance
// const now = new Date();
// const day = `${now.getDate()}`.padStart(2, 0);
// const month = `${now.getMonth() + 1}`.padStart(2, 0);
// const year = now.getFullYear();
// const hour = `${now.getHours()}`.padStart(2, 0);
// const minutes = `${now.getMinutes()}`.padStart(2, 0);

// labelDate.textContent = `${hour}:${minutes}, ${month}/${day}/${year}`;

// month/day/year

// Log In Event Handlers
btnLogin.addEventListener(`click`, function (event) {
  //prevent form from submitting
  event.preventDefault();
  console.log(`LOGIN`);
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);
  // optional chaining
  if (currentAccount?.pin === +inputLoginPin.value) {
    console.log(`LOGIN`);
    // display ui and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(` `)[0]
    }`;
    containerApp.style.opacity = 100;
    inputLoginUsername.value = inputLoginPin.value = ``;
    inputLoginPin.blur();
    inputLoginUsername.blur();
    // display current account amounts
    const now2 = new Date();
    const options = {
      hour: `numeric`,
      minute: `numeric`,
      day: `2-digit`,
      month: `2-digit`,
      year: `numeric`,
    };
    // // getting locale from browser
    // const locale = navigator.language;
    // console.log(locale);

    // creates a formatter on which you call format
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now2);
    if (timerLogOut) clearInterval(timerLogOut);
    timerLogOut = startTimer();
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener(`click`, function (e) {
  e.preventDefault();
  const amount = Math.ceil(+inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount / 10)) {
    setTimeout(function () {
      // add positive movement
      currentAccount.movements.push(amount);
      // update date
      currentAccount.movementsDates.push(new Date().toISOString());
      // update ui
      updateUI(currentAccount);
    }, 2000);
  }
  inputLoanAmount.value = ``;
  // reset timer
  clearInterval(timerLogOut);
  timerLogOut = startTimer();
});

// transfer
btnTransfer.addEventListener(`click`, function (event) {
  event.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiver = accounts.find(
    curr => curr.username === inputTransferTo.value
  );
  // console.log(amount, receiver);
  inputTransferAmount.value = inputTransferTo.value = ``;
  if (
    receiver &&
    amount > 0 &&
    amount <= currentAccount.balance &&
    receiver.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiver.movements.push(amount);

    // add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiver.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);

    // reset timer
    clearInterval(timerLogOut);
    timerLogOut = startTimer();
  }
});

// close account

btnClose.addEventListener(`click`, function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    accounts.splice(index, 1);
    // hide ui
    containerApp.style.opacity = 0;
    labelWelcome.textContent = `Log in to get started`;
  }
  inputCloseUsername.value = inputClosePin.value = ``;
});

let sorted = false;
btnSort.addEventListener(`click`, function (e) {
  e.preventDefault();
  displayTransactions(currentAccount, !sorted);
  sorted = !sorted;
  // reset timer
  clearInterval(timerLogOut);
  timerLogOut = startTimer();
});

//console.log(containerMovements.innerHTML);

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// // Timers setTimeout setInterval

// const hams = [`punch`, `kick`, `fight`];
// // milliseconds
// const punchTimer = setTimeout(
//   (ham1, ham2, ham3) =>
//     console.log(`Shablam 👊. ${hams.join(` and `)}. ${ham1}.`),
//   2599,
//   ...hams
// );
// // asynchronous javascript
// console.log(`Hello`);
// if (hams.includes(`bite`)) clearTimeout(punchTimer);

// // setInterval
// setInterval(function () {
//   const optionsT = {
//     hour: `2-digit`,
//     minute: `2-digit`,
//     second: `2-digit`,
//   };
//   const presentTime = new Intl.DateTimeFormat(`en-US`, optionsT).format();
//   console.log(presentTime);
// }, 1000);

// // Internationalizing Numbers

// const numI = 3884321.4132;
// const optionsNI = {
//   style: `unit`,
//   unit: `fahrenheit`,
// };
// const optionsNIcurr = {
//   style: `currency`,
//   currency: `EUR`,
//   useGrouping: true,
// };
// const optionsNIpercent = {
//   style: `percent`,
//   // unit ignored
//   unit: `fahrenheit`,
// };

// console.log(`Merica: `, new Intl.NumberFormat(`en-US`, optionsNI).format(numI));
// console.log(
//   `Deutschland: `,
//   new Intl.NumberFormat(`de-DE`, optionsNI).format(numI)
// );
// console.log(`Syria: `, new Intl.NumberFormat(`ar-SY`, optionsNI).format(numI));
// console.log(
//   `Browser: `,
//   new Intl.NumberFormat(navigator.language, optionsNIcurr).format(numI)
// );

// // Operations with Dates
// const future2 = new Date(2037, 10, 19, 15, 23);
// console.log(+future2);
// const daysPassed2 = (date1, date2) =>
//   Math.abs((date2 - date1) / (1000 * 60 * 60 * 24));

// console.log(daysPassed2(future2, new Date(2039, 1, 23, 12, 32)));
// console.log(daysPassed2(new Date(2039, 1, 23, 12, 32), future2));

// // Dates and Times

// const present = new Date();
// console.log(present);

// console.log(new Date(`Sep 03 2023 13:03:31`));

// console.log(new Date(`July 4, 2022`));
// console.log(new Date(account1.movementsDates[0]));

// console.log(new Date(2044, 10, 18, 23, 5));
// // nov only has 30 days so it goes to the next day dec 1
// console.log(new Date(2044, 10, 31, 3, 3, 3));
// console.log(new Date(0));
// // 3 days later 3 times hours minutes seconds milliseconds
// // gives timestamp
// console.log(new Date(3 * 24 * 60 * 60 * 1000));

// // working with dates
// const future = new Date(2077, 1, 23, 23, 2, 3);
// console.log(future);
// console.log(future.getFullYear());
// console.log(future.getMonth());
// // day of the month
// console.log(future.getDate());
// // day of the week
// console.log(future.getDay());
// console.log(future.getHours());
// console.log(future.getMinutes());
// console.log(future.getSeconds());
// console.log(future.toISOString());
// console.log(future.getTime());

// console.log(new Date(3381368523000));
// console.log(Date.now());

// // set for everything
// future.setFullYear(2078);
// console.log(future);

// // Big Int

// console.log(2 ** 53 - 1);
// console.log(Number.MAX_SAFE_INTEGER);
// // not always accurate above this number
// console.log(2 ** 53 + 1);
// console.log(2 ** 53 + 2);
// console.log(2 ** 53 + 0);

// console.log(98170985872349857203475029384750928n);
// // the constructor doesn't work the same
// console.log(BigInt(98170985872349857203475029384750928));

// // operations
// console.log(1000n + 1200n);
// console.log(20192384019238409n * 1234n);

// const huge = 12394871029384701932n;
// const num = 32142;
// // cant combine big int and regular int
// console.log(huge * BigInt(num));

// console.log(20n > 15);
// console.log(20n === 20);
// console.log(typeof 203n);
// console.log(32n == 32);
// console.log(32n == `32`);
// console.log(huge + ` is really swell.`);
// // big int doesnt work with Math methods
// //console.log(Math.sqrt(huge));

// // division
// console.log(13n / 4n);
// console.log(13 / 4);

// // Remainder

// console.log(5 % 2);
// console.log(8 % 5);
// // finding even numbers
// console.log(9 % 2 === 0);
// const isEven = n => n % 2 === 0;
// console.log(isEven(15));
// console.log(isEven(Math.round(Math.random() * 5 + 1)));

// labelBalance.addEventListener(`click`, function () {
//   [...document.querySelectorAll(`.movements__row`)].forEach(function (row, i) {
//     if (i % 2 === 0) row.style.backgroundColor = `orange`;
//     if (i % 3 === 0) row.style.backgroundColor = `gray`;
//   });
// });

// // Math and Rounding

// console.log(Math.sqrt(16));
// console.log(36 ** (1 / 2));
// console.log(27 ** (1 / 3));

// console.log(Math.max(4, 34, 23, 55, 41));
// console.log(Math.max(4, `34`, 23, 55, 41));
// console.log(Math.max(4, `34rpg`, 23, 55, 41));
// console.log(Math.min(4, `34`, 23, 55, 41));

// console.log(Math.PI * Number.parseFloat(`10px`) ** 2);

// console.log(Math.trunc(Math.random() * 6) + 1);

// const randomInt = (min, max) => Math.round(Math.random() * (max - min)) + min;
// // 0...1 random * max - min = 0...(max - min)
// // + min = min...max

// console.log(randomInt(5, 15));

// // rounding ints
// console.log(Math.trunc(23.3));
// console.log(Math.round(43.12));

// console.log(Math.ceil(33.3));

// console.log(Math.floor(324.12));
// console.log(Math.floor(`324.12`));

// //trunc and floor the same when dealing with positive numbers

// console.log(Math.floor(-32.53));
// console.log(Math.trunc(-32.53));

// // floating point numbers, decimals
// // to fixed returns string
// console.log((2.43).toFixed(0));
// console.log((2.43).toFixed(3));
// console.log(+(2.43).toFixed(1));

// // Converting and Checking Numbers

// console.log(23 === 23.0);
// console.log(0.1 + 0.2);
// console.log(0.1 + 0.2 === 0.3);

// // conversion

// console.log(Number(`54`));
// console.log(+`32`);

// // parsing
// // has to start with number
// // second entry is the base
// console.log(Number.parseInt(`30px`, 10));
// console.log(Number.parseInt(`e65`));

// console.log(Number.parseFloat(`43.2rem`));
// console.log(Number.parseInt(`43.2rem`));

// console.log(parseFloat(`   23.4rpg   `));

// console.log(Number.isNaN(20));
// console.log(Number.isNaN(`20`));
// console.log(Number.isNaN(+`20A`));
// console.log(Number.isNaN(23 / 0));
// console.log(23 / 0);

// // best way to check if a number is a real number not a string
// console.log(Number.isFinite(23));
// console.log(Number.isFinite(`13`));
// console.log(Number.isFinite(+`13x`));
// console.log(Number.isFinite(13 / 0));

// console.log(Number.isInteger(23));
// console.log(Number.isInteger(23.0));
// console.log(Number.isInteger(23 / 0));
