import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "karthik",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 0;

// let users = [
//   { id: 1, name: "Angela", color: "red" },
//   { id: 2, name: "Jack", color: "powderblue" },
// ];

async function currusers() {
  const result=await db.query("SELECT * FROM users;");
  let users=[];
  result.rows.forEach((user) => {
    users.push(user);
  });
  return users;
}

async function checkVisisted() {
  console.log(currentUserId+1);
  const result = await db.query(`SELECT country_code FROM visited_countries  WHERE student_id=${currentUserId+1};`
  );
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}
app.get("/", async (req, res) => {
  
  const countries = await checkVisisted();
  const users=await currusers();
  console.log(users);
  console.log(users[currentUserId].color);
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: users[currentUserId].color,
  });
});
app.post("/add", async (req, res) => {
  const input = req.body["country"];


  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    const data = result.rows[0];
    const countryCode = data.country_code;
    try {
      console.log(currentUserId);
      await db.query(
        "INSERT INTO visited_countries (country_code,student_id) VALUES ($1,$2)",
        [countryCode,currentUserId+1]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});
app.post("/user", async (req, res) => {

  const userId = req.body.user;
  const checknewusr=req.body.add;
  console.log(checknewusr);
  if(checknewusr=="new"){
    // console.log("new user");
    res.render("new.ejs");
  }
  else{
    // console.log('User ID:', userId);
  currentUserId = userId-1;
  // console.log(currentUserId);
  const countries = await checkVisisted();
  const users=await currusers();
  // console.log(users[currentUserId].color);

  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: users[currentUserId].color,
  });
  };

});

app.post("/new", async (req, res) => {
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html
  const name=req.body.name;
  const color=req.body.color;
  console.log(name);
  console.log(color);
  await db.query('INSERT INTO users (name, color) VALUES ($1, $2)', [name, color]);

  res.redirect("/");


});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
