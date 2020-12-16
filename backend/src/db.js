// connects to the remote PRISMA DB and helps us to query thru javascript
const { Prisma } = require('prisma-binding');

const db = new Prisma({
    typeDefs: 'src/generated/prisma.graphql',
    endpoint:process.env.PRISMA_ENDPOINT,
    secret:process.env.PRISMA_SECRET,
    debug:false
});

module.exports = db;