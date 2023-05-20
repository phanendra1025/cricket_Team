const express = require("express");

const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error : ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertToCamelCase = (playerDetails) => {
  return {
    playerId: playerDetails.player_id,
    playerName: playerDetails.player_name,
    jerseyNumber: playerDetails.jersey_number,
    role: playerDetails.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(playersArray.map((array) => convertToCamelCase(array)));
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerDetailsQuery = `
    INSERT INTO cricket_team 
    (player_name,jersey_number,role)
    VALUES
    (
        '${playerName}',
        ${jerseyNumber},
        '${role}'
    )`;
  dbResponse = await db.run(addPlayerDetailsQuery);
  let playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT * FROM cricket_team
    WHERE player_id = ${playerId};
    `;
  const playerDetails = await db.get(getPlayerQuery);
  response.send(convertToCamelCase(playerDetails));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const updateDetails = request.body;
  const { playerName, jerseyNumber, role } = updateDetails;
  const updatePlayerDetailsQuery = `
    UPDATE cricket_team
    SET
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
    WHERE
        player_id = ${playerId};
    `;
  await db.run(updatePlayerDetailsQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerDetailsQuery = `
        DELETE FROM cricket_team
        WHERE 
            player_id = ${playerId};
    `;
  await db.run(deletePlayerDetailsQuery);
  response.send("Player Removed");
});

module.exports = app;
