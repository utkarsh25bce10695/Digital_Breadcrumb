import { adaptCookie } from "./scoring/cookieAdapter.js";
import fs from "fs";

const trackerData = JSON.parse(
    fs.readFileSync("./data/trackers.json", "utf-8")
);

const rawCookie = {
    name: "analytics_id",
    value: "12345",
    domain: ".google.com",
    path: "/",
    secure: false,
    httpOnly: false,
    sameSite: "no_restriction",
    session: false,
    expirationDate: Math.floor(Date.now() / 1000) + (730 * 24 * 60 * 60)
};

const adaptedCookie = adaptCookie(
    rawCookie,
    "example.com",
    trackerData
);

console.log(JSON.stringify(adaptedCookie, null, 4));