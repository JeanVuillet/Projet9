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
import NewBill from "../containers/NewBill.js";
import store from "../__mocks__/store.js";

// Mock the store
jest.mock("../app/store", () => mockStore);

// Mock the Logout class
jest.mock("../containers/Logout.js", () => {
	return jest.fn().mockImplementation(() => {
		return { init: jest.fn() };
		//ALo
	});
});
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

beforeEach(async () => {
	await waitFor(() => screen.getByTestId("tbody"));
	document.body.innerHTML = "";

	// SIMULATION DU LOCALSTORAGE
	jest.spyOn(mockStore, "bills");
	Object.defineProperty(window, "localStorage", { value: localStorageMock });
	window.localStorage.clear();
	window.localStorage.setItem(
		"user",
		JSON.stringify({
			type: "Employee",
			email: "a@a",
		})
	);

	// SIMULATION DU DOM
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
			await waitFor(() => screen.getByTestId("icon-window"));
			const windowIcon = screen.getByTestId("icon-window");
			expect(windowIcon.classList.contains("active-icon")).toBe(true);
		});

		test("Then bills should be ordered from earliest to latest", () => {
			// BillsUI charge les différentes factures dans la page
			document.body.innerHTML = BillsUI({ data: bills });

			const dates = screen
				.getAllByText(/^\d{4}-\d{2}-\d{2}$/)
				.map((a) => a.innerHTML);

			const sortedData = dates.sort((a, b) => {
				a > b ? 1 : -1;
			});
			// const antiChrono = (a, b) => (a < b ? 1 : -1);
			// const datesSorted = [...dates].sort(antiChrono);

			expect(dates).toEqual(sortedData);
		});

		test("when newBillsMethod is called I should navigate to newBills page", async () => {
			document.body.innerHTML = BillsUI({ data: bills });
			await waitFor(() => screen.getByTestId("btn-new-bill"));
			const newBillsButton = screen.getByTestId("btn-new-bill");

			const onNavigate = jest.fn((path) => {
				window.location.href = `http://localhost${path}`;
			});

			const billsInstance = new Bills({
				document,
				onNavigate,
				store: mockStore,
				localStorage: window.localStorage,
			});

			const eventListenerFunction = jest.fn((e) =>
				billsInstance.handleClickNewBill()
			);

			newBillsButton.addEventListener("click", eventListenerFunction);

			userEvent.click(newBillsButton);

			expect(eventListenerFunction).toHaveBeenCalled();

			await waitFor(
				() => window.location.href === "http://localhost/#employee/bill/new"
			);

			expect(window.location.href).toBe("http://localhost/#employee/bill/new");
		});
	});
});

// TEST D'INTEGRATION GET DE BILLS
describe("When I navigate to billList", () => {
	test("fetches bills from mock API GET", async () => {
		await waitFor(() => {
			const result = screen.getAllByText("Hôtel et logement");
			expect(result).toBeTruthy();
		});
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
		//on attend la promesse apres que le dome soit cree
		//(nextTick s execute apres le code synchrone
		//await permet d attendre la resolution de la promesse
		await new Promise(process.nextTick);
		const message = await screen.getByText(/Erreur 404/);
		expect(message).toBeTruthy();
	});
	test("fetches messages from an API and fails with 500 message error", async () => {
		mockStore.bills.mockImplementationOnce(() => {
			return {
				list: () => {
					return Promise.reject(new Error("Erreur 500"));
				},
			};
		});

		window.onNavigate(ROUTES_PATH.Bills);
		await new Promise(process.nextTick);
		const message = await screen.getByText(/Erreur 500/);
		expect(message).toBeTruthy();
	});
});
