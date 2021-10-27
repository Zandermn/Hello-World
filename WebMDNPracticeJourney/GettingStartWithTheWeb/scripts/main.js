//get the reference of img
let myImage = document.querySelector('img');

//reference onclick function
myImage.onclick = function() {
    //get src reference from the reference of img
    let mySrc = myImage.getAttribute('src');
    if(mySrc === 'images/sexyGirl.jpg') {
      myImage.setAttribute('src','images/sexyGirl01.jpg');
    } else {
      myImage.setAttribute('src','images/sexyGirl.jpg');
    }
}



//get get reference of button and h1 elemetn from html
let myButton = document.querySelector('button');
let myHeading = document.querySelector('h1');

//this function is only for changing user name 
//It create prompt to get user name and make sure it's not null
//Then it storage it to localstorage and change the h1 textcontent
function setUserName() {
  let myName = prompt('Please enter your name.');
  if(!myName) {
    setUserName();
  } else {
    localStorage.setItem('name', myName);
    myHeading.textContent = 'Mozilla is cool, ' + myName;
  }
}

//this function is only for initialize to check the localstorage
if(!localStorage.getItem('name')) {
    setUserName();
} else {
    let storedName = localStorage.getItem('name');
    myHeading.textContent = 'Mozilla is cool, ' + storedName;
}

//onclick function from button reference
myButton.onclick = function() {
    setUserName();
}