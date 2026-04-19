import http from "http";

const req = http.request(
  {
    hostname: "localhost",
    port: 3000,
    path: "/_server/?_serverFnId=generateAudio&_serverFnName=generateAudio",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  },
  (res) => {
    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });
    res.on("end", () => {
      console.log("RESPONSE:", res.statusCode);
      console.log("BODY:", data);
    });
  },
);
req.on("error", (e) => console.error("ERR:", e));
req.write(JSON.stringify(["Say hello cheerful"]));
req.end();
