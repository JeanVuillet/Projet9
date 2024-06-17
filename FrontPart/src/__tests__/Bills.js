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
import userEvent from "@testing-library/user-event";
import NewBill from "../containers/NewBill.js";
import store from "../__mocks__/store.js";

// Mock the Logout class
jest.mock("../containers/Logout.js", () => {
  return jest.fn().mockImplementation(() => {
    return { init: jest.fn() };
  });
});
beforeEach(() => {
  document.body.innerHTML='';

  // SIMULATION DU LOCALSTORAGE
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });
  window.localStorage.clear();
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
    })
  );

  // SIMULATION DU DOM
  document.body.innerHTML = ""; // Nettoyage du body avant chaque test

  // Activation du router
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();

  // Changement de l'URL courant et mise à jour du contenu de la page grâce au router
  window.onNavigate(ROUTES_PATH.Bills);

 
});
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {


  

   

    test("Then bill icon in vertical layout should be highlighted", async () => {
      // Object.defineProperty(window, "localStorage", {
      //   value: localStorageMock,
      // });
      // window.localStorage.setItem(
      //   "user",
      //   JSON.stringify({
      //     type: "Employee",
      //   })
      // );
  
      // // SIMULATION DU DOM
      // document.body.innerHTML = ""; // Nettoyage du body avant chaque test
  
      // // Activation du router
      // const root = document.createElement("div");
      // root.setAttribute("id", "root");
      // document.body.append(root);
      // router();
  
      // // Changement de l'URL courant et mise à jour du contenu de la page grâce au router
      // window.onNavigate(ROUTES_PATH.Bills);
      // Récupération des éléments dans la fenêtre virtuelle nouvellement créée
async function tester(){
  await waitFor(() => screen.getByTestId("icon-window"));
  const windowIcon = screen.getByTestId("icon-window");

document.body.innerHTML;

  // Vérification que les éléments récupérés ont bien la classe active-icon sur eux
  expect(windowIcon.classList.contains("active-icon")).toBe(true);
}
tester();
 

    });

    test("Then bills should be ordered from earliest to latest", () => {
      // BillsUI charge les différentes factures dans la page
      document.body.innerHTML = BillsUI({ data: bills });
    
      const dates = screen
        .getAllByText(/^\d{4}-\d{2}-\d{2}$/)
        .map((a) => a.innerHTML);

       const sortedData= dates.sort((a,b)=>{a>b? 1:-1})
      // const antiChrono = (a, b) => (a < b ? 1 : -1);
      // const datesSorted = [...dates].sort(antiChrono);

      expect(dates).toEqual(sortedData);

    });

    describe("when i click on Nouvelle note de frais",()=>{
    document.body.innerHTML



  test("handleClickNewBill should be called",()=>{
    document.body.innerHTML = BillsUI({ data: bills });
async function test(){
    await waitFor(()=>screen.getByTestId("btn-new-bill"));
    const NouvelleIcon=screen.getByTestId("btn-new-bill")

userEvent.click(NouvelleIcon);

expect(handleClickNewBill).toHaveBeenCalled()
};

 test();
 document.body.innerHTML;
 debugger
      })
      test("whent newBillsMethod is called i should navigate to newBills page", async () => {
        // Rendre BillsUI avec le formulaire
        document.body.innerHTML = BillsUI({ data: bills });
        await waitFor(() => screen.getByTestId("btn-new-bill"));
      
        // Mock pour la fonction onNavigate
        const onNavigate = jest.fn((path) => {
          window.location.href = `http://localhost${path}`; // Conserver le fragment
        });
      
        async function clickButtion() {
          let billsInstance;
          await waitFor(() => {
            billsInstance = new Bills({
              document,
              onNavigate,
              store: mockStore, // Assurez-vous que mockStore est correctement configuré 
              localStorage: window.localStorage
            });
            return billsInstance;
          });
          billsInstance.handleClickNewBill();
        }
      
        await clickButtion(); 
      
        // Attendre que l'URL soit mise à jour 
        // Attendre que l'URL soit mise à jour 
  await waitFor(() => window.location.href === 'http://localhost/#employee/bill/new'); 

  // Vérifier que onNavigate a été appelée 
  expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill']);

  // Vérifier l'URL complète (avec le fragment)
  expect(window.location.href).toBe('http://localhost/#employee/bill/new'); 
});
      });



  })    
    })


    // describe("When I click on an eye icon", () => {
    //   beforeEach(() => {
    //     document.body.innerHTML = BillsUI({ data: bills });

    //     const billsInstance = new Bills({
    //       document,
    //       onNavigate: jest.fn(),
    //       store: mockStore,
    //       localStorage: window.localStorage,
    //     });

    //     // Ajoutez l'élément #modaleFile au DOM
    //     const modaleFile = document.createElement("div");
    //     modaleFile.setAttribute("id", "modaleFile");
    //     modaleFile.classList.add("modal");
    //     modaleFile.innerHTML = `
    //       <div class="modal-body"></div>
    //     `;
    //     document.body.append(modaleFile);

    //     jest.spyOn($.fn, "modal");

    //     const iconEye = screen.getAllByTestId("icon-eye")[0];
    //     fireEvent.click(iconEye);
    //   });

    //   afterEach(() => {
    //     $.fn.modal.mockRestore();
    //   });

    //   test("Then a modal should open and display the bill", async () => {
    //     const iconEye = screen.getAllByTestId("icon-eye")[0];
    //     const billUrl = iconEye.getAttribute("data-bill-url");
    //     const imgWidth = Math.floor($("#modaleFile").width() * 0.5);

    //     // Vérifiez que la fonction jQuery modal a été appelée
    //     expect($.fn.modal).toHaveBeenCalledWith("show");

    //     // Vérifiez que le contenu de la modal est correct
    //     await waitFor(() => {
    //       const modalBody = $("#modaleFile").find(".modal-body").html();
    //       expect(modalBody).toContain(`width=${imgWidth}`);
    //       expect(modalBody).toContain(`src=${billUrl}`);
    //     });
    //   });
    // });

    // TEST D'INTEGRATION GET DE BILLS
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

      // describe("When an error occurs on API", () => {
      //   beforeEach(() => {
      //     jest.spyOn(mockStore, "bills");
      //     Object.defineProperty(window, "localStorage", {
      //       value: localStorageMock,
      //     });
      //     window.localStorage.setItem(
      //       "user",
      //       JSON.stringify({
      //         type: "Admin",
      //         email: "a@a",
      //       })
      //     );
      //     const root = document.createElement("div");
      //     root.setAttribute("id", "root");
      //     document.body.appendChild(root);
      //     router();
      //   });
      //   test("fetches bills from an API and fails with 404 message error", async () => {
      //     mockStore.bills.mockImplementationOnce(() => {
      //       return {
      //         list: () => {
      //           return Promise.reject(new Error("Erreur 404"));
      //         },
      //       };
      //     });
      //     window.onNavigate(ROUTES_PATH.Bills);
      //     await new Promise(process.nextTick);
      //     const message = await screen.getByText("Erreur 404");
      //     expect(message).toBeTruthy();
      //   });

      //   test("fetches bills from an API and fails with 500 message error", async () => {
      //     mockStore.bills.mockImplementationOnce(() => {
      //       return {
      //         list: () => {
      //           return Promise.reject(new Error("Erreur 500"));
      //         },
      //       };
      //     });
      //     window.onNavigate(ROUTES_PATH.Bills);
      //     await new Promise(process.nextTick);
      //     const message = await screen.getByText("Erreur 500");
      //     expect(message).toBeTruthy();
      //   });
      // });
    });
    // FIN DU TEST D'INTEGRATION

    // describe("When I click on New Bill button", () => {
    //   test("handleClickNewBill is called", () => {
    //     const handleClickNewBill = jest.fn();
    //     const buttonNewBill = document.createElement("button");
    //     buttonNewBill.setAttribute("data-testid", "btn-new-bill");
    //     document.body.appendChild(buttonNewBill);
    //     buttonNewBill.addEventListener("click", handleClickNewBill);
    //     fireEvent.click(buttonNewBill);
    //     expect(handleClickNewBill).toHaveBeenCalled();
    //   });

    //   // test("onNavigate is called with NewBill route", () => {
    //   //   const mockOnNavigate = jest.fn();
    //   //   const billsInstance = new Bills({
    //   //     document,
    //   //     onNavigate: mockOnNavigate,
    //   //     store: mockStore,
    //   //     localStorage: window.localStorage,
    //   //   });

    //   //   // Appeler handleClickNewBill
    //   //   billsInstance.handleClickNewBill();

    //   //   // Vérifier que onNavigate a été appelé avec la bonne route
    //   //   expect(mockOnNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill);
    //   // });
    // })
  
  
  


   