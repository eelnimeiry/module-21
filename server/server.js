const express = require("express");
const path = require("path");
//import apollo server
const { ApolloServer } = require("apollo-server-express");
const { typeDefs, resolvers } = require("./schemas");
const { authMiddleware } = require("./resources/auth");
const DbConn = require("./config/DatabaseConnection");
const app = express();
const PORT = process.env.PORT || 4433;
const Apollo = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});
Apollo.applyMiddleware({ app });
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const _dirname = path.dirname("");
const buildPath = path.join(_dirname, "../client/build");
app.use(express.static(buildPath));
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

DbConn.once("open", () => {
  app.listen(PORT, () => {
    console.log(`Apollo Server running on port ${PORT}!`);
  });
});
