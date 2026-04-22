# CPTS489-Spring-26-Ecommerce-Project

Usage Instructions:
- Download all files to a folder with
  `git clone https://github.com/JimKino/CPTS489-Spring-26-Ecommerce-Project`
- In that folder run `npm install` to download dependencies
- run `npm start`
- open your browser of choice and navigate to `localhost:3000/`

Restoring the Database:
Delete the storedb.sqlite file and create a copy of the CLEANstoredb.sqlite. Rename the copy storedb.sqlite.

Alternativley since the application will create any missing tables when ran, delete everything in the storedb.sqlite file and un-comment out the 'TESTING DEFAULT VALUES' section in the app.js file, then run the application.
IMPORTANT! do not forget to comment the testing section out again otherwise you will run into duplicate entry errors upon restarting the application.
