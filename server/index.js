const express = require("express");
const app = express();
app.use(express.json());
const {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite,
} = require("./db");

app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (error) {
    next(error);
  }
});
app.get("/api/products", async (req, res, next) => {
  try {
    res.send(await fetchProducts());
  } catch (error) {
    next(error);
  }
});
app.get("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res.send(await fetchFavorites(req.params.id));
  } catch (error) {
    next(error);
  }
});

app.post("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res.status(201).send(
      await createFavorite({
        user_id: req.params.id,
        product_id: req.body.product_id,
      })
    );
  } catch (error) {
    next(error);
  }
});

app.delete("/api/users/:userId/favorites/:id", async (req, res, next) => {
  try {
    await destroyFavorite({ id: req.params.id, user_id: req.params.userId });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

const init = async () => {
  await client.connect();
  console.log("connected to database");
  await createTables();
  console.log("tables created");

  const [moe, lucy, ethyl, anvil, tnt, lego, plates] = await Promise.all([
    createUser({ username: "moe", password: "1234" }),
    createUser({ username: "lucy", password: "1234" }),
    createUser({ username: "ethyl", password: "1234" }),
    createProduct({ name: "anvil" }),
    createProduct({ name: "tnt" }),
    createProduct({ name: "lego" }),
    createProduct({ name: "plates" }),
  ]);
  //   console.log(moe.id)
  const users = await fetchUsers();
  console.log(users);
  const products = await fetchProducts();
  console.log(products);

  const favorites = await Promise.all([
    createFavorite({ user_id: moe.id, product_id: anvil.id }),
    createFavorite({ user_id: moe.id, product_id: lego.id }),
    createFavorite({ user_id: lucy.id, product_id: tnt.id }),
    createFavorite({ user_id: ethyl.id, product_id: plates.id }),
  ]);
  console.log(await fetchFavorites(moe.id));
  await destroyFavorite(favorites[0]);

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`I am listening on port ${PORT}`);
  });
};

init();
