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
import { formatDate, formatStatus } from "../app/format.js";
import userEvent from "@testing-library/user-event";

import store from "../__mocks__/store.js";


import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"


beforeEach(() => {
  document.body.innerHTML = "";

  // SIMULATION DU LOCALSTORAGE
  // jest.spyOn(mockStore, "bills")

  Object.defineProperty(window, 
    "localStorage",
     {value: localStorageMock,}
    );
  window.localStorage.clear();
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
      email:"a@a"
    })
  );

  // SIMULATION DU DOM
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();

  // Changement de l'URL courant et mise à jour du contenu de la page grâce au router
  window.onNavigate(ROUTES_PATH.NewBill);
});

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then newBillsForm should be visible", async () => {
      let form;
    form=screen.getByTestId("form-new-bill")

expect(form).toBeTruthy(); 
      debugger
      //to-do write assertion
    })
  })
})