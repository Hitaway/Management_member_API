require('babel-register')
const { success, error, checkAndChange } = require('./assets/module-functions')        // c'est un nouveau module qu'on a créer et qui est dans le node_modules, le success et error permet de d'utiliser les function sans mettre var.error etc
const mysql = require('promise-mysql')
const bodyParser = require('body-parser')
const express = require('express')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./assets/swagger.json');
const morgan = require('morgan')
const config = require('./assets/config.json')

mysql.createConnection({
    host: config.db.host,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password
}).then((db) => {
    console.log('Connected')

    const app = express()

    let MembersRouter = express.Router()
    let Members = require('./assets/classes/members-class')(db, config)  

    app.use(morgan('dev'))      // voir les requête http
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(config.rootAPI+'api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));  // l'api dans http://localhost:8080/api/v1/api-docs/

    MembersRouter.route('/:id')

        // récupère un menbre avec son ID
        .get(async (req, res) => {
            let member = await Members.getByID(req.params.id)
            res.json(checkAndChange(member))
        })

        // modifie un menbre avec son ID
        .put(async (req, res) => {
            let updateMember = await Members.update(req.params.id, req.body.name)
            res.json(checkAndChange(updateMember))
        })

        // supprime un membre avec son ID
        .delete(async (req, res) => {
            let deleteMember = await Members.delete(req.params.id)
            res.json(checkAndChange(deleteMember))
        })

    MembersRouter.route('/')

        // recupère tout les membres
        .get(async (req, res) => {
            let allMembers = await Members.getAll(req.query.max)
            res.json(checkAndChange(allMembers))
        })

        // ajoute un membre
        .post(async (req, res) => {
            let addMember = await Members.add(req.body.name)
            res.json(checkAndChange(addMember))
        })

    app.use(config.rootAPI + 'members', MembersRouter)
    app.listen(8080, () => console.log('Started on port ' + config.port))

}).catch((err) => {
    console.log('Error during database connection')
    console.log(err.message)
})
