import { ROUTES_PATH } from '../constants/routes.js';
import Logout from './Logout.js';

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    // ajout des proprietes document onNavigate et store  au nouvel objet
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    //recuperation du formulaire et ajout d un eventLIstener au submit =>handleSubmit()
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`);
    formNewBill.addEventListener("submit", this.handleSubmit);
    // recuperation de l input du formulaire et ajout d un eventLIstener au change =>handleChanteFile
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);
    // ajout des proprietes fileURl fileName billId et logout
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }

  //Recuperation du file ajoutee par l utilisateur pour verifier l extension
  handleChangeFile = e => {
    e.preventDefault();
    var fileInput = this.document.querySelector(`input[data-testid="file"]`);
    var file = this.document.querySelector(`input[data-testid="file"]`).files[0];
    const filePath = e.target.value.split(/\\/g);
    const fileName = filePath[filePath.length-1];

    if (!this.fileValidation(file)) {
      fileInput.value = '';
      alert('Extension de fichier non valide. Veuillez sélectionner un fichier PNG, JPG ou JPEG.');
      return;
    }

    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;
    formData.append('file', file);
    formData.append('email', email);

    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({fileUrl, key}) => {
        this.billId = key;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
      })
      .catch(error => console.error(error));
  };

  handleSubmit = e => {
    e.preventDefault();
    const email = JSON.parse(localStorage.getItem("user")).email;
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    };

    if (!this.fileName) return;
    this.updateBill(bill);
    this.onNavigate(ROUTES_PATH['Bills']);
  };

  // not need to cover this function by tests
  updateBill = bill => {
    if (this.store) {
      this.store
        .bills()
        .update({data: JSON.stringify(bill), selector: this.billId})
        .then(() => {
          this.onNavigate(ROUTES_PATH['Bills']);
        })
        .catch(error => console.error(error));
    }
  };

  fileValidation = file => {
    const allowedExtensions = /(\.png|\.jpg|\.jpeg)$/i;
    if (!allowedExtensions.exec(file.name)) {
      return false;
    }
    return true;
  };
}
