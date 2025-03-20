/* eslint-disable camelcase */
import express from 'express';
// eslint-disable-next-line import/extensions
import authenticateToken from '../authenticateToken.js';

const driverRoutes = driverCollection => {
  const router = express.Router();
  router.get('/:id', authenticateToken, async (req, res) => {
    try {
      const doc = await driverCollection.doc(req.params.id).get();
      if (!doc.exists) return res.status(404).send({error: 'Driver not found'});
      res.status(200).send({id: doc.id, ...doc.data()});
    } catch (error) {
      res.status(500).send({error: `Failed to fetch driver: ${error}`});
    }
  });
  router.get('/email/:email', async (req, res) => {
    try {
      const {email} = req.params;
      const querySnapshot = await driverCollection.where('email', '==', email).get();

      // Create an array to store the documents
      const dbData = [];

      // Loop through the documents and add them to the array
      querySnapshot.forEach(doc => {
        dbData.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      // Check if any documents were found
      if (dbData.length > 0) {
        res.status(200).send(dbData);
      } else {
        // Return 404 if no driver found with the given email
        res.status(404).send({error: `No driver exists with this email: ${email}`});
      }
    } catch (error) {
      res.status(500).send({error: `Failed to fetch driver: ${error.message}`});
    }
  });
  router.get('/company/:company_id', authenticateToken, async (req, res) => {
    try {
      const {company_id} = req.params;
      const querySnapshot = await driverCollection.where('company_id', '==', company_id).get();

      // Create an array to store the documents
      const dbData = [];

      // Loop through the documents and add them to the array
      querySnapshot.forEach(doc => {
        dbData.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      res.status(200).send(dbData);
    } catch (error) {
      res.status(500).send({error: `Failed to fetch driver: ${error}`});
    }
  });
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const {id, name, email, user_type, picture_url, company_id} = req.body;
      const newDriver = {id, name, email, user_type, picture_url, company_id};
      await driverCollection.doc(id).set(newDriver);
      res.status(201).send({id, ...newDriver});
    } catch (error) {
      res.status(500).send({error: `Failed to create driver: ${error}`});
    }
  });

  router.get('/', authenticateToken, async (req, res) => {
    console.log("Getting '/drivers'...");
    try {
      const snapshot = await driverCollection.get();
      const drivers = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      res.status(200).send(drivers);
    } catch (error) {
      res.status(500).send({error: `Failed to fetch drivers: ${error}`});
    }
  });

  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const {id} = req.params;
      const {name, email, birthday, user_type, company_id, picture_url} = req.body;

      // Create a new driver object with the updated fields - only include defined values
      const updatedDriver = {};

      // Only add fields that are defined
      if (name !== undefined) updatedDriver.name = name;
      if (email !== undefined) updatedDriver.email = email;
      if (user_type !== undefined) updatedDriver.user_type = user_type;
      if (company_id !== undefined) updatedDriver.company_id = company_id;
      if (birthday !== undefined) updatedDriver.birthday = birthday;
      if (picture_url !== undefined) updatedDriver.picture_url = picture_url;

      // Only proceed with the update if there are fields to update
      if (Object.keys(updatedDriver).length > 0) {
        // Update the driver document in Firestore
        await driverCollection.doc(id).update(updatedDriver);
      }

      // Get the updated driver document to return in the response
      const updatedDriverDoc = await driverCollection.doc(id).get();
      const updatedDriverData = updatedDriverDoc.data();

      res.status(200).send(updatedDriverData);
    } catch (error) {
      console.error('Error updating driver:', error);
      res.status(500).send({error: `Failed to update driver: ${error.message}`});
    }
  });

  // ✅ Delete a driver by ID
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      await driverCollection.doc(req.params.id).delete();
      res.status(200).send({message: 'Driver deleted'});
    } catch (error) {
      res.status(500).send({error: `Failed to delete driver: ${error}`});
    }
  });
  return router;
};
export default driverRoutes;
