import fetch from "node-fetch"
import { expect } from "chai";
import Ajv from "ajv";
import schema_createnewuser from "../schema/reqresSchema.js";

describe("API Test Suite coba", function(){

    it("Get single user", async function(){
        // tembak url reqres
        const hasil = await fetch('https://reqres.in/api/users/2')

        // validasi http status nya harus 200
        expect(hasil.status).to.equal(200)

    });

    it("Create new User", async function(){
        const newPost = {
            name: "Morpheus",
            job: "leader"
        }

        const hasilpost = await fetch('https://reqres.in/api/users', {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newPost)
        })

        expect(hasilpost.status).to.equal(90000000)

        // validasi json schema
        const ajv = new Ajv()
        const data = await hasilpost.json();
        const cekcek = ajv.compile(schema_createnewuser)
        const hasil_schema = cekcek(data)

        expect(hasil_schema).to.be.true
    });

})