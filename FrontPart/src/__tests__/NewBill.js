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

import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

//cette methode permet de lancer mokStore a la place de store
jest.mock("../app/store", () => mockStore);

beforeEach(async () => {
	jest.clearAllMocks();

	// Cette méthode permet d'espionner la méthode create de bills du mockstore
	jest.spyOn(mockStore.bills(), "create");

	document.body.innerHTML = "";

	// SIMULATION DU LOCALSTORAGE
	Object.defineProperty(window, "localStorage", { value: localStorageMock });
	window.localStorage.clear();
	window.localStorage.setItem(
		"user",
		JSON.stringify({ type: "Employee", email: "a@a" })
	);

	// SIMULATION DU DOM
	const root = document.createElement("div");
	root.setAttribute("id", "root");
	document.body.append(root);
	router();

	await new Promise((resolve) => setTimeout(resolve, 50));
	// Attendre la resolution des promesses en cours

	document.body.innerHTML;
	// Naviguer de nouveau après le délai
	window.onNavigate(ROUTES_PATH.NewBill);
});

describe("Given I am connected as an employee", () => {
	describe("When I am on NewBill Page", () => {
		//I J ARRIVE SUR NEWBILL
		test("Then then newBillsForm should be visible", async () => {
			let form;
			form = screen.getByTestId("form-new-bill");

			expect(form).toBeTruthy();

			//to-do write assertion
		});

		// II TEST CHANGEFILE

		describe("when i change file", () => {
			describe("when the api works fine ", () => {
				test("Then if the extension is incorrect:Then errorDiv should popUp", async () => {
					// Attendre que la page NewBill soit complètement chargée
					await waitFor(() => {
						const fileInput = screen.getByTestId("file");
						return fileInput;
					});

					// Simuler le changement de fichier avec une extension incorrecte
					const fileInput = screen.getByTestId("file");

					userEvent.upload(
						fileInput,
						new File([], "myfile.pdf", { type: "application/pdf" })
					);

					// Attendre que l'élément d'erreur soit rendu
					let error;

					await waitFor(() => {
						error = screen.getByTestId("errorDiv");
					});

					expect(error).toBeTruthy();
				});
				test("then if the extension is incorrect and i correct it , the errorDiv should disappear", async () => {
					// Simuler le changement de fichier avec une extension incorrecte
					const fileInput = screen.getByTestId("file");

					userEvent.upload(
						fileInput,
						new File([], "myfile.pdf", { type: "application/pdf" })
					);
					let error;
					await waitFor(() => {
						error = screen.getByTestId("errorDiv");
					});
					// Simuler la correction de l extension
					userEvent.upload(
						fileInput,
						new File([""], "correctfile.png", { type: "application/png" })
					);
					//verifier l absence du div

					await waitFor(() => {
						error = screen.queryByTestId("errorDiv");
					});

					expect(error).toBeFalsy();
				});
				test("Then if the extension is correc, an object with correct values should be created ", async () => {
					// Attendre que la page NewBill soit complètement chargée
					await waitFor(() => {
						const fileInput = screen.getByTestId("file");
						return fileInput;
					});

					// Simuler le changement de fichier avec une extension correcte
					const fileInput = screen.getByTestId("file");

					userEvent.upload(
						fileInput,
						new File([""], "correctfile.png", { type: "application/png" })
					);

					//creation d un objet FormData
					const formData = new FormData();
					formData.append(
						"file",
						new File([""], "correctfile.png", { type: "application/png" })
					);
					formData.append("email", "a@a");

					//attendre que la fonction soit appellee
					await waitFor(() =>
						expect(mockStore.bills().create).toHaveBeenCalledWith({
							data: formData,
							headers: { noContentType: true },
						})
					);

				});
				test("Then, if the extension is correct then the new fill should be send to dataBase", async () => {
					// Attendre que la page NewBill soit complètement chargée
					await waitFor(() => {
						const fileInput = screen.getByTestId("file");
						return fileInput;
					});

					// Simuler le changement de fichier avec une extension correcte
					const fileInput = screen.getByTestId("file");

					userEvent.upload(
						fileInput,
						new File([""], "correctfile.png", { type: "application/png" })
					);

					await waitFor(() =>
						expect(mockStore.bills().create).toHaveBeenCalled()
					);

					// Attendre que la promesse arrive  (Récupérer la promesse résolue)
					const result = await mockStore.bills().create.mock.results[0].value;

					expect(mockStore.bills().create).toHaveBeenCalled();
					expect(result.fileUrl).toEqual(
						"https://localhost:3456/images/test.jpg"
					);
					expect(result.key).toEqual("1234");
				});
			});

			// II.2  ERREURS API CHANGE
			describe("when  API failes", () => {
				test("it fails with error 404 then console should be called with new Error (Erreur 404)", async () => {
					jest.spyOn(mockStore, "bills");
					const postSpy = jest.spyOn(console, "error");
					mockStore.bills.mockImplementationOnce(() => {
						return {
							create: () => {
								return Promise.reject(new Error("Erreur 404"));
							},
						};
					});

					// mise a jour du fichier
					const fileInput = screen.getByTestId("file");

					userEvent.upload(
						fileInput,
						new File([""], "correctfile.png", { type: "application/png" })
					);

					await waitFor(() => {
						expect(postSpy).toBeCalledWith(new Error("Erreur 404"));
					});
				});
				test("it fails with error 500 then console should be called with new Error (Erreur 500)", async () => {
					const postSpy = jest.spyOn(console, "error");
					jest.spyOn(mockStore.bills(), "create");
					mockStore.bills.mockImplementationOnce(() => {
						return {
							create: () => {
								return Promise.reject(new Error("Erreur 500"));
							},
						};
					});

					// mise a jour du fichier
					const fileInput = screen.getByTestId("file");

					userEvent.upload(
						fileInput,
						new File([""], "correctfile.png", { type: "application/png" })
					);

					await waitFor(() => {
						expect(postSpy).toBeCalledWith(new Error("Erreur 500"));
					});
				});
			});
		});
	});
	// III SOUMISSION DU FORMULAIRE
	describe("when i submit the formular ", () => {
		describe("when api works fine ", () => {
			test(" Then a newBill object with correct values  should be created", async () => {
				document.body.innerHTML;

				await waitFor(() => screen.getByTestId("expense-type"));
				let type = screen.getByTestId("expense-type");
				await userEvent.selectOptions(type, "Transports");

				await waitFor(() => screen.getByTestId("expense-name"));
				let name = screen.getByTestId("expense-name");
				await userEvent.type(name, "taxi");

				await waitFor(() => screen.getByTestId("datepicker"));
				let date = screen.getByTestId("datepicker");
				await userEvent.type(date, "1986-11-21");

				await waitFor(() => screen.getByTestId("amount"));
				let amount = screen.getByTestId("amount"); // Corrigé : expense-name -> amount
				await userEvent.type(amount, "100");

				await waitFor(() => screen.getByTestId("vat"));
				let vat = screen.getByTestId("vat");
				await userEvent.type(vat, "7");

				await waitFor(() => screen.getByTestId("pct"));
				let pct = screen.getByTestId("pct");
				await userEvent.type(pct, "9");

				await waitFor(() => screen.getByTestId("file"));
				const fileInput = screen.getByTestId("file");
				await userEvent.upload(
					fileInput,
					new File(["testFile"], "myfile.png", { type: "application/png" })
				);

				await waitFor(() => {
					screen.getAllByText("Envoyer");
				});

				//creation d une instance newBill
				const instance = new NewBill({
					document,
					onNavigate,
					store,
					localStorage,
				});

				const myFileInput = screen.getByTestId("file");

				userEvent.upload(
					myFileInput,
					new File([""], "correctfile.png", { type: "application/png" })
				);

				jest.spyOn(instance, "handleSubmit");
				jest.spyOn(instance, "updateBill");
				const form = await screen.getByTestId("form-new-bill");
				form.addEventListener("submit", (e) => instance.handleSubmit(e));

				const bill = {
					email: "a@a",
					type: "Transports",
					name: "taxi",
					amount: 100,
					date: "1986-11-21",
					vat: "7",
					pct: 9,
					commentary: "",
					fileUrl: "https://localhost:3456/images/test.jpg",
					fileName: "correctfile.png",
					status: "pending",
				};

				fireEvent.submit(form);

				document.body.innerHTML;
				await waitFor(() => {
					expect(instance.handleSubmit).toHaveBeenCalled();
				});

				await waitFor(() => expect(instance.handleSubmit).toHaveBeenCalled());

				await waitFor(() =>
					expect(instance.updateBill).toHaveBeenCalledWith(bill)
				);

				// attendre le retour a la page bills
				let element = await document.getElementById("data-table");

				expect(element).toBeTruthy();
			});
			test("The new object should be sent to dataBase and the response sould be the mocked response", async () => {
				jest.spyOn(mockStore.bills(), "update");

				await waitFor(() => {
					screen.getAllByText("Envoyer");
				});
				document.body.innerHTML;

				//creation d une instance newBill
				const instance = new NewBill({
					document,
					onNavigate,
					store,
					localStorage,
				});

				const myFileInput = screen.getByTestId("file");

				userEvent.upload(
					myFileInput,
					new File([""], "correctfile.png", { type: "application/png" })
				);

				instance.updateBill();

				await waitFor(() =>
					expect(mockStore.bills().update).toHaveBeenCalled()
				);

				// Attendre que la promesse arrive  (Récupérer la promesse résolue)
				const result = await mockStore.bills().update.mock.results[0].value;

				expect(mockStore.bills().update).toHaveBeenCalled();
				expect(result).toEqual({
					id: "47qAXb6fIm2zOKkLzMro",
					vat: "80",
					fileUrl:
						"https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
					status: "pending",
					type: "Hôtel et logement",
					commentary: "séminaire billed",
					name: "encore",
					fileName: "preview-facture-free-201801-pdf-1.jpg",
					date: "2004-04-04",
					amount: 400,
					commentAdmin: "ok",
					email: "a@a",
					pct: 20,
				});
			});
		});

		describe("when API failes", () => {
			test("Then if Api fails on 404 , on submition: a new error 404 should be created ", async () => {
				const postSpy = jest.spyOn(console, "error");
				mockStore.bills.mockImplementationOnce(() => {
					return {
						update: () => {
							return Promise.reject(new Error("Erreur 404"));
						},
					};
				});

				await waitFor(() => {
					screen.getAllByText("Envoyer");
				});

				//creation d une instance newBill
				const instance = new NewBill({
					document,
					onNavigate,
					store,
					localStorage,
				});

				instance.updateBill();

				await waitFor(() => {
					expect(postSpy).toBeCalledWith(new Error("Erreur 404"));
				});
			});

			test("Then if the Api fails on 500,  on submition: a new error 500 should be created ", async () => {
				const postSpy = jest.spyOn(console, "error");
				mockStore.bills.mockImplementationOnce(() => {
					return {
						update: () => {
							return Promise.reject(new Error("Erreur 500"));
						},
					};
				});

				await waitFor(() => {
					screen.getAllByText("Envoyer");
				});

				//creation d une instance newBill
				const instance = new NewBill({
					document,
					onNavigate,
					store,
					localStorage,
				});

				instance.updateBill();

				await waitFor(() => {
					expect(postSpy).toBeCalledWith(new Error("Erreur 500"));
				});
			});
		});
	});
});
