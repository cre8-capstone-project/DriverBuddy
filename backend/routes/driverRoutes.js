/* eslint-disable camelcase */
import express from 'express';

const driverRoutes = driverCollection => {
  const router = express.Router();

  router.post('/', async (req, res) => {
    try {
      const {id, name, email, phone, vehicle_type, user_type, picture_url, company_id} = req.body;
      const newDriver = {id, name, email, phone, vehicle_type, user_type, picture_url, company_id};
      await driverCollection.doc(id).set(newDriver);
      res.status(201).send({id, ...newDriver});
    } catch (error) {
      res.status(500).send({error: `Failed to create driver: ${error}`});
    }
  });

  router.get('/', async (req, res) => {
    console.log("Getting '/drivers'...");
    try {
      const snapshot = await driverCollection.get();
      const drivers = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      res.status(200).send(drivers);
    } catch (error) {
      res.status(500).send({error: `Failed to fetch drivers: ${error}`});
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const doc = await driverCollection.doc(req.params.id).get();
      if (!doc.exists) return res.status(404).send({error: 'Driver not found'});
      res.status(200).send({id: doc.id, ...doc.data()});
    } catch (error) {
      res.status(500).send({error: `Failed to fetch driver: ${error}`});
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      const {id} = req.params;
      const {name, email, phone, birthday, vehicle_type, user_type, company_id} = req.body;

      // Create a new driver object with the updated fields - only include defined values
      const updatedDriver = {};

      // Only add fields that are defined
      if (name !== undefined) updatedDriver.name = name;
      if (email !== undefined) updatedDriver.email = email;
      if (phone !== undefined) updatedDriver.phone = phone;
      if (vehicle_type !== undefined) updatedDriver.vehicle_type = vehicle_type;
      if (user_type !== undefined) updatedDriver.user_type = user_type;
      if (company_id !== undefined) updatedDriver.company_id = company_id;
      if (birthday !== undefined) updatedDriver.birthday = birthday;

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
  router.delete('/:id', async (req, res) => {
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
