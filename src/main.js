// Open the side navigation menu
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

// Close the side navigation menu
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

// Display word data fetched from the API
function displayWordData(data) {
  console.log('API Response:', data); // Log the API response for debugging

  const entryContainer = document.getElementById('entryContainer');
  entryContainer.innerHTML = '';

  if (data.length > 0) {
      entryContainer.classList.add('visible'); // Show the container
      entryContainer.classList.remove('hidden'); // Ensure hidden class is removed

      const entry = data[0];

      // Display word and source URL if available
      let entryHTML = `<div class="word-info">`;
      entryHTML += `<h2>${entry.word}</h2>`;

      if (entry.sourceUrls && entry.sourceUrls.length > 0) {
          entryHTML += `<p>Source URL: <a href="${entry.sourceUrls[0]}" target="_blank">${entry.sourceUrls[0]}</a></p>`;
      } else {
          entryHTML += `<p>No source URL available</p>`;
      }

      // Display phonetics if available
      if (entry.phonetics && entry.phonetics.length > 0) {
          entry.phonetics.forEach(phonetic => {
              if (phonetic.text) {
                  entryHTML += `<p id="phonetic">Phonetic: ${phonetic.text}</p>`;
              }
              if (phonetic.audio) {
                  entryHTML += `<audio controls><source src="${phonetic.audio}" type="audio/mpeg">Your browser does not support the audio element.</audio>`;
              } else {
                  entryHTML += `<p>Audio for this word doesn't exist</p>`;
              }
          });
      } else {
          entryHTML += `<p>Phonetic information not available</p>`;
      }

      // Display origin if available
      if (entry.origin) {
          entryHTML += `<p>Origin: ${entry.origin}</p>`;
      } else {
          entryHTML += `<p>Origin information not available</p>`;
      }

      entryHTML += `<button onclick="addToFavorites('${entry.word}', '${entry.phonetics[0]?.audio || ''}', '${entry.phonetics[0]?.sourceUrl || ''}')"><a href="#"><i class='bx bx-bookmark'></i></a></button>`;
      entryHTML += `</div>`;
      entryContainer.innerHTML = entryHTML;

      // Loop through all meanings to display definitions, examples, synonyms, antonyms
      entry.meanings.forEach(meaning => {
          let meaningsHTML = `<div class="meanings">`;
          meaningsHTML += `<h3>${meaning.partOfSpeech}</h3>`;

          // Definitions
          if (meaning.definitions && meaning.definitions.length > 0) {
              meaningsHTML += `<div class="definitions">`;
              meaningsHTML += `<h4>Definitions:</h4>`;
              meaning.definitions.slice(0, 3).forEach(definition => {
                  meaningsHTML += `<p>${definition.definition}</p>`;
                  if (definition.sourceUrl) {
                      meaningsHTML += `<p>Source: <a href="${definition.sourceUrl}" target="_blank">${definition.sourceUrl}</a></p>`;
                  }
              });
              meaningsHTML += `</div>`;
          }

          // Examples
          if (meaning.definitions[0].example) {
              meaningsHTML += `<div class="examples">`;
              meaningsHTML += `<h4>Examples:</h4>`;
              meaningsHTML += `<p>${meaning.definitions[0].example}</p>`;
              if (meaning.definitions[0].exampleSourceUrl) {
                  meaningsHTML += `<p>Source: <a href="${meaning.definitions[0].exampleSourceUrl}" target="_blank">${meaning.definitions[0].exampleSourceUrl}</a></p>`;
              }
              meaningsHTML += `</div>`;
          }

          // Synonyms
          if (meaning.synonyms && meaning.synonyms.length > 0) {
              meaningsHTML += `<div class="synonyms">`;
              meaningsHTML += `<h4>Synonyms:</h4>`;
              meaningsHTML += `<p>${meaning.synonyms.join(', ')}</p>`;
              meaningsHTML += `</div>`;
          }

          // Antonyms
          if (meaning.antonyms && meaning.antonyms.length > 0) {
              meaningsHTML += `<div class="antonyms">`;
              meaningsHTML += `<h4>Antonyms:</h4>`;
              meaningsHTML += `<p>${meaning.antonyms.join(', ')}</p>`;
              meaningsHTML += `</div>`;
          }

          meaningsHTML += `</div>`; // Close meanings div
          entryContainer.innerHTML += meaningsHTML; // Append to entryContainer
      });
  } else {
      entryContainer.classList.add('hidden'); // Hide the container if no data
      entryContainer.classList.remove('visible'); // Ensure visible class is removed
  }
}

