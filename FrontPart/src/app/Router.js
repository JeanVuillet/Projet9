import store from "./Store.js";
import Login, { PREVIOUS_LOCATION } from "../containers/Login.js";
import Bills from "../containers/Bills.js";
import NewBill from "../containers/NewBill.js";
import Dashboard from "../containers/Dashboard.js";
import { formatDate } from "./format.js";

import BillsUI from "../views/BillsUI.js";
import DashboardUI from "../views/DashboardUI.js";

import { ROUTES, ROUTES_PATH } from "../constants/routes.js";

export default () => {
	const rootDiv = document.getElementById("root");
	rootDiv.innerHTML = ROUTES({ pathname: window.location.pathname });

	window.onNavigate = (pathname) => {
		window.history.pushState({}, pathname, window.location.origin + pathname);
		if (pathname === ROUTES_PATH["Login"]) {
			rootDiv.innerHTML = ROUTES({ pathname });
			document.body.style.backgroundColor = "#0E5AE5";
			new Login({
				document,
				localStorage,
				onNavigate,
				PREVIOUS_LOCATION,
				store,
			});
			// cas ou l url est Bills
		} else if (pathname === ROUTES_PATH["Bills"]) {
			// generation de la premiere version de la page (loading le temps que les bills arrivent)
			rootDiv.innerHTML = ROUTES({ pathname, loading: true });
			const divIcon1 = document.getElementById("layout-icon1");
			const divIcon2 = document.getElementById("layout-icon2");
			// activation de la classe sur l icone des bills et desactivation de la classe de l icone newBills
			// pour que le hilight soit conforme a la page courrante
			divIcon1.classList.add("active-icon");
			divIcon2.classList.remove("active-icon");
			//creation d un objet bills pour pouvoir utiliser getBills dessus et recuperer les bills
			const bills = new Bills({ document, onNavigate, store, localStorage });
			bills
				.getBills()
				.then((data) => {
					//utilisation de BillsUI() sur les bills recuperer  afin de generer l html correspondant et injection de cet html au div root
					rootDiv.innerHTML = BillsUI({ data });
					const divIcon1 = document.getElementById("layout-icon1");
					const divIcon2 = document.getElementById("layout-icon2");
					// realumage de l icone car la page a ete rechargee depuis zero
					divIcon1.classList.add("active-icon");
					divIcon2.classList.remove("active-icon");
					new Bills({ document, onNavigate, store, localStorage });
				})
				.catch((error) => {
					rootDiv.innerHTML = ROUTES({ pathname, error });
				});
		} else if (pathname === ROUTES_PATH["NewBill"]) {
			// injection de la page newBills dans  le div root

			rootDiv.innerHTML = ROUTES({ pathname, loading: true });
			//Creation d un Object newBills
			new NewBill({ document, onNavigate, store, localStorage });
			// allumage de l icone newBills et extinction de l icone Bills
			const divIcon1 = document.getElementById("layout-icon1");
			const divIcon2 = document.getElementById("layout-icon2");
			divIcon1.classList.remove("active-icon");
			divIcon2.classList.add("active-icon");
		} else if (pathname === ROUTES_PATH["Dashboard"]) {
			rootDiv.innerHTML = ROUTES({ pathname, loading: true });
			const bills = new Dashboard({
				document,
				onNavigate,
				store,
				bills: [],
				localStorage,
			});
			bills
				.getBillsAllUsers()
				.then((bills) => {
					rootDiv.innerHTML = DashboardUI({ data: { bills } });
					new Dashboard({ document, onNavigate, store, bills, localStorage });
				})
				.catch((error) => {
					rootDiv.innerHTML = ROUTES({ pathname, error });
				});
		}
	};

	window.onpopstate = (e) => {
		const user = JSON.parse(localStorage.getItem("user"));
		if (window.location.pathname === "/" && !user) {
			document.body.style.backgroundColor = "#0E5AE5";
			rootDiv.innerHTML = ROUTES({ pathname: window.location.pathname });
		} else if (user) {
			onNavigate(PREVIOUS_LOCATION);
		}
	};

	if (window.location.pathname === "/" && window.location.hash === "") {
		new Login({ document, localStorage, onNavigate, PREVIOUS_LOCATION, store });
		document.body.style.backgroundColor = "#0E5AE5";
	} else if (window.location.hash !== "") {
		if (window.location.hash === ROUTES_PATH["Bills"]) {
			rootDiv.innerHTML = ROUTES({
				pathname: window.location.hash,
				loading: true,
			});
			const divIcon1 = document.getElementById("layout-icon1");
			const divIcon2 = document.getElementById("layout-icon2");
			divIcon1.classList.add("active-icon");
			divIcon2.classList.remove("active-icon");
			const bills = new Bills({ document, onNavigate, store, localStorage });
			bills
				.getBills()
				.then((data) => {
					rootDiv.innerHTML = BillsUI({ data });
					const divIcon1 = document.getElementById("layout-icon1");
					const divIcon2 = document.getElementById("layout-icon2");
					divIcon1.classList.add("active-icon");
					divIcon2.classList.remove("active-icon");
					new Bills({ document, onNavigate, store, localStorage });
				})
				.catch((error) => {
					rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, error });
				});
		} else if (window.location.hash === ROUTES_PATH["NewBill"]) {
			rootDiv.innerHTML = ROUTES({
				pathname: window.location.hash,
				loading: true,
			});
			new NewBill({ document, onNavigate, store, localStorage });
			const divIcon1 = document.getElementById("layout-icon1");
			const divIcon2 = document.getElementById("layout-icon2");
			divIcon1.classList.remove("active-icon");
			divIcon2.classList.add("active-icon");
		} else if (window.location.hash === ROUTES_PATH["Dashboard"]) {
			rootDiv.innerHTML = ROUTES({
				pathname: window.location.hash,
				loading: true,
			});
			const bills = new Dashboard({
				document,
				onNavigate,
				store,
				bills: [],
				localStorage,
			});
			bills
				.getBillsAllUsers()
				.then((bills) => {
					rootDiv.innerHTML = DashboardUI({ data: { bills } });
					new Dashboard({ document, onNavigate, store, bills, localStorage });
				})
				.catch((error) => {
					rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, error });
				});
		}
	}

	return null;
};
