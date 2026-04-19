import http from "http";

const req = http.request("http://localhost:3000/", { method: "GET" }, (res) => {
  console.log("Status:", res.statusCode);
  res.on("data", (d) => process.stdout.write(d));
});
req.on("error", (e) => console.error(e));
req.end();
