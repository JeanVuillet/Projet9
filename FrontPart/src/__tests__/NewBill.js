import { screen, fireEvent, within } from "@testing-library/dom";
import "@testing-library/jest-dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { bills } from "../fixtures/bills.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

const setNewBill = () => {
  return new NewBill({
    document,
    onNavigate,
    store: mockStore,
    localStorage: window.localStorage,
  });
};

beforeAll(() => {
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });

  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
      email: "a@a",
    })
  );
});

beforeEach(() => {

  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router(); // Rendu de Router
  document.body.innerHTML = NewBillUI(); // Rendu de NewBillUI
  window.onNavigate(ROUTES_PATH.NewBill); 

  // Ajout des éléments layout-icon1 et layout-icon2 dans le DOM
  const divIcon1 = document.createElement("div");
  divIcon1.setAttribute("id", "layout-icon1");
  document.body.appendChild(divIcon1);

  const divIcon2 = document.createElement("div");
  divIcon2.setAttribute("id", "layout-icon2");
  document.body.appendChild(divIcon2);


  // const root = document.createElement("div");
  // root.setAttribute("id", "root");
  // document.body.append(root);
  // router();

  document.body.innerHTML = NewBillUI();

  window.onNavigate(ROUTES_PATH.NewBill);
});

afterEach(() => {
  jest.resetAllMocks();
  document.body.innerHTML = "";
});







describe("When I do fill fields in correct format and I click on submit button", () => {
  test("Then the submission process should work properly, and I should be sent on the Bills Page with a higher coverage rate", async () => {
    const onNavigate = pathname => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    const newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });

    const inputData = bills[0];
    inputData.pct = 0.9; // Set a higher coverage rate

    const newBillForm = screen.getByTestId("form-new-bill");

    fireEvent.change(screen.getByTestId("expense-name"), {
      target: { value: inputData.name },
    });
    fireEvent.change(screen.getByTestId("datepicker"), {
      target: { value: inputData.date },
    });
    fireEvent.change(screen.getByTestId("amount"), {
      target: { value: inputData.amount },
    });
    fireEvent.change(screen.getByTestId("vat"), {
      target: { value: inputData.vat },
    });
    fireEvent.change(screen.getByTestId("pct"), {
      target: { value: inputData.pct },
    });
    fireEvent.change(screen.getByTestId("commentary"), {
      target: { value: inputData.commentary },
    });

    const file = new File(["image"], "test.png", { type: "image/png" });

    const fileInput = screen.getByTestId("file");

    userEvent.upload(fileInput, file);

    expect(fileInput.files[0]).toEqual(file);

    const handleSubmit = jest.spyOn(newBill, "handleSubmit");

    newBillForm.addEventListener("submit", handleSubmit);
    fireEvent.submit(newBillForm);

    expect(handleSubmit).toHaveBeenCalled();
    expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();

    // Additional assertions for higher coverage rate
    expect(mockStore.bills().create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        pct: inputData.pct,
      }),
      headers: {
        noContentType: true,
      },
    });
  });
});
describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    beforeEach(() => {
      // Set up the DOM elements required for the test
      document.body.innerHTML = `
        <div>
          <form data-testid="form-new-bill">
            <input data-testid="file" type="file" />
          </form>
        </div>
      `;

      // Mock localStorage and store
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ email: 'test@test.com' }))
    })

    test('Then the file should be correctly uploaded if it has a valid extension', async () => {
      // Initialize the NewBill instance
      const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage })

      // Mock the file input and the file object
      const fileInput = screen.getByTestId('file')
      const file = new File(['file content'], 'file.jpg', { type: 'image/jpg' })

      // Simulate file change event
      fireEvent.change(fileInput, { target: { files: [file] } })

      // Wait for the promises to resolve
      await waitFor(() => expect(newBill.fileUrl).toBe('https://localhost:3456/images/test.jpg'))

      // Assert the file URL and fileName are correctly updated
      expect(newBill.fileUrl).toBe('https://localhost:3456/images/test.jpg')
      expect(newBill.fileName).toBe('file.jpg')
      expect(newBill.billId).toBe('1234')
    })


  })
});

describe('NewBill additional tests', () => {
  it('should display validation error messages for empty required fields', () => {
    const newBill = setNewBill();
    const newBillForm = screen.getByTestId('form-new-bill');
    const handleSubmit = jest.spyOn(newBill, 'handleSubmit');

    fireEvent.submit(newBillForm);

    expect(screen.getByTestId('expense-name').validity.valueMissing).toBeTruthy();
    expect(handleSubmit).toHaveBeenCalled();
  });
});




