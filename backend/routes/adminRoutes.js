/* eslint-disable camelcase */
import express from 'express';
// eslint-disable-next-line import/extensions
import authenticateToken from '../authenticateToken.js';

const adminsRoutes = adminsCollection => {
  const router = express.Router();
  router.get('/:id', authenticateToken, async (req, res) => {
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
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const {company_id, email, name} = req.body;
      await adminsCollection.doc(req.params.id).update({company_id, email, name});
      res.status(200).json({message: 'Admin updated successfully'});
    } catch (error) {
      res.status(500).json({error: `Failed to update Admin: ${error}`});
    }
  });
  router.post('/:id', async (req, res) => {
    try {
      const {company_id, email, name} = req.body;
      await adminsCollection
        .doc(req.params.id)
        .set({company_id, email, name, createdAt: new Date().toDateString()});
      res.status(200).json({message: 'Admin updated successfully'});
    } catch (error) {
      res.status(500).json({error: `Failed to update Admin: ${error}`});
    }
  });
  router.delete('/:id', authenticateToken, async (req, res) => {
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
