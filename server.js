const express = require("express");
const path = require('path');
const {open} = require("sqlite");
const sqlite3 = require('sqlite3');
const cors = require('cors');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const server = express();
server.use(express.json());
server.use(cors());
const dpPath = path.join(__dirname,"traveldiary.db");
const PORT = process.env.PORT || 3000;

let db = null;


const initializeServerAndDb = async () => {
    try{
        db = await open({
            filename: dpPath,
            driver: sqlite3.Database,
        });
        
        // creating the tables


    //     await db.run(`DROP TABLE IF EXISTS user`);
    //     await db.run(`CREATE TABLE IF NOT EXISTS user 
    //     ( id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL)`);
        
    //     await db.run(`DROP TABLE IF EXISTS traveldiary`);
    //     await db.run(`CREATE TABLE IF NOT EXISTS traveldiary (
    //            id INTEGER PRIMARY KEY,
    //            title TEXT NOT NULL,
    //            description TEXT NOT NULL,
    //            date TEXT NOT NULL,
    //            location TEXT NOT NULL,
    //            user_id INTEGER,
    //            FOREIGN KEY (user_id) REFERENCES user(id)
    //        )
    //    `);


        server.listen(PORT, ()=> {
            console.log("server running at",PORT);
        });
    }
    catch(error) {
        console.log(`DB Error: ${error.message}`);
        process.exit(1);
    }
};

initializeServerAndDb();


server.get('/', (request, response) => {
    response.send('Welcome to the server!');
});


class User {
    async registerUser(request,response) {
        try {
            const {email, password} = request.body;
            const hashedPassword = await bcrypt.hash(password,10);
            const selectUserQuery = `SELECT * FROM user WHERE email = '${email}'`;
            const dbUser = await db.get(selectUserQuery);
            // console.log(dbUser);
            if(dbUser === undefined){
                const createUserQuery = `
            INSERT INTO
                user ( email,password)
            VALUES
                (  
                    '${email}',
                    '${hashedPassword}'
                )
                `;
                await db.run(createUserQuery);
                response.send('User created Successfully');
            }
            else {
                response.status = 400;
                response.send('User already exists please login');
            }

        } catch (error) {
            response.send(500);
            response.status(`${error} : Internal Server Error`);
        }
    }

    async loginUser(request,response) {
        try {
            const {email,password} = request.body;
            const selectUserQuery = `SELECT * FROM user WHERE email = '${email}'`;
            const dbUser = await db.get(selectUserQuery);
            // console.log(dbUser);
            if(dbUser === undefined){
                response.status(400);
                response.send("Invalid User Email");
            }else{
                const isPasswordMatched = await bcrypt.compare(password,dbUser.password);
                // console.log(password,dbUser.password,isPasswordMatched);
                if(isPasswordMatched === true){
                    const payload = {email:email};
                    const jwtToken = jwt.sign(payload,"MY_SECRET_TOKEN");
                    response.send({jwtToken});
                }else{
                    response.status(400);
                    response.send("Invalid Password");
                }
            }
        } catch (error) {
            response.send(500);
            response.status(`${error} : Internal Server Error`);
        }
    }


    authenticateToken = (request,response,next) => {
        try {
            let jwtToken;
            const authHeader = request.headers["authorization"];
            if(authHeader !== undefined){
                jwtToken = authHeader.split(" ")[1];
            }
            if(jwtToken === undefined){
                response.status(401);
                response.send("Not Authorized");
            }else{
                jwt.verify(jwtToken,"MY_SECRET_TOKEN", async (error,payload) => {
                    if(error){
                        response.status(401);
                        response.send("Not Authorized");
                    }
                    else{
                        request.email = payload.email;
                        next();
                    }
                })
            }
        } catch (error) {
            response.status(500);
            response.send(`${error} : Internal Server Error`);
        }
    }


    //profile management

    // async getAllUsers(request,response){
    //     const usersQuery = `SELECT * FROM user`;
    //     const users = await db.all(usersQuery);
    //     response.send(users);
    // }

