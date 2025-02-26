/* eslint-disable camelcase */
import express from 'express';

const driverRoutes = driverCollection => {
  const router = express.Router();

  router.post('/', async (req, res) => {
    try {
      const {name, email, phone, vehicle_type, user_type} = req.body;
      const newDriver = {name, email, phone, vehicle_type, user_type};
      const docRef = await driverCollection.add(newDriver);
      res.status(201).send({id: docRef.id, ...newDriver});
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
      const {name, email, phone, birthday, vehicle_type, user_type} = req.body;
      await driverCollection
        .doc(req.params.id)
        .update({name, email, phone, birthday, vehicle_type, user_type});
      res
        .status(200)
        .send({id: req.params.id, name, email, phone, birthday, vehicle_type, user_type});
    } catch (error) {
      res.status(500).send({error: `Failed to update driver: ${error}`});
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
