const Sequelize = require('sequelize')

const sequelize = new Sequelize(
  process.env.RINGCENTRAL_CHATBOT_DATABASE_CONNECTION_URI,
  {
    define: {
      timestamps: true
    },
    logging: false
  }
)

const Session = sequelize.define('service', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  sessionId: {
    type: Sequelize.STRING
  },
  partyId: {
    type: Sequelize.STRING
  },
  data: {
    type: Sequelize.JSON
  }
})

module.exports.Session = Session
