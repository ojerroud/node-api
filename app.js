const express = require("express");
const morgan = require("morgan");
const favicon = require("serve-favicon");
const bodyParser = require("body-parser");
const { Sequelize } = require("sequelize");
let pokemons = require("./mock-pokemon");
const { success, getUniqueId } = require("./helper");

const app = express();
const port = 3000;

const sequelize = new Sequelize("pokedex", "root", "", {
	host: "192.168.1.145",
	dialect: "mariadb",
	dialectOptions: {
		timezone: "Etc/GMT-2",
	},
	logging: false,
});

sequelize
	.authenticate()
	.then((_) =>
		console.log("La connexion à la base de donnée a bien été établie.")
	)
	.catch((error) =>
		console.error(`Connexion impossible à la base de donnée: ${error}`)
	);

// middlewares: one after others on chain
app
	.use(favicon(__dirname + "/favicon.ico"))
	.use(morgan("dev"))
	.use(bodyParser.json());

app.get("/", (req, res) => res.send("Hello, Express!"));

app.get("/api/pokemons/:id", (req, res) => {
	const id = parseInt(req.params.id);
	const pokemon = pokemons.find((pokemon) => pokemon.id === id);
	const message = "un pokémon a bien été trouvé";
	res.json(success(message, pokemon));
});

app.get("/api/pokemons", (req, res) => {
	const message = "la liste des pokémons a bien été trouvé";
	res.json(success(message, pokemons));
});

app.post("/api/pokemons", (req, res) => {
	const id = getUniqueId(pokemons);
	const pokemonCreacted = { ...req.body, ...{ id, created: new Date() } };
	console.log("test:" + req.body);
	pokemons.push(pokemonCreacted);
	const message = `Le pokemon ${pokemonCreacted.name} a bien été crée`;
	res.json(success(message, pokemonCreacted));
});

app.put("/api/pokemons/:id", (req, res) => {
	const id = parseInt(req.params.id);
	const pokemonUpdated = { ...req.body, id: id };
	pokemons = pokemons.map((pokemon) => {
		return pokemon.id === id ? pokemonUpdated : pokemon;
	});

	const message = `Le pokémon ${pokemonUpdated.name} a bien été modifié.`;
	res.json(success(message, pokemonUpdated));
});

app.delete("/api/pokemons/:id", (req, res) => {
	const id = parseInt(req.params.id);
	const pokemonDeleted = pokemons.find((pokemon) => pokemon.id === id);

	if (pokemonDeleted === undefined)
		res.json({ message: "pas de pokemon a supprimer" });

	pokemons = pokemons.filter((pokemon) => pokemon.id !== id);
	const message = `Le pokémon ${pokemonDeleted.name} a bien été supprimé`;
	res.json(success(message, pokemonDeleted));
});

app.listen(port, () =>
	console.log(`Le serveur à démarré sur: http://localhost:${port}`)
);
