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
  router();

  document.body.innerHTML = NewBillUI();

  window.onNavigate(ROUTES_PATH.NewBill);
});

afterEach(() => {
  jest.resetAllMocks();
  document.body.innerHTML = "";
});

describe('NewBill', () => {
  let newBill;

  beforeEach(() => {
    newBill = new NewBill({
      document: document,
      onNavigate: jest.fn(),
      store: mockStore,
      localStorage: localStorageMock,
    });
  });

  it('should store the bill when storeBill is called', () => {
    // Mocking necessary data
    const file = new File(["document"], "document.jpg", {
      type: "image/jpeg",
    });
    const fakeEmail = 'test@example.com';
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({ email: fakeEmail }));

    // Mocking the create method of the store
    mockStore.bills().create = jest.fn().mockResolvedValueOnce({
      fileUrl: 'http://example.com/file.jpg',
      key: '123456789',
    });

    // Calling storeBill
    newBill.storeBill(file, 'document.jpg');

    // Expectations
    expect(mockStore.bills().create).toHaveBeenCalledWith({
      data: expect.any(FormData),
      headers: {
        noContentType: true,
      },
    });
    const formData = mockStore.bills().create.mock.calls[0][0].data;
    expect(formData.get('file')).toEqual(file);
    expect(formData.get('email')).toEqual(fakeEmail);
    expect(newBill.billId).toEqual('123456789');
    expect(newBill.fileUrl).toEqual('http://example.com/file.jpg');
    expect(newBill.fileName).toEqual('document.jpg');
  });

  it('should call storeBill when a valid file is uploaded', () => {
    const file = new File(["document"], "document.jpg", {
      type: "image/jpeg",
    });

    const handleChangeFile = jest.spyOn(newBill, 'handleChangeFile');
    const storeBill = jest.spyOn(newBill, 'storeBill');

    const fileInput = screen.getByTestId("file");
    fireEvent.change(fileInput, {
      target: {
        files: [file],
      },
    });

    expect(handleChangeFile).toHaveBeenCalled();
    expect(storeBill).toHaveBeenCalledWith(file, 'document.jpg');
  });

  it('should not call storeBill when an invalid file is uploaded', () => {
    const file = new File(["document"], "document.pdf", {
      type: "application/pdf",
    });

    const handleChangeFile = jest.spyOn(newBill, 'handleChangeFile');
    const storeBill = jest.spyOn(newBill, 'storeBill');
    window.alert = jest.fn();

    const fileInput = screen.getByTestId("file");
    fireEvent.change(fileInput, {
      target: {
        files: [file],
      },
    });

    expect(handleChangeFile).toHaveBeenCalled();
    expect(storeBill).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Extension de fichier non valide. Veuillez sélectionner un fichier PNG, JPG ou JPEG.');
  });
});

describe("Given I am connected as an employee", () => {
  describe("When I do not select a file and I click on submit button", () => {
    test("Then the form should not be submitted", () => {
      const newBill = setNewBill();

      const newBillForm = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.spyOn(newBill, "handleSubmit");

      newBill.fileName = null;

      newBillForm.addEventListener("submit", handleSubmit);
      fireEvent.submit(newBillForm);

      expect(handleSubmit).toHaveBeenCalledTimes(1);
      expect(newBillForm).toBeVisible();
    });
  });

  describe("When I select a file and I click on submit button", () => {
    test("Then the form should be submitted", async () => {
      const newBill = setNewBill();

      const inputData = bills[0];
      const newBillForm = screen.getByTestId("form-new-bill");

      const handleSubmit = jest.spyOn(newBill, "handleSubmit");
      const imageInput = screen.getByTestId("file");
      const file = new File(["image"], "image.jpg", { type: "image/jpg" });

      // Rellenar campos
      fireEvent.change(screen.getByTestId("expense-type"), {
        target: { value: inputData.type },
      });
      userEvent.type(screen.getByTestId("expense-name"), inputData.name);
      userEvent.type(screen.getByTestId("amount"), inputData.amount.toString());
      userEvent.type(screen.getByTestId("datepicker"), inputData.date);
      userEvent.type(screen.getByTestId("vat"), inputData.vat.toString());
      userEvent.type(screen.getByTestId("pct"), inputData.pct.toString());
      userEvent.type(screen.getByTestId("commentary"), inputData.commentary);
      await userEvent.upload(imageInput, file);

      newBill.fileName = file.name;

      const submitButton = screen.getByRole("button", { name: /envoyer/i });

      newBillForm.addEventListener("submit", handleSubmit);
      userEvent.click(submitButton);

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe("When I upload a file with an invalid extension", () => {
    test("Then the file input should show an error message", () => {
      const newBill = setNewBill();

      const handleChangeFile = jest.spyOn(newBill, "handleChangeFile");
      const imageInput = screen.getByTestId("file");
      const fileValidation = jest.spyOn(newBill, "fileValidation");

      imageInput.addEventListener("change", handleChangeFile);

      fireEvent.change(imageInput, {
        target: {
          files: [
            new File(["document"], "document.pdf", {
              type: "application/pdf",
            }),
          ],
        },
      });

      expect(handleChangeFile).toHaveBeenCalledTimes(1);
      expect(fileValidation.mock.results[0].value).toBeFalsy();
      expect(imageInput).toHaveClass("is-invalid");
    });
  });

  describe("When I upload a file with a valid extension", () => {
    test("Then the file input should not show an error message", () => {
      const newBill = setNewBill();

      const handleChangeFile = jest.spyOn(newBill, "handleChangeFile");
      const imageInput = screen.getByTestId("file");
      const fileValidation = jest.spyOn(newBill, "fileValidation");

      imageInput.addEventListener("change", handleChangeFile);

      fireEvent.change(imageInput, {
        target: {
          files: [
            new File(["image"], "image.jpg", {
              type: "image/jpg",
            }),
          ],
        },
      });

      expect(handleChangeFile).toHaveBeenCalledTimes(1);
      expect(fileValidation.mock.results[0].value).toBeTruthy();
      expect(imageInput).not.toHaveClass("is-invalid");
    });
  });

  describe("When I am on NewBill Page", () => {
    test("Then newBill icon in vertical layout should be highlighted", () => {
      const windowIcon = screen.getByTestId("icon-mail");

      expect(windowIcon).toHaveClass("active-icon");
    });
  });
});

describe("When I do fill fields in correct format and I click on submit button", () => {
  test("Then the submission process should work properly, and I should be sent on the Bills Page", async () => {
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
  });
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