const {LocalStorage} = require('node-localstorage');


const localStorage = new LocalStorage('./scratch');
const token = localStorage.getItem('token');
console.log(token); // will output the value of the "token" key in the localStorage