// Function to fetch and display Word of the Day
function fetchWordOfTheDay() {
  console.log('Starting fetchWordOfTheDay'); // Debugging line

  // Fetch a random word
  fetch('https://random-word-api.herokuapp.com/word?number=1')
      .then(response => {
          if (!response.ok) {
              throw new Error(`Error fetching random word: ${response.statusText}`);
          }
          return response.json();
      })
      .then(wordArray => {
          if (!Array.isArray(wordArray) || wordArray.length === 0) {
              throw new Error("No random word received");
          }
          const randomWord = wordArray[0];
          console.log(`Random Word: ${randomWord}`); // Debugging line
          return fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${randomWord}`);
      })
      .then(response => {
          if (!response.ok) {
              throw new Error(`Error fetching dictionary data: ${response.statusText}`);
          }
          return response.json();
      })
      .then(data => {
          console.log(data); // Debugging line
          displayWordData(data);
      })
      .catch(error => {
          console.error('Error fetching the Word of the Day:', error);
          document.getElementById('entryContainer').innerText = "Sorry, an error occurred. Please try again.";
      });
}

// Function to search for a word using the dictionary API
function searchWord() {
    const word = document.getElementById('word').value.trim(); // Get the word from the input field
    const type = document.getElementById('type').value.trim(); // Get the type from the dropdown

    // Construct the API URL
    let apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

    // Fetch data from the API
    fetch(apiUrl)
        .then(response => response.json()) // Parse the JSON response
        .then(data => {
            displayWordData(data); // Display the word data
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            const entryContainer = document.getElementById('entryContainer');
            entryContainer.classList.add('hidden'); // Hide the container in case of an error
            entryContainer.classList.remove('visible'); // Ensure visible class is removed
        });
}


// Function to add word to favorites
function addToFavorites(word) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || []; // Get favorites from localStorage or initialize an empty array
  if (!favorites.includes(word)) {
      favorites.push(word); // Add the word if it is not already in favorites
      localStorage.setItem('favorites', JSON.stringify(favorites)); // Save the updated favorites array to localStorage
      alert(`${word} has been added to your favorites!`);
  } else {
      alert(`${word} is already in your favorites!`);
  }
}

// Function to remove word from favorites
function removeFromFavorites(word) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favorites = favorites.filter(favorite => favorite !== word); // Filter out the word to be removed
  localStorage.setItem('favorites', JSON.stringify(favorites)); // Save the updated favorites array to localStorage
  displayFavorites(); // Refresh the favorites display
}

// Function to display favorite words
function displayFavorites() {
    const favoritesContainer = document.getElementById('favoritesContainer');
    favoritesContainer.innerHTML = '';  // Clear the container

    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (favorites.length === 0) {
        favoritesContainer.innerHTML = '<p>You have no favorite words.</p>'; // Display a message if there are no favorites
    } else {
        favorites.forEach(word => {
            // Create a div element for each favorite word
            const wordElement = document.createElement('div');
            wordElement.className = 'favorite-word';
            wordElement.innerHTML = `
                <p id="word-display-${word}">${word}</p>
                <button id="remove-button-${word}" onclick="removeFromFavorites('${word}')">Remove</button>
                <button id="edit" onclick="showEditForm('${word}')">Edit</button>
                <form id="edit-form-${word}" class="edit-form" style="display: none;" onsubmit="updateFavorite(event, '${word}')">
                    <input type="text" id="new-word-${word}" value="${word}">
                    <button  id="save" type="submit">Save</button>
                    <button  id="cancel" type="button" onclick="hideEditForm('${word}')">Cancel</button>
                </form>
            `;
            favoritesContainer.appendChild(wordElement); // Append the word element to the container
        });
    }
}

// Function to show the edit form for a word
function showEditForm(word) {
    document.getElementById(`word-display-${word}`).style.display = 'none'; // Hide the word display
    document.getElementById(`remove-button-${word}`).style.display = 'none'; // Hide the remove button
    document.getElementById(`edit`).style.display = 'none'; // Hide the edit button
    document.getElementById(`edit-form-${word}`).style.display = 'block'; // Show the edit form
}

// Function to hide the edit form for a word
function hideEditForm(word) {
    document.getElementById(`word-display-${word}`).style.display = 'block'; // Show the word display
    document.getElementById(`remove-button-${word}`).style.display = 'inline'; // Show the remove button
    document.getElementById(`edit`).style.display = 'inline'; // Show the edit button
    document.getElementById(`edit-form-${word}`).style.display = 'none'; // Hide the edit form
}

// Function to update a favorite word
function updateFavorite(event, oldWord) {
    event.preventDefault(); // Prevent the default form submission behavior
    const newWord = document.getElementById(`new-word-${oldWord}`).value.trim(); // Get the new word from the input field

    if (newWord) {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const wordIndex = favorites.indexOf(oldWord); // Find the index of the old word

        if (wordIndex !== -1) {
            favorites[wordIndex] = newWord; // Update the word in the favorites array
            localStorage.setItem('favorites', JSON.stringify(favorites)); // Save the updated favorites array to localStorage
            alert(`"${oldWord}" has been updated to "${newWord}"!`);
            displayFavorites();
        } else {
            alert(`"${oldWord}" was not found in your favorites.`);
        }
    } else {
        alert('The new word cannot be empty.');
    }
}

