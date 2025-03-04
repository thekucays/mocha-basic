import { expect } from "chai";
import fetch from "node-fetch";
import Ajv from "ajv";
import schema_createuser from "../schema/reqresSchema.js"

describe("API Tests Suite", function () {
    this.timeout(5000); // Set timeout for API requests

    const ajv = new Ajv();
    const baseURL = "https://reqres.in";
    

    it("CREATE - Create User Baru", async function () {
        const newPost = {
            name: "morpheus",
            job: "leader"
        };
        
        // hit
        const response = await fetch(`${baseURL}/api/users`, {
        method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newPost),
        });

        // validasi HTTP Status Code
        expect(response.status).to.equal(201);
        
        // validasi JSON Scchema
        const data = await response.json();
        const validate = ajv.compile(schema_createuser);
        const hasil = validate(data)

        if (!hasil) {
            console.log(validate.errors); // Log errors if schema validation fails
        }
    
        expect(hasil, 'validasi json schema ada yang salah').to.be.true;
    });

    it("READ - Get single user", async function () {
        // hit
        const response = await fetch(`${baseURL}/api/users/2`);
        
        // validasi
        expect(response.status).to.equal(200);
    });

    it("READ - List user", async function () {
        const response = await fetch(`${baseURL}/api/users?page=2`);
        expect(response.status).to.equal(200);
    });

    it("UPDATE - Update User", async function () {
        const newPost = {
            name: "morpheus",
            job: "leader"
        };

        const response = await fetch(`${baseURL}/api/users/2`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newPost),
        });

        expect(response.status).to.equal(200);
    });

    it("DELETE - Delete user", async function () {
        const response = await fetch(`${baseURL}/api/users?page=2`, {
            method: "DELETE"
        });
        expect(response.status).to.equal(204);
    });
});
