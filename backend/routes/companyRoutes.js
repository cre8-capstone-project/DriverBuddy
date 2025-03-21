/* eslint-disable import/extensions */
/* eslint-disable camelcase */
import express from 'express';
import authenticateToken from '../authenticateToken.js';

const companyRoutes = companyCollection => {
  const router = express.Router();

  router.post('/', authenticateToken, async (req, res) => {
    try {
      const {name} = req.body;

      const companyRef = await companyCollection.add({
        name,
        createdAt: new Date().toDateString(),
      });

      const companyId = companyRef.id;

      res.status(201).send({
        id: companyId,
        name,
      });
    } catch (error) {
      res.status(500).send({error: `Failed to create company: ${error.message}`});
    }
  });

  router.get('/', authenticateToken, async (req, res) => {
    console.log("Getting '/companies'...");
    try {
      const snapshot = await companyCollection.get();
      const companies = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      res.status(200).send(companies);
    } catch (error) {
      res.status(500).send({error: `Failed to fetch companies: ${error}`});
    }
  });

  router.get('/:id', authenticateToken, async (req, res) => {
    try {
      const doc = await companyCollection.doc(req.params.id).get();
      if (!doc.exists) return res.status(404).send({error: 'Company not found'});
      res.status(200).send({id: doc.id, ...doc.data()});
    } catch (error) {
      res.status(500).send({error: `Failed to fetch company: ${error}`});
    }
  });

  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const {id} = req.params;
      const {name} = req.body;

      // Create a new company object with the updated fields - only include defined values
      const updatedCompany = {};

      // Only add fields that are defined
      if (name !== undefined) updatedCompany.name = name;

      // Only proceed with the update if there are fields to update
      if (Object.keys(updatedCompany).length > 0) {
        await companyCollection.doc(id).update(updatedCompany);
      }

      const updatedCompanyDoc = await companyCollection.doc(id).get();
      const updatedCompanyData = updatedCompanyDoc.data();
      updatedCompanyData.id = id;
      res.status(200).send(updatedCompanyData);
    } catch (error) {
      console.error('Error updating company:', error);
      res.status(500).send({error: `Failed to update company: ${error.message}`});
    }
  });

  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      await companyCollection.doc(req.params.id).delete();
      res.status(200).send({message: 'Company deleted'});
    } catch (error) {
      res.status(500).send({error: `Failed to delete company: ${error}`});
    }
  });
  return router;
};
export default companyRoutes;
