new DataTable('#example');

let edit = document.querySelectorAll('.fa-edit');
let trash = document.querySelectorAll('.fa-trash-o');

// displaying Edit Movie Review (event listener)

edit.forEach((editButton) => {
  editButton.addEventListener('click', () => {
    const movieId = editButton.dataset.movieId;
    const movieTitle = editButton.dataset.movieTitle;
    const rating = editButton.dataset.rating;
    const review = editButton.dataset.review;

    const editForm = document.getElementById('edit-movie-form-window');

    // prepopulate the edit form with existing values

    editForm.querySelector('#edit-movie-id').value = movieId;
    editForm.querySelector('#edit-movie-title').value = movieTitle;
    editForm.querySelector('#edit-rating').value = rating;
    editForm.querySelector('#edit-review').value = review;

    const popup = document.querySelector('.popup');
    const overlay = document.querySelector('.overlay');
    
    // this was originally a function showPopup, but couldn't figure out how to 
    // dynamically populate edit form with existing values. until figuring out,
    // showing popup is built into each Add and Edit review event listener.

    popup.innerHTML = ''; // clear for any previous stuff

    // NOTE: appendChild moves an existing node/element (editForm) from its original position in DOM to new position (parent node popup)
    // this makes it so that clicking out of edit movie form was originally bugged
    // accounted for by wrapping the edit form in a div tag (original-edit) to move form back to its original position

    popup.appendChild(editForm); // add reusable form to the popup
    editForm.classList.remove('hidden'); // make sure form is visible
    overlay.style.display = 'block'; // show the overlay
    popup.style.display = 'block'; // show the popup
  });
});


// 
trash.forEach((trashButton) => {
  trashButton.addEventListener('click', () => {
    // get the review ID
    const movieId = trashButton.dataset.reviewId;
    const confirmDelete = confirm('You sure?');

    if (confirmDelete) {
      fetch(`/profile/delete-review/${movieId}`, {
        method: 'delete',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
          if (response.ok) {
            console.log('Review deleted');
            window.location.reload();
          } else {
            console.error('Review not deleted: ', response.statusText);
          }
      })
      .catch((err) => console.error(err));
    }
  });
});

//  add movie review popup
document.querySelector('#add-movie-button').addEventListener('click', () => {
  const addForm = document.getElementById('add-movie-form-window');
  const popup = document.querySelector('.popup');
  const overlay = document.querySelector('.overlay');

  popup.innerHTML = ''; 
  popup.appendChild(addForm);
  addForm.classList.remove('hidden'); 
  overlay.style.display = 'block'; 
  popup.style.display = 'block';
});

// edit movie
document.querySelector('#edit-movie-form').addEventListener('submit', (event) => {
  event.preventDefault()

  const movieId = document.querySelector('#edit-movie-id').value;
  const movieTitle = document.querySelector('#edit-movie-title').value;
  const rating = document.querySelector('#edit-rating').value;
  const review = document.querySelector('#edit-review').value;

  fetch(`/profile/edit-review`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      movie_id: movieId,
      movie_title: movieTitle,
      rating: rating,
      review: review,
    }),
  })
    .then((response) => {
      if (response.ok) {
        console.log('Review updated');
        window.location.reload(); 
      } else {
        console.error('Failed to update the review');
      }
    })
    .catch((err) => console.error('Error:', err));
});


function closePopup() {
  const popup = document.querySelector('.popup');
  const overlay = document.querySelector('.overlay');
  const editForm = document.getElementById('edit-movie-form-window');

  if (popup && overlay) {
    overlay.style.display = 'none'; 
    popup.style.display = 'none'; 

    // move the form back to its original location because of appendChild usage before
    const originalContainer = document.getElementById('original-edit-form-container');
    if (originalContainer && editForm) {
      editForm.classList.add('hidden');
      originalContainer.appendChild(editForm);
    }
    popup.innerHTML = ''
  }
}

document.querySelector('.overlay').addEventListener('click', closePopup);
