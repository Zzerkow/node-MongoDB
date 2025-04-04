const mongoose = require('mongoose');

// Mock de la connexion mongoose
jest.mock('mongoose', () => {
  const originalMongoose = jest.requireActual('mongoose');
  
  // Fonction mock qui retourne un faux modèle
  const mockModel = (modelName, schema) => {
    // Collection fictive associée au modèle
    const mockCollection = {
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 0 })
    };
    
    // Classe fictive du modèle
    class MockModel {
      constructor(data) {
        Object.assign(this, data);
        this._id = new originalMongoose.Types.ObjectId();
      }
      
      // Méthode statique find simulée
      static find() {
        return {
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([]) // retourne un tableau vide
        };
      }

      // findById fictif
      static findById() {
        return {
          exec: jest.fn().mockResolvedValue(null)
        };
      }

      // findByIdAndUpdate fictif
      static findByIdAndUpdate() {
        return {
          exec: jest.fn().mockResolvedValue(null)
        };
      }

      // findByIdAndDelete fictif
      static findByIdAndDelete() {
        return {
          exec: jest.fn().mockResolvedValue({ deletedCount: 1 })
        };
      }

      // create fictif : gère un ou plusieurs objets
      static create(data) {
        if (Array.isArray(data)) {
          return Promise.resolve(data.map(item => new MockModel(item)));
        }
        return Promise.resolve(new MockModel(data));
      }

      // Méthode save fictive
      save() {
        return Promise.resolve(this);
      }
    }

    // Ajoute le schéma au modèle fictif
    MockModel.schema = schema;
    
    return MockModel;
  };
  
  // Objet mongoose mocké avec les fonctions surchargées
  return {
    ...originalMongoose,
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    model: mockModel,
    connection: {
      collections: {}
    }
  };
});

// Configuration avant tous les tests
beforeAll(async () => {
  console.log('Utilisation du mock MongoDB pour les tests');
});

// Nettoyage après tous les tests
afterAll(async () => {
  // Pas besoin de déconnexion réelle
});

// Nettoyage après chaque test
afterEach(async () => {
  // Pas besoin de vider les collections
});
