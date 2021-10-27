
// document.querySelector  get the refernce which need to be loaded
const myHeading = document.querySelector('h1'); 
//set the text for this variable
myHeading.textContent = 'Hello world!';

/*
document.querySelector('html').onclick = function() {
    alert('Ouch! Stop poking me!');
};
*/
let myHtml = document.querySelector('html');
myHtml.onclick = function() {
    alert('Ouch! Stop poking me!');
}

