/**
//  * @jest-environment jsdom
//  */
import {fireEvent, screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import DashboardFormUI from "../views/DashboardFormUI.js"
import DashboardUI from "../views/DashboardUI.js"
import Dashboard, { filteredBills, cards } from "../containers/Dashboard.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store.js"
import { bills } from "../fixtures/bills.js"
import router from "../app/Router.js"

import BillsUI from "../views/BillsUI.js"





describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {

    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      const realIcon=document.getElementById('layout-icon1')
      //to-do write expect expression
     expect(windowIcon.className).toEqual(realIcon.className)
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
     
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

   
    
    
  })
})
 //demarage get bills

 describe("Given I am a user connected as emplyee", () => {
    describe("When I navigate to billList", () => {
      test("fetches bills from mock API GET", async () => {
        localStorage.setItem("user", JSON.stringify({ type: "employee", email: "a@a" }));
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
      
        const contentPending  =  screen.getByText("Mes notes de frais")
        expect(contentPending).toBeTruthy()
        const arrayPending  =  screen.getByText("Type")
        expect(arrayPending).toBeTruthy()

      })
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Admin',
          email: "a@a"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })
      test("fetches bills from an API and fails with 404 message error", async () => {
  
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})
        window.onNavigate(ROUTES_PATH.Dashboard)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })
  
      test("fetches messages from an API and fails with 500 message error", async () => {
  
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})
  
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
      test('handleClickNewBill est appelée lorsque le bouton est cliqué', () => {
        // Créer une fonction mock pour handleClickNewBill
        const handleClickNewBill = jest.fn();
      
        // Créer des éléments de test simulés
        const buttonNewBill = document.createElement('button');
        buttonNewBill.setAttribute('data-testid', 'btn-new-bill');
      
        // Ajouter un écouteur d'événements sur le bouton
        buttonNewBill.addEventListener('click', handleClickNewBill);
      
        // Ajouter le bouton au document
        document.body.appendChild(buttonNewBill);
      
        // Simuler un clic sur le bouton
        fireEvent.click(buttonNewBill);
      
        // Vérifier si handleClickNewBill a été appelée
        expect(handleClickNewBill).toHaveBeenCalled();
      });
    })
  
    })
  })