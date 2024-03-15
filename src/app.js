// src/app.js

import { Auth, getUser } from './auth';
import { getUserFragments, createFragment, apiUrl, getFragmentById } from './api';

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
    
    const contentType = document.getElementById('contentType').value;
    var fileInput = document.getElementById('fileInput').files[0];
    var textInput = document.getElementById('textInput').value;

    // Ensure both content type and file or text are selected
    if (!contentType && (!fileInput || !textInput)) {
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
    formData.append('contentType', contentType);

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
        contentType.innerHTML = `<b>ContentType</b> : ${fragment.type}`;
        listItem.appendChild(contentType);

        const size = document.createElement('ol');
        size.innerHTML = `<b>Size</b> : ${fragment.size}`;
        listItem.appendChild(size);

        const fragmentData = await getFragmentById(user, fragment.id);
        const data = document.createElement('ol');
        data.innerHTML = `<b>Data</b> : ${fragmentData}`;
        listItem.appendChild(data);

      });
      
    } catch (error) {
      alert('Error fetching fragments. Please try again later.');
    }
  };

  // Function to render fragment list
  function renderFragmentList(fragments) {
    
  }

  
  // Log the user's details
  console.log(user);


  // Update the UI to welcome the user
  userSection.hidden = false;
  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;
  // Disable the Login button
  loginBtn.disabled = true;
}


// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);