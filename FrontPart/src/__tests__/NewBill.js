/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"


// describe("Given I am connected as an employee", () => {
//   describe("When I am on NewBill Page", () => {
//     test("Then ...", () => {
//       const html = NewBillUI()
//       document.body.innerHTML = html
//       //to-do write assertion

//       this.document = document
//     this.onNavigate = onNavigate
//     this.store = store
//     expect(this.document,     this.onNavigate, this.store = store).toBeTruthy();
//     })
//   })
// })
import NewBill from '../NewBills.js';
import { ROUTES_PATH } from '../constants/routes.js';

describe('NewBill', () => {
  let newBill;

  beforeEach(() => {
    // Mocking dependencies
    const document = {
      querySelector: jest.fn().mockReturnValue({
        addEventListener: jest.fn()
      })
    };

    const onNavigate = jest.fn();
    const store = {
      bills: jest.fn().mockReturnValue({
        create: jest.fn().mockResolvedValue({ fileUrl: 'https://localhost:3456/images/test.jpg', key: '1234' })
      })
    };
    const localStorage = {
      getItem: jest.fn().mockReturnValue(JSON.stringify({ email: 'test@example.com' }))
    };

    // Create a new instance of NewBill before each test
    newBill = new NewBill({ document, onNavigate, store, localStorage });
  });

  describe('handleChangeFile', () => {
    test('should handle file change and create a new bill', () => {
      // Mock file input and file
      const fileInput = { value: 'file.txt' };
      const file = new File(['test'], 'file.txt', { type: 'text/plain' });

      // Call handleChangeFile method
      newBill.handleChangeFile({ preventDefault: jest.fn(), target: { value: fileInput, files: [file] } });

      // Assertions
      expect(newBill.store.bills().create).toHaveBeenCalledWith({
        data: expect.any(FormData),
        headers: { noContentType: true }
      });
      expect(newBill.fileUrl).toEqual('https://localhost:3456/images/test.jpg');
      expect(newBill.fileName).toEqual('file.txt');
    });
  });

  describe('handleSubmit', () => {
    test('should handle form submission and update bill', () => {
      // Mock form data
      const form = {
        preventDefault: jest.fn(),
        target: {
          querySelector: jest.fn().mockImplementation(selector => {
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
          })
        }
      };

      // Call handleSubmit method
      newBill.handleSubmit(form);

      // Assertions
      expect(newBill.updateBill).toHaveBeenCalled();
      expect(newBill.onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
    });
  });

  describe('updateBill', () => {
    test('should update bill if store is available', () => {
      // Mock store.bills().update method
      newBill.store.bills().update = jest.fn().mockResolvedValue();

      // Call updateBill method
      newBill.updateBill({});

      // Assertions
      expect(newBill.store.bills().update).toHaveBeenCalled();
      expect(newBill.onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
    });

    test('should not update bill if store is not available', () => {
      // Set store to null
      newBill.store = null;

      // Call updateBill method
      newBill.updateBill({});

      // Assertions
      expect(newBill.store.bills().update).not.toHaveBeenCalled();
      expect(newBill.onNavigate).not.toHaveBeenCalled();
    });
  });
});