    async updateProfileDetails(request,response) {
        const {emailId} = request.params;
        const {email,password} = request.body;
        const hashedPassword = await bcrypt.hash(password,10);
        const userUpdateQuery = `UPDATE user SET email = '${email}', password = '${hashedPassword}' WHERE email = '${emailId}'`;
        await db.run(userUpdateQuery);
        response.send('user profile updated successfully!');
    }

    async deleteUserProfile(request,response) {
        const {emailId} = request.params;
        const deleteProfileQuery = `DELETE FROM user WHERE email = '${emailId}'`;
        await db.run(deleteProfileQuery);
        response.send('Profile deleted');
    }

}

class DiaryEntry {
    async postTravelDiary(request,response) {
        const travelDiaryDetails = request.body;
        const {id,title,description,date,location} = travelDiaryDetails;
        
        const addTravelDiaryQuery = `INSERT INTO traveldiary
            (id,title,description,date,location)
        VAlUES 
            (${id},'${title}','${description}','${date}','${location}')`;

        await db.run(addTravelDiaryQuery);
        response.send('Travel Diary Entry Added Successfully');
    }

    async getTravelDiary(request,response) {
        const {travelId} = request.params;
        const getTravelDiaryQuery = `SELECT * FROM traveldiary WHERE id = ${travelId}`;
        const getTravel = await db.get(getTravelDiaryQuery);
        // console.log(getTravel);
        if(getTravel === undefined){
            response.send(`Travel id: ${travelId} is not in the table`);
        }
        else{
            response.send(getTravel);
        }
     }

    async getAllTravelDiaries(request,response){
        const getAllTravelDiaryQuery = `SELECT * FROM traveldiary`;
        const allTravelDiaries = await db.all(getAllTravelDiaryQuery);
        // console.log(allTravelDiaries);
        if(allTravelDiaries.length === 0){
            response.send('No Travel Entries Found!');
        }else{
            response.send(allTravelDiaries);
        }
    }

    async updateTravelDiary(request,response) {
        const { travelId } = request.params;
        const diaryDetails = request.body;
        const {title,description,date,location} = diaryDetails;
        const putTravelQuery = `UPDATE traveldiary SET 
        title = '${title}', description = '${description}',
        date = '${date}', location = '${location}' 
        WHERE id = ${travelId} `;

        await db.run(putTravelQuery);
        response.send(`Travel Entry '${title}' Updated Successfully`);
    }

    async deleteTravelDiary(request,response){
        const {travelId} = request.params;
        const deleteTravelQuery = `DELETE FROM traveldiary WHERE id = ${travelId}`;
        await db.run(deleteTravelQuery);
        response.send(`Travel Diary Entry "${travelId}" Deleted Successfully`);
    }
}

const userObject = new User();
const travelObject = new DiaryEntry();

server.post('/register/', (request,response) => {
    userObject.registerUser(request,response);
})

server.post('/login/', (request,response) => {
    userObject.loginUser(request,response);
})

// server.get('/login/', userObject.authenticateToken, (request,response) => {
//     userObject.getAllUsers(request,response);
// })

server.put('/login/:emailId/', userObject.authenticateToken, (request,response) => {
    userObject.updateProfileDetails(request,response);
})

server.delete('/login/:emailId/', userObject.authenticateToken, (request,response) => {
    userObject.deleteUserProfile(request,response);
})



// travel diary routes
server.post('/travel/', userObject.authenticateToken, (request,response) => {
    travelObject.postTravelDiary(request,response);
})

server.get('/travel/', userObject.authenticateToken, (request,response) => {
    travelObject.getAllTravelDiaries(request,response);
})

server.get('/travel/:travelId/', userObject.authenticateToken, (request,response) => {
    travelObject.getTravelDiary(request,response);
})


server.put('/travel/:travelId/', userObject.authenticateToken, (request,response) => {
    travelObject.updateTravelDiary(request,response);
})

server.delete("/travel/:travelId/", userObject.authenticateToken, (request,response) => {
    travelObject.deleteTravelDiary(request,response);
})
