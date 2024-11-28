import mongoose from "mongoose";
let connection;

process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("Connection has been closed");
    process.exit(0);
  } catch (error) {
    console.error("Error occurred while closing the connection:", error);
    process.exit(1); 
  }
});


export const connect= ()=>{
      return mongoose.connect(process.env.DB_URI).then((db)=>{
      connection = db;
      console.log("Database connection has been established");
    }).catch((err)=>{
      console.log('Error has been occured: ',err);
      throw err;
    });
  }

export const getConnection= ()=> connection