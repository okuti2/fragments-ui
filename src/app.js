// src/app.js

import { Auth, getUser } from './auth';
import { getUserFragments, createFragment, apiUrl, getFragmentById, deleteFragment, updateFragment } from './api';

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  const fragmentForm = document.querySelector('#fragments');
  const getFragmentsBtn = document.querySelector('#getFragments');
  const fragmentList = document.querySelector('#fragmentList');


  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-out
    Auth.signOut();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    return;
  }

  document.getElementById('clear').addEventListener('click', function() {
    document.getElementById('fileInput').value = '';
    document.getElementById('textInput').value = '';
    document.getElementById('contentType').selectedIndex = 0;
  });

  // Wire up event handler to deal with fragment form submission
  fragmentForm.onclick = async (event) => {
    fragmentList.hidden = true;
    event.preventDefault(); // Prevent default form submission behavior
    
    const content = document.getElementById('contentType').value;
    var fileInput = document.getElementById('fileInput').files[0];
    var textInput = document.getElementById('textInput').value;

    // Ensure both content type and file or text are selected
    if (!content && (!fileInput || !textInput)) {
      alert('Please select content type and upload a file.');
      return;
    }

    if(fileInput && textInput){
        alert('Please select either file or text, not both.');
        return;
    }

    // Create a FormData object to send the file data along with content type
    const formData = new FormData();
    if (fileInput) {
        formData.append('body', fileInput);
    } else {
        formData.append('body', textInput);
    }
    formData.append('contentType', content);

    createFragment(user, formData)
    .then(response => {
      // The fragment was created successfully
      alert('Fragment uploaded successfully');
    })
    .catch(error => {
      // There was an error creating the fragment
      alert('Error uploading fragment. Please try again later.');
    });
  };

  // Do an authenticated request to the fragments API server and log the result
  var userFragments = await getUserFragments(user);


  // Wire up event handler to get fragments
  getFragmentsBtn.onclick = async () => {
    fragmentList.hidden = false;
    try {
      userFragments = await getUserFragments(user);
      fragmentList.innerHTML = ''; // Clear previous list
      userFragments.fragments.forEach(async fragment => {

        const listItem = document.createElement('details');
        const fragmentLink = document.createElement('summary');
        listItem.appendChild(fragmentLink);
        fragmentLink.textContent = fragment.id; // Assuming the fragment object has an `id` property
        fragmentList.appendChild(listItem);

        // Get the fragment metadata
        const id = document.createElement('ol');
        id.innerHTML = `<b>Id</b> : ${fragment.id}`;
        listItem.appendChild(id);

        const ownerId = document.createElement('ol');
        ownerId.innerHTML = `<b>OwnerId</b> : ${fragment.ownerId}`;
        listItem.appendChild(ownerId);

        const created = document.createElement('ol');
        created.innerHTML = `<b>Created</b> : ${fragment.created}`;
        listItem.appendChild(created);

        const updated = document.createElement('ol');
        updated.innerHTML = `<b>Updated</b> : ${fragment.updated}`;
        listItem.appendChild(updated);

        const contentType = document.createElement('ol');
        contentType.id = 'fragmentType';
        contentType.innerHTML = `<b>ContentType</b> : ${fragment.type}`;
        listItem.appendChild(contentType);

        const size = document.createElement('ol');
        size.innerHTML = `<b>Size</b> : ${fragment.size}`;
        listItem.appendChild(size);

        var fragmentData = await getFragmentById(user, fragment.id);
        const data = document.createElement('ol');
        data.id = 'fragmentData';
        data.innerHTML = `<b>Data</b> : ${fragmentData}`;
        listItem.appendChild(data);
        if(fragment.type === 'application/json'){
          fragmentData = JSON.stringify(fragmentData.data);
        }
        else if(fragment.type.startsWith('image')){
          const img = document.createElement('img');
          img.src = fragmentData;
          data.innerHTML = `<b>Data</b> :`;
          data.appendChild(img);
        }
        
        // Add edit and delete buttons
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        listItem.appendChild(editButton);

        editButton.onclick = () => {
          // Creating the option dropdow list to select a new type
          const updatedContentType = document.createElement('select');
          updatedContentType.style.border = '1px solid black';
          updatedContentType.id = 'contentType';
          updatedContentType.placeholder = 'Select content type';
          const option0 = document.createElement('option');
          option0.value = '';
          option0.text = 'Select content type';
          updatedContentType.appendChild(option0);
          const option1 = document.createElement('option');
          option1.value = '.txt';
          option1.text = 'text/plain';
          updatedContentType.appendChild(option1);
          const option2 = document.createElement('option');
          option2.value = '.html';
          option2.text = 'text/html';
          updatedContentType.appendChild(option2);
          const option3 = document.createElement('option');
          option3.value = '.md';
          option3.text = 'text/markdown';
          updatedContentType.appendChild(option3);
          const option4 = document.createElement('option');
          option4.value = '.csv';
          option4.text = 'text/csv';
          updatedContentType.appendChild(option4);
          const option5 = document.createElement('option');
          option5.value = '.json';
          option5.text = 'application/json';
          updatedContentType.appendChild(option5);
          const option6 = document.createElement('option');
          option6.value = '.jpeg';
          option6.text = 'image/jpeg';
          updatedContentType.appendChild(option6);
          const option7 = document.createElement('option');
          option7.value = '.png';
          option7.text = 'image/png';
          updatedContentType.appendChild(option7);
          const option8 = document.createElement('option');
          option8.value = '.gif';
          option8.text = 'image/gif';
          updatedContentType.appendChild(option8);
          const option9 = document.createElement('option');
          option9.value = '.webp';
          option9.text = 'image/webp';
          updatedContentType.appendChild(option9);
          const option10 = document.createElement('option');
          option10.value = '.avif';
          option10.text = 'image/avif';
          updatedContentType.appendChild(option10);

          listItem.appendChild(updatedContentType);
          listItem.appendChild(document.createElement('br'));
          listItem.appendChild(document.createElement('br'));
          // set prompt text for text area and set borders for the text area
          const updatedData = document.createElement('textarea');
          updatedData.placeholder = 'Enter updated data';
          updatedData.style.border = '1px solid black';
          listItem.appendChild(updatedData);
          //Inputed file
          const updatedfileInput = document.createElement('input');
          updatedfileInput.type = 'file';
          updatedfileInput.style.border = '1px solid black';
          updatedfileInput.placeholder = 'Select file to upload';
          listItem.appendChild(updatedfileInput);
          listItem.appendChild(document.createElement('br'));
          listItem.appendChild(document.createElement('br'));
          const updateButton = document.createElement('button');
          updateButton.textContent = 'Update';
          updateButton.onclick = async () => {
            if(updatedData.value && updatedfileInput.value){
              alert('Please select either file or text, not both.');
              updatedfileInput.value = '';
              updatedData.value = '';
              return;
            }
            editFragment(fragment.id, fragment.type, updatedContentType, updatedData, updatedfileInput);// Call editFragment function when clicked
          }
          listItem.appendChild(updateButton);
        } 

       

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => {
          fragmentList.hidden = true;
          removeFragment(fragment.id);
        } // Call deleteFragment function when clicked
        //add multiple spaces before the delete button to separate it from the edit button
        listItem.appendChild(document.createTextNode('        '));
        listItem.appendChild(deleteButton);
        listItem.appendChild(document.createElement('br'));
        listItem.appendChild(document.createElement('br'));



      });
      
    } catch (error) {
      alert('Error fetching fragments. Please try again later.');
    }
  };

  // Update the UI to welcome the user
  userSection.hidden = false;
  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;
  // Disable the Login button
  loginBtn.disabled = true;

  // Function to edit a fragment
  async function editFragment(fragmentId, contentType,  updatedContentType, updatedData, updatedfileInput) {
    //console.log('CONTENT TYPE:', updatedContentType);
    if(updatedContentType.selectedIndex != 0){ //WORKS
     
        //console.log('Content type inside updated:', updatedContentType.value);
        const Fragment = await getFragmentById(user, fragmentId, updatedContentType.value);
        const contentType = document.getElementById('fragmentType');
       // console.log("TYPE BEFORE UPDATING:", contentType.textContent);
        const type = updatedContentType.options[updatedContentType.selectedIndex].text
        //console.log('Updated Content type text:', type);
        contentType.innerHTML = `<b>ContentType</b> : ${type}`;

        const fragmentData = document.getElementById('fragmentData');
        fragmentData.innerHTML = `<b>Data</b> : ${Fragment}`;

    }
    // console.log('Updated Data:', updatedData.value);
    // console.log('Updated File:', updatedfileInput.files[0]);
     if(updatedData.value != "" || updatedfileInput.files[0] != undefined){ // DOES NOT WORK
      //console.log("SHOULD NOT SEE THIS UNLESS YOU SELECTED A FILE OR ENTERED TEXT");

      //console.log('Data:', updatedData.value);
      (updatedfileInput.files[0] == undefined) ? await updateFragment(user, fragmentId, updatedData.value, contentType) : await updateFragment(user, fragmentId, updatedfileInput.files[0], contentType);
      
      // const Fragment = await getFragmentById(user, fragmentId);
      // const fragmentData = document.getElementById('fragmentData');
      // fragmentData.innerHTML = `<b>Data</b> : ${Fragment}`;
    }
    fragmentList.hidden = true;
  }

  // Function to delete a fragment
  async function removeFragment(fragmentId) {
    try {
      // Call the API to delete the fragment
      await deleteFragment(user, fragmentId);
      
      // Remove the fragment from the UI
      // const listItem = document.getElementById(fragmentId);
      // listItem.parentNode.removeChild(listItem);
      
     // alert('Fragment deleted successfully');
    } catch (error) {
      //console.error('Error deleting fragment:', error);
      alert('Error deleting fragment. Please try again later.');
    }
  }

}


// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);