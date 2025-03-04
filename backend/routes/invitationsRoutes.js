/* eslint-disable camelcase */
import express from 'express';
/*
type Invitation = {
  invitationsId: string;
  userId: string;
  startTime: admin.firestore.Timestamp;
  endTime: admin.firestore.Timestamp;
  sessionDuration: number;
  alerts?: admin.firestore.Timestamp[];
};
*/
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
  router.put('/:id', async (req, res) => {
    try {
      const {company_id, invitation_code, createdAt, recipient_email, recipient_name, status} =
        req.body;
      await invitationsCollection
        .doc(req.params.id)
        .update({company_id, invitation_code, createdAt, recipient_email, recipient_name, status});
      res.status(200).json({message: 'Invitation status updated successfully'});
    } catch (error) {
      console.error('Error fetching daily data:', error);
      res.status(500).json({error: `Failed to fetch daily history records: ${error}`});
    }
  });
  return router;
};

export default invitationsRoutes;
