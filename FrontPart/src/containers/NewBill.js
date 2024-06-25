import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
	constructor({ document, onNavigate, store, localStorage }) {
		this.document = document;
		this.onNavigate = onNavigate;
		//le store de app
		this.store = store;
		const formNewBill = this.document.querySelector(
			`form[data-testid="form-new-bill"]`
		);
		formNewBill.addEventListener("submit", this.handleSubmit);
		const file = this.document.querySelector(`input[data-testid="file"]`);
		file.addEventListener("change", this.handleChangeFile);
		this.fileUrl = null;
		this.fileName = null;
		this.billId = null;
		new Logout({ document, localStorage, onNavigate });
	}

	handleChangeFile = (e) => {
		e.preventDefault();
		var fileInput = this.document.querySelector(`input[data-testid="file"]`);
		var file = this.document.querySelector(`input[data-testid="file"]`)
			.files[0];

		const fileName = file.name;

		let errorDiv = this.document.querySelector(`div[data-testid="errorDiv"]`);
		if (errorDiv) {
			errorDiv.remove();
		}
    //utilisation de la methode fileValidation sur le fichier selectionner
    //pour certifier qu il est au bon format
		if (!this.fileValidation(file) && !errorDiv) {
			fileInput.value = "";
			let errorDiv = this.document.createElement("div");
			errorDiv.textContent =
				"extension non valide.  Veuillez sélectionner un fichier PNG, JPG ou JPEG.";
			errorDiv.style.color = "red";
			errorDiv.setAttribute("data-testid", "errorDiv");
			// Insérer le message d'erreur dans le DOM après le champ de téléchargement de fichier
			fileInput.parentNode.insertBefore(errorDiv, fileInput.nextSibling);
		} else {
			const formData = new FormData();

			let email = JSON.parse(localStorage.getItem("user")).email;
			if (!email) {
				const user = localStorage.getItem("user");
				email = JSON.parse(JSON.parse(user)).email;
			}

			formData.append("file", file);
			formData.append("email", email);

			this.store
				.bills()
				.create({
					data: formData,
					headers: {
						noContentType: true,
					},
				})
				.then(({ fileUrl, key }) => {
					this.billId = key;
					this.fileUrl = fileUrl;

					this.fileName = fileName;
				})
				.catch((error) => console.error(error));
		}
	};

	handleSubmit = (e) => {
		e.preventDefault();
		let user = localStorage.getItem("user");
		// user =JSON.parse(user);
		// if (! JSON.parse(user))
		//   {user=JSON.parse(user)}
		let email = JSON.parse(localStorage.getItem("user")).email;
		if (!email) {
			const user = localStorage.getItem("user");
			email = JSON.parse(JSON.parse(user)).email;
		}

		const bill = {
			email,
			type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
			name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
			amount: parseInt(
				e.target.querySelector(`input[data-testid="amount"]`).value
			),
			date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
			vat: e.target.querySelector(`input[data-testid="vat"]`).value,
			pct:
				parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
				20,
			commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
				.value,
			fileUrl: this.fileUrl,
			fileName: this.fileName,
			status: "pending",
		};

		if (!this.fileName) return;

		this.updateBill(bill);

		this.onNavigate(ROUTES_PATH["Bills"]);
	};

	// not need to cover this function by tests
	updateBill = (bill) => {
		if (this.store) {
			this.store
				.bills()
				.update({ data: JSON.stringify(bill), selector: this.billId })
				.then(() => {
					this.onNavigate(ROUTES_PATH["Bills"]);
				})
				.catch((error) => console.error(error));
		}
	};

	fileValidation = (file) => {
		const allowedExtensions = /(\.png|\.jpg|\.jpeg)$/i;
		if (!allowedExtensions.exec(file.name)) {
			return false;
		}
		return true;
	};
}
