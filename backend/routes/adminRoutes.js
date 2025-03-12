/* eslint-disable camelcase */
import express from 'express';

const adminsRoutes = adminsCollection => {
  const router = express.Router();
  router.get('/:id', async (req, res) => {
    try {
      const {id} = req.params;
      if (!id) {
        return res.status(400).json({error: 'Missing admin id'});
      }
      const querySnapshot = await adminsCollection.where('id', '==', id).get();
      if (querySnapshot.empty) {
        return res.status(404).send({error: 'Admin not found'});
      }
      const doc = querySnapshot.docs[0];
      res.status(200).send({id: doc.id, ...doc.data()});
    } catch (error) {
      console.error('Error getting admin:', error);
      res.status(500).json({error: `Failed to update invitation: ${error}`});
    }
  });
  router.put('/:id', async (req, res) => {
    try {
      const {company_id, createdAt, email, name} = req.body;
      await adminsCollection.doc(req.params.id).update({company_id, createdAt, email, name});
      res.status(200).json({message: 'Admin updated successfully'});
    } catch (error) {
      res.status(500).json({error: `Failed to update Admin: ${error}`});
    }
  });
  router.delete('/:id', async (req, res) => {
    try {
      await adminsCollection.delete(req.params.id);
      res.status(200).json({message: 'Admin deleted successfully'});
    } catch (error) {
      res.status(500).json({error: `Failed to fetch admin: ${error}`});
    }
  });
  return router;
};

export default adminsRoutes;
