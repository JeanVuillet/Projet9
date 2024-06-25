const jsonOrThrowIfError = async (response) => {
	if (!response.ok) throw new Error((await response.json()).message);
	return response.json();
};

class Api {
	constructor({ baseUrl }) {
		//quand on cree un objet de la class api on doit lui specifier la base url
		this.baseUrl = baseUrl;
	}
	async get({ url, headers }) {
		// methode qui necessite l url de l api et les headers (objet qu on veux recuperer)
		return jsonOrThrowIfError(
			await fetch(`${this.baseUrl}${url}`, { headers, method: "GET" })
		);
	}
	async post({ url, data, headers }) {
		// methode qui necessite  l url sur laquelle poster, le contenu qu on veux poster et les headers pour envoyer des info complementaires
		return jsonOrThrowIfError(
			await fetch(`${this.baseUrl}${url}`, {
				headers,
				method: "POST",
				body: data,
			})
		);
	}
	async delete({ url, headers }) {
		//methode prend l url a modifier et les headers pour les infos et autoriasations
		return jsonOrThrowIfError(
			await fetch(`${this.baseUrl}${url}`, { headers, method: "DELETE" })
		);
	}
	async patch({ url, data, headers }) {
		return jsonOrThrowIfError(
			await fetch(`${this.baseUrl}${url}`, {
				headers,
				method: "PATCH",
				body: data,
			})
		);
	}
}

const getHeaders = (headers) => {
	const h = {};
	if (!headers.noContentType) h["Content-Type"] = "application/json";
	const jwt = localStorage.getItem("jwt");
	if (jwt && !headers.noAuthorization) h["Authorization"] = `Bearer ${jwt}`;
	return { ...h, ...headers };
};

class ApiEntity {
	//l objet prend key=morceau d url de cette api  et api objet de la class API avec les methodes get...
	constructor({ key, api }) {
		this.key = key;
		this.api = api;
	}
	// cette methode prend les choses qu on veut selectionner (selector) et les headers
	// elle met les headers au bon format et recupere l element souhaite via get
	async select({ selector, headers = {} }) {
		return await this.api.get({
			url: `/${this.key}/${selector}`,
			headers: getHeaders(headers),
		});
	}
	//cette methode renvoie toutes les choses a cet url
	// elle utilise l url qui decoule de l arg key met les headers au bon format et recupere tout le contenu de
	// l api a cet url
	async list({ headers = {} } = {}) {
		return await this.api.get({
			url: `/${this.key}`,
			headers: getHeaders(headers),
		});
	}
	// elle remplace l element souhaite (selector), par data et met les headers en form, toujours a l adresse
	//specifiee par key
	async update({ data, selector, headers = {} }) {
		return await this.api.patch({
			url: `/${this.key}/${selector}`,
			headers: getHeaders(headers),
			data,
		});
	}
	// ajoute data a l objet de l url specifie par key en mettant headers au bon format
	async create({ data, headers = {} }) {
		return await this.api.post({
			url: `/${this.key}`,
			headers: getHeaders(headers),
			data,
		});
	}
	// supprime l element specifie dans selector a l adresse key et met au bon format headers
	async delete({ selector, headers = {} }) {
		return await this.api.delete({
			url: `/${this.key}/${selector}`,
			headers: getHeaders(headers),
		});
	}
}

class Store {
	constructor() {
		//creation d un objet de la class API
		this.api = new Api({ baseUrl: "http://localhost:5678" });
	}
	// methode permetant d utiliser la methde select de la class ApiEntity (arg selector= id de l utilisateur)
	user = (uid) =>
		new ApiEntity({ key: "users", api: this.api }).select({ selector: uid });
	// cree un objet de la class ApiEntity
	users = () => new ApiEntity({ key: "users", api: this.api });
	//cette methode permet d envoyer les donnes de l utilisateur a l api pour sa premiere connexion (data)
	// si l utilisateur est present dans la bdd elle enverra en reponse un token qui permetra d identifier l utilisateur
	// pour le rest de sa navigation
	login = (data) =>
		this.api.post({
			url: "/auth/login",
			data,
			headers: getHeaders({ noAuthorization: true }),
		});

	// permet de recuperer un document relatif a cet utilisateur
	ref = (path) => this.store.doc(path);

	// param: bid(ref de la facture) on utilise select de ApiEntity sur l url ...bills..
	//pour aller chercher la facture correspondant a la ref bid
	bill = (bid) =>
		new ApiEntity({ key: "bills", api: this.api }).select({ selector: bid });
	// cree un objet de la class ApiEntity sur l url ...bills...
	bills = () => new ApiEntity({ key: "bills", api: this.api });
}

export default new Store();
