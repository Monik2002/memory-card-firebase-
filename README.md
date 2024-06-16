# Memory Card Application

This is a simple memory-card application built with React and Firebase. Users can create, update, and view memory cards containing titles, email addresses, and uploaded files/images

## Features

- **Create Card**: Users can add a new memory card by providing a title, email address, and uploading a file.
- **Update Card**: Users can update existing memory cards with a new title, email address, or file.
- **View Card**: Users can view all memory cards with their details.

## Technologies Used

- React
- Firebase Firestore (for storing card data)
- Firebase Storage (for storing uploaded files)
- React Router (for routing)
- Bootstrap (for styling)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- Node.js and npm installed on your machine
- Firebase project set up with Firestore and Storage

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Monik2002/memory-card-app.git

    cd memory-card-app
    ```
2. Install dependencies:

   ```bash
   npm install
   ```

3. Setup Firebase:

   - Create a new Firebase project
   - Enable Firestore and Storage
   - Create a `.env` file in the root directory of the project
   - Add your Firebase project configuration to the `.env` file:

     ```env
     REACT_APP_FIREBASE_API_KEY=your-api-key
     REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
     REACT_APP_FIREBASE_PROJECT_ID=your-project-id
     REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
     REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
     REACT_APP_FIREBASE_APP_ID=your-app-id
     ```

4. Run the app:
5. ```bash
   npm start
   ```
6. The app should now be running on [http://localhost:3000](http://localhost:3000)
7. You can now create, update, and view memory cards


## Usage

- **Create Card**: Click on the "Add Card" button to create a new memory card. Fill in the title, email address, and upload a file to create a card.
- **Update Card**: Click on the "Edit" button on a card to update the title, email address, or file.
- **View Card**: View all memory cards with their details on the home page.
- **Delete Card**: Click on the "Delete" button on a card to delete it.


