/* Flip the letter A upside down */
// Get element
const textElement = document.querySelector('.text');
const textContent = textElement.textContent;
flipA(textContent, textElement);

// Listen for text input change
const textInput = document.querySelector('.text-input');
// console.log('input', textInput);
textInput.addEventListener('keyup', function () {
  const textInputVal = textInput.value;
  // console.log('value', textInputVal);
  flipA(textInputVal, textElement);
});

function flipA(text, element) {
  let newText = text.replace(/A/g, '<span>A</span>');
  newText = text.replace(/a/g, '<span>a</span>');

  element.innerHTML = newText;
}