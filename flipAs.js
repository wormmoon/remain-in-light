/* Flip the letter A upside down */
// Get element
const textElement = document.querySelector('.text');
const textContent = textElement.textContent;

if(textContent.indexOf('A') !== -1) {
  // Adding the 'g' switch in the regex here replaces all occurences
  // of the substring
  const newText = textContent.replace(/A/g, '<span>A</span>');

  textElement.innerHTML = newText;
}