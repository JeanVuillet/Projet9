/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH } from "../constants/routes.js";

// Mock des dépendances
jest.mock("../containers/Logout.js", () => {
  return jest.fn().mockImplementation(() => {
    return { init: jest.fn() };
  });
});

describe("NewBill", () => {
  let newBill;
  let mockDocument;
  let mockOnNavigate;
  let mockStore;
  let mockLocalStorage;
  let mockFile;
  let fileInputMock;
  let formMock;

  beforeEach(() => {
    // Mock de l'objet document
    mockDocument = {
      querySelector: jest.fn().mockImplementation((selector) => {
        if (selector === `form[data-testid="form-new-bill"]`) {
          return formMock;
        } else if (selector === `input[data-testid="file"]`) {
          return {
            addEventListener: jest.fn(),
            files: [], // Initialisation du tableau files
          };
        }
      }),
      querySelectorAll: jest.fn().mockReturnValue([
        {
          addEventListener: jest.fn(),
        },
      ]),
    };

    // Mock de la fonction onNavigate
    mockOnNavigate = jest.fn();

    // Mock du store
    mockStore = {
      bills: jest.fn().mockReturnValue({
        create: jest.fn().mockResolvedValue({ fileUrl: 'https://localhost:3456/images/test.jpg', key: '1234' }),
        update: jest.fn().mockResolvedValue(),
      }),
    };

    // Mock de localStorage
    mockLocalStorage = {
      getItem: jest.fn().mockReturnValue(JSON.stringify({ email: 'test@example.com' })),
    };

    // Mock du fichier
    mockFile = new File([""], "test.jpg", { type: "image/jpeg" });

    // Mock de l'input de fichier
    fileInputMock = document.createElement("input");
    fileInputMock.setAttribute("data-testid", "file");

    // Mock du formulaire
    formMock = {
      addEventListener: jest.fn(),
      preventDefault: jest.fn(),
      target: {
        querySelector: jest.fn().mockImplementation((selector) => {
          if (selector === 'select[data-testid="expense-type"]') {
            return { value: 'Type' };
          } else if (selector === 'input[data-testid="expense-name"]') {
            return { value: 'Name' };
          } else if (selector === 'input[data-testid="amount"]') {
            return { value: '100' };
          } else if (selector === 'input[data-testid="datepicker"]') {
            return { value: '2024-01-01' };
          } else if (selector === 'input[data-testid="vat"]') {
            return { value: '20' };
          } else if (selector === 'input[data-testid="pct"]') {
            return { value: '20' };
          } else if (selector === 'textarea[data-testid="commentary"]') {
            return { value: 'Comment' };
          }
        }),
      },
    };

    // Création d'une instance de NewBill
    newBill = new NewBill({
      document: mockDocument,
      onNavigate: mockOnNavigate,
      store: mockStore,
      localStorage: mockLocalStorage,
    });
  });

  describe("Constructor", () => {
    test("should add event listeners to form and file input", () => {
      // Vérifier que querySelector a été appelé pour le formulaire
      expect(mockDocument.querySelector).toHaveBeenCalledWith(`form[data-testid="form-new-bill"]`);

      // Vérifier que addEventListener a été appelé pour le formulaire
      expect(formMock.addEventListener).toHaveBeenCalledWith("submit", newBill.handleSubmit);

      // Vérifier que querySelector a été appelé pour l'input de fichier
      expect(mockDocument.querySelector).toHaveBeenCalledWith(`input[data-testid="file"]`);

      // Vérifier que addEventListener a été appelé pour l'input de fichier
      expect(mockDocument.querySelector().addEventListener).toHaveBeenCalledWith("change", newBill.handleChangeFile);
    });

    test("should create a new Logout instance", () => {
      expect(Logout).toHaveBeenCalledWith({ document: mockDocument, localStorage: mockLocalStorage, onNavigate: mockOnNavigate });
    });
  });

  describe("handleChangeFile", () => {
    test("should handle file change and create a new bill", async () => {
      // Mock de l'input de fichier
      mockDocument.querySelector.mockReturnValueOnce(fileInputMock);

      // Simuler le changement de fichier
      const mockEvent = {
        preventDefault: jest.fn(),
        target: { value: "C:\\fakepath\\test.jpg", files: [mockFile] },
      };

      // Appeler handleChangeFile
      fireEvent.change(fileInputMock, mockEvent);

      // Vérifications
      expect(newBill.store.bills().create).toHaveBeenCalledWith({
        data: expect.any(FormData),
        headers: { noContentType: true },
      });
      expect(newBill.fileUrl).toEqual("https://localhost:3456/images/test.jpg");
      expect(newBill.fileName).toEqual("test.jpg");

      // Vérifier que billId est défini
      expect(newBill.billId).toEqual("1234"); // La valeur retournée par mockStore.bills().create

      // Vérifier que la valeur de l'input de fichier n'a pas été réinitialisée
      expect(fileInputMock.value).toBe('C:\\fakepath\\test.jpg');
    });

    test("should handle invalid file extensions", () => {
      // Mock de l'input de fichier avec une extension invalide
      mockDocument.querySelector.mockReturnValueOnce(fileInputMock);

      // Simuler le changement de fichier avec une extension invalide
      const mockFile = new File([""], "test.pdf", { type: "application/pdf" });
      const mockEvent = { target: { value: "C:\\fakepath\\test.pdf", files: [mockFile] }, preventDefault: jest.fn() };

      // Appeler handleChangeFile
      newBill.handleChangeFile(mockEvent);

      // Vérifications
      expect(newBill.store.bills().create).not.toHaveBeenCalled();
      expect(newBill.fileUrl).toBeNull();
      expect(newBill.fileName).toBeNull();

      // Vérifier que la valeur de l'input de fichier a été réinitialisée
      expect(fileInputMock.value).toBe("");

      // Vérifier que l'alerte est affichée
      expect(window.alert).toHaveBeenCalledWith('Extension de fichier non valide. Veuillez sélectionner un fichier PNG, JPG ou JPEG.');
    });
  });

  describe("handleSubmit", () => {
    test("should handle form submission and update bill", async () => {
      // Mock des données du formulaire
      const form = {
        preventDefault: jest.fn(),
        target: {
          querySelector: jest.fn().mockImplementation((selector) => {
            if (selector === 'select[data-testid="expense-type"]') {
              return { value: 'Type' };
            } else if (selector === 'input[data-testid="expense-name"]') {
              return { value: 'Name' };
            } else if (selector === 'input[data-testid="amount"]') {
              return { value: '100' };
            } else if (selector === 'input[data-testid="datepicker"]') {
              return { value: '2024-01-01' };
            } else if (selector === 'input[data-testid="vat"]') {
              return { value: '20' };
            } else if (selector === 'input[data-testid="pct"]') {
              return { value: '20' };
            } else if (selector === 'textarea[data-testid="commentary"]') {
              return { value: 'Comment' };
            }
          }),
        },
      };

      // Appeler la méthode handleSubmit
      await newBill.handleSubmit(form);

      // Vérifications
      expect(newBill.updateBill).toHaveBeenCalled();
      expect(newBill.onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
    });

    test("should handle form submission without file", async () => {
      // Mock des données du formulaire sans fichier
      const form = {
        preventDefault: jest.fn(),
        target: {
          querySelector: jest.fn().mockImplementation((selector) => {
            if (selector === 'select[data-testid="expense-type"]') {
              return { value: 'Type' };
            } else if (selector === 'input[data-testid="expense-name"]') {
              return { value: 'Name' };
            } else if (selector === 'input[data-testid="amount"]') {
              return { value: '100' };
            } else if (selector === 'input[data-testid="datepicker"]') {
              return { value: '2024-01-01' };
            } else if (selector === 'input[data-testid="vat"]') {
              return { value: '20' };
            } else if (selector === 'input[data-testid="pct"]') {
              return { value: '20' };
            } else if (selector === 'textarea[data-testid="commentary"]') {
              return { value: 'Comment' };
            }
          }),
        },
      };

      // Appeler la méthode handleSubmit
      await newBill.handleSubmit(form);

      // Vérifications
      expect(newBill.updateBill).toHaveBeenCalled();
      expect(newBill.onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
    });
  });

  describe("updateBill", () => {
    test("should update bill if store is available", () => {
      // Mock de la méthode store.bills().update
      newBill.store.bills().update = jest.fn().mockResolvedValue();
      newBill.billId = '1234'; // Définir billId avant d'appeler updateBill

      // Appel de la méthode updateBill
      newBill.updateBill({});

      // Vérifications
      expect(newBill.store.bills().update).toHaveBeenCalled();
      expect(newBill.onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
    });

    test("should not update bill if store is not available", () => {
      // Set store to null
      newBill.store = null;

      // Appel de la méthode updateBill
      newBill.updateBill({});

      // Vérifications
      expect(newBill.store.bills().update).not.toHaveBeenCalled();
      expect(newBill.onNavigate).not.toHaveBeenCalled();
    });

    test("should not update bill if billId is not defined", () => {
      // Mock de la méthode store.bills().update
      newBill.store.bills().update = jest.fn().mockResolvedValue();
      // Ne pas définir billId

      // Appel de la méthode updateBill
      newBill.updateBill({});

      // Vérifications
      expect(newBill.store.bills().update).not.toHaveBeenCalled();
      expect(newBill.onNavigate).not.toHaveBeenCalled();
    });
  });

  describe("handleChangeFile - coverage of missing test", () => {
    test("should handle file change and create a new bill with formData", async () => {
      // Mock de l'input de fichier
      mockDocument.querySelector.mockReturnValueOnce(fileInputMock);

      // Simuler le changement de fichier
      const mockEvent = {
        preventDefault: jest.fn(),
        target: { value: "C:\\fakepath\\test.jpg", files: [mockFile] },
      };

      // Appeler handleChangeFile
      await newBill.handleChangeFile(mockEvent);

      // Vérification de l'appel à store.bills().create
      expect(newBill.store.bills().create).toHaveBeenCalledWith({
        data: expect.any(FormData),
        headers: { noContentType: true },
      });

      // Récupérer l'objet FormData passé à store.bills().create
      const formData = newBill.store.bills().create.mock.calls[0][0].data;

      // Vérification du contenu du FormData
      expect(formData.get('file')).toEqual(mockFile);
      expect(formData.get('email')).toEqual('test@example.com'); // Vérification de l'email
    });
  });

});
test("should handle file change and create a new bill with correct formData", async () => {
    // Mock de l'input de fichier
    mockDocument.querySelector.mockReturnValueOnce(fileInputMock);

    // Simuler le changement de fichier
    const mockEvent = {
      preventDefault: jest.fn(),
      target: { value: "C:\\fakepath\\test.jpg", files: [mockFile] },
    };

    // Appeler handleChangeFile
    await newBill.handleChangeFile(mockEvent);

    // Vérification de l'appel à store.bills().create
    expect(newBill.store.bills().create).toHaveBeenCalledWith({
      data: expect.any(FormData),
      headers: { noContentType: true },
    });

    // Récupérer l'objet FormData passé à store.bills().create
    const formData = newBill.store.bills().create.mock.calls[0][0].data;

    // Vérification du contenu du FormData
    expect(formData.get('file')).toEqual(mockFile);
    expect(formData.get('email')).toEqual('test@example.com'); // Vérification de l'email
  });