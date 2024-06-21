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


//cette methode permet de lancer mokStore a la place de store
jest.mock("../app/store", () => mockStore);


beforeEach(() => {
  //cette methode permet d espionner la methode create de bills du mockstore
  jest.spyOn(mockStore.bills(), "create");
  document.body.innerHTML = "";

  // SIMULATION DU LOCALSTORAGE

// Mock the store


  Object.defineProperty(window, "localStorage",{value: localStorageMock,});
  window.localStorage.clear();
window.localStorage.setItem("user", JSON.stringify({type: "Employee", email: "a@a"}));
  



  // SIMULATION DU DOM
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();

  // Changement de l'URL courant et mise à jour du contenu de la page grâce au router
  window.onNavigate(ROUTES_PATH.NewBill);
  // Obtenir la référence de l'instance



});

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then newBillsForm should be visible", async () => {
      let form;
      form = screen.getByTestId("form-new-bill");

      expect(form).toBeTruthy(); 

      //to-do write assertion
    });
    describe("Given I am connected as an employee", () => {
      describe("When I am on NewBill Page", () => {
        // ... (Le reste du code de setup) ...
    
        describe("when I change theFile and extension is incorrect", () => {
          test("Then errorDiv should popUp", async () => {
     
            // Attendre que la page NewBill soit complètement chargée
            await waitFor(() => {
              const fileInput = screen.getByTestId('file');
              return fileInput; 
            });
    
            // Simuler le changement de fichier avec une extension incorrecte
            const fileInput = screen.getByTestId('file');
   
             userEvent.upload(fileInput, new File([], 'myfile.pdf', { type: 'application/pdf' })); 
    
            // Attendre que l'élément d'erreur soit rendu
            let error;
     
            await waitFor(() => { 
              error = screen.getByTestId('errorDiv'); 
        
            });
    
            expect(error).toBeTruthy(); 
          });
        });

        describe("when I change the file and the extension is correct",()=>{
          test("then the fill should be send to dataBase",async()=>{
                       // Espionner la méthode create de mockedBills
        
             // Attendre que la page NewBill soit complètement chargée
             await waitFor(() => {
              const fileInput = screen.getByTestId('file');
              return fileInput; 
            });
      
  
            // Simuler le changement de fichier avec une extension correcte
            const fileInput = screen.getByTestId('file');
      
             userEvent.upload(fileInput, new File([''], 'correctfile.png', { type: 'application/png' })); 
    
     


         


          //attendre que la fonction soit appellee
          await waitFor(() => expect(mockStore.bills().create).toHaveBeenCalled());

          // Attendre que la promesse arrive  (Récupérer la promesse résolue)
          const result = await mockStore.bills().create.mock.results[0].value;

             expect(mockStore.bills().create).toHaveBeenCalled();
             expect(result.fileUrl).toEqual("https://localhost:3456/images/test.jpg")
             expect(result.key).toEqual("1234")
          })
       

        test("when i fill de form and i click the button, a newBill should be created",async()=>{
        


          await waitFor(() => screen.getByTestId('expense-type'));
          let type = screen.getByTestId('expense-type');
          await userEvent.selectOptions(type, 'Transports');
    
          await waitFor(() => screen.getByTestId('expense-name'));
          let name = screen.getByTestId('expense-name');
          await userEvent.type(name, 'taxi');
    
          await waitFor(() => screen.getByTestId('datepicker'));
          let date = screen.getByTestId('datepicker');
          await userEvent.type(date, '1986-11-21'); 
    
          await waitFor(() => screen.getByTestId('amount'));
          let amount = screen.getByTestId('amount'); // Corrigé : expense-name -> amount
          await userEvent.type(amount, '100');
    
          await waitFor(() => screen.getByTestId('vat'));
          let vat = screen.getByTestId('vat');
          await userEvent.type(vat, '7');
    
          await waitFor(() => screen.getByTestId('pct'));
          let pct = screen.getByTestId('pct');
          await userEvent.type(pct, '9');
    
          await waitFor(() => screen.getByTestId('file'));
          const fileInput = screen.getByTestId('file');
          await userEvent.upload(fileInput, new File(['testFile'], 'myfile.png', { type: 'application/png' })); 


    document.body.innerHTML;


     


          // Vérifications après le clic sur le bouton
  
            // // Vérifie que tous les champs sont remplis
            // expect(screen.getByTestId('expense-type'));
            // expect(screen.getByTestId('expense-name')).toHaveValue('taxi');
            // expect(screen.getByTestId('datepicker'));
            // expect(screen.getByTestId('amount'));
            // expect(screen.getByTestId('vat'));
            // expect(screen.getByTestId('pct'));
    
      await waitFor(()=> {   screen.getAllByText('Envoyer')})

      //creation d une instance newBill
      const instance= new NewBill({ document, onNavigate, store, localStorage });


      const myFileInput = screen.getByTestId('file');
     
      userEvent.upload(myFileInput, new File([''], 'correctfile.png', { type: 'application/png' })); 



  
      jest.spyOn(instance,'handleSubmit');
      jest.spyOn(instance, 'updateBill');
      const form= await screen.getByTestId('form-new-bill');
      form.addEventListener('submit',(e)=>instance.handleSubmit(e));

      const bill={ 
        email:"a@a",
        type:'Transports',
        name:'taxi',
        amount:100,
        date:'1986-11-21',
        vat:'7',
        pct:9,
        commentary:'',
        fileUrl:"https://localhost:3456/images/test.jpg",
        fileName:'correctfile.png',
        status:'pending'

      }
      debugger;
      await fireEvent.submit(form);
      
          document.body.innerHTML;
          expect(instance.handleSubmit).toHaveBeenCalled();
          await waitFor( ()=>expect(instance.handleSubmit).toHaveBeenCalled())
          expect(instance.updateBill).toHaveBeenCalledWith(bill);
    })
    })})})})});

    

