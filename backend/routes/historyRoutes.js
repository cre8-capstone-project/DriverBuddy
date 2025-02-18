import express from 'express';

const historyRoutes = (historyCollection, driverCollection, admin) => {
  const router = express.Router();

  // ✅ Create a new history record
  router.post('/', async (req, res) => {
    try {
      const {
        numberOfAlerts,
        startingPointName,
        startingPointCoordinates,
        destinationName,
        destinationCoordinates,
        distanceInKm,
        driverID,
        durationInMinutes,
      } = req.body;

      if (!driverID) {
        return res.status(400).send({error: 'driverID is required'});
      }

      // Validate driver exists
      const driverRef = driverCollection.doc(driverID);
      const driverSnapshot = await driverRef.get();
      if (!driverSnapshot.exists) {
        return res.status(404).send({error: 'Driver not found'});
      }

      // Create new history entry
      const newHistory = {
        numberOfAlerts,
        startingPointName,
        startingPointCoordinates,
        destinationName,
        destinationCoordinates,
        distanceInKm,
        driverID: driverRef, // Firestore reference
        durationInMinutes,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await historyCollection.add(newHistory);
      res.status(201).send({id: docRef.id, ...newHistory});
    } catch (error) {
      res.status(500).send({error: `Failed to create history record: ${error}`});
    }
  });

  // ✅ Get all history records
  router.get('/', async (req, res) => {
    try {
      const snapshot = await historyCollection.get();
      const historyRecords = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      res.status(200).send(historyRecords);
    } catch (error) {
      res.status(500).send({error: `Failed to fetch history records: ${error}`});
    }
  });

  // ✅ Get a history record by ID
  router.get('/:id', async (req, res) => {
    try {
      const doc = await historyCollection.doc(req.params.id).get();
      if (!doc.exists) return res.status(404).send({error: 'History record not found'});
      res.status(200).send({id: doc.id, ...doc.data()});
    } catch (error) {
      res.status(500).send({error: `Failed to fetch history record: ${error}`});
    }
  });

  // ✅ Get history records for a specific driver
  router.get('/driver/:driverID', async (req, res) => {
    try {
      const snapshot = await historyCollection
        .where('driverID', '==', driverCollection.doc(req.params.driverID))
        .get();

      if (snapshot.empty) {
        return res.status(404).send({message: 'No history records found for this driver'});
      }

      const historyRecords = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      res.status(200).send(historyRecords);
    } catch (error) {
      res.status(500).send({error: `Failed to fetch driver history: ${error}`});
    }
  });

  // ✅ Update a history record
  router.put('/:id', async (req, res) => {
    try {
      const updateData = req.body;
      await historyCollection.doc(req.params.id).update(updateData);
      res.status(200).send({id: req.params.id, ...updateData});
    } catch (error) {
      res.status(500).send({error: `Failed to update history record: ${error}`});
    }
  });

  // ✅ Delete a history record
  router.delete('/:id', async (req, res) => {
    try {
      await historyCollection.doc(req.params.id).delete();
      res.status(200).send({message: 'History record deleted'});
    } catch (error) {
      res.status(500).send({error: `Failed to delete history record: ${error}`});
    }
  });

  return router;
};
export default historyRoutes;
