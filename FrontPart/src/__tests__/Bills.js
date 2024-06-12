/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import { bills } from "../fixtures/bills.js";
import router from "../app/Router.js";
import $ from "jquery";
import { formatDate, formatStatus } from "../app/format.js"; // Importer formatDate et formatStatus

// Mock the Logout class
jest.mock("../containers/Logout.js", () => {
  return jest.fn().mockImplementation(() => {
    return { init: jest.fn() };
  });
});

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(/^\d{4}-\d{2}-\d{2}$/)
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    describe("When I click on an eye icon", () => {
      beforeEach(() => {
        document.body.innerHTML = BillsUI({ data: bills });

        const billsInstance = new Bills({
          document,
          onNavigate: jest.fn(),
          store: mockStore,
          localStorage: window.localStorage,
        });

        // Ajoutez l'élément #modaleFile au DOM
        const modaleFile = document.createElement("div");
        modaleFile.setAttribute("id", "modaleFile");
        modaleFile.classList.add("modal");
        modaleFile.innerHTML = `
          <div class="modal-body"></div>
        `;
        document.body.append(modaleFile);

        jest.spyOn($.fn, "modal");

        const iconEye = screen.getAllByTestId("icon-eye")[0];
        fireEvent.click(iconEye);
      });

      afterEach(() => {
        $.fn.modal.mockRestore();
      });

      test("Then a modal should open and display the bill", async () => {
        const iconEye = screen.getAllByTestId("icon-eye")[0];
        const billUrl = iconEye.getAttribute("data-bill-url");
        const imgWidth = Math.floor($("#modaleFile").width() * 0.5);

        // Vérifiez que la fonction jQuery modal a été appelée
        expect($.fn.modal).toHaveBeenCalledWith("show");

        // Vérifiez que le contenu de la modal est correct
        await waitFor(() => {
          const modalBody = $("#modaleFile").find(".modal-body").html();
          expect(modalBody).toContain(`width=${imgWidth}`);
          expect(modalBody).toContain(`src=${billUrl}`);
        });
      });
    });

    // TEST D INTEGRATION GET DE BILLS
    describe("When I navigate to billList", () => {
      test("fetches bills from mock API GET", async () => {
        localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee", email: "a@a" })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        router();
        window.onNavigate(ROUTES_PATH.Bills);
        await waitFor(() => screen.getByText("Mes notes de frais"));
        const contentPending = screen.getByText("Mes notes de frais");
        expect(contentPending).toBeTruthy();
        const arrayPending = screen.getByText("Type");
        expect(arrayPending).toBeTruthy();
      });

      describe("When an error occurs on API", () => {
        beforeEach(() => {
          jest.spyOn(mockStore, "bills");
          Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
          });
          window.localStorage.setItem(
            "user",
            JSON.stringify({
              type: "Admin",
              email: "a@a",
            })
          );
          const root = document.createElement("div");
          root.setAttribute("id", "root");
          document.body.appendChild(root);
          router();
        });
        test("fetches bills from an API and fails with 404 message error", async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list: () => {
                return Promise.reject(new Error("Erreur 404"));
              },
            };
          });
          window.onNavigate(ROUTES_PATH.Bills);
          await new Promise(process.nextTick);
          const message = await screen.getByText("Erreur 404");
          expect(message).toBeTruthy();
        });

        test("fetches bills from an API and fails with 500 message error", async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list: () => {
                return Promise.reject(new Error("Erreur 500"));
              },
            };
          });
          window.onNavigate(ROUTES_PATH.Bills);
          await new Promise(process.nextTick);
          const message = await screen.getByText("Erreur 500");
          expect(message).toBeTruthy();
        });
      });
    });
    //FIN DU TEST D INTEGRATION

    describe("When I click on New Bill button", () => {
      test("handleClickNewBill is called", () => {
        const handleClickNewBill = jest.fn();
        const buttonNewBill = document.createElement("button");
        buttonNewBill.setAttribute("data-testid", "btn-new-bill");
        document.body.appendChild(buttonNewBill);
        buttonNewBill.addEventListener("click", handleClickNewBill);
        fireEvent.click(buttonNewBill);
        expect(handleClickNewBill).toHaveBeenCalled();
      });

      test("onNavigate is called with NewBill route", () => {
        const mockOnNavigate = jest.fn();
        const billsInstance = new Bills({
          document,
          onNavigate: mockOnNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        // Appeler handleClickNewBill
        billsInstance.handleClickNewBill();

        // Vérifier que onNavigate a été appelé avec la bonne route
        expect(mockOnNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill);
      });
    });

    describe("When I click on an eye icon", () => {
      test("handleClickIconEye is called", () => {
        const handleClickIconEye = jest.fn();
        const iconEye = document.createElement("div");
        iconEye.setAttribute("data-testid", "icon-eye");
        iconEye.setAttribute("data-bill-url", "http://example.com/test.jpg");
        document.body.appendChild(iconEye);
        iconEye.addEventListener("click", () => handleClickIconEye(iconEye));
        fireEvent.click(iconEye);
        expect(handleClickIconEye).toHaveBeenCalledWith(iconEye);
      });
    });

    describe("When I get bills", () => {
      test("should format the bills correctly", async () => {
        const mockStore = {
          bills: jest.fn().mockReturnValue({
            list: jest.fn().mockResolvedValue([
              { date: "2023-12-01", status: "pending" },
              { date: "2022-05-23", status: "accepted" },
              { date: "2021-11-12", status: "refused" },
            ]),
          }),
        };

        const billsInstance = new Bills({
          document,
          onNavigate: jest.fn(),
          store: mockStore,
          localStorage: window.localStorage,
        });
        const bills = await billsInstance.getBills();

        expect(bills).toEqual([
          { date: "01 Déc. 2023", status: "En attente" },
          { date: "23 Mai 2022", status: "Acceptée" },
          { date: "12 Nov. 2021", status: "Refusée" },
        ]);
      });

      test("should handle format errors gracefully", async () => {
        const mockStore = {
          bills: jest.fn().mockReturnValue({
            list: jest
              .fn()
              .mockResolvedValue([{ date: "invalid-date", status: "pending" }]),
          }),
        };

        const billsInstance = new Bills({
          document,
          onNavigate: jest.fn(),
          store: mockStore,
          localStorage: window.localStorage,
        });
        const bills = await billsInstance.getBills();

        expect(bills).toEqual([{ date: "invalid-date", status: "En attente" }]);
      });
    });
    describe("Given I am connected as an employee", () => {
      describe("When an error occurs during bills processing", () => {
        test("Then it should log the error and the document causing it", async () => {
          const mockStore = {
            bills: jest.fn().mockReturnValue({
              list: jest.fn().mockResolvedValue([
                { date: "invalid-date", status: "pending" },
                { date: "valid-date", status: "accepted" },
              ]),
            }),
          };

          const billsInstance = new Bills({
            document,
            onNavigate: jest.fn(),
            store: mockStore,
            localStorage: window.localStorage,
          });

          // Spy on console.log
          console.log = jest.fn();

          await billsInstance.getBills();

          // Check that console.log was called with the error and document
          expect(console.log).toHaveBeenCalledWith(expect.any(Error), "for", {
            date: "invalid-date",
            status: "pending",
          });

          // Restore console.log
          console.log.mockRestore();
        });
      });
    });
  });
});