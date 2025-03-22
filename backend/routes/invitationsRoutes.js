/* eslint-disable import/extensions */
/* eslint-disable camelcase */
import express from 'express';
import authenticateToken from '../authenticateToken.js';

const invitationsRoutes = invitationsCollection => {
  const router = express.Router();
  router.get('/:code', async (req, res) => {
    try {
      const {code} = req.params;
      if (!code) {
        return res.status(400).json({error: 'Missing invitation code'});
      }
      const querySnapshot = await invitationsCollection.where('invitation_code', '==', code).get();
      if (querySnapshot.empty) {
        return res.status(404).send({error: 'Invitation not found'});
      }
      const doc = querySnapshot.docs[0];
      res.status(200).send({id: doc.id, ...doc.data()});
    } catch (error) {
      console.error('Error updating invitation:', error);
      res.status(500).json({error: `Failed to update invitation: ${error}`});
    }
  });
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const {company_id} = req.query;
      const querySnapshot = await invitationsCollection.where('company_id', '==', company_id).get();
      if (querySnapshot.empty) {
        return res.status(404).send({error: 'Invitation not found'});
      }

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
      console.error('Error updating invitation:', error);
      res.status(500).json({error: `Failed to update invitation: ${error}`});
    }
  });
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const {
        company_id,
        invitation_code,
        createdAt,
        recipient_email,
        recipient_name,
        status,
        acceptedAt,
      } = req.body;
      const newInvitation = {};
      if (company_id !== undefined) newInvitation.company_id = company_id;
      if (invitation_code !== undefined) newInvitation.invitation_code = invitation_code;
      if (createdAt !== undefined) newInvitation.createdAt = createdAt;
      if (recipient_email !== undefined) newInvitation.recipient_email = recipient_email;
      if (recipient_name !== undefined) newInvitation.recipient_name = recipient_name;
      if (status !== undefined) newInvitation.status = status;
      if (acceptedAt !== undefined) newInvitation.acceptedAt = acceptedAt;

      await invitationsCollection.add(newInvitation);
      res.status(200).json({message: 'Invitation status added successfully'});
    } catch (error) {
      console.error('Error posting invitation:', error);
      res.status(500).json({error: `Failed to send invitation: ${error}`});
    }
  });
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      if (!req.params.id) throw new Error(`Invitation id is invalid:${req.params.id}`);
      const {
        company_id,
        invitation_code,
        createdAt,
        recipient_email,
        recipient_name,
        status,
        acceptedAt,
      } = req.body;
      const updatedInvitation = {};
      if (company_id !== undefined) updatedInvitation.company_id = company_id;
      if (invitation_code !== undefined) updatedInvitation.invitation_code = invitation_code;
      if (createdAt !== undefined) updatedInvitation.createdAt = createdAt;
      if (recipient_email !== undefined) updatedInvitation.recipient_email = recipient_email;
      if (recipient_name !== undefined) updatedInvitation.recipient_name = recipient_name;
      if (status !== undefined) updatedInvitation.status = status;
      if (acceptedAt !== undefined) updatedInvitation.acceptedAt = acceptedAt;
      await invitationsCollection.doc(req.params.id).update(updatedInvitation);
      res.status(200).json({message: 'Invitation status updated successfully'});
    } catch (error) {
      console.error('Error updating invitation:', error);
      res.status(500).json({error: `Failed to update invitation: ${error}`});
    }
  });
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      await invitationsCollection.delete(req.params.id);
      res.status(200).json({message: 'Invitation deleted successfully'});
    } catch (error) {
      res.status(500).json({error: `Failed to fetch invitation: ${error}`});
    }
  });
  return router;
};

export default invitationsRoutes;
