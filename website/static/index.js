// take the noteid that we pass, send a post request to the delete-note end point, then its going reload the window (window.location.href = "/";)
// This is for note deletion
function deleteNote(noteId) {
  // send request to the end point using fetch()
  fetch("/delete-note", {
    method: "POST",
    body: JSON.stringify({ noteId: noteId }),
  }).then((_res) => {
    window.location.href = "/";
  });
}
