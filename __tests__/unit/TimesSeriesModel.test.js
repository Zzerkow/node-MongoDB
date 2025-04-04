const mongoose = require('mongoose');
const TimeSeries = require('../../models/TimesSeriesModel');

describe('Modèle TimeSeries', () => {
  describe('Validation du schéma', () => {
    it('devrait créer une entrée valide avec un timestamp', async () => {
      const timestamp = new Date('2023-01-01T12:00:00Z');
      const entreeValide = {
        timestamp: timestamp,
        value: 42.5
      };

      const entry = new TimeSeries(entreeValide);
      const savedEntry = await entry.save();
      
      expect(savedEntry._id).toBeDefined();
      expect(savedEntry.value).toBe(entreeValide.value);
      expect(savedEntry.timestamp.toISOString()).toBe(timestamp.toISOString());
    });

    it('devrait créer une entrée valide avec un timestamp par défaut', async () => {
      const avantSauvegarde = new Date();
      const entreeValide = {
        value: 37.8
      };

      const entry = new TimeSeries(entreeValide);
      const savedEntry = await entry.save();
      const apresSauvegarde = new Date();
      
      expect(savedEntry._id).toBeDefined();
      expect(savedEntry.value).toBe(entreeValide.value);
      expect(savedEntry.timestamp).toBeDefined();
      
      const timestamp = new Date(savedEntry.timestamp);
      expect(timestamp >= avantSauvegarde).toBe(true);
      expect(timestamp <= apresSauvegarde).toBe(true);
    });

    it('devrait échouer si la valeur est manquante', async () => {
      const entreeInvalide = {
        timestamp: new Date()
      };

      const entry = new TimeSeries(entreeInvalide);
      await expect(entry.save()).rejects.toThrow();
    });

    it('devrait échouer si la valeur n’est pas un nombre', async () => {
      const entreeInvalide = {
        timestamp: new Date(),
        value: 'pas-un-nombre'
      };

      const entry = new TimeSeries(entreeInvalide);
      await expect(entry.save()).rejects.toThrow();
    });
  });

  describe('Fonctionnalité série temporelle', () => {
    beforeEach(async () => {
      await TimeSeries.create([
        {
          timestamp: new Date('2023-01-01T00:00:00Z'),
          value: 10
        },
        {
          timestamp: new Date('2023-01-02T00:00:00Z'),
          value: 20
        },
        {
          timestamp: new Date('2023-01-03T00:00:00Z'),
          value: 30
        }
      ]);
    });

    it('devrait permettre les requêtes temporelles', async () => {
      const dateDebut = new Date('2023-01-01T12:00:00Z');
      const dateFin = new Date('2023-01-03T12:00:00Z');
      
      const entreesDansIntervalle = await TimeSeries.find({
        timestamp: {
          $gte: dateDebut,
          $lte: dateFin
        }
      });
      
      expect(entreesDansIntervalle.length).toBe(2);
      expect(entreesDansIntervalle.some(entry => entry.value === 20)).toBe(true);
      expect(entreesDansIntervalle.some(entry => entry.value === 30)).toBe(true);
      expect(entreesDansIntervalle.some(entry => entry.value === 10)).toBe(false);
    });

    it('devrait trier les entrées par timestamp', async () => {
      const entreesAsc = await TimeSeries.find().sort({ timestamp: 1 });
      
      expect(entreesAsc.length).toBe(3);
      expect(entreesAsc[0].value).toBe(10);
      expect(entreesAsc[1].value).toBe(20);
      expect(entreesAsc[2].value).toBe(30);
      
      const entreesDesc = await TimeSeries.find().sort({ timestamp: -1 });
      
      expect(entreesDesc.length).toBe(3);
      expect(entreesDesc[0].value).toBe(30);
      expect(entreesDesc[1].value).toBe(20);
      expect(entreesDesc[2].value).toBe(10);
    });
  });
});
